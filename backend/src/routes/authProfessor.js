import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db.js'

const router = Router()

const SALT_ROUNDS = 12

// ─── HELPER ───────────────────────────────────────────────────────────────────

function gerarToken(professor) {
  return jwt.sign(
    {
      id: professor.id,
      nome: professor.nome,
      email: professor.email,
      tipo: 'professor',          
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

function sanitizar(professor) {
  const { senha_hash, ...sem_senha } = professor
  return { ...sem_senha, tipo: 'professor' }
}

router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body ?? {}

  if (!nome?.trim())   return res.status(400).json({ erro: 'Nome é obrigatório.' })
  if (!email?.trim())  return res.status(400).json({ erro: 'Email é obrigatório.' })
  if (!senha)          return res.status(400).json({ erro: 'Senha é obrigatória.' })
  if (senha.length < 6) return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' })

  const emailNorm = email.trim().toLowerCase()

  const client = await pool.connect()
  try {
    const { rows: existe } = await client.query(
      'SELECT id FROM professores WHERE email = $1',
      [emailNorm]
    )
    if (existe.length > 0) {
      return res.status(409).json({ erro: 'Email já cadastrado.' })
    }

    const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS)

    const { rows } = await client.query(
      `INSERT INTO professores (nome, email, senha_hash)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nome.trim(), emailNorm, senha_hash]
    )

    const professor = rows[0]
    const token = gerarToken(professor)

    return res.status(201).json({
      mensagem: 'Professor cadastrado com sucesso.',
      token,
      usuario: sanitizar(professor),
    })
  } catch (err) {
    console.error('[authProfessor/register]', err)
    return res.status(500).json({ erro: 'Erro interno ao criar conta.' })
  } finally {
    client.release()
  }
})

router.post('/login', async (req, res) => {
  const { email, senha } = req.body ?? {}

  if (!email?.trim() || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' })
  }

  const emailNorm = email.trim().toLowerCase()

  const client = await pool.connect()
  try {
    const { rows } = await client.query(
      'SELECT * FROM professores WHERE email = $1',
      [emailNorm]
    )

    if (rows.length === 0) {
      return res.status(401).json({ erro: 'Email ou senha incorretos.' })
    }

    const professor = rows[0]
    const senhaCorreta = await bcrypt.compare(senha, professor.senha_hash)

    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Email ou senha incorretos.' })
    }

    const token = gerarToken(professor)

    return res.json({
      mensagem: 'Login realizado com sucesso.',
      token,
      usuario: sanitizar(professor),
    })
  } catch (err) {
    console.error('[authProfessor/login]', err)
    return res.status(500).json({ erro: 'Erro interno ao fazer login.' })
  } finally {
    client.release()
  }
})

router.put('/me', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ erro: 'Não autorizado.' })
  const token = authHeader.split(' ')[1]

  let payload
  try { payload = jwt.verify(token, process.env.JWT_SECRET) }
  catch { return res.status(401).json({ erro: 'Token inválido.' }) }

  const { nome, senhaAtual, novaSenha } = req.body ?? {}
  const updates = []; const values = []; let idx = 1

  if (nome?.trim()) {
    updates.push(`nome = $${idx++}`)
    values.push(nome.trim())
  }

  if (novaSenha) {
    if (!senhaAtual) return res.status(400).json({ erro: 'Informe a senha atual.' })
    if (novaSenha.length < 6) return res.status(400).json({ erro: 'Mínimo 6 caracteres.' })
    const client = await pool.connect()
    try {
      const { rows } = await client.query('SELECT senha_hash FROM professores WHERE id = $1', [payload.id])
      const ok = await bcrypt.compare(senhaAtual, rows[0].senha_hash)
      if (!ok) return res.status(401).json({ erro: 'Senha atual incorreta.' })
      updates.push(`senha_hash = $${idx++}`)
      values.push(await bcrypt.hash(novaSenha, 12))
    } finally { client.release() }
  }

  if (updates.length === 0) return res.status(400).json({ erro: 'Nada para atualizar.' })

  const client = await pool.connect()
  try {
    values.push(payload.id)
    const { rows } = await client.query(
      `UPDATE professores SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )
    return res.json({ mensagem: 'Atualizado.', usuario: sanitizar(rows[0]) })
  } catch (err) {
    console.error('[authProfessor/me PUT]', err)
    return res.status(500).json({ erro: 'Erro interno.' })
  } finally { client.release() }
})

router.delete('/me', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ erro: 'Não autorizado.' })
  const token = authHeader.split(' ')[1]

  let payload
  try { payload = jwt.verify(token, process.env.JWT_SECRET) }
  catch { return res.status(401).json({ erro: 'Token inválido.' }) }

  const client = await pool.connect()
  try {
    await client.query('DELETE FROM professores WHERE id = $1', [payload.id])
    return res.json({ mensagem: 'Conta excluída.' })
  } catch (err) {
    console.error('[authProfessor/me DELETE]', err)
    return res.status(500).json({ erro: 'Erro interno.' })
  } finally { client.release() }
})

export default router