import { Router } from 'express';

const router = Router();

// Exportado para partidas.js poder acessar
export const rooms = new Map();

function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i += 1) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

function createUniqueCode() {
    let code = generateRoomCode();
    let tries = 0;
    while (rooms.has(code) && tries < 5) {
        code = generateRoomCode();
        tries += 1;
    }
    return code;
}

// POST /api/salas — criar sala
router.post('/', (req, res) => {
    const { hostName } = req.body ?? {};
    const code = createUniqueCode();

    const room = {
        code,
        hostName: typeof hostName === 'string' && hostName.trim() ? hostName.trim() : 'Anfitrião',
        createdAt: new Date().toISOString(),
        players: [],
        status: 'waiting',
    };

    rooms.set(code, room);
    res.status(201).json(room);
});

// GET /api/salas/:code — buscar sala
router.get('/:code', (req, res) => {
    const code = String(req.params.code ?? '').toUpperCase();
    const room = rooms.get(code);

    if (!room) {
        return res.status(404).json({ message: 'Sala não encontrada.' });
    }

    res.json(room);
});

// POST /api/salas/:code/entrar — jogador entra na sala
router.post('/:code/entrar', (req, res) => {
    const code = String(req.params.code ?? '').toUpperCase();
    const { nome } = req.body ?? {};

    const room = rooms.get(code);
    if (!room) return res.status(404).json({ erro: 'Sala não encontrada.' });
    if (room.status !== 'waiting') return res.status(400).json({ erro: 'A partida desta sala já foi iniciada.' });
    if (!nome || typeof nome !== 'string' || !nome.trim()) {
        return res.status(400).json({ erro: 'Nome do jogador é obrigatório.' });
    }

    const nomeTrimmed = nome.trim();

    if (room.players.includes(nomeTrimmed)) {
        // Jogador já está na sala — retorna sala sem erro (reconexão)
        return res.json(room);
    }

    if (room.players.length >= 4) {
        return res.status(400).json({ erro: 'Sala cheia. Máximo de 4 jogadores.' });
    }

    room.players.push(nomeTrimmed);
    rooms.set(code, room);
    res.json(room);
});

export default router;