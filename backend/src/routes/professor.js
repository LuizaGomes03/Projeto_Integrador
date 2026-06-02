import { Router } from 'express'
import pool from '../db.js'
import { authMiddleware, apenasProfessor } from '../middleware/auth.js'

const router = Router()

const XP_POR_ACERTO = 10
const XP_POR_VITORIA = 50
const XP_POR_NIVEL = 1000

router.get('/dashboard', authMiddleware, apenasProfessor, async (req, res) => {
  const client = await pool.connect()
  try {
    // Nível médio dos alunos
    const { rows: nivelRows } = await client.query(`
      SELECT COALESCE(AVG(
        dj.acertos * $1 + CASE WHEN dj.venceu THEN $2 ELSE 0 END
      ), 0) AS xp_medio
      FROM desempenho_jogadores dj
    `, [XP_POR_ACERTO, XP_POR_VITORIA])

    const xpMedio = Number(nivelRows[0].xp_medio)
    const nivelMedio = Math.max(1, Math.floor(xpMedio / XP_POR_NIVEL) + 1)

    // Partidas recentes com nível da sala
    const { rows: partidas } = await client.query(`
      SELECT
        p.id,
        p.finalizado_em,
        s.code AS codigo_sala,
        COALESCE(s.nivel, 1) AS nivel,
        u.nome AS vencedor
      FROM partidas p
      JOIN salas s ON s.id = p.sala_id
      LEFT JOIN usuarios u ON u.id = p.vencedor_id
      WHERE p.encerrado = TRUE
      ORDER BY p.finalizado_em DESC
      LIMIT 10
    `)

    return res.json({
      nivelMedio,
      partidas: partidas.map(p => ({
        id: p.id,
        codigoSala: p.codigo_sala,
        nivel: Number(p.nivel),
        vencedor: p.vencedor ?? 'Sem vencedor',
        finalizadoEm: p.finalizado_em,
      }))
    })
  } catch (err) {
    console.error('[professor/dashboard]', err)
    return res.status(500).json({ erro: 'Erro ao buscar dados do dashboard.' })
  } finally {
    client.release()
  }
})

router.get('/alunos', authMiddleware, apenasProfessor, async (req, res) => {
  const client = await pool.connect()
  try {
    const { rows } = await client.query(`
      SELECT
        u.id,
        u.nome,
        u.email,
        u.ano,
        u.sala,
        COUNT(dj.id) AS total_partidas,
        COALESCE(SUM(dj.acertos * 10 + CASE WHEN dj.venceu THEN 50 ELSE 0 END), 0) AS xp_total,
        COALESCE(SUM(CASE WHEN dj.venceu THEN 1 ELSE 0 END), 0) AS total_vitorias
      FROM usuarios u
      LEFT JOIN desempenho_jogadores dj ON dj.usuario_id = u.id
      WHERE u.tipo = 'aluno'
      GROUP BY u.id
      ORDER BY xp_total DESC
    `)

    return res.json(rows.map(r => ({
      id: Number(r.id),
      nome: r.nome,
      email: r.email,
      ano: r.ano ? `${r.ano}º Ano` : '—',
      sala: r.sala ? `Sala ${r.sala}` : '—',
      xpTotal: Number(r.xp_total),
      nivel: Math.max(1, Math.floor(Number(r.xp_total) / 1000) + 1),
      totalPartidas: Number(r.total_partidas),
      totalVitorias: Number(r.total_vitorias),
    })))
  } catch (err) {
    console.error('[professor/alunos]', err)
    return res.status(500).json({ erro: 'Erro ao buscar alunos.' })
  } finally {
    client.release()
  }
})

export default router