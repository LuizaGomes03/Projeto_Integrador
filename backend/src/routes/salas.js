import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

async function createUniqueCode(client) {
  let code = generateRoomCode()
  let tries = 0
  while (tries < 5) {
    const { rows } = await client.query('SELECT 1 FROM salas WHERE code = $1', [code])
    if (rows.length === 0) return code
    code = generateRoomCode()
    tries += 1
  }
  return code
}

async function buildRoomPayload(client, salaRow) {
  const { rows: jogadores } = await client.query(
    `SELECT u.id, u.nome
       FROM sala_jogadores sj
       JOIN usuarios u ON u.id = sj.usuario_id
      WHERE sj.sala_id = $1
      ORDER BY sj.entrou_em`,
    [salaRow.id]
  )

  return {
    id: salaRow.id,
    code: salaRow.code,
    hostId: salaRow.host_id,
    createdAt: salaRow.criado_em,
    status: salaRow.status,
    players: jogadores.map((j) => ({ id: j.id, nome: j.nome })),
  }
}

// ─── POST /api/salas — criar sala ─────────────────────────────────────────────
// Body: { hostId }
router.post('/', async (req, res) => {
  const { hostId } = req.body ?? {}

  if (!hostId) {
    return res.status(400).json({ erro: 'hostId é obrigatório.' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const code = await createUniqueCode(client)

    const { rows: salaRows } = await client.query(
      `INSERT INTO salas (code, host_id, status)
       VALUES ($1, $2, 'waiting')
       RETURNING *`,
      [code, hostId]
    )
    const sala = salaRows[0]

    // Adiciona o host como primeiro jogador
    await client.query(
      `INSERT INTO sala_jogadores (sala_id, usuario_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [sala.id, hostId]
    )

    await client.query('COMMIT')

    const payload = await buildRoomPayload(client, sala)
    return res.status(201).json(payload)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[salas POST /]', err)
    return res.status(500).json({ erro: 'Erro ao criar sala.' })
  } finally {
    client.release()
  }
})

// ─── GET /api/salas/:code — buscar sala por código ────────────────────────────
router.get('/:code', async (req, res) => {
  const code = String(req.params.code ?? '').toUpperCase()

  const client = await pool.connect()
  try {
    const { rows } = await client.query('SELECT * FROM salas WHERE code = $1', [code])
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Sala não encontrada.' })
    }
    const payload = await buildRoomPayload(client, rows[0])
    return res.json(payload)
  } catch (err) {
    console.error('[salas GET /:code]', err)
    return res.status(500).json({ erro: 'Erro ao buscar sala.' })
  } finally {
    client.release()
  }
})

// ─── POST /api/salas/:code/entrar — jogador entra na sala ─────────────────────
// Body: { usuarioId }
router.post('/:code/entrar', async (req, res) => {
  const code = String(req.params.code ?? '').toUpperCase()
  const { usuarioId } = req.body ?? {}

  if (!usuarioId || Number(usuarioId) <= 0) {
    return res.status(400).json({ erro: 'usuarioId inválido.' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: salaRows } = await client.query(
      'SELECT * FROM salas WHERE code = $1',
      [code]
    )
    if (salaRows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ erro: 'Sala não encontrada.' })
    }

    const sala = salaRows[0]

    if (sala.status !== 'waiting') {
      await client.query('ROLLBACK')
      return res.status(400).json({ erro: 'A partida desta sala já foi iniciada.' })
    }

    // Reconexão — jogador já está na sala
    const { rows: jaEsta } = await client.query(
      'SELECT 1 FROM sala_jogadores WHERE sala_id = $1 AND usuario_id = $2',
      [sala.id, usuarioId]
    )
    if (jaEsta.length > 0) {
      await client.query('ROLLBACK')
      const payload = await buildRoomPayload(client, sala)
      return res.json(payload)
    }

    // Limite de 4 jogadores
    const { rows: countRows } = await client.query(
      'SELECT COUNT(*) AS total FROM sala_jogadores WHERE sala_id = $1',
      [sala.id]
    )
    if (Number(countRows[0].total) >= 4) {
      await client.query('ROLLBACK')
      return res.status(400).json({ erro: 'Sala cheia. Máximo de 4 jogadores.' })
    }

    await client.query(
      'INSERT INTO sala_jogadores (sala_id, usuario_id) VALUES ($1, $2)',
      [sala.id, usuarioId]
    )

    await client.query('COMMIT')

    const payload = await buildRoomPayload(client, sala)
    return res.json(payload)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[salas POST /:code/entrar]', err)
    return res.status(500).json({ erro: 'Erro ao entrar na sala.' })
  } finally {
    client.release()
  }
})

// ─── DELETE /api/salas/:code/sair — jogador sai da sala ─────────────────────
// Body: { usuarioId }
router.delete('/:code/sair', async (req, res) => {
  const code = String(req.params.code ?? '').toUpperCase()
  const { usuarioId } = req.body ?? {}

  console.log('🚪 DELETE /sair recebido')
  console.log('code:', code)
  console.log('usuarioId:', usuarioId)

  if (!usuarioId || Number(usuarioId) <= 0) {
    return res.status(400).json({ erro: 'usuarioId inválido.' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: salaRows } = await client.query(
      'SELECT id FROM salas WHERE code = $1',
      [code]
    )
    console.log('🚪 Sala encontrada:', salaRows)
    if (salaRows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ erro: 'Sala não encontrada.' })
    }

    const salaId = salaRows[0].id
    console.log('🚪 Removendo jogador', usuarioId, 'da sala', salaId)

    // Remove o jogador da sala
    await client.query(
      'DELETE FROM sala_jogadores WHERE sala_id = $1 AND usuario_id = $2',
      [salaId, usuarioId]
    )

    // Se a sala ficou vazia, deleta ela também
    const { rows: countRows } = await client.query(
      'SELECT COUNT(*) AS total FROM sala_jogadores WHERE sala_id = $1',
      [salaId]
    )
    if (Number(countRows[0].total) === 0) {
      await client.query('DELETE FROM salas WHERE code = $1', [code])
    }

    await client.query('COMMIT')
    return res.json({ sucesso: true, mensagem: 'Saído da sala.' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[salas DELETE /:code/sair]', err)
    return res.status(500).json({ erro: 'Erro ao sair da sala.' })
  } finally {
    client.release()
  }
})

export default router