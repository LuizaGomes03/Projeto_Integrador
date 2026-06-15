import { Router } from 'express'
import pool from '../db.js'
import {
  gerarTodasAsPedrasParaNivel,
  getPedraInicialParaNivel,
  NIVEIS,
} from '../domino/levels.js'

const router = Router()

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const PEDRAS_POR_JOGADOR = 7
const IA_NOME = 'IA Química'
const IA_ID = -1

// ─── UTILITÁRIOS DE PEDRA ─────────────────────────────────────────────────────

/** Retorna o token de encaixe de uma face (suporta string simples ou objeto rico) */
function encaixeDe(face) {
  if (!face) return null
  return typeof face === 'string' ? face : face.encaixe
}

// ─── EMBARALHAMENTO ───────────────────────────────────────────────────────────

function embaralhar(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function distribuirPedras(jogadores, nivel = 1) {
  const todas = embaralhar(gerarTodasAsPedrasParaNivel(nivel))
  const pedraInicial = getPedraInicialParaNivel(nivel)

  // Remove a pedra inicial da lista se ela aparecer (por encaixe idêntico)
  const semInicial = todas.filter(
    (p) =>
      encaixeDe(p.left) !== encaixeDe(pedraInicial.left) ||
      encaixeDe(p.right) !== encaixeDe(pedraInicial.right)
  )

  const maos = {}
  for (const j of jogadores) {
    maos[j.id] = []
  }

  // Distribui para TODOS os jogadores (humanos e IA) em rodadas alternadas
  // A IA precisa ter pedras para jogar — sem isso, verificarFimDeJogo
  // a declara vencedora imediatamente por mão vazia.
  for (let i = 0; i < PEDRAS_POR_JOGADOR; i++) {
    for (const j of jogadores) {
      if (semInicial.length > 0) {
        maos[j.id].push(semInicial.shift())
      }
    }
  }

  return { maos, monte: semInicial, pedraInicial }
}

// ─── VALIDAÇÃO ────────────────────────────────────────────────────────────────

function obterPontas(mesa) {
  if (mesa.length === 0) return { esquerda: null, direita: null }
  return {
    esquerda: encaixeDe(mesa[0].left),
    direita: encaixeDe(mesa[mesa.length - 1].right),
  }
}

function verificarFechamento(mesa) {
  if (mesa.length < 2) return false
  const { esquerda, direita } = obterPontas(mesa)
  return esquerda === direita
}

function validarJogada(pedra, mesa) {
  const { esquerda, direita } = obterPontas(mesa)
  const pl = encaixeDe(pedra.left)
  const pr = encaixeDe(pedra.right)

  if (esquerda === null) return { valido: true, lado: 'direita', virar: false }
  if (pl === direita) return { valido: true, lado: 'direita', virar: false }
  if (pr === direita) return { valido: true, lado: 'direita', virar: true }
  if (pr === esquerda) return { valido: true, lado: 'esquerda', virar: false }
  if (pl === esquerda) return { valido: true, lado: 'esquerda', virar: true }
  return { valido: false, lado: null, virar: false }
}

function aplicarJogada(pedra, mesa, lado, virar) {
  const pedraFinal = virar
    ? { ...pedra, left: pedra.right, right: pedra.left }
    : { ...pedra }
  return lado === 'esquerda' ? [pedraFinal, ...mesa] : [...mesa, pedraFinal]
}

// ─── TURNOS ───────────────────────────────────────────────────────────────────

function proximoJogador(jogadores, jogadorAtualId) {
  const idx = jogadores.findIndex((j) => j.id === jogadorAtualId)
  return jogadores[(idx + 1) % jogadores.length]
}

function alguemPodeJogar(maos, mesa) {
  for (const pedras of Object.values(maos)) {
    for (const pedra of pedras) {
      if (validarJogada(pedra, mesa).valido) return true
    }
  }
  return false
}

function verificarFimDeJogo(maos, mesa, jogadores) {
  for (const j of jogadores) {
    if ((maos[j.id] ?? []).length === 0) {
      return { encerrado: true, motivo: 'vitoria', vencedorId: j.id, vencedores: [j] }
    }
  }
  if (!alguemPodeJogar(maos, mesa)) {
    let minPedras = Infinity
    let vencedores = []
    for (const j of jogadores) {
      const qtd = (maos[j.id] ?? []).length
      if (qtd < minPedras) { minPedras = qtd; vencedores = [j] }
      else if (qtd === minPedras) vencedores.push(j)
    }
    return {
      encerrado: true,
      motivo: 'travado',
      vencedorId: vencedores.length === 1 ? vencedores[0].id : null,
      vencedores,
    }
  }
  return { encerrado: false }
}

// ─── IA ───────────────────────────────────────────────────────────────────────

function jogadaIA(estado) {
  const mao = estado.maos[IA_ID] ?? []
  if (mao.length === 0) return
  for (const pedra of mao) {
    const { valido, lado, virar } = validarJogada(pedra, estado.mesa)
    if (valido) {
      estado.mesa = aplicarJogada(pedra, estado.mesa, lado, virar)
      estado.maos[IA_ID] = mao.filter((p) => p.id !== pedra.id)
      estado.historico.push({
        jogadorId: IA_ID,
        nome: IA_NOME,
        pedra,
        lado,
        virar,
        timestamp: new Date().toISOString(),
      })
      return
    }
  }
  estado.historico.push({
    jogadorId: IA_ID,
    nome: IA_NOME,
    acao: 'passou',
    timestamp: new Date().toISOString(),
  })
}

function processarTurnosIA(estado) {
  let iteracoes = 0
  const MAX = 10
  while (!estado.encerrado && estado.turnoAtualId === IA_ID && iteracoes < MAX) {
    jogadaIA(estado)
    const fim = verificarFimDeJogo(estado.maos, estado.mesa, estado.jogadores)
    if (fim.encerrado) {
      estado.encerrado = true
      estado.vencedorId = fim.vencedorId ?? null
      estado.vencedores = fim.vencedores ?? []
      estado.motivo = fim.motivo
      return
    }
    estado.turnoAtualId = proximoJogador(estado.jogadores, IA_ID).id
    iteracoes++
  }
}

// ─── SERIALIZAÇÃO ─────────────────────────────────────────────────────────────

function sanitizarEstado(estado, usuarioId) {
  const maosPublicas = {}
  for (const j of estado.jogadores) {
    // Compara como string pois JSONB serializa chaves como string
    const pedras = estado.maos[j.id] ?? estado.maos[String(j.id)] ?? []
    maosPublicas[j.nome] = j.id === usuarioId ? pedras : pedras.length
  }

  const jogadorAtual = estado.jogadores.find((j) => j.id === estado.turnoAtualId)

  const uid = usuarioId
  const minhaMao = uid != null
    ? (estado.maos[uid] ?? estado.maos[String(uid)] ?? [])
    : undefined

  return {
    sala: estado.salaCode,
    nivel: estado.nivel ?? 1,
    nivelInfo: NIVEIS[estado.nivel ?? 1] ?? NIVEIS[1],
    jogadores: estado.jogadores.map((j) => j.nome),
    turnoAtual: jogadorAtual?.nome ?? '',
    mesa: estado.mesa,
    minha_mao: minhaMao,
    maos: maosPublicas,
    monte: estado.monte?.length ?? 0,
    encerrado: estado.encerrado,
    vencedor:
      estado.vencedores?.find((j) => j.id === estado.vencedorId)?.nome ?? null,
    vencedores: estado.vencedores?.map((j) => j.nome) ?? null,
    motivo: estado.motivo ?? null,
    historico: estado.historico,
    pontas: obterPontas(estado.mesa),
  }
}

// ─── ACESSO AO BANCO ──────────────────────────────────────────────────────────

async function getEstado(client, salaId) {
  const { rows } = await client.query(
    'SELECT * FROM partida_estado WHERE sala_id = $1',
    [salaId]
  )
  if (rows.length === 0) return null
  const estado = { ...rows[0].estado, _partidaId: rows[0].partida_id }

  // JSONB serializa chaves de objetos como strings.
  // Normaliza as mãos para que chaves numéricas funcionem.
  if (estado.maos) {
    const maosNormalizadas = {}
    for (const [k, v] of Object.entries(estado.maos)) {
      const num = Number(k)
      maosNormalizadas[Number.isNaN(num) ? k : num] = v
    }
    estado.maos = maosNormalizadas
  }

  // Normaliza turnoAtualId e jogadores.id
  if (estado.turnoAtualId !== undefined) {
    estado.turnoAtualId = Number(estado.turnoAtualId)
  }
  if (Array.isArray(estado.jogadores)) {
    estado.jogadores = estado.jogadores.map(j => ({ ...j, id: Number(j.id) }))
  }

  return estado
}

async function saveEstado(client, partidaId, salaId, estado) {
  const { _partidaId, ...estadoLimpo } = estado
  await client.query(
    `INSERT INTO partida_estado (partida_id, sala_id, estado, updated_at)
     VALUES ($1, $2, $3::jsonb, NOW())
     ON CONFLICT (partida_id) DO UPDATE
       SET estado = EXCLUDED.estado,
           updated_at = NOW()`,
    [partidaId, salaId, JSON.stringify(estadoLimpo)]
  )
}

async function finalizarPartida(client, estadoFinal) {
  const { _partidaId, vencedorId, motivo, jogadores, iniciadoEm } = estadoFinal

  // Calcula duração total da partida em segundos
  const tempoSegundos = iniciadoEm
    ? Math.round((Date.now() - new Date(iniciadoEm).getTime()) / 1000)
    : 0

  const vencedorReal = vencedorId !== IA_ID ? vencedorId : null
  await client.query(
    `UPDATE partidas
        SET vencedor_id = $1,
            motivo      = $2,
            encerrado   = TRUE,
            finalizado_em = NOW()
      WHERE id = $3`,
    [vencedorReal, motivo, _partidaId]
  )

  for (const j of jogadores) {
    if (j.id === IA_ID) continue

    const venceu = vencedorId === j.id
    const acertos = estadoFinal.historico.filter(
      (h) => h.jogadorId === j.id && h.pedra
    ).length
    const erros = estadoFinal.historico.filter(
      (h) => h.jogadorId === j.id && h.acao === 'passou'
    ).length

    await client.query(
      `INSERT INTO desempenho_jogadores (partida_id, usuario_id, acertos, erros, venceu, tempo_segundos)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [_partidaId, j.id, acertos, erros, venceu, tempoSegundos]
    )
  }
}

// ─── ROTAS ────────────────────────────────────────────────────────────────────

// POST /api/partidas/iniciar
// Body: { codigoSala, jogadores?: [{ id, nome }], nivel?: 1|2|3 }
router.post('/iniciar', async (req, res) => {
  const { codigoSala, jogadores: jogadoresDireto, nivel: nivelReq } = req.body ?? {}
  const salaCode = String(codigoSala ?? '').toUpperCase()
  const nivel = Number(nivelReq) in NIVEIS ? Number(nivelReq) : 1

  console.log('📋 POST /iniciar — sala:', salaCode, '| nível:', nivel)

  if (Array.isArray(jogadoresDireto)) {
    const invalido = jogadoresDireto.find(
      (j) => j.id !== -1 && (typeof j.id !== 'number' || j.id <= 0)
    )
    if (invalido) {
      return res.status(400).json({
        erro: `Jogador com id inválido (${invalido.id}). Sessão ainda não carregada.`,
      })
    }
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: salaRows } = await client.query(
      'SELECT * FROM salas WHERE code = $1',
      [salaCode]
    )

    let salaId
    let jogadores

    if (salaRows.length > 0) {
      const sala = salaRows[0]

      if (sala.status === 'playing') {
        await client.query('ROLLBACK')
        return res
          .status(400)
          .json({ erro: 'Esta sala já tem uma partida em andamento.' })
      }

      const { rows: jogadoresRows } = await client.query(
        `SELECT u.id, u.nome
           FROM sala_jogadores sj
           JOIN usuarios u ON u.id = sj.usuario_id
          WHERE sj.sala_id = $1
          ORDER BY sj.entrou_em`,
        [sala.id]
      )

      if (jogadoresRows.length < 2) {
        await client.query('ROLLBACK')
        return res
          .status(400)
          .json({ erro: 'Mínimo de 2 jogadores necessário.' })
      }

      salaId = sala.id
      jogadores = jogadoresRows
      const nivelFinal = sala.nivel ?? nivel

      await client.query(
        "UPDATE salas SET status = 'playing' WHERE id = $1",
        [salaId]
      )
    } else {
      if (!Array.isArray(jogadoresDireto) || jogadoresDireto.length < 2) {
        await client.query('ROLLBACK')
        return res
          .status(400)
          .json({ erro: 'Mínimo de 2 jogadores necessário.' })
      }

      const code =
        salaCode || Math.random().toString(36).slice(2, 8).toUpperCase()
      const hostId =
        typeof jogadoresDireto[0].id === 'number' && jogadoresDireto[0].id > 0
          ? jogadoresDireto[0].id
          : null

      const { rows: novaSala } = await client.query(
        `INSERT INTO salas (code, host_id, status)
         VALUES ($1, $2, 'playing')
         ON CONFLICT (code) DO UPDATE SET status = 'playing'
         RETURNING id`,
        [code, hostId]
      )
      salaId = novaSala[0].id

      jogadores = jogadoresDireto.map((j) =>
        j.nome === IA_NOME ? { id: IA_ID, nome: IA_NOME } : j
      )
    }

    const primeiroHumano = jogadores.find((j) => j.id !== IA_ID)
    const { rows: partidaRows } = await client.query(
      `INSERT INTO partidas (sala_id, usuario_id, encerrado)
       VALUES ($1, $2, FALSE)
       RETURNING id`,
      [salaId, primeiroHumano?.id ?? null]
    )
    const partidaId = partidaRows[0].id

    const nivelFinal = salaRows.length > 0 ? (salaRows[0].nivel ?? nivel) : nivel
    const { maos, monte, pedraInicial } = distribuirPedras(jogadores, nivel)

    const estado = {
      salaCode: salaCode || jogadores[0]?.nome,
      salaId,
      nivel: nivelFinal,
      jogadores,
      turnoAtualId: jogadores[0].id,
      mesa: [pedraInicial],
      maos,
      monte,
      encerrado: false,
      vencedorId: null,
      vencedores: null,
      motivo: null,
      historico: [],
      iniciadoEm: new Date().toISOString(),
    }

    processarTurnosIA(estado)

    await saveEstado(client, partidaId, salaId, estado)
    estado._partidaId = partidaId

    await client.query('COMMIT')

    return res.status(201).json(sanitizarEstado(estado, primeiroHumano?.id ?? null))
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[partidas POST /iniciar]', err)
    return res.status(500).json({ erro: 'Erro ao iniciar partida.' })
  } finally {
    client.release()
  }
})

// GET /api/partidas/:sala?jogador=<usuarioId>
router.get('/:sala', async (req, res) => {
  const salaCode = req.params.sala.toUpperCase()
  const usuarioId = req.query.jogador ? Number(req.query.jogador) : null

  const client = await pool.connect()
  try {
    const { rows: salaRows } = await client.query(
      'SELECT id FROM salas WHERE code = $1',
      [salaCode]
    )
    if (salaRows.length === 0) {
      return res.status(404).json({ erro: 'Partida não encontrada.' })
    }

    const estado = await getEstado(client, salaRows[0].id)
    if (!estado) return res.status(404).json({ erro: 'Partida não encontrada.' })

    return res.json(sanitizarEstado(estado, usuarioId))
  } catch (err) {
    console.error('[partidas GET /:sala]', err)
    return res.status(500).json({ erro: 'Erro ao buscar partida.' })
  } finally {
    client.release()
  }
})

// POST /api/partidas/:sala/jogar
router.post('/:sala/jogar', async (req, res) => {
  const salaCode = req.params.sala.toUpperCase()
  const { usuarioId, pedraId } = req.body ?? {}
  const uid = Number(usuarioId)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: salaRows } = await client.query(
      'SELECT id FROM salas WHERE code = $1',
      [salaCode]
    )
    if (salaRows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ erro: 'Partida não encontrada.' })
    }

    const estado = await getEstado(client, salaRows[0].id)
    if (!estado) {
      await client.query('ROLLBACK')
      return res.status(404).json({ erro: 'Partida não encontrada.' })
    }

    if (estado.encerrado) {
      await client.query('ROLLBACK')
      return res.status(400).json({ erro: 'Partida já encerrada.' })
    }

    if (estado.turnoAtualId !== uid) {
      await client.query('ROLLBACK')
      return res.status(403).json({ erro: 'Não é o seu turno.' })
    }

    const mao = estado.maos[uid] ?? []
    const pedra = mao.find((p) => p.id === String(pedraId))
    if (!pedra) {
      await client.query('ROLLBACK')
      return res.status(400).json({ erro: 'Pedra não encontrada na sua mão.' })
    }

    const { valido, lado, virar } = validarJogada(pedra, estado.mesa)
    if (!valido) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        erro: 'Jogada inválida. A pedra não encaixa nas pontas disponíveis.',
        pontas: obterPontas(estado.mesa),
      })
    }

    estado.mesa = aplicarJogada(pedra, estado.mesa, lado, virar)
    estado.maos[uid] = mao.filter((p) => p.id !== pedraId)
    estado.historico.push({
      jogadorId: uid,
      pedra,
      lado,
      virar,
      timestamp: new Date().toISOString(),
    })

    // Fechamento do ciclo — pontas iguais após a jogada = vitória imediata
    const jogadorAtual = estado.jogadores.find((j) => j.id === uid)
    if (verificarFechamento(estado.mesa)) {
      estado.encerrado = true
      estado.vencedorId = uid
      estado.vencedores = [jogadorAtual]
      estado.motivo = 'fechamento'
      await saveEstado(client, estado._partidaId, salaRows[0].id, estado)
      await finalizarPartida(client, estado)
      await client.query('COMMIT')
      return res.json({ sucesso: true, ...sanitizarEstado(estado, uid) })
    }

    const fim = verificarFimDeJogo(estado.maos, estado.mesa, estado.jogadores)
    if (fim.encerrado) {
      estado.encerrado = true
      estado.vencedorId = fim.vencedorId ?? null
      estado.vencedores = fim.vencedores ?? []
      estado.motivo = fim.motivo
      await saveEstado(client, estado._partidaId, salaRows[0].id, estado)
      await finalizarPartida(client, estado)
    } else {
      estado.turnoAtualId = proximoJogador(estado.jogadores, uid).id
      processarTurnosIA(estado)
      await saveEstado(client, estado._partidaId, salaRows[0].id, estado)
    }

    await client.query('COMMIT')
    return res.json({ sucesso: true, ...sanitizarEstado(estado, uid) })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[partidas POST /:sala/jogar]', err)
    return res.status(500).json({ erro: 'Erro ao processar jogada.' })
  } finally {
    client.release()
  }
})

// POST /api/partidas/:sala/passar
router.post('/:sala/passar', async (req, res) => {
  const salaCode = req.params.sala.toUpperCase()
  const { usuarioId } = req.body ?? {}
  const uid = Number(usuarioId)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: salaRows } = await client.query(
      'SELECT id FROM salas WHERE code = $1',
      [salaCode]
    )
    if (salaRows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ erro: 'Partida não encontrada.' })
    }

    const estado = await getEstado(client, salaRows[0].id)
    if (!estado) {
      await client.query('ROLLBACK')
      return res.status(404).json({ erro: 'Partida não encontrada.' })
    }

    if (estado.encerrado) {
      await client.query('ROLLBACK')
      return res.status(400).json({ erro: 'Partida já encerrada.' })
    }

    if (estado.turnoAtualId !== uid) {
      await client.query('ROLLBACK')
      return res.status(403).json({ erro: 'Não é o seu turno.' })
    }

    estado.historico.push({
      jogadorId: uid,
      acao: 'passou',
      timestamp: new Date().toISOString(),
    })
    estado.turnoAtualId = proximoJogador(estado.jogadores, uid).id

    const fim = verificarFimDeJogo(estado.maos, estado.mesa, estado.jogadores)
    if (fim.encerrado) {
      estado.encerrado = true
      estado.vencedorId = fim.vencedorId ?? null
      estado.vencedores = fim.vencedores ?? []
      estado.motivo = fim.motivo
      await saveEstado(client, estado._partidaId, salaRows[0].id, estado)
      await finalizarPartida(client, estado)
    } else {
      processarTurnosIA(estado)
      await saveEstado(client, estado._partidaId, salaRows[0].id, estado)
    }

    const jogadorNome =
      estado.jogadores.find((j) => j.id === uid)?.nome ?? uid

    await client.query('COMMIT')
    return res.json({
      sucesso: true,
      mensagem: `${jogadorNome} passou a vez.`,
      ...sanitizarEstado(estado, uid),
    })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[partidas POST /:sala/passar]', err)
    return res.status(500).json({ erro: 'Erro ao passar a vez.' })
  } finally {
    client.release()
  }
})

export default router