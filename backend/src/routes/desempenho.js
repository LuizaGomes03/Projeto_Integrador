// backend/src/routes/desempenho.js
import { Router } from 'express'
import pool from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// Pesos de XP
const XP_POR_ACERTO  = 10
const XP_POR_VITORIA = 50

// ─── GET /api/aluno/desempenho ────────────────────────────────────────────────
// Retorna todos os dados de desempenho do aluno autenticado.
// Requer: Authorization: Bearer <token>
router.get('/desempenho', authMiddleware, async (req, res) => {
  const usuarioId = req.usuario.id

  const client = await pool.connect()
  try {
    // ── 1. Agrega totais de acertos, erros, vitórias e XP ────────────────────
    const { rows: totais } = await client.query(
      `SELECT
         COALESCE(SUM(dj.acertos), 0)                                    AS total_acertos,
         COALESCE(SUM(dj.erros), 0)                                      AS total_erros,
         COALESCE(SUM(CASE WHEN dj.venceu THEN 1 ELSE 0 END), 0)        AS total_vitorias,
         COUNT(dj.id)                                                    AS total_partidas,
         COALESCE(
           SUM(dj.acertos) * $2 + SUM(CASE WHEN dj.venceu THEN 1 ELSE 0 END) * $3,
           0
         )                                                               AS xp_total
       FROM desempenho_jogadores dj
       WHERE dj.usuario_id = $1`,
      [usuarioId, XP_POR_ACERTO, XP_POR_VITORIA]
    )

    // ── 2. Sequência atual de vitórias (streak) ───────────────────────────────
    // Pega as últimas partidas encerradas em ordem decrescente e conta
    // quantas vitórias consecutivas existem no início da lista.
    const { rows: streak } = await client.query(
      `SELECT dj.venceu
       FROM desempenho_jogadores dj
       JOIN partidas p ON p.id = dj.partida_id
       WHERE dj.usuario_id = $1
         AND p.encerrado = TRUE
       ORDER BY p.finalizado_em DESC
       LIMIT 20`,
      [usuarioId]
    )

    let vitoriasSeguidas = 0
    for (const row of streak) {
      if (row.venceu) vitoriasSeguidas++
      else break
    }

    // ── 3. Dias de ofensiva (dias seguidos com ao menos 1 partida) ────────────
    const { rows: diasRows } = await client.query(
      `SELECT DISTINCT DATE(p.finalizado_em AT TIME ZONE 'America/Sao_Paulo') AS dia
       FROM desempenho_jogadores dj
       JOIN partidas p ON p.id = dj.partida_id
       WHERE dj.usuario_id = $1
         AND p.encerrado = TRUE
       ORDER BY dia DESC
       LIMIT 30`,
      [usuarioId]
    )

    let diasSeguidos = 0
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    for (let i = 0; i < diasRows.length; i++) {
      const dia = new Date(diasRows[i].dia)
      dia.setHours(0, 0, 0, 0)
      const diffDias = Math.round((hoje - dia) / (1000 * 60 * 60 * 24))
      if (diffDias === i || diffDias === i + 1) {
        diasSeguidos++
      } else {
        break
      }
    }

    // ── 4. Histórico das últimas 10 partidas finalizadas ─────────────────────
    const { rows: historico } = await client.query(
      `SELECT
         p.id,
         p.finalizado_em                                                AS data,
         dj.acertos,
         dj.erros,
         dj.venceu,
         dj.tempo_segundos,
         (dj.acertos * $2 + CASE WHEN dj.venceu THEN $3 ELSE 0 END)   AS xp_ganho,
         s.code                                                         AS codigo_sala
       FROM desempenho_jogadores dj
       JOIN partidas p ON p.id = dj.partida_id
       JOIN salas    s ON s.id = p.sala_id
       WHERE dj.usuario_id = $1
         AND p.encerrado = TRUE
       ORDER BY p.finalizado_em DESC
       LIMIT 10`,
      [usuarioId, XP_POR_ACERTO, XP_POR_VITORIA]
    )

    // ── 5. Reações descobertas (acertos únicos — proxy: total de acertos) ─────
    const reacoesDescobertas = Number(totais[0].total_acertos)

    // ── 6. Medalhas desbloqueadas ─────────────────────────────────────────────
    const totalPartidas  = Number(totais[0].total_partidas)
    const totalVitorias  = Number(totais[0].total_vitorias)
    const xpTotal        = Number(totais[0].xp_total)

    const medalhas = [
      {
        titulo: 'Aprendiz de Laboratório',
        descricao: 'Complete sua primeira partida',
        desbloqueado: totalPartidas >= 1,
        emoji: '🥉',
      },
      {
        titulo: 'Pesquisador Estratégico',
        descricao: 'Vença 3 partidas',
        desbloqueado: totalVitorias >= 3,
        emoji: '🥈',
      },
      {
        titulo: 'Mestre dos Elementos',
        descricao: 'Alcance 500 XP',
        desbloqueado: xpTotal >= 500,
        emoji: '🥇',
      },
    ]

    // ── 7. Progresso para próximo desbloqueio de medalha ─────────────────────
    // Usa o número de vitórias como métrica principal 
    const proximoDesbloqueio = Math.min(totalVitorias, 3)

    return res.json({
      xpTotal,
      xpHoje: calcularXpHoje(historico),
      totalPartidas,
      totalVitorias,
      totalAcertos: Number(totais[0].total_acertos),
      totalErros:   Number(totais[0].total_erros),
      diasSeguidos,
      vitoriasSeguidas,
      reacoesDescobertas,
      proximoDesbloqueio,
      medalhas,
      historico: historico.map((h) => ({
        id:            h.id,
        data:          h.data,
        acertos:       h.acertos,
        erros:         h.erros,
        venceu:        h.venceu,
        tempoSegundos: h.tempo_segundos,
        xpGanho:       Number(h.xp_ganho),
        nomeModo:      `Sala ${h.codigo_sala}`,
        codigoSala:    h.codigo_sala,
      })),
    })
  } catch (err) {
    console.error('[desempenho GET /]', err)
    return res.status(500).json({ erro: 'Erro ao buscar dados de desempenho.' })
  } finally {
    client.release()
  }
})

// ─── HELPER: XP ganho hoje ────────────────────────────────────────────────────
function calcularXpHoje(historico) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return historico
    .filter((h) => {
      const d = new Date(h.data)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === hoje.getTime()
    })
    .reduce((acc, h) => acc + Number(h.xp_ganho), 0)
}

export default router