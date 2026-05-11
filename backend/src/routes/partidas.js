import { Router } from 'express';
import { rooms } from './salas.js';

const router = Router();

// ─── CONSTANTES ────────────────────────────────────────────────────────────────

const FUNCOES = ['Ácido', 'Base', 'Óxido', 'Sal', 'Hidreto'];
const PEDRA_INICIAL = { left: 'Ácido', right: 'Hidreto' };
const PEDRAS_POR_JOGADOR = 7;

// Armazenamento em memória das partidas ativas
const partidas = new Map();

// ─── GERAÇÃO DE PEÇAS ──────────────────────────────────────────────────────────

function gerarTodasAsPedras() {
    const pedras = [];
    let id = 1;

    for (let i = 0; i < FUNCOES.length; i++) {
        for (let j = i; j < FUNCOES.length; j++) {
            pedras.push({
                id: String(id++),
                left: FUNCOES[i],
                right: FUNCOES[j],
            });
        }
    }

    return pedras;
}

function embaralhar(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function distribuirPedras(jogadores) {
    const todas = embaralhar(gerarTodasAsPedras());

    // Garante que a pedra inicial sempre exista no baralho
    const idxInicial = todas.findIndex(
        (p) => p.left === PEDRA_INICIAL.left && p.right === PEDRA_INICIAL.right,
    );
    const pedraInicial = todas.splice(idxInicial, 1)[0];

    const maos = {};
    for (const jogador of jogadores) {
        maos[jogador] = todas.splice(0, PEDRAS_POR_JOGADOR);
    }

    const monte = todas;
    return { maos, monte, pedraInicial };
}

// ─── VALIDAÇÃO ─────────────────────────────────────────────────────────────────

function obterPontas(mesa) {
    if (mesa.length === 0) return { esquerda: null, direita: null };
    return {
        esquerda: mesa[0].left,
        direita: mesa[mesa.length - 1].right,
    };
}

function validarJogada(pedra, mesa) {
    const { esquerda, direita } = obterPontas(mesa);

    if (esquerda === null) return { valido: true, lado: 'direita', virar: false };

    if (pedra.left === direita) return { valido: true, lado: 'direita', virar: false };
    if (pedra.right === direita) return { valido: true, lado: 'direita', virar: true };
    if (pedra.right === esquerda) return { valido: true, lado: 'esquerda', virar: false };
    if (pedra.left === esquerda) return { valido: true, lado: 'esquerda', virar: true };

    return { valido: false, lado: null, virar: false };
}

function aplicarJogada(pedra, mesa, lado, virar) {
    const pedraFinal = virar
        ? { ...pedra, left: pedra.right, right: pedra.left }
        : { ...pedra };

    return lado === 'esquerda' ? [pedraFinal, ...mesa] : [...mesa, pedraFinal];
}

// ─── TURNOS ────────────────────────────────────────────────────────────────────

function proximoJogador(jogadores, jogadorAtual) {
    const idx = jogadores.indexOf(jogadorAtual);
    return jogadores[(idx + 1) % jogadores.length];
}

function alguemPodeJogar(maos, mesa) {
    for (const pedras of Object.values(maos)) {
        for (const pedra of pedras) {
            if (validarJogada(pedra, mesa).valido) return true;
        }
    }
    return false;
}

function verificarFimDeJogo(maos, mesa) {
    // Vitória: alguém esvaziou a mão
    for (const [jogador, pedras] of Object.entries(maos)) {
        if (pedras.length === 0) {
            return { encerrado: true, motivo: 'vitoria', vencedor: jogador, vencedores: [jogador] };
        }
    }

    // Travamento: ninguém pode jogar
    if (!alguemPodeJogar(maos, mesa)) {
        let minPedras = Infinity;
        let vencedores = [];

        for (const [jogador, pedras] of Object.entries(maos)) {
            if (pedras.length < minPedras) {
                minPedras = pedras.length;
                vencedores = [jogador];
            } else if (pedras.length === minPedras) {
                vencedores.push(jogador);
            }
        }

        return {
            encerrado: true,
            motivo: 'travado',
            vencedor: vencedores.length === 1 ? vencedores[0] : null,
            vencedores,
        };
    }

    return { encerrado: false };
}

// ─── IA ────────────────────────────────────────────────────────────────────────

const IA_NOME = 'IA Química';

function jogadaIA(estado) {
    const mao = estado.maos[IA_NOME];
    if (!mao || mao.length === 0) return;

    // Tenta encontrar uma pedra válida
    for (const pedra of mao) {
        const { valido, lado, virar } = validarJogada(pedra, estado.mesa);
        if (valido) {
            estado.mesa = aplicarJogada(pedra, estado.mesa, lado, virar);
            estado.maos[IA_NOME] = mao.filter((p) => p.id !== pedra.id);
            estado.historico.push({
                jogador: IA_NOME,
                pedra,
                lado,
                virar,
                timestamp: new Date().toISOString(),
            });
            return;
        }
    }

    // IA não tem jogada — passa a vez
    estado.historico.push({
        jogador: IA_NOME,
        acao: 'passou',
        timestamp: new Date().toISOString(),
    });
}

/**
 * Executa turnos da IA enquanto for a vez dela.
 * Evita loop infinito com limite de iterações.
 */
function processarTurnosIA(estado) {
    let iteracoes = 0;
    const MAX = estado.jogadores.length * 2;

    while (
        !estado.encerrado &&
        estado.turnoAtual === IA_NOME &&
        iteracoes < MAX
    ) {
        jogadaIA(estado);

        const fim = verificarFimDeJogo(estado.maos, estado.mesa);
        if (fim.encerrado) {
            estado.encerrado = true;
            estado.vencedor = fim.vencedor ?? null;
            estado.vencedores = fim.vencedores ?? [];
            estado.motivo = fim.motivo;
            return;
        }

        estado.turnoAtual = proximoJogador(estado.jogadores, IA_NOME);
        iteracoes++;
    }
}

// ─── HELPER ────────────────────────────────────────────────────────────────────

function sanitizarEstado(estado, jogador) {
    const maosPublicas = {};
    for (const [nome, pedras] of Object.entries(estado.maos)) {
        maosPublicas[nome] = nome === jogador ? pedras : pedras.length;
    }

    return {
        sala: estado.sala,
        jogadores: estado.jogadores,
        turnoAtual: estado.turnoAtual,
        mesa: estado.mesa,
        minha_mao: jogador ? (estado.maos[jogador] ?? []) : undefined,
        maos: maosPublicas,
        monte: estado.monte?.length ?? 0,
        encerrado: estado.encerrado,
        vencedor: estado.vencedor ?? null,
        vencedores: estado.vencedores ?? null,
        motivo: estado.motivo ?? null,
        historico: estado.historico,
        pontas: obterPontas(estado.mesa),
    };
}

function criarEstado({ sala, jogadores, maos, monte, pedraInicial }) {
    return {
        sala,
        jogadores,
        turnoAtual: jogadores[0],
        mesa: [pedraInicial],
        maos,
        monte,
        encerrado: false,
        vencedor: null,
        vencedores: null,
        motivo: null,
        historico: [],
    };
}

// ─── ROTAS ─────────────────────────────────────────────────────────────────────

// POST /api/partidas/iniciar
// Aceita: { jogadores, codigoSala } — ou valida a partir de uma sala existente
router.post('/iniciar', (req, res) => {
    const { jogadores, codigoSala } = req.body ?? {};

    let sala = String(codigoSala ?? '').toUpperCase();

    // Se a sala existir no mapa, valida os jogadores a partir dela
    if (sala && rooms.has(sala)) {
        const room = rooms.get(sala);

        if (room.status === 'playing') {
            return res.status(400).json({ erro: 'Esta sala já tem uma partida em andamento.' });
        }

        const jogadoresSala = room.players.length > 0 ? room.players : jogadores;

        if (!Array.isArray(jogadoresSala) || jogadoresSala.length < 2) {
            return res.status(400).json({ erro: 'Mínimo de 2 jogadores necessário.' });
        }

        room.status = 'playing';
        rooms.set(sala, room);

        const { maos, monte, pedraInicial } = distribuirPedras(jogadoresSala);
        const estado = criarEstado({ sala, jogadores: jogadoresSala, maos, monte, pedraInicial });
        partidas.set(sala, estado);

        // Processa turno da IA se ela começa
        processarTurnosIA(estado);
        partidas.set(sala, estado);

        return res.status(201).json(sanitizarEstado(estado, null));
    }

    // Sala não existe — modo direto (solo ou demo)
    if (!Array.isArray(jogadores) || jogadores.length < 2) {
        return res.status(400).json({ erro: 'Mínimo de 2 jogadores necessário.' });
    }

    if (!sala) {
        sala = crypto.randomUUID().slice(0, 6).toUpperCase();
    }

    const { maos, monte, pedraInicial } = distribuirPedras(jogadores);
    const estado = criarEstado({ sala, jogadores, maos, monte, pedraInicial });
    partidas.set(sala, estado);

    // Processa turno da IA se ela começa
    processarTurnosIA(estado);
    partidas.set(sala, estado);

    res.status(201).json(sanitizarEstado(estado, null));
});

// GET /api/partidas/:sala?jogador=Nome
router.get('/:sala', (req, res) => {
    const sala = req.params.sala.toUpperCase();
    const jogador = req.query.jogador ?? null;

    const estado = partidas.get(sala);
    if (!estado) return res.status(404).json({ erro: 'Partida não encontrada.' });

    res.json(sanitizarEstado(estado, jogador));
});

// POST /api/partidas/:sala/jogar
router.post('/:sala/jogar', (req, res) => {
    const sala = req.params.sala.toUpperCase();
    const { jogador, pedraId } = req.body ?? {};

    const estado = partidas.get(sala);
    if (!estado) return res.status(404).json({ erro: 'Partida não encontrada.' });
    if (estado.encerrado) return res.status(400).json({ erro: 'Partida já encerrada.' });
    if (estado.turnoAtual !== jogador) return res.status(403).json({ erro: 'Não é o seu turno.' });

    const mao = estado.maos[jogador];
    const pedra = mao?.find((p) => p.id === String(pedraId));
    if (!pedra) return res.status(400).json({ erro: 'Pedra não encontrada na sua mão.' });

    const { valido, lado, virar } = validarJogada(pedra, estado.mesa);
    if (!valido) {
        return res.status(400).json({
            erro: 'Jogada inválida. A pedra não encaixa nas pontas disponíveis.',
            pontas: obterPontas(estado.mesa),
        });
    }

    // Aplica jogada do jogador humano
    estado.mesa = aplicarJogada(pedra, estado.mesa, lado, virar);
    estado.maos[jogador] = mao.filter((p) => p.id !== pedraId);
    estado.historico.push({ jogador, pedra, lado, virar, timestamp: new Date().toISOString() });

    const fim = verificarFimDeJogo(estado.maos, estado.mesa);
    if (fim.encerrado) {
        estado.encerrado = true;
        estado.vencedor = fim.vencedor ?? null;
        estado.vencedores = fim.vencedores ?? [];
        estado.motivo = fim.motivo;
    } else {
        estado.turnoAtual = proximoJogador(estado.jogadores, jogador);

        // Processa turno(s) da IA automaticamente
        processarTurnosIA(estado);
    }

    partidas.set(sala, estado);
    res.json({ sucesso: true, ...sanitizarEstado(estado, jogador) });
});

// POST /api/partidas/:sala/passar
router.post('/:sala/passar', (req, res) => {
    const sala = req.params.sala.toUpperCase();
    const { jogador } = req.body ?? {};

    const estado = partidas.get(sala);
    if (!estado) return res.status(404).json({ erro: 'Partida não encontrada.' });
    if (estado.encerrado) return res.status(400).json({ erro: 'Partida já encerrada.' });
    if (estado.turnoAtual !== jogador) return res.status(403).json({ erro: 'Não é o seu turno.' });

    const mao = estado.maos[jogador] ?? [];
    const temJogada = mao.some((p) => validarJogada(p, estado.mesa).valido);
    if (temJogada) {
        return res.status(400).json({ erro: 'Você ainda possui jogadas válidas. Não é possível passar.' });
    }

    estado.historico.push({ jogador, acao: 'passou', timestamp: new Date().toISOString() });
    estado.turnoAtual = proximoJogador(estado.jogadores, jogador);

    const fim = verificarFimDeJogo(estado.maos, estado.mesa);
    if (fim.encerrado) {
        estado.encerrado = true;
        estado.vencedor = fim.vencedor ?? null;
        estado.vencedores = fim.vencedores ?? [];
        estado.motivo = fim.motivo;
    } else {
        // Processa turno(s) da IA automaticamente
        processarTurnosIA(estado);
    }

    partidas.set(sala, estado);
    res.json({ sucesso: true, mensagem: `${jogador} passou a vez.`, ...sanitizarEstado(estado, jogador) });
});

export default router;