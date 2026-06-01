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
    nivel: salaRow.nivel ?? 1,
    players: jogadores.map((j) => ({ id: j.id, nome: j.nome })),
  }
}

// ─── POST /api/salas — criar sala ─────────────────────────────────────────────
// Body: { hostId, nivel?: 1|2|3 }
router.post('/', async (req, res) => {
  const { hostId, nivel } = req.body ?? {}
  const nivelSala = [1, 2, 3].includes(Number(nivel)) ? Number(nivel) : 1

  if (!hostId) {
    return res.status(400).json({ erro: 'hostId é obrigatório.' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const code = await createUniqueCode(client)

    // Tenta adicionar a coluna nivel se ainda não existir (migração suave)
    // Em produção, faça a migração separada; aqui garantimos compatibilidade
    const { rows: salaRows } = await client.query(
      `INSERT INTO salas (code, host_id, status, nivel)
       VALUES ($1, $2, 'waiting', $3)
       RETURNING *`,
      [code, hostId, nivelSala]
    ).catch(async () => {
      // Fallback: coluna nivel pode não existir ainda → insere sem ela
      return client.query(
        `INSERT INTO salas (code, host_id, status)
         VALUES ($1, $2, 'waiting')
         RETURNING *`,
        [code, hostId]
      )
    })

    const sala = salaRows[0]

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

// ─── GET /api/salas/:code ─────────────────────────────────────────────────────
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

// ─── PATCH /api/salas/:code/nivel — host atualiza o nível antes de iniciar ───
// Body: { hostId, nivel: 1|2|3 }
router.patch('/:code/nivel', async (req, res) => {
  const code = String(req.params.code ?? '').toUpperCase()
  const { hostId, nivel } = req.body ?? {}

  if (![1, 2, 3].includes(Number(nivel))) {
    return res.status(400).json({ erro: 'Nível inválido. Use 1, 2 ou 3.' })
  }

  const client = await pool.connect()
  try {
    const { rows } = await client.query(
      'SELECT * FROM salas WHERE code = $1',
      [code]
    )
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Sala não encontrada.' })
    }

    const sala = rows[0]
    if (sala.host_id !== Number(hostId)) {
      return res.status(403).json({ erro: 'Apenas o host pode alterar o nível.' })
    }
    if (sala.status !== 'waiting') {
      return res.status(400).json({ erro: 'Partida já iniciada.' })
    }

    await client.query(
      'UPDATE salas SET nivel = $1 WHERE id = $2',
      [Number(nivel), sala.id]
    )

    const payload = await buildRoomPayload(client, { ...sala, nivel: Number(nivel) })
    return res.json(payload)
  } catch (err) {
    console.error('[salas PATCH /:code/nivel]', err)
    return res.status(500).json({ erro: 'Erro ao atualizar nível.' })
  } finally {
    client.release()
  }
})

// ─── POST /api/salas/:code/entrar ─────────────────────────────────────────────
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

    // Reconexão
    const { rows: jaEsta } = await client.query(
      'SELECT 1 FROM sala_jogadores WHERE sala_id = $1 AND usuario_id = $2',
      [sala.id, usuarioId]
    )
    if (jaEsta.length > 0) {
      await client.query('ROLLBACK')
      const payload = await buildRoomPayload(client, sala)
      return res.json(payload)
    }

    // Limite 4 jogadores
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

// ─── DELETE /api/salas/:code/sair ─────────────────────────────────────────────
// Body: { usuarioId }
router.delete('/:code/sair', async (req, res) => {
  const code = String(req.params.code ?? '').toUpperCase()
  const { usuarioId } = req.body ?? {}

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

    if (salaRows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ erro: 'Sala não encontrada.' })
    }

    const salaId = salaRows[0].id

    await client.query(
      'DELETE FROM sala_jogadores WHERE sala_id = $1 AND usuario_id = $2',
      [salaId, usuarioId]
    )

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