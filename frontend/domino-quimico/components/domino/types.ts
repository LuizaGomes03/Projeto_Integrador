/**
 * frontend/domino-quimico/components/domino/types.ts
 *
 * Tipos compartilhados entre jogo solo e online.
 */

export type FaceTipo = 'funcao' | 'formula' | 'propriedade' | 'classificacao'

export interface FaceRica {
  encaixe: string      // token de encaixe (nome da função) — validação
  display: string      // texto principal exibido na face
  subtitulo: string | null
  tipo: FaceTipo
}

export interface Pedra {
  id: string
  left: FaceRica | string   // string = retrocompatibilidade nível 1 antigo
  right: FaceRica | string
}

export interface NivelInfo {
  id: number
  nome: string
  emoji: string
  descricao: string
  detalhes: string
  cor: string
  corBg: string
  corBorda: string
}

export interface Pontas {
  esquerda: string | null
  direita: string | null
}

export interface EstadoPartida {
  sala: string
  nivel: number
  nivelInfo: NivelInfo
  jogadores: string[]
  turnoAtual: string
  mesa: Pedra[]
  minha_mao: Pedra[]
  maos: Record<string, number | Pedra[]>
  monte: number
  encerrado: boolean
  vencedor: string | null
  vencedores: string[] | null
  motivo: string | null
  pontas: Pontas
}

export type DropZone = 'esquerda' | 'direita'

// Extrai string de encaixe seja de FaceRica ou string simples
export function encaixeDe(face: FaceRica | string): string {
  if (typeof face === 'string') return face
  return face.encaixe
}

// Extrai texto de display
export function displayDe(face: FaceRica | string): string {
  if (typeof face === 'string') return face
  return face.display
}

// Extrai subtítulo
export function subtituloDe(face: FaceRica | string): string | null {
  if (typeof face === 'string') return null
  return face.subtitulo
}

// Extrai tipo
export function tipoDe(face: FaceRica | string): FaceTipo {
  if (typeof face === 'string') return 'funcao'
  return face.tipo
}