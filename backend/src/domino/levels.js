/**
 * backend/src/domino/levels.js
 *
 * Definição dos 3 níveis de dificuldade e geração de pedras ricas.
 *
 * NÍVEL 1 – Fácil   : Função ↔ Função
 * NÍVEL 2 – Médio   : Fórmula ↔ Função  (encaixe pelo nome da função)
 * NÍVEL 3 – Difícil : Propriedade ↔ Classificação (encaixe pelo nome da função)
 *
 * A validação de encaixe é sempre feita pelo campo `encaixe` de cada face,
 * que é sempre o nome da função inorgânica. O campo `display` é o que o
 * jogador vê na peça.
 */

// ─── BASE DE DADOS QUÍMICA ────────────────────────────────────────────────────

export const COMPOSTOS = [
  // ── Ácidos ──────────────────────────────────────────────────────────────────
  { funcao: 'Ácido',   formula: 'HCl',        propriedade: 'Corrosivo',     classificacao: 'Hidrácido'  },
  { funcao: 'Ácido',   formula: 'H₂SO₄',      propriedade: 'Desidratante',  classificacao: 'Oxiácido'   },
  { funcao: 'Ácido',   formula: 'HNO₃',       propriedade: 'Oxidante',      classificacao: 'Oxiácido'   },
  { funcao: 'Ácido',   formula: 'H₃PO₄',      propriedade: 'Não-volátil',   classificacao: 'Oxiácido'   },
  { funcao: 'Ácido',   formula: 'HF',          propriedade: 'Tóxico',        classificacao: 'Hidrácido'  },
  { funcao: 'Ácido',   formula: 'H₂CO₃',      propriedade: 'Instável',      classificacao: 'Oxiácido'   },
  { funcao: 'Ácido',   formula: 'HBr',         propriedade: 'Gasoso',        classificacao: 'Hidrácido'  },
  // ── Bases ───────────────────────────────────────────────────────────────────
  { funcao: 'Base',    formula: 'NaOH',        propriedade: 'Solúvel',       classificacao: 'Hidróxido'  },
  { funcao: 'Base',    formula: 'Ca(OH)₂',     propriedade: 'Pouco solúvel', classificacao: 'Hidróxido'  },
  { funcao: 'Base',    formula: 'Mg(OH)₂',     propriedade: 'Insolúvel',     classificacao: 'Hidróxido'  },
  { funcao: 'Base',    formula: 'KOH',         propriedade: 'Cáustico',      classificacao: 'Hidróxido'  },
  { funcao: 'Base',    formula: 'Al(OH)₃',     propriedade: 'Anfótero',      classificacao: 'Hidróxido'  },
  { funcao: 'Base',    formula: 'NH₃',         propriedade: 'Gasoso',        classificacao: 'Amônia'     },
  // ── Óxidos ──────────────────────────────────────────────────────────────────
  { funcao: 'Óxido',   formula: 'CO₂',         propriedade: 'Gasoso',        classificacao: 'Ácido'      },
  { funcao: 'Óxido',   formula: 'SO₃',         propriedade: 'Irritante',     classificacao: 'Ácido'      },
  { funcao: 'Óxido',   formula: 'Na₂O',        propriedade: 'Reativo',       classificacao: 'Básico'     },
  { funcao: 'Óxido',   formula: 'CaO',         propriedade: 'Cal virgem',    classificacao: 'Básico'     },
  { funcao: 'Óxido',   formula: 'Fe₂O₃',       propriedade: 'Ferrugem',      classificacao: 'Básico'     },
  { funcao: 'Óxido',   formula: 'Al₂O₃',       propriedade: 'Refratário',    classificacao: 'Anfótero'   },
  { funcao: 'Óxido',   formula: 'NO',          propriedade: 'Neutro',        classificacao: 'Neutro'     },
  // ── Sais ────────────────────────────────────────────────────────────────────
  { funcao: 'Sal',     formula: 'NaCl',        propriedade: 'Solúvel',       classificacao: 'Normal'     },
  { funcao: 'Sal',     formula: 'CaCO₃',       propriedade: 'Insolúvel',     classificacao: 'Normal'     },
  { funcao: 'Sal',     formula: 'NaHCO₃',      propriedade: 'Efervescente',  classificacao: 'Ácido'      },
  { funcao: 'Sal',     formula: 'Ca₃(PO₄)₂',  propriedade: 'Insolúvel',     classificacao: 'Normal'     },
  { funcao: 'Sal',     formula: 'CuSO₄',       propriedade: 'Cristalino',    classificacao: 'Normal'     },
  { funcao: 'Sal',     formula: 'AgNO₃',       propriedade: 'Solúvel',       classificacao: 'Normal'     },
  // ── Hidretos ────────────────────────────────────────────────────────────────
  { funcao: 'Hidreto', formula: 'NaH',         propriedade: 'Reativo',       classificacao: 'Metálico'   },
  { funcao: 'Hidreto', formula: 'CaH₂',        propriedade: 'Sólido',        classificacao: 'Metálico'   },
  { funcao: 'Hidreto', formula: 'H₂O',         propriedade: 'Polar',         classificacao: 'Molecular'  },
  { funcao: 'Hidreto', formula: 'H₂S',         propriedade: 'Tóxico',        classificacao: 'Molecular'  },
  { funcao: 'Hidreto', formula: 'H₂',          propriedade: 'Inflamável',    classificacao: 'Molecular'  },
]

// Token list — as cinco funções inorgânicas usadas como chave de encaixe
export const FUNCOES = ['Ácido', 'Base', 'Óxido', 'Sal', 'Hidreto']

// ─── DEFINIÇÃO DOS NÍVEIS ─────────────────────────────────────────────────────

export const NIVEIS = {
  1: {
    id: 1,
    nome: 'Fácil',
    emoji: '🧪',
    descricao: 'Conecte funções inorgânicas iguais',
    detalhes: 'Cada metade mostra o nome da função. Encaixe metades com a mesma função.',
    cor: '#16A34A',
    corBg: '#F0FDF4',
    corBorda: '#86EFAC',
  },
  2: {
    id: 2,
    nome: 'Médio',
    emoji: '⚗️',
    descricao: 'Conecte fórmulas com suas funções',
    detalhes: 'Um lado mostra a fórmula química, o outro a função. Encaixe fórmula com sua função.',
    cor: '#D97706',
    corBg: '#FFFBEB',
    corBorda: '#FCD34D',
  },
  3: {
    id: 3,
    nome: 'Difícil',
    emoji: '🔬',
    descricao: 'Conecte propriedades com classificações',
    detalhes: 'Um lado exibe uma propriedade, o outro uma classificação. Encaixe compostos da mesma função.',
    cor: '#DC2626',
    corBg: '#FEF2F2',
    corBorda: '#FCA5A5',
  },
}

// ─── LCG — gerador pseudo-aleatório determinístico ────────────────────────────
// Usado apenas para gerar as faces exibidas (não é segurança — só variedade visual).

function makeLcg(seed) {
  let s = seed >>> 0
  return () => {
    s = Math.imul(s, 1664525) + 1013904223 >>> 0
    return s / 0x100000000
  }
}

// ─── GERAÇÃO DE FACE RICA ─────────────────────────────────────────────────────

/**
 * Gera uma face para exibição numa metade da pedra.
 *
 * Retorna:
 *   encaixe      — string de encaixe (nome da função) — usado na validação
 *   display      — texto principal exibido na face
 *   subtitulo    — texto secundário (fórmula, hint) ou null
 *   tipo         — 'funcao' | 'formula' | 'propriedade' | 'classificacao'
 */
export function gerarFaceRica(funcao, nivel, rng) {
  const candidatos = COMPOSTOS.filter((c) => c.funcao === funcao)
  // Escolhe um composto diferente para cada chamada (variedade visual)
  const composto = candidatos.length > 0
    ? candidatos[Math.floor(rng() * candidatos.length)]
    : null

  switch (nivel) {
    // ── Nível 1: só o nome da função ──────────────────────────────────────────
    case 1:
      return {
        encaixe: funcao,
        display: funcao,
        subtitulo: null,
        tipo: 'funcao',
      }

    // ── Nível 2: fórmula OU função (50/50) ────────────────────────────────────
    case 2: {
      const mostrarFormula = rng() < 0.5
      if (mostrarFormula && composto) {
        return {
          encaixe: funcao,
          display: composto.formula,
          subtitulo: null,         // sem dica no médio
          tipo: 'formula',
        }
      }
      return {
        encaixe: funcao,
        display: funcao,
        subtitulo: null,
        tipo: 'funcao',
      }
    }

    // ── Nível 3: propriedade OU classificação (50/50) ─────────────────────────
    case 3: {
      const mostrarProp = rng() < 0.5
      if (composto) {
        if (mostrarProp) {
          return {
            encaixe: funcao,
            display: composto.propriedade,
            subtitulo: composto.formula,
            tipo: 'propriedade',
          }
        }
        return {
          encaixe: funcao,
          // Mostra subclasse + função para dar contexto suficiente
          display: composto.classificacao,
          subtitulo: `${funcao} · ${composto.formula}`,
          tipo: 'classificacao',
        }
      }
      // Fallback sem composto
      return { encaixe: funcao, display: funcao, subtitulo: null, tipo: 'funcao' }
    }

    default:
      return { encaixe: funcao, display: funcao, subtitulo: null, tipo: 'funcao' }
  }
}

// ─── GERAÇÃO DO CONJUNTO COMPLETO DE PEDRAS ───────────────────────────────────

/**
 * Gera todas as pedras para o nível especificado.
 * Com 5 funções, há 5+4+3+2+1 = 15 pedras (combinações com repetição C(5+1,2)).
 *
 * Cada pedra:
 *   { id: string, left: FaceRica, right: FaceRica }
 */
export function gerarTodasAsPedrasParaNivel(nivel) {
  // Seed varia por nível para que as faces exibidas sejam diferentes em cada nível,
  // mas sejam consistentes numa mesma sessão (sem DB randômico a cada chamada).
  // Em jogo real o embaralhamento da distribuição já garante variedade suficiente.
  const rng = makeLcg(0xDEAD + nivel * 0x1337)

  const pedras = []
  let id = 1

  for (let i = 0; i < FUNCOES.length; i++) {
    for (let j = i; j < FUNCOES.length; j++) {
      const left  = gerarFaceRica(FUNCOES[i], nivel, rng)
      const right = gerarFaceRica(FUNCOES[j], nivel, rng)
      pedras.push({ id: String(id++), left, right })
    }
  }

  return pedras  // 15 pedras
}

/**
 * Retorna a pedra inicial da mesa (Ácido | Hidreto) para o nível dado.
 * Usa seed separada para não interferir com o conjunto de pedras.
 */
export function getPedraInicialParaNivel(nivel) {
  const rng = makeLcg(0xBEEF + nivel * 0xCAFE)
  return {
    id: 'inicial',
    left:  gerarFaceRica('Ácido',   nivel, rng),
    right: gerarFaceRica('Hidreto', nivel, rng),
  }
}