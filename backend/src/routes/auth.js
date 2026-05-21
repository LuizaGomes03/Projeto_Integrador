// backend/src/routes/auth.js
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const TIPOS_VALIDOS = ['aluno', 'professor']
const EMAIL_ACADEMICO = /^[^\s@]+@aluno\.cps\.sp\.gov\.br$/i
const SALT_ROUNDS = 12

function gerarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

function sanitizarUsuario(usuario) {
  const { senha_hash, ...sem_senha } = usuario
  return sem_senha
}

// ─── POST /api/auth/register ───────────────────────────────────────────────────
// Cria um novo usuário (aluno ou professor)
//
// Body: { nome, email, senha, tipo? }
// tipo padrão: 'aluno'
//
// Validações:
//   - todos os campos obrigatórios
//   - email único
//   - alunos: email deve terminar em @aluno.cps.sp.gov.br
//   - senha: mínimo 6 caracteres

router.post('/register', async (req, res) => {
  const { nome, email, senha, tipo = 'aluno' } = req.body ?? {}

  // Validações básicas
  if (!nome?.trim()) {
    return res.status(400).json({ erro: 'Nome é obrigatório.' })
  }

  if (!email?.trim()) {
    return res.status(400).json({ erro: 'Email é obrigatório.' })
  }

  if (!senha) {
    return res.status(400).json({ erro: 'Senha é obrigatória.' })
  }

  if (senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' })
  }

  if (!TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({ erro: 'Tipo inválido. Use "aluno" ou "professor".' })
  }

  const emailNormalizado = email.trim().toLowerCase()

  if (tipo === 'aluno' && !EMAIL_ACADEMICO.test(emailNormalizado)) {
    return res.status(400).json({
      erro: 'Alunos devem usar email institucional (@aluno.cps.sp.gov.br).',
    })
  }

  try {
    // Verificar se email já existe
    const { rows: existente } = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [emailNormalizado]
    )

    if (existente.length > 0) {
      return res.status(409).json({ erro: 'Email já cadastrado.' })
    }

    // Hash da senha
    const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS)

    // Inserir usuário
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, tipo)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nome.trim(), emailNormalizado, senha_hash, tipo]
    )

    const usuario = rows[0]
    const token = gerarToken(usuario)

    return res.status(201).json({
      mensagem: 'Cadastro realizado com sucesso.',
      token,
      usuario: sanitizarUsuario(usuario),
    })
  } catch (err) {
    console.error('[auth/register]', err)
    return res.status(500).json({ erro: 'Erro interno ao criar conta.' })
  }
})

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
// Autentica um usuário existente
//
// Body: { email, senha }
// Retorna: { token, usuario }

router.post('/login', async (req, res) => {
  const { email, senha } = req.body ?? {}

  if (!email?.trim() || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' })
  }

  const emailNormalizado = email.trim().toLowerCase()

  try {
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [emailNormalizado]
    )

    if (rows.length === 0) {
      // Mensagem genérica por segurança (não revelar se email existe)
      return res.status(401).json({ erro: 'Email ou senha incorretos.' })
    }

    const usuario = rows[0]
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash)

    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Email ou senha incorretos.' })
    }

    const token = gerarToken(usuario)

    return res.json({
      mensagem: 'Login realizado com sucesso.',
      token,
      usuario: sanitizarUsuario(usuario),
    })
  } catch (err) {
    console.error('[auth/login]', err)
    return res.status(500).json({ erro: 'Erro interno ao fazer login.' })
  }
})

// ─── GET /api/auth/me ──────────────────────────────────────────────────────────
// Retorna os dados do usuário autenticado
// Requer: Authorization: Bearer <token>

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nome, email, tipo, criado_em FROM usuarios WHERE id = $1',
      [req.usuario.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' })
    }

    return res.json({ usuario: rows[0] })
  } catch (err) {
    console.error('[auth/me]', err)
    return res.status(500).json({ erro: 'Erro interno.' })
  }
})

// ─── PUT /api/auth/me ──────────────────────────────────────────────────────────
// Atualiza nome ou senha do usuário autenticado
// Requer: Authorization: Bearer <token>
//
// Body: { nome?, senhaAtual?, novaSenha? }

router.put('/me', authMiddleware, async (req, res) => {
  const { nome, senhaAtual, novaSenha } = req.body ?? {}
  const updates = []
  const values = []
  let idx = 1

  if (nome?.trim()) {
    updates.push(`nome = $${idx++}`)
    values.push(nome.trim())
  }

  if (novaSenha) {
    if (!senhaAtual) {
      return res.status(400).json({ erro: 'Informe a senha atual para alterá-la.' })
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ erro: 'A nova senha deve ter no mínimo 6 caracteres.' })
    }

    try {
      const { rows } = await pool.query(
        'SELECT senha_hash FROM usuarios WHERE id = $1',
        [req.usuario.id]
      )

      const senhaCorreta = await bcrypt.compare(senhaAtual, rows[0].senha_hash)

      if (!senhaCorreta) {
        return res.status(401).json({ erro: 'Senha atual incorreta.' })
      }

      const novoHash = await bcrypt.hash(novaSenha, SALT_ROUNDS)
      updates.push(`senha_hash = $${idx++}`)
      values.push(novoHash)
    } catch (err) {
      console.error('[auth/me PUT]', err)
      return res.status(500).json({ erro: 'Erro ao verificar senha.' })
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ erro: 'Nenhum campo para atualizar.' })
  }

  try {
    values.push(req.usuario.id)
    const { rows } = await pool.query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )

    return res.json({
      mensagem: 'Dados atualizados com sucesso.',
      usuario: sanitizarUsuario(rows[0]),
    })
  } catch (err) {
    console.error('[auth/me PUT]', err)
    return res.status(500).json({ erro: 'Erro interno ao atualizar.' })
  }
})

export default router