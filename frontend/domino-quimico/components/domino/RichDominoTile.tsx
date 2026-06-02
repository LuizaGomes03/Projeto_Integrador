"use client"

/**
 * frontend/domino-quimico/components/domino/RichDominoTile.tsx
 *
 * Peça do Dominó Químico com suporte a faces ricas (3 níveis).
 * Nível 1: mostra só o nome da função.
 * Nível 2: mostra fórmula OU função com cor por tipo.
 * Nível 3: mostra propriedade OU classificação com subtítulo.
 */

import React from "react"
import { FaceRica, Pedra, displayDe, subtituloDe, tipoDe, encaixeDe } from "./types"

// ─── PALETA DE CORES POR FUNÇÃO ──────────────────────────────────────────────

const FUNCAO_COR: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Ácido: { bg: "#FFF1F0", border: "#FF4D4F", text: "#A8071A", dot: "#FF4D4F" },
  Base: { bg: "#F0F5FF", border: "#2F54EB", text: "#061178", dot: "#2F54EB" },
  Óxido: { bg: "#FFF7E6", border: "#FA8C16", text: "#612500", dot: "#FA8C16" },
  Sal: { bg: "#F6FFED", border: "#52C41A", text: "#135200", dot: "#52C41A" },
  Hidreto: { bg: "#F9F0FF", border: "#722ED1", text: "#22075E", dot: "#722ED1" },
  Amida: { bg: "#FCE4EC", border: "#E91E63", text: "#880E4F", dot: "#E91E63" },
  Éter: { bg: "#E0F2F1", border: "#009688", text: "#004D40", dot: "#009688" },
}

// Ícone por tipo de face — visualmente diferencia o que está sendo exibido
const TIPO_ICONE: Record<string, string> = {
  funcao: "⚗",
  formula: "🔣",
  propriedade: "✦",
  classificacao: "▸",
}

function getCor(encaixe: string) {
  return FUNCAO_COR[encaixe] ?? { bg: "#F5F5F5", border: "#8C8C8C", text: "#262626", dot: "#8C8C8C" }
}

// ─── HALF DA PEÇA ─────────────────────────────────────────────────────────────

interface HalfProps {
  face: FaceRica | string
  side: "left" | "right"
  small?: boolean
  nivel?: number
}

export function PieceHalf({ face, side, small = false, nivel = 1 }: HalfProps) {
  const encaixe = encaixeDe(face)
  const display = displayDe(face)
  const sub = subtituloDe(face)
  const tipo = tipoDe(face)
  const cor = getCor(encaixe)

  const radius = side === "left" ? "8px 0 0 8px" : "0 8px 8px 0"
  const divider = side === "left"
    ? { right: 0, borderRight: `2px dashed ${cor.border}33` }
    : { left: 0, borderLeft: `2px dashed ${cor.border}33` }

  // Tamanhos adaptativos
  const padH = small ? "8px" : "12px"
  const padV = small ? "10px" : "16px"
  const minW = small ? 60 : 88
  const dotSz = small ? 8 : 12
  const mainSz = small
    ? (nivel === 1 ? 12 : nivel === 2 ? 11 : 10)
    : (nivel === 1 ? 14 : nivel === 2 ? 13 : 11)
  const subSz = small ? 8 : 10

  const icone = nivel > 1 ? TIPO_ICONE[tipo] : null

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: small ? 2 : 4,
        padding: `${padH} ${padV}`,
        background: cor.bg,
        borderRadius: radius,
        minWidth: minW,
        flex: 1,
        overflow: "hidden",
      }}
    >
      {/* Linha divisória central */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          bottom: "10%",
          width: 0,
          ...divider,
        }}
      />

      {/* Ponto colorido identificador da função */}
      <div
        style={{
          width: dotSz,
          height: dotSz,
          borderRadius: "50%",
          background: cor.dot,
          flexShrink: 0,
          boxShadow: `0 0 0 2px ${cor.dot}33`,
        }}
      />

      {/* Ícone de tipo (nível 2 e 3) */}
      {icone && !small && (
        <span
          style={{
            fontSize: 9,
            color: cor.dot,
            fontWeight: 700,
            letterSpacing: 0.5,
            opacity: 0.7,
          }}
        >
          {icone}
        </span>
      )}

      {/* Texto principal */}
      <span
        style={{
          fontSize: mainSz,
          fontWeight: 800,
          color: cor.text,
          textAlign: "center",
          lineHeight: 1.2,
          wordBreak: "break-word",
          maxWidth: "100%",
        }}
      >
        {display}
      </span>

      {/* Subtítulo (nível 3 — fórmula como hint) */}
      {sub && !small && (
        <span
          style={{
            fontSize: subSz,
            color: cor.dot,
            fontWeight: 600,
            opacity: 0.8,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          {sub}
        </span>
      )}

      {/* Badge do encaixe (nível 2-3, small mode) — mostra a função na ponta */}
      {nivel > 1 && small && tipo !== "funcao" && (
        <span
          style={{
            fontSize: 7,
            color: cor.dot,
            fontWeight: 700,
            opacity: 0.65,
            textAlign: "center",
          }}
        >
          {encaixe}
        </span>
      )}
    </div>
  )
}

// ─── PEÇA COMPLETA ────────────────────────────────────────────────────────────

interface RichDominoTileProps {
  pedra: Pedra
  nivel?: number
  small?: boolean
  selected?: boolean
  disabled?: boolean
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onClick?: () => void
  style?: React.CSSProperties
}

export function RichDominoTile({
  pedra,
  nivel = 1,
  small = false,
  selected = false,
  disabled = false,
  draggable = false,
  onDragStart,
  onClick,
  style,
}: RichDominoTileProps) {
  const borderColor = selected ? "#2563EB" : "#D1D5DB"
  const shadow = selected
    ? "0 0 0 3px #2563EB44, 0 4px 12px rgba(0,0,0,0.15)"
    : "0 2px 8px rgba(0,0,0,0.10)"

  return (
    <div
      draggable={draggable && !disabled}
      onDragStart={onDragStart}
      onClick={disabled ? undefined : onClick}
      title={`${encaixeDe(pedra.left)} | ${encaixeDe(pedra.right)}`}
      style={{
        display: "inline-flex",
        alignItems: "stretch",
        border: `2px solid ${borderColor}`,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: shadow,
        cursor: draggable && !disabled ? "grab" : onClick && !disabled ? "pointer" : "default",
        opacity: disabled ? 0.45 : 1,
        transition: "box-shadow 0.15s, transform 0.12s, opacity 0.15s",
        transform: selected ? "translateY(-4px)" : "none",
        userSelect: "none",
        background: "#FFF",
        flexShrink: 0,
        ...style,
      }}
    >
      <PieceHalf face={pedra.left} side="left" small={small} nivel={nivel} />

      {/* Divisor central */}
      <div
        style={{
          width: small ? 5 : 7,
          background: "#E5E7EB",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: small ? 5 : 7,
            height: small ? 5 : 7,
            borderRadius: "50%",
            background: "#9CA3AF",
          }}
        />
      </div>

      <PieceHalf face={pedra.right} side="right" small={small} nivel={nivel} />
    </div>
  )
}

// ─── DROP ZONE INLINE ─────────────────────────────────────────────────────────

interface DropZoneProps {
  side: "esquerda" | "direita"
  ponta: string | null
  over: boolean
  nivel?: number
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, side: "esquerda" | "direita") => void
  onClick?: () => void
}

export function InlineDropZone({
  side,
  ponta,
  over,
  nivel = 1,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
}: DropZoneProps) {
  const cor = ponta ? getCor(ponta) : null
  const arrow = side === "esquerda" ? "←" : "→"

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, side)}
      onClick={onClick}
      style={{
        minWidth: 72,
        minHeight: nivel > 1 ? 88 : 72,
        border: `2px dashed ${over ? "#60A5FA" : "rgba(255,255,255,0.3)"}`,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        padding: "6px 8px",
        background: over ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.07)",
        transition: "all 0.15s",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {ponta && cor ? (
        <>
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>{arrow}</span>
          <div
            style={{
              padding: "3px 8px",
              background: cor.bg,
              border: `1.5px solid ${cor.border}`,
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 800,
              color: cor.text,
              textAlign: "center",
            }}
          >
            {ponta}
          </div>
          {nivel > 1 && (
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.45)", textAlign: "center", lineHeight: 1.3 }}>
              função: {ponta}
            </span>
          )}
          {over && (
            <span style={{ fontSize: 9, color: "#93C5FD", fontWeight: 700 }}>Soltar ✓</span>
          )}
        </>
      ) : (
        <>
          <span style={{ fontSize: 20, color: "rgba(255,255,255,0.3)" }}>{arrow}</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textAlign: "center", lineHeight: 1.3 }}>
            Arraste<br />aqui
          </span>
        </>
      )}
    </div>
  )
}

// ─── LEGENDA DE CORES ─────────────────────────────────────────────────────────

export function LegendaCores({ nivel = 1 }: { nivel?: number }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {Object.entries(FUNCAO_COR).map(([funcao, cor]) => (
        <div key={funcao} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: cor.dot }} />
          <span style={{ fontSize: 10, color: "#64748B", fontWeight: 500 }}>{funcao}</span>
        </div>
      ))}
      {nivel > 1 && (
        <div style={{ marginLeft: 8, display: "flex", gap: 8 }}>
          {Object.entries(TIPO_ICONE)
            .filter(([t]) => t !== "funcao")
            .map(([tipo, icone]) => (
              <div key={tipo} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 10 }}>{icone}</span>
                <span style={{ fontSize: 10, color: "#64748B" }}>{tipo}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}