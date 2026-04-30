import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

function createUniqueCode() {
  let tries = 0;
  let code = generateRoomCode();

  while (rooms.has(code) && tries < 5) {
    code = generateRoomCode();
    tries += 1;
  }

  return code;
}

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend rodando!' });
});

app.post('/api/salas', (req, res) => {
  const { hostName } = req.body ?? {};
  const code = createUniqueCode();
  const now = new Date().toISOString();

  const room = {
    code,
    hostName: typeof hostName === 'string' && hostName.trim() ? hostName.trim() : 'Anfitriao',
    createdAt: now,
    players: [],
    status: 'waiting',
  };

  rooms.set(code, room);
  res.status(201).json(room);
});

app.get('/api/salas/:code', (req, res) => {
  const code = String(req.params.code || '').toUpperCase();
  const room = rooms.get(code);

  if (!room) {
    res.status(404).json({ message: 'Sala nao encontrada' });
    return;
  }

  res.json(room);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
