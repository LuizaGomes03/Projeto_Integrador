"use client"

/**
 * frontend/domino-quimico/components/domino/LevelSelector.tsx
 *
 * Seletor de nível reutilizado na página solo e na sala de espera (host).
 */

import React from "react"

export interface NivelOpcao {
  id: number
  nome: string
  emoji: string
  descricao: string
  detalhes: string
  cor: string
  corBg: string
  corBorda: string
}

export const NIVEIS_OPCOES: NivelOpcao[] = [
  {
    id: 1,
    nome: "Fácil",
    emoji: "🧪",
    descricao: "Função ↔ Função",
    detalhes: "Conecte metades com o mesmo nome de função inorgânica.",
    cor: "#16A34A",
    corBg: "#F0FDF4",
    corBorda: "#86EFAC",
  },
  {
    id: 2,
    nome: "Médio",
    emoji: "⚗️",
    descricao: "Fórmula ↔ Função",
    detalhes: "Um lado exibe a fórmula química, o outro o nome da função. Encaixe corretamente.",
    cor: "#D97706",
    corBg: "#FFFBEB",
    corBorda: "#FCD34D",
  },
  {
    id: 3,
    nome: "Difícil",
    emoji: "🔬",
    descricao: "Propriedade ↔ Classificação",
    detalhes: "Conecte compostos pela propriedade ou subclassificação. Requer conhecimento aprofundado.",
    cor: "#DC2626",
    corBg: "#FEF2F2",
    corBorda: "#FCA5A5",
  },
]

interface LevelSelectorProps {
  nivelSelecionado: number
  onChange: (nivel: number) => void
  disabled?: boolean
  compact?: boolean  // versão compacta para uso dentro da sala de espera
}

export function LevelSelector({
  nivelSelecionado,
  onChange,
  disabled = false,
  compact = false,
}: LevelSelectorProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? 8 : 12,
      }}
    >
      {!compact && (
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#64748B",
            marginBottom: 4,
          }}
        >
          Nível de Dificuldade
        </p>
      )}

      <div
        style={{
          display: "flex",
          gap: compact ? 8 : 12,
          flexWrap: "wrap",
        }}
      >
        {NIVEIS_OPCOES.map((n) => {
          const ativo = nivelSelecionado === n.id
          return (
            <button
              key={n.id}
              onClick={() => !disabled && onChange(n.id)}
              disabled={disabled}
              style={{
                flex: compact ? "1 1 80px" : "1 1 160px",
                minWidth: compact ? 80 : 140,
                display: "flex",
                flexDirection: "column",
                alignItems: compact ? "center" : "flex-start",
                gap: compact ? 4 : 8,
                padding: compact ? "10px 12px" : "16px 18px",
                border: `2px solid ${ativo ? n.cor : "rgba(255,255,255,0.2)"}`,
                borderRadius: compact ? 14 : 16,
                background: ativo
                  ? `${n.cor}22`
                  : "rgba(255,255,255,0.08)",
                cursor: disabled ? "default" : "pointer",
                transition: "all 0.18s",
                opacity: disabled && !ativo ? 0.5 : 1,
                textAlign: compact ? "center" : "left",
                outline: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: compact ? 18 : 22 }}>{n.emoji}</span>
                <span
                  style={{
                    fontSize: compact ? 13 : 15,
                    fontWeight: 800,
                    color: ativo ? n.cor : "rgba(255,255,255,0.9)",
                  }}
                >
                  {n.nome}
                </span>
                {ativo && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      background: n.cor,
                      color: "#fff",
                      borderRadius: 999,
                      padding: "2px 7px",
                      letterSpacing: "0.06em",
                    }}
                  >
                    ATIVO
                  </span>
                )}
              </div>

              <span
                style={{
                  fontSize: compact ? 10 : 12,
                  fontWeight: 700,
                  color: ativo ? n.cor : "rgba(255,255,255,0.55)",
                  letterSpacing: "0.04em",
                }}
              >
                {n.descricao}
              </span>

              {!compact && (
                <span
                  style={{
                    fontSize: 11,
                    color: ativo ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)",
                    lineHeight: 1.4,
                  }}
                >
                  {n.detalhes}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Badge de nível exibido no header do jogo
export function NivelBadge({ nivel, small = false }: { nivel: number; small?: boolean }) {
  const n = NIVEIS_OPCOES.find((o) => o.id === nivel) ?? NIVEIS_OPCOES[0]
  return (
    <div
      style={{
        background: "#0F172A",
        border: `1px solid ${n.cor}55`,
        borderRadius: 8,
        padding: small ? "3px 8px" : "4px 10px",
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: "#64748B",
          fontWeight: 600,
          letterSpacing: 0.8,
        }}
      >
        NÍVEL
      </div>
      <div
        style={{
          fontSize: small ? 11 : 13,
          fontWeight: 700,
          color: n.cor,
        }}
      >
        {n.emoji} {n.nome}
      </div>
    </div>
  )
}