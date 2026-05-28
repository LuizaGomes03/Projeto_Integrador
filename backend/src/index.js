import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import salaRoutes from './routes/salas.js'
import partidaRoutes from './routes/partidas.js'
import authRoutes from './routes/auth.js'
import desempenhoRoutes from './routes/desempenho.js'
 
dotenv.config()
 
const app = express()
const PORT = process.env.PORT || 3001
 
app.use(cors())
app.use(express.json())
 
// ─── ROTAS PÚBLICAS ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'Backend rodando!' })
})
 
app.use('/api/auth', authRoutes)
app.use('/api/aluno', desempenhoRoutes)

// ─── ROTAS DO JOGO ─────────────────────────────────────────────────────────────
// Futuramente: adicionar authMiddleware aqui para proteger salas/partidas
app.use('/api/salas', salaRoutes)
app.use('/api/partidas', partidaRoutes)
 
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
})