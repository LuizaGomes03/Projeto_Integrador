"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Trophy, RefreshCw, RotateCcw, AlertCircle, X } from "lucide-react"
import { apiFetch } from "@/lib/api"

// ─── TIPOS ─────────────────────────────────────────────────────────────────────

type Pedra = {
  id: string
  left: string
  right: string
}

type Pontas = {
  esquerda: string | null
  direita: string | null
}

type EstadoPartida = {
  sala: string
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

type DropZone = "esquerda" | "direita"

// ─── COR POR FUNÇÃO ────────────────────────────────────────────────────────────

const FUNCAO_COR: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Ácido: { bg: "#FFF1F0", border: "#FF4D4F", text: "#A8071A", dot: "#FF4D4F" },
  Base: { bg: "#F0F5FF", border: "#2F54EB", text: "#061178", dot: "#2F54EB" },
  Óxido: { bg: "#FFF7E6", border: "#FA8C16", text: "#612500", dot: "#FA8C16" },
  Sal: { bg: "#F6FFED", border: "#52C41A", text: "#135200", dot: "#52C41A" },
  Hidreto: { bg: "#F9F0FF", border: "#722ED1", text: "#22075E", dot: "#722ED1" },
}

const getCor = (funcao: string) =>
  FUNCAO_COR[funcao] ?? { bg: "#F5F5F5", border: "#8C8C8C", text: "#262626", dot: "#8C8C8C" }

// ─── COMPONENTE: HALF DA PEÇA ──────────────────────────────────────────────────

function PieceHalf({
  label,
  side,
  small = false,
}: {
  label: string
  side: "left" | "right"
  small?: boolean
}) {
  const cor = getCor(label)
  const radius = side === "left" ? "8px 0 0 8px" : "0 8px 8px 0"
  const divider = side === "left"
    ? { right: 0, borderRight: `2px dashed ${cor.border}33` }
    : { left: 0, borderLeft: `2px dashed ${cor.border}33` }

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: small ? 3 : 5,
        padding: small ? "8px 10px" : "12px 16px",
        background: cor.bg,
        borderRadius: radius,
        minWidth: small ? 58 : 80,
        flex: 1,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "10%",
          bottom: "10%",
          width: 0,
          ...divider,
        }}
      />
      <div
        style={{
          width: small ? 10 : 14,
          height: small ? 10 : 14,
          borderRadius: "50%",
          background: cor.dot,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: small ? 11 : 14,
          fontWeight: 800,
          color: cor.text,
          letterSpacing: 0.3,
          textAlign: "center",
          lineHeight: 1.2,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  )
}

// ─── COMPONENTE: PEÇA HORIZONTAL ──────────────────────────────────────────────

function DominoTile({
  pedra,
  small = false,
  selected = false,
  playable = false,
  disabled = false,
  draggable = false,
  onDragStart,
  onClick,
  onClickPonta,
  style,
}: {
  pedra: Pedra
  small?: boolean
  selected?: boolean
  playable?: boolean
  disabled?: boolean
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onClick?: () => void
  onClickPonta?: (side: DropZone) => void
  style?: React.CSSProperties
}) {
  const borderColor = selected
    ? "#2563EB"
    : playable
      ? "#16A34A"
      : "#D1D5DB"

  const shadow = selected
    ? "0 0 0 3px #2563EB44"
    : playable
      ? "0 0 0 2px #16A34A33"
      : "0 2px 8px rgba(0,0,0,0.10)"

  return (
    <div
      draggable={draggable && !disabled}
      onDragStart={onDragStart}
      onClick={disabled ? undefined : onClick}
      title={`${pedra.left} | ${pedra.right}`}
      style={{
        display: "inline-flex",
        alignItems: "stretch",
        border: `2px solid ${borderColor}`,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: shadow,
        cursor: draggable && !disabled
          ? "grab"
          : onClick && !disabled
            ? "pointer"
            : "default",
        opacity: disabled ? 0.45 : 1,
        transition: "box-shadow 0.15s, transform 0.12s, opacity 0.15s",
        transform: selected ? "translateY(-4px)" : "none",
        userSelect: "none",
        background: "#FFF",
        flexShrink: 0,
        ...style,
      }}
    >
      <PieceHalf label={pedra.left} side="left" small={small} />
      <div
        style={{
          width: small ? 5 : 7,
          background: "#E5E7EB",
          flexShrink: 0,
          position: "relative",
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
      <PieceHalf label={pedra.right} side="right" small={small} />
    </div>
  )
}

// ─── COMPONENTE: DROP ZONE INLINE (nas pontas do tabuleiro) ───────────────────

function InlineDropZone({
  side,
  ponta,
  over,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
}: {
  side: DropZone
  ponta: string | null
  over: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, side: DropZone) => void
  onClick?: () => void
}) {
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
        minHeight: 72,
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

// ─── COMPONENTE: TOAST DE ERRO ─────────────────────────────────────────────────

function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [message, onClose])

  return (
    <div
      style={{
        position: "fixed",
        bottom: 90,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#FEF2F2",
        border: "1.5px solid #FCA5A5",
        borderRadius: 12,
        padding: "12px 18px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        maxWidth: "calc(100vw - 32px)",
        width: 380,
        animation: "slideUp 0.2s ease",
      }}
    >
      <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 14, fontWeight: 600, color: "#991B1B", flex: 1 }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 2,
          display: "flex",
          color: "#991B1B",
        }}
      >
        <X size={14} />
      </button>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL DO JOGO ──────────────────────────────────────────────────

const POLL_INTERVAL = 2000

// ─── LAYOUT SERPENTINA ──────────────────────────────────────────────────────
// Linha par:  [dropEsq] [h][h][h][h][h][h] [V] ← ultima peca vertical (canto)
// Linha impar:                         [V] [h][h][h][h][h][h] [dropDir]
//                                      ^ primeira peca vertical (entrada)
// Linha par seguinte: [dropEsq] [h]...[V]  etc.
// As pecas verticais nos cantos sinalizama dobra da cadeia.

const COLS = 6  // pecas horizontais por linha (sem contar as verticais de canto)

type TileLayout = {
  pedra: Pedra
  // "h" = horizontal normal
  // "v-exit"  = vertical de saida (ultima da linha, canto direito linha par / canto esquerdo linha impar)
  // "v-enter" = vertical de entrada (primeira da linha impar, repete a mesma posicao do v-exit da linha anterior)
  kind: "h" | "v-exit" | "v-enter"
}
type SnakeRow = { tiles: TileLayout[]; reversed: boolean }

function buildSnakeRows(mesa: Pedra[]): SnakeRow[] {
  if (mesa.length === 0) return []
  // Distribui as pecas em grupos de COLS, com a ultima de cada grupo (exceto o ultimo)
  // marcada como "v-exit". A proxima linha comeca com a mesma peca como "v-enter"
  // para mostrar o canto — mas na verdade e so visual, nao duplica a peca.
  // Mais simples: cada linha tem ate COLS pecas. A ultima linha incompleta nao tem canto.
  const rows: SnakeRow[] = []
  let i = 0
  let rowIdx = 0
  while (i < mesa.length) {
    const reversed = rowIdx % 2 !== 0
    const slice = mesa.slice(i, i + COLS)
    const hasNextRow = i + COLS < mesa.length
    const tiles: TileLayout[] = slice.map((pedra, li) => {
      const isLast = li === slice.length - 1
      const kind: TileLayout["kind"] = isLast && hasNextRow ? "v-exit" : "h"
      return { pedra, kind }
    })
    rows.push({ tiles, reversed })
    i += COLS
    rowIdx++
  }
  return rows
}


export default function GameBoard() {
  const [partida, setPartida] = useState<EstadoPartida | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erroBusca, setErroBusca] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const [selectedPedra, setSelectedPedra] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropOverLeft, setDropOverLeft] = useState(false)
  const [dropOverRight, setDropOverRight] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [showVencedor, setShowVencedor] = useState(false)

  const meuNome = typeof window !== "undefined"
    ? (sessionStorage.getItem("dominoNome") ?? "Jogador")
    : "Jogador"
  const codigoSala = typeof window !== "undefined"
    ? (sessionStorage.getItem("dominoSala") ?? "DEMO")
    : "DEMO"

  const showError = useCallback((msg: string) => setErrorMsg(msg), [])

  const pedradePodeJogar = useCallback((pedra: Pedra, p: EstadoPartida | null) => {
    if (!p) return false
    const { esquerda, direita } = p.pontas
    return (
      pedra.left === direita ||
      pedra.right === direita ||
      pedra.left === esquerda ||
      pedra.right === esquerda
    )
  }, [])

  const ehMeuTurno = partida?.turnoAtual === meuNome

  const buscarEstado = useCallback(async () => {
    if (!codigoSala || !meuNome) return
    try {
      const res = await apiFetch(
        `/api/partidas/${codigoSala}?jogador=${encodeURIComponent(typeof window !== "undefined" ? Number(sessionStorage.getItem("dominoUserId") ?? -99) : -99)}`
      )
      if (res.status === 404) {
        const r2 = await apiFetch(`/api/partidas/iniciar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            codigoSala,
            jogadores: [
              { id: typeof window !== "undefined" ? Number(sessionStorage.getItem("dominoUserId") ?? -99) : -99, nome: meuNome },
              { id: -1, nome: "IA Química" }
            ],
          }),
        })
        if (!r2.ok) throw new Error("Falha ao iniciar")
        const data: EstadoPartida = await r2.json()
        setPartida(data)
        setErroBusca("")
        return
      }
      if (!res.ok) throw new Error("Erro ao buscar")
      const data: EstadoPartida = await res.json()
      setPartida(data)
      setErroBusca("")
      if (data.encerrado && !showVencedor) setShowVencedor(true)
    } catch {
      setErroBusca("Sem conexão com o servidor.")
    } finally {
      setCarregando(false)
    }
  }, [codigoSala, meuNome, showVencedor])

  useEffect(() => {
    buscarEstado()
    const id = setInterval(buscarEstado, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [buscarEstado])

  const jogarPedra = useCallback(
    async (pedraId: string) => {
      if (!partida || enviando) return
      if (partida.turnoAtual !== meuNome) {
        showError("Aguarde o seu turno para jogar!")
        return
      }
      setEnviando(true)
      try {
        const res = await apiFetch(`/api/partidas/${codigoSala}/jogar`, {
          method: "POST",
          body: JSON.stringify({ jogador: meuNome, pedraId }),
        })
        const data = await res.json()
        if (!res.ok) {
          const pontas = data.pontas as Pontas | undefined
          const pontasInfo = pontas
            ? ` As pontas abertas são: ${pontas.esquerda} e ${pontas.direita}.`
            : ""
          showError((data.erro ?? "Jogada inválida.") + pontasInfo)
          setSelectedPedra(null)
          setDraggingId(null)
          return
        }
        setPartida(data)
        setSelectedPedra(null)
        setDraggingId(null)
        if (data.encerrado) setShowVencedor(true)
      } catch {
        showError("Erro de conexão com o servidor.")
      } finally {
        setEnviando(false)
      }
    },
    [partida, enviando, meuNome, codigoSala, showError]
  )

  const passarVez = useCallback(async () => {
    if (!partida || enviando) return
    if (partida.turnoAtual !== meuNome) {
      showError("Não é o seu turno!")
      return
    }
    setEnviando(true)
    try {
      const res = await apiFetch(`/api/partidas/${codigoSala}/passar`, {
        method: "POST",
        body: JSON.stringify({ jogador: meuNome }),
      })
      const data = await res.json()
      if (!res.ok) {
        showError(data.erro ?? "Não é possível passar agora.")
        return
      }
      setPartida(data)
      setSelectedPedra(null)
      if (data.encerrado) setShowVencedor(true)
    } catch {
      showError("Erro de conexão com o servidor.")
    } finally {
      setEnviando(false)
    }
  }, [partida, enviando, meuNome, codigoSala, showError])

  const handleDragStart = (e: React.DragEvent, pedraId: string) => {
    e.dataTransfer.setData("pedraId", pedraId)
    e.dataTransfer.effectAllowed = "move"
    setDraggingId(pedraId)
    setSelectedPedra(pedraId)
  }

  const handleDragOver = (e: React.DragEvent, side: DropZone) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (side === "esquerda") setDropOverLeft(true)
    else setDropOverRight(true)
  }

  const handleDragLeave = (side: DropZone) => {
    if (side === "esquerda") setDropOverLeft(false)
    else setDropOverRight(false)
  }

  const handleDrop = async (e: React.DragEvent, _side: DropZone) => {
    e.preventDefault()
    setDropOverLeft(false)
    setDropOverRight(false)
    const pedraId = e.dataTransfer.getData("pedraId")
    if (!pedraId) return
    await jogarPedra(pedraId)
  }

  // Clique na ponta do tabuleiro com pedra selecionada → joga
  const handleClickPonta = useCallback(
    async (_side: DropZone) => {
      if (!selectedPedra || !ehMeuTurno) return
      await jogarPedra(selectedPedra)
    },
    [selectedPedra, ehMeuTurno, jogarPedra]
  )

  const handleClickPedra = useCallback(
    async (pedraId: string) => {
      if (!ehMeuTurno) {
        showError("Aguarde o seu turno!")
        return
      }
      if (selectedPedra === pedraId) {
        await jogarPedra(pedraId)
      } else {
        setSelectedPedra(pedraId)
      }
    },
    [ehMeuTurno, selectedPedra, jogarPedra, showError]
  )

  if (carregando) {
    return (
      <div
        style={{
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F172A",
        }}
      >
        <div style={{ textAlign: "center", color: "#94A3B8" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #334155",
              borderTopColor: "#C62828",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ fontSize: 14, fontWeight: 500 }}>Carregando partida...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  if (erroBusca && !partida) {
    return (
      <div
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#0F172A",
          color: "#94A3B8",
        }}
      >
        <AlertCircle size={36} color="#DC2626" />
        <p style={{ fontSize: 14 }}>{erroBusca}</p>
        <button
          onClick={buscarEstado}
          style={{
            background: "#C62828",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 24px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  const minhaMao = partida?.minha_mao ?? []
  const mesa = partida?.mesa ?? []
  const snakeRows = buildSnakeRows(mesa)

  return (
    <div
      style={{
        minHeight: "100svh",
        height: "100svh",
        background: "#0F172A",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
        @media (max-width: 600px) {
          .header-chips { flex-wrap: wrap; gap: 6px !important; }
          .header-chips > div { padding: 3px 7px !important; }
        }
      `}</style>

      {/* ── MODAL VENCEDOR ── */}
      {showVencedor && partida?.encerrado && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#1E293B",
              border: "1px solid #334155",
              borderRadius: 20,
              padding: 40,
              textAlign: "center",
              maxWidth: 380,
              width: "100%",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: partida.vencedor === meuNome ? "#FEF3C7" : "#1E293B",
                border: "2px solid #334155",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Trophy size={34} color={partida.vencedor === meuNome ? "#D97706" : "#475569"} />
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#F1F5F9", margin: "0 0 8px" }}>
              {partida.vencedor === meuNome ? "Você venceu! 🎉" : `${partida.vencedor} venceu!`}
            </h2>
            <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 28px" }}>
              {partida.motivo === "vitoria"
                ? `${partida.vencedor} esvaziou a mão primeiro.`
                : "O jogo travou — ninguém conseguia jogar."}
            </p>
            <button
              onClick={() => setShowVencedor(false)}
              style={{
                width: "100%",
                background: "#C62828",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "14px 0",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <RefreshCw size={16} />
              Voltar ao Menu
            </button>
          </div>
        </div>
      )}

      {/* ── TOAST DE ERRO ── */}
      {errorMsg && <ErrorToast message={errorMsg} onClose={() => setErrorMsg("")} />}

      {/* ── HEADER ── */}
      <header
        style={{
          background: "#1E293B",
          borderBottom: "1px solid #334155",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 100 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#F1F5F9", letterSpacing: -0.3 }}>
            Dominó <span style={{ color: "#EF4444" }}>Químico</span>
          </span>
        </div>
        <div className="header-chips" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Chip label="Sala" value={codigoSala} accent="#2563EB" />
          <Chip label="Jogador" value={meuNome} />
          <Chip label="Turno" value={partida?.turnoAtual ?? "—"} accent={ehMeuTurno ? "#16A34A" : undefined} />
          <Chip label="Monte" value={`${partida?.monte ?? 0}`} />
        </div>
      </header>

      {/* ── MESA + MÃO ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>

        {/* ── MESA DO JOGO ── */}
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {/* feltro */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at center, #1B4332 0%, #14532D 40%, #0F3D22 100%)",
              backgroundImage: "radial-gradient(ellipse at center, #1B4332 0%, #14532D 40%, #0F3D22 100%), repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.02) 19px, rgba(255,255,255,0.02) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.02) 19px, rgba(255,255,255,0.02) 20px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 10,
              border: "2px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              pointerEvents: "none",
            }}
          />

          {/* CONTEÚDO CENTRAL DA MESA */}
          <div
            style={{
              position: "relative",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px 12px",
              gap: 12,
              overflow: "auto",
              minHeight: 0,
            }}
          >
            {mesa.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "rgba(255,255,255,0.25)",
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: 1,
                }}
              >
                Mesa vazia — jogue a primeira pedra
              </div>
            ) : (
              /* SERPENTINA com cantos verticais */
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "stretch" }}>
                {snakeRows.map((row, rowIdx) => {
                  const isFirst = rowIdx === 0
                  const isLast = rowIdx === snakeRows.length - 1
                  const isOnly = snakeRows.length === 1

                  // Linha revertida alinha à direita para continuar a cadeia
                  const justif = row.reversed ? "flex-end" : "flex-start"

                  // A ponta direita fica no fim da última linha não-revertida,
                  // ou no início (visual esquerdo) da última linha revertida
                  const dropEsqVisible = ehMeuTurno && (isFirst || isOnly) && !row.reversed
                  const dropDirVisible = ehMeuTurno && (isLast || isOnly) && !row.reversed
                  const dropDirReversed = ehMeuTurno && isLast && !isOnly && row.reversed

                  return (
                    <div
                      key={rowIdx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        justifyContent: justif,
                        flexWrap: "nowrap",
                      }}
                    >
                      {/* Ponta esquerda: linha 0 normal */}
                      {dropEsqVisible && (
                        <InlineDropZone
                          side="esquerda"
                          ponta={partida?.pontas.esquerda ?? null}
                          over={dropOverLeft}
                          onDragOver={(e) => handleDragOver(e, "esquerda")}
                          onDragLeave={() => handleDragLeave("esquerda")}
                          onDrop={handleDrop}
                          onClick={() => handleClickPonta("esquerda")}
                        />
                      )}
                      {/* Ponta direita: última linha revertida (ponta chega no lado esquerdo visual) */}
                      {dropDirReversed && (
                        <InlineDropZone
                          side="direita"
                          ponta={partida?.pontas.direita ?? null}
                          over={dropOverRight}
                          onDragOver={(e) => handleDragOver(e, "direita")}
                          onDragLeave={() => handleDragLeave("direita")}
                          onDrop={handleDrop}
                          onClick={() => handleClickPonta("direita")}
                        />
                      )}
                      {(row.reversed ? [...row.tiles].reverse() : row.tiles).map(({ pedra, kind }, idx) => {
                        const isCorner = kind === "v-exit"
                        return (
                          <div
                            key={`${pedra.id}-${rowIdx}-${idx}`}
                            style={{
                              flexShrink: 0,
                              transform: isCorner ? "rotate(90deg)" : "none",
                              // Margem extra para o canto girado não sobrepor vizinhos
                              margin: isCorner ? "0 10px" : "0",
                              transition: "transform 0.2s ease",
                            }}
                          >
                            <DominoTile pedra={pedra} small />
                          </div>
                        )
                      })}
                      {/* Ponta direita: fim da última linha normal */}
                      {dropDirVisible && (
                        <InlineDropZone
                          side="direita"
                          ponta={partida?.pontas.direita ?? null}
                          over={dropOverRight}
                          onDragOver={(e) => handleDragOver(e, "direita")}
                          onDragLeave={() => handleDragLeave("direita")}
                          onDrop={handleDrop}
                          onClick={() => handleClickPonta("direita")}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* pontas info quando não é meu turno */}
            {!ehMeuTurno && partida?.pontas && (
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
                <PontaTag label="← Esq" funcao={partida.pontas.esquerda} />
                <PontaTag label="Dir →" funcao={partida.pontas.direita} />
              </div>
            )}

            {/* aviso de turno */}
            <div
              style={{
                background: ehMeuTurno ? "rgba(22,163,74,0.15)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${ehMeuTurno ? "#16A34A44" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                color: ehMeuTurno ? "#86EFAC" : "#94A3B8",
                letterSpacing: 0.4,
                textAlign: "center",
              }}
            >
              {ehMeuTurno
                ? selectedPedra
                  ? "✦ Clique numa ponta do tabuleiro ou arraste para jogar"
                  : "✦ Sua vez — selecione uma pedra"
                : `⟳ Vez de ${partida?.turnoAtual ?? "..."}`}
            </div>
          </div>
        </div>

        {/* ── MÃO DO JOGADOR ── */}
        <div
          style={{
            background: "#1E293B",
            borderTop: "1px solid #334155",
            padding: "12px 16px",
            flexShrink: 0,
          }}
        >
          {/* header da mão */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#64748B",
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                Sua mão — {meuNome}
              </span>
              <span
                style={{
                  background: "#0F172A",
                  border: "1px solid #334155",
                  borderRadius: 6,
                  padding: "2px 8px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#94A3B8",
                }}
              >
                {minhaMao.length} pedras
              </span>
              {selectedPedra && (
                <span
                  style={{
                    background: "#1D4ED833",
                    border: "1px solid #2563EB44",
                    borderRadius: 6,
                    padding: "2px 8px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#93C5FD",
                  }}
                >
                  Clique na ponta ↑ ou 2× na pedra
                </span>
              )}
            </div>

            {ehMeuTurno && (
              <button
                onClick={passarVez}
                disabled={enviando}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  border: "1px solid #475569",
                  borderRadius: 8,
                  padding: "6px 14px",
                  color: "#94A3B8",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: enviando ? "not-allowed" : "pointer",
                  opacity: enviando ? 0.5 : 1,
                }}
              >
                <RotateCcw size={13} />
                Passar vez
              </button>
            )}
          </div>

          {/* pedras na mão */}
          <div
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              padding: "4px 2px 8px",
              scrollbarWidth: "thin",
              scrollbarColor: "#334155 transparent",
              alignItems: "flex-end",
            }}
          >
            {minhaMao.length === 0 ? (
              <span style={{ fontSize: 13, color: "#475569" }}>Sem pedras na mão</span>
            ) : (
              minhaMao.map((pedra) => {
                const podeJogar = pedradePodeJogar(pedra, partida)
                const isSelected = selectedPedra === pedra.id
                const isDragging = draggingId === pedra.id

                return (
                  <div
                    key={pedra.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      opacity: isDragging ? 0.4 : 1,
                      transition: "opacity 0.15s",
                    }}
                  >
                    <DominoTile
                      pedra={pedra}
                      selected={isSelected}
                      playable={false}
                      disabled={!ehMeuTurno}
                      draggable={ehMeuTurno}
                      onDragStart={(e) => handleDragStart(e, pedra.id)}
                      onClick={() => handleClickPedra(pedra.id)}
                    />
                    {isSelected && (
                      <div
                        style={{
                          width: 32,
                          height: 3,
                          borderRadius: 2,
                          background: "#2563EB",
                          transition: "background 0.2s",
                        }}
                      />
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* legenda de cores */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 8,
              paddingTop: 8,
              borderTop: "1px solid #1E293B",
              alignItems: "center",
            }}
          >
            {Object.entries(FUNCAO_COR).map(([funcao, cor]) => (
              <div key={funcao} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: cor.dot }} />
                <span style={{ fontSize: 10, color: "#64748B", fontWeight: 500 }}>{funcao}</span>
              </div>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
              <LegendItem color="#2563EB" label="Selecionada" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── UTILITÁRIOS VISUAIS ───────────────────────────────────────────────────────

function Chip({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div
      style={{
        background: "#0F172A",
        border: `1px solid ${accent ? accent + "55" : "#334155"}`,
        borderRadius: 8,
        padding: "4px 10px",
      }}
    >
      <div style={{ fontSize: 9, color: "#64748B", fontWeight: 600, letterSpacing: 0.8 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: accent ?? "#E2E8F0" }}>{value}</div>
    </div>
  )
}

function PontaTag({ label, funcao }: { label: string; funcao: string | null }) {
  if (!funcao) return null
  const cor = getCor(funcao)
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: "6px 12px",
      }}
    >
      <span style={{ fontSize: 10, color: "#94A3B8" }}>{label}</span>
      <div
        style={{
          padding: "3px 8px",
          background: cor.bg,
          border: `1.5px solid ${cor.border}`,
          borderRadius: 5,
          fontSize: 11,
          fontWeight: 700,
          color: cor.text,
        }}
      >
        {funcao}
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 24, height: 3, borderRadius: 2, background: color }} />
      <span style={{ fontSize: 10, color: "#64748B" }}>{label}</span>
    </div>
  )
}