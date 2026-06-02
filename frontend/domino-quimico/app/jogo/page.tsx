"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Trophy, RefreshCw, RotateCcw, AlertCircle, X, ChevronLeft } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useRouter } from "next/navigation"
import {
  RichDominoTile,
  InlineDropZone,
  LegendaCores,
} from "@/components/domino/RichDominoTile"
import {
  LevelSelector,
  NivelBadge,
  NIVEIS_OPCOES,
} from "@/components/domino/LevelSelector"
import type { Pedra, EstadoPartida, DropZone } from "@/components/domino/types"
import { encaixeDe } from "@/components/domino/types"

// ─── SERPENTINA ───────────────────────────────────────────────────────────────

const COLS = 6

type TileLayout = { pedra: Pedra; kind: "h" | "v-exit" }
type SnakeRow = { tiles: TileLayout[]; reversed: boolean }

function buildSnakeRows(mesa: Pedra[]): SnakeRow[] {
  if (mesa.length === 0) return []
  const rows: SnakeRow[] = []
  let i = 0, rowIdx = 0
  while (i < mesa.length) {
    const reversed = rowIdx % 2 !== 0
    const slice = mesa.slice(i, i + COLS)
    const hasNext = i + COLS < mesa.length
    const tiles: TileLayout[] = slice.map((pedra, li) => ({
      pedra,
      kind: li === slice.length - 1 && hasNext ? "v-exit" : "h",
    }))
    rows.push({ tiles, reversed })
    i += COLS; rowIdx++
  }
  return rows
}

// ─── TOAST DE ERRO ────────────────────────────────────────────────────────────

function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [message, onClose])

  return (
    <div style={{
      position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
      zIndex: 100, display: "flex", alignItems: "center", gap: 10,
      background: "#FEF2F2", border: "1.5px solid #FCA5A5", borderRadius: 12,
      padding: "12px 18px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      maxWidth: "calc(100vw - 32px)", width: 380,
    }}>
      <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 14, fontWeight: 600, color: "#991B1B", flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#991B1B" }}>
        <X size={14} />
      </button>
    </div>
  )
}

// ─── CHIP DO HEADER ───────────────────────────────────────────────────────────

function Chip({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: "#0F172A", border: `1px solid ${accent ? accent + "55" : "#334155"}`, borderRadius: 8, padding: "4px 10px" }}>
      <div style={{ fontSize: 9, color: "#64748B", fontWeight: 600, letterSpacing: 0.8 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: accent ?? "#E2E8F0" }}>{value}</div>
    </div>
  )
}

// ─── TELA DE SELEÇÃO DE NÍVEL ─────────────────────────────────────────────────

function TelaSelecaoNivel({
  nivelSel,
  setNivelSel,
  onIniciar,
  playerName,
}: {
  nivelSel: number
  setNivelSel: (n: number) => void
  onIniciar: () => void
  playerName: string
}) {
  const router = useRouter()
  const nivelInfo = NIVEIS_OPCOES.find((n) => n.id === nivelSel)!

  return (
    <div style={{
      minHeight: "100svh",
      background: "#0F172A",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <style>{`* { box-sizing: border-box; }`}</style>

      {/* Voltar */}
      <button
        onClick={() => router.push("/aluno")}
        style={{
          position: "absolute", top: 20, left: 20,
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.06)", border: "1px solid #334155",
          borderRadius: 10, padding: "8px 14px",
          color: "#94A3B8", fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}
      >
        <ChevronLeft size={15} /> Menu
      </button>

      <div style={{ maxWidth: 560, width: "100%", display: "flex", flexDirection: "column", gap: 28 }}>

        {/* Título */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.06)", border: "1px solid #334155",
            borderRadius: 999, padding: "6px 16px", marginBottom: 16,
          }}>
            <span style={{ fontSize: 18 }}>⚗️</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B", letterSpacing: "0.1em" }}>MODO SOLO</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#F1F5F9", margin: 0, letterSpacing: -0.5 }}>
            Dominó <span style={{ color: "#EF4444" }}>Químico</span>
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: "8px 0 0" }}>
            Olá, <strong style={{ color: "#94A3B8" }}>{playerName}</strong>! Escolha o nível de dificuldade.
          </p>
        </div>

        {/* Seletor */}
        <div style={{
          background: "#1E293B", border: "1px solid #334155",
          borderRadius: 20, padding: 24,
        }}>
          <LevelSelector
            nivelSelecionado={nivelSel}
            onChange={setNivelSel}
          />
        </div>

        {/* Preview do nível selecionado */}
        <div style={{
          background: `${nivelInfo.cor}11`,
          border: `1px solid ${nivelInfo.cor}44`,
          borderRadius: 14, padding: "14px 18px",
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>{nivelInfo.emoji}</span>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: nivelInfo.cor }}>{nivelInfo.nome} — {nivelInfo.descricao}</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>{nivelInfo.detalhes}</p>
          </div>
        </div>

        {/* Botão iniciar */}
        <button
          onClick={onIniciar}
          style={{
            width: "100%", padding: "16px 0",
            background: `linear-gradient(135deg, #C62828, #991b1b)`,
            border: "none", borderRadius: 14,
            color: "#fff", fontSize: 15, fontWeight: 800,
            cursor: "pointer", letterSpacing: "0.04em",
            boxShadow: "0 8px 24px rgba(220,38,38,0.35)",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          🎲 Iniciar Partida
        </button>
      </div>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL DO JOGO ─────────────────────────────────────────────────

const POLL_INTERVAL = 2000

export default function GameBoard() {
  const router = useRouter()

  // Estado da sessão
  const [meuNome, setMeuNome] = useState(() => {
    if (typeof window === "undefined") return "Jogador"
    const nome = sessionStorage.getItem("dominoNome")
    if (nome) return nome
    try {
      const user = JSON.parse(localStorage.getItem("dominoUsuario") ?? "{}")
      if (user.nome) return user.nome
    } catch { /* silencioso */ }
    return "Jogador"
  })
  const [meuId, setMeuId] = useState<number>(() => {
    if (typeof window === "undefined") return -99
    const uid = sessionStorage.getItem("dominoUserId")
    if (uid && uid !== "-99") return Number(uid)
    try {
      const user = JSON.parse(localStorage.getItem("dominoUsuario") ?? "{}")
      if (user.id) return Number(user.id)
    } catch { /* silencioso */ }
    return -99
  })
  const [codigoSala, setCodigoSala] = useState("")
  const [clientReady, setClientReady] = useState(false)

  // Nível selecionado na tela inicial
  const [nivelSel, setNivelSel] = useState(1)
  const [fase, setFase] = useState<"selecao" | "jogo">("selecao")

  // Estado do jogo
  const [partida, setPartida] = useState<EstadoPartida | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erroBusca, setErroBusca] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // Interação
  const [selectedPedra, setSelectedPedra] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropOverLeft, setDropOverLeft] = useState(false)
  const [dropOverRight, setDropOverRight] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [showVencedor, setShowVencedor] = useState(false)

  const showError = useCallback((msg: string) => setErrorMsg(msg), [])

  // Carrega sessão do storage
  useEffect(() => {
    let nome = sessionStorage.getItem("dominoNome")
    let uid = sessionStorage.getItem("dominoUserId")

    // fallback: lê do localStorage se sessionStorage estiver vazio
    if (!nome || !uid || uid === "-99") {
      try {
        const user = JSON.parse(localStorage.getItem("dominoUsuario") ?? "{}")
        if (!nome && user.nome) nome = user.nome
        if ((!uid || uid === "-99") && user.id) uid = String(user.id)
      } catch { /* silencioso */ }
    }

    if (nome) setMeuNome(nome)
    if (uid) setMeuId(Number(uid))

    const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let sala = sessionStorage.getItem("dominoSoloCodigo")
    if (!sala) {
      sala = Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("")
      sessionStorage.setItem("dominoSoloCodigo", sala)
    }
    setCodigoSala(sala)
    setClientReady(true)
  }, [])

  const ehMeuTurno = partida?.turnoAtual === meuNome
  const nivel = partida?.nivel ?? nivelSel

  // ─── INICIAR PARTIDA ────────────────────────────────────────────────────────

  const iniciarPartida = useCallback(async () => {
    if (!clientReady || meuId === -99) return
    setCarregando(true)
    setErroBusca("")
    try {
      // Limpa sala anterior se existir
      if (codigoSala) {
        await apiFetch(`/api/salas/${codigoSala}/sair`, {
          method: "DELETE",
          body: JSON.stringify({ usuarioId: meuId }),
        }).catch(() => { })
      }
      // Gera novo código
      const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
      const novaSala = Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("")
      sessionStorage.setItem("dominoSoloCodigo", novaSala)
      setCodigoSala(novaSala)

      const r = await apiFetch(`/api/partidas/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigoSala: novaSala,
          nivel: nivelSel,
          jogadores: [
            { id: meuId, nome: meuNome },
            { id: -1, nome: "IA Química" },
          ],
        }),
      })
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        throw new Error(d.erro ?? "Falha ao iniciar partida.")
      }
      const data: EstadoPartida = await r.json()
      setPartida(data)
      setFase("jogo")
    } catch (err) {
      setErroBusca(err instanceof Error ? err.message : "Erro ao iniciar.")
    } finally {
      setCarregando(false)
    }
  }, [clientReady, meuId, meuNome, codigoSala, nivelSel])

  // ─── POLLING ────────────────────────────────────────────────────────────────

  const buscarEstado = useCallback(async () => {
    if (!codigoSala || meuId === -99 || fase !== "jogo") return
    try {
      const res = await apiFetch(`/api/partidas/${codigoSala}?jogador=${encodeURIComponent(meuId)}`)
      if (res.status === 404) { setErroBusca("Partida encerrada."); return }
      if (!res.ok) throw new Error("Erro ao buscar")
      const data: EstadoPartida = await res.json()
      setPartida(data)
      setErroBusca("")
      if (data.encerrado && !showVencedor) setShowVencedor(true)
    } catch {
      // silencioso
    }
  }, [codigoSala, meuId, fase, showVencedor])

  useEffect(() => {
    if (fase !== "jogo") return
    const id = setInterval(buscarEstado, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [buscarEstado, fase])

  // ─── JOGAR PEDRA ────────────────────────────────────────────────────────────

  const jogarPedra = useCallback(async (pedraId: string) => {
    if (!partida || enviando) return
    if (partida.turnoAtual !== meuNome) { showError("Aguarde o seu turno!"); return }
    setEnviando(true)
    try {
      const res = await apiFetch(`/api/partidas/${codigoSala}/jogar`, {
        method: "POST",
        body: JSON.stringify({ usuarioId: meuId, pedraId }),
      })
      const data = await res.json()
      if (!res.ok) {
        const p = data.pontas
        showError((data.erro ?? "Jogada inválida.") + (p ? ` Pontas: ${p.esquerda} e ${p.direita}.` : ""))
        setSelectedPedra(null); setDraggingId(null); return
      }
      setPartida(data); setSelectedPedra(null); setDraggingId(null)
      if (data.encerrado) setShowVencedor(true)
    } catch { showError("Erro de conexão.") }
    finally { setEnviando(false) }
  }, [partida, enviando, meuNome, meuId, codigoSala, showError])

  // ─── PASSAR VEZ ─────────────────────────────────────────────────────────────

  const passarVez = useCallback(async () => {
    if (!partida || enviando) return
    if (partida.turnoAtual !== meuNome) { showError("Não é o seu turno!"); return }
    setEnviando(true)
    try {
      const res = await apiFetch(`/api/partidas/${codigoSala}/passar`, {
        method: "POST",
        body: JSON.stringify({ usuarioId: meuId }),
      })
      const data = await res.json()
      if (!res.ok) { showError(data.erro ?? "Não é possível passar."); return }
      setPartida(data); setSelectedPedra(null)
      if (data.encerrado) setShowVencedor(true)
    } catch { showError("Erro de conexão.") }
    finally { setEnviando(false) }
  }, [partida, enviando, meuNome, meuId, codigoSala, showError])

  // ─── DRAG & DROP ────────────────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, pedraId: string) => {
    e.dataTransfer.setData("pedraId", pedraId)
    setDraggingId(pedraId); setSelectedPedra(pedraId)
  }
  const handleDragOver = (e: React.DragEvent, side: DropZone) => {
    e.preventDefault()
    if (side === "esquerda") setDropOverLeft(true); else setDropOverRight(true)
  }
  const handleDragLeave = (side: DropZone) => {
    if (side === "esquerda") setDropOverLeft(false); else setDropOverRight(false)
  }
  const handleDrop = async (e: React.DragEvent, _side: DropZone) => {
    e.preventDefault(); setDropOverLeft(false); setDropOverRight(false)
    const id = e.dataTransfer.getData("pedraId")
    if (id) await jogarPedra(id)
  }
  const handleClickPonta = useCallback(async (_side: DropZone) => {
    if (selectedPedra && ehMeuTurno) await jogarPedra(selectedPedra)
  }, [selectedPedra, ehMeuTurno, jogarPedra])

  const handleClickPedra = useCallback(async (pedraId: string) => {
    if (!ehMeuTurno) { showError("Aguarde o seu turno!"); return }
    if (selectedPedra === pedraId) await jogarPedra(pedraId)
    else setSelectedPedra(pedraId)
  }, [ehMeuTurno, selectedPedra, jogarPedra, showError])

  // ─── REINICIAR ──────────────────────────────────────────────────────────────

  const reiniciar = () => {
    sessionStorage.removeItem("dominoSoloCodigo")
    setPartida(null); setShowVencedor(false)
    setSelectedPedra(null); setDraggingId(null)
    setFase("selecao"); setErroBusca("")
    // Gera novo código de sala
    const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    const sala = Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("")
    sessionStorage.setItem("dominoSoloCodigo", sala)
    setCodigoSala(sala)
  }

  // ─── TELA DE SELEÇÃO ────────────────────────────────────────────────────────

  if (fase === "selecao") {
    return (
      <TelaSelecaoNivel
        nivelSel={nivelSel}
        setNivelSel={setNivelSel}
        onIniciar={iniciarPartida}
        playerName={meuNome}
      />
    )
  }

  // ─── LOADING ────────────────────────────────────────────────────────────────

  if (carregando && !partida) {
    return (
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F172A" }}>
        <div style={{ textAlign: "center", color: "#94A3B8" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #334155", borderTopColor: "#C62828", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14 }}>Iniciando partida...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  // ─── ERRO FATAL ─────────────────────────────────────────────────────────────

  if (erroBusca && !partida) {
    return (
      <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#0F172A", color: "#94A3B8" }}>
        <AlertCircle size={36} color="#DC2626" />
        <p style={{ fontSize: 14 }}>{erroBusca}</p>
        <button onClick={reiniciar} style={{ background: "#C62828", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 700, cursor: "pointer" }}>
          Tentar novamente
        </button>
      </div>
    )
  }

  // ─── JOGO ───────────────────────────────────────────────────────────────────

  const minhaMao = partida?.minha_mao ?? []
  const mesa = partida?.mesa ?? []
  const snakeRows = buildSnakeRows(mesa)
  const nivelInfo = NIVEIS_OPCOES.find((n) => n.id === nivel) ?? NIVEIS_OPCOES[0]

  return (
    <div style={{ minHeight: "100svh", height: "100svh", background: "#0F172A", fontFamily: "'Inter','Segoe UI',sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }`}</style>

      {/* ── MODAL VENCEDOR ── */}
      {showVencedor && partida?.encerrado && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", padding: 16 }}>
          <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 20, padding: 40, textAlign: "center", maxWidth: 380, width: "100%" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {partida.vencedor === meuNome ? "🏆" : "😔"}
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#F1F5F9", margin: "0 0 8px" }}>
              {partida.vencedor === meuNome ? "Você venceu!" : `${partida.vencedor} venceu!`}
            </h2>
            <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 8px" }}>
              {partida.motivo === "vitoria"
                ? `${partida.vencedor} esvaziou a mão primeiro.`
                : partida.motivo === "fechamento"
                  ? `${partida.vencedor} fechou o ciclo — as pontas se encontraram!`
                  : "O jogo travou — ninguém conseguia jogar."}
            </p>
            <p style={{ fontSize: 11, color: nivelInfo.cor, fontWeight: 700, margin: "0 0 24px" }}>
              {nivelInfo.emoji} Nível {nivelInfo.nome}
            </p>
            <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
              <button onClick={reiniciar} style={{ width: "100%", background: "#C62828", color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <RefreshCw size={16} /> Jogar novamente
              </button>
              <button onClick={() => { reiniciar(); router.push("/aluno") }} style={{ width: "100%", background: "transparent", color: "#94A3B8", border: "1px solid #334155", borderRadius: 12, padding: "12px 0", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Voltar ao Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMsg && <ErrorToast message={errorMsg} onClose={() => setErrorMsg("")} />}

      {/* ── HEADER ── */}
      <header style={{ background: "#1E293B", borderBottom: "1px solid #334155", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 100 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#F1F5F9" }}>
            Dominó <span style={{ color: "#EF4444" }}>Químico</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Chip label="Jogador" value={meuNome} />
          <Chip label="Turno" value={partida?.turnoAtual ?? "—"} accent={ehMeuTurno ? "#16A34A" : undefined} />
          <Chip label="Monte" value={`${partida?.monte ?? 0}`} />
          <NivelBadge nivel={nivel} />
        </div>
        <button
          onClick={() => { sessionStorage.removeItem("dominoSoloCodigo"); router.push("/aluno") }}
          style={{ background: "transparent", border: "1px solid #475569", borderRadius: 8, padding: "6px 14px", color: "#94A3B8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          Sair
        </button>
      </header>

      {/* ── MESA + MÃO ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>

        {/* Mesa */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, #1B4332 0%, #14532D 40%, #0F3D22 100%)" }} />
          <div style={{ position: "absolute", inset: 10, border: "2px solid rgba(255,255,255,0.07)", borderRadius: 14, pointerEvents: "none" }} />

          <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 12px", gap: 12, overflow: "auto", minHeight: 0 }}>

            {mesa.length === 0 ? (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>Mesa vazia — aguardando...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "stretch" }}>
                {snakeRows.map((row, rowIdx) => {
                  const isFirst = rowIdx === 0
                  const isLast = rowIdx === snakeRows.length - 1
                  const isOnly = snakeRows.length === 1
                  const justif = row.reversed ? "flex-end" : "flex-start"
                  const dropEsq = ehMeuTurno && (isFirst || isOnly) && !row.reversed
                  const dropDir = ehMeuTurno && (isLast || isOnly) && !row.reversed
                  const dropDirRev = ehMeuTurno && isLast && !isOnly && row.reversed

                  return (
                    <div key={rowIdx} style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: justif, flexWrap: "nowrap" }}>
                      {dropEsq && (
                        <InlineDropZone side="esquerda" ponta={partida?.pontas.esquerda ?? null} over={dropOverLeft} nivel={nivel}
                          onDragOver={(e) => handleDragOver(e, "esquerda")} onDragLeave={() => handleDragLeave("esquerda")}
                          onDrop={handleDrop} onClick={() => handleClickPonta("esquerda")} />
                      )}
                      {dropDirRev && (
                        <InlineDropZone side="direita" ponta={partida?.pontas.direita ?? null} over={dropOverRight} nivel={nivel}
                          onDragOver={(e) => handleDragOver(e, "direita")} onDragLeave={() => handleDragLeave("direita")}
                          onDrop={handleDrop} onClick={() => handleClickPonta("direita")} />
                      )}
                      {(row.reversed ? [...row.tiles].reverse() : row.tiles).map(({ pedra, kind }, idx) => (
                        <div key={`${pedra.id}-${rowIdx}-${idx}`} style={{ flexShrink: 0, transform: kind === "v-exit" ? "rotate(90deg)" : "none", margin: kind === "v-exit" ? "0 10px" : "0", transition: "transform 0.2s" }}>
                          <RichDominoTile pedra={pedra} nivel={nivel} small />
                        </div>
                      ))}
                      {dropDir && (
                        <InlineDropZone side="direita" ponta={partida?.pontas.direita ?? null} over={dropOverRight} nivel={nivel}
                          onDragOver={(e) => handleDragOver(e, "direita")} onDragLeave={() => handleDragLeave("direita")}
                          onDrop={handleDrop} onClick={() => handleClickPonta("direita")} />
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Aviso de turno */}
            <div style={{ background: ehMeuTurno ? "rgba(22,163,74,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${ehMeuTurno ? "#16A34A44" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: ehMeuTurno ? "#86EFAC" : "#94A3B8", textAlign: "center" }}>
              {ehMeuTurno
                ? selectedPedra ? "✦ Clique numa ponta ou arraste para jogar" : "✦ Sua vez — selecione uma pedra"
                : `⟳ Vez de ${partida?.turnoAtual ?? "..."}`}
            </div>

            {/* Dica de nível */}
            {nivel > 1 && (
              <div style={{ background: `${nivelInfo.cor}15`, border: `1px solid ${nivelInfo.cor}33`, borderRadius: 8, padding: "5px 12px", fontSize: 11, color: nivelInfo.cor, fontWeight: 600, textAlign: "center" }}>
                {nivelInfo.emoji} {nivelInfo.nome}: encaixe pela <strong>função inorgânica</strong> (ponto colorido)
              </div>
            )}
          </div>
        </div>

        {/* Mão do jogador */}
        <div style={{ background: "#1E293B", borderTop: "1px solid #334155", padding: "12px 16px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: 1.2, textTransform: "uppercase" }}>
                Sua mão — {meuNome}
              </span>
              <span style={{ background: "#0F172A", border: "1px solid #334155", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>
                {minhaMao.length} pedras
              </span>
              {selectedPedra && (
                <span style={{ background: "#1D4ED833", border: "1px solid #2563EB44", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600, color: "#93C5FD" }}>
                  Clique na ponta ↑ ou 2× na pedra
                </span>
              )}
            </div>
            {ehMeuTurno && (
              <button onClick={passarVez} disabled={enviando} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid #475569", borderRadius: 8, padding: "6px 14px", color: "#94A3B8", fontSize: 12, fontWeight: 600, cursor: enviando ? "not-allowed" : "pointer", opacity: enviando ? 0.5 : 1 }}>
                <RotateCcw size={13} /> Passar vez
              </button>
            )}
          </div>

          {/* Pedras */}
          <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "4px 2px 8px", alignItems: "flex-end" }}>
            {minhaMao.length === 0 ? (
              <span style={{ fontSize: 13, color: "#475569" }}>Sem pedras na mão</span>
            ) : (
              minhaMao.map((pedra) => {
                const isSelected = selectedPedra === pedra.id
                const isDragging = draggingId === pedra.id
                return (
                  <div key={pedra.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: isDragging ? 0.4 : 1, transition: "opacity 0.15s" }}>
                    <RichDominoTile
                      pedra={pedra} nivel={nivel}
                      selected={isSelected} disabled={!ehMeuTurno}
                      draggable={ehMeuTurno}
                      onDragStart={(e) => handleDragStart(e, pedra.id)}
                      onClick={() => handleClickPedra(pedra.id)}
                    />
                    {isSelected && <div style={{ width: 32, height: 3, borderRadius: 2, background: "#2563EB" }} />}
                  </div>
                )
              })
            )}
          </div>

          {/* Legenda */}
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #1E293B" }}>
            <LegendaCores nivel={nivel} />
          </div>
        </div>
      </div>
    </div>
  )
}