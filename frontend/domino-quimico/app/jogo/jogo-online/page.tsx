"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Trophy, RefreshCw, RotateCcw, AlertCircle, X } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { RichDominoTile, InlineDropZone as RichInlineDropZone, LegendaCores } from "@/components/domino/RichDominoTile"

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
  nivel?: number
}

type DropZone = "esquerda" | "direita"

// ─── TOAST DE ERRO ─────────────────────────────────────────────────────────────

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
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", color: "#991B1B" }}>
        <X size={14} />
      </button>
    </div>
  )
}

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
    const hasNextRow = i + COLS < mesa.length
    const tiles: TileLayout[] = slice.map((pedra, li) => ({
      pedra, kind: li === slice.length - 1 && hasNextRow ? "v-exit" : "h",
    }))
    rows.push({ tiles, reversed })
    i += COLS; rowIdx++
  }
  return rows
}

// ─── CHIP ─────────────────────────────────────────────────────────────────────

function Chip({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: "#0F172A", border: `1px solid ${accent ? accent + "55" : "#334155"}`, borderRadius: 8, padding: "4px 10px" }}>
      <div style={{ fontSize: 9, color: "#64748B", fontWeight: 600, letterSpacing: 0.8 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: accent ?? "#E2E8F0" }}>{value}</div>
    </div>
  )
}

// ─── CARD DO JOGADOR ──────────────────────────────────────────────────────────

function PlayerInfoCard({ nome, pecas, turno, isSelf }: { nome: string; pecas: number; turno: boolean; isSelf: boolean }) {
  return (
    <div style={{
      background: turno ? "rgba(22,163,74,0.15)" : "rgba(255,255,255,0.06)",
      border: `1px solid ${turno ? "#16A34A44" : "rgba(255,255,255,0.1)"}`,
      borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: turno ? "#86EFAC" : "#E2E8F0" }}>
          {nome} {isSelf && <span style={{ fontSize: 10, color: "#64748B", fontWeight: 400 }}>(você)</span>}
        </div>
        <div style={{ fontSize: 11, color: "#64748B" }}>{pecas} pedras</div>
      </div>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: turno ? "#22C55E" : "#334155" }} />
    </div>
  )
}

// ─── POLL INTERVAL ────────────────────────────────────────────────────────────

const POLL_INTERVAL = 2000

// ─── PÁGINA PRINCIPAL ──────────────────────────────────────────────────────────

export default function JogoOnlinePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nomeParm = searchParams.get("jogador")
  const salaParm = searchParams.get("sala")
  const [meuNome, setMeuNome] = useState("")
  const [meuId, setMeuId] = useState(-99)
  const [codigoSala, setCodigoSala] = useState((salaParm || "").toUpperCase())

  useEffect(() => {
    const nomeSession = sessionStorage.getItem("dominoNome")
    const idSession = sessionStorage.getItem("dominoUserId")
    const salaSession = sessionStorage.getItem("dominoSala")
    if (!nomeParm && nomeSession) setMeuNome(nomeSession)
    if (idSession) setMeuId(Number(idSession))
    if (!salaParm && salaSession) setCodigoSala(salaSession.toUpperCase())
  }, [nomeParm, salaParm])

  useEffect(() => {
    if (codigoSala === "") router.replace("/aluno")
  }, [codigoSala, router])

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

  const showError = useCallback((msg: string) => setErrorMsg(msg), [])

  const meuIdRef = useRef(meuId)
  const meuNomeRef = useRef(meuNome)
  const salaRef = useRef(codigoSala)
  meuIdRef.current = meuId
  meuNomeRef.current = meuNome
  salaRef.current = codigoSala

  const [clientReady, setClientReady] = useState(false)
  useEffect(() => { setClientReady(true) }, [])

  // Bug fix: quando o jogador fecha a aba ou sai durante o jogo,
  // remove ele da sala no banco. Isso previne que ele apareça como "espectro"
  // pra os outros jogadores.
  useEffect(() => {
    return () => {
      if (meuId !== -99 && codigoSala) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/salas/${codigoSala}/sair`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuarioId: meuId }),
        }).catch(() => { })
      }
    }
  }, [meuId, codigoSala])

  const ehMeuTurno = partida?.turnoAtual === meuNome

  // ─── POLLING — só busca, não cria partida ────────────────────────────────────
  const buscarEstado = useCallback(async () => {
    const id = meuIdRef.current
    const sala = salaRef.current

    if (!sala || id === -99) return
    try {
      const res = await apiFetch(`/api/partidas/${sala}?jogador=${encodeURIComponent(id)}`)
      if (res.status === 404) {
        setErroBusca("Partida não encontrada. Verifique o código da sala.")
        setCarregando(false)
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
  }, [showVencedor])

  useEffect(() => {
    if (!clientReady) return
    buscarEstado()
    const id = setInterval(buscarEstado, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [buscarEstado, clientReady])

  // ─── JOGAR PEDRA ──────────────────────────────────────────────────────────────
  const jogarPedra = useCallback(async (pedraId: string) => {
    if (!partida || enviando) return
    const nome = meuNomeRef.current
    const id = meuIdRef.current
    const sala = salaRef.current
    if (partida.turnoAtual !== nome) { showError("Aguarde o seu turno para jogar!"); return }
    setEnviando(true)
    try {
      const res = await apiFetch(`/api/partidas/${sala}/jogar`, {
        method: "POST",
        body: JSON.stringify({ usuarioId: id, pedraId }),
      })
      const data = await res.json()
      if (!res.ok) {
        const pontas = data.pontas as Pontas | undefined
        showError((data.erro ?? "Jogada inválida.") + (pontas ? ` Pontas: ${pontas.esquerda} e ${pontas.direita}.` : ""))
        setSelectedPedra(null); setDraggingId(null); return
      }
      setPartida(data); setSelectedPedra(null); setDraggingId(null)
      if (data.encerrado) setShowVencedor(true)
    } catch { showError("Erro de conexão com o servidor.") }
    finally { setEnviando(false) }
  }, [partida, enviando, showError])

  // ─── PASSAR VEZ ───────────────────────────────────────────────────────────────
  const passarVez = useCallback(async () => {
    if (!partida || enviando) return
    const nome = meuNomeRef.current
    const id = meuIdRef.current
    const sala = salaRef.current
    if (partida.turnoAtual !== nome) { showError("Não é o seu turno!"); return }
    setEnviando(true)
    try {
      const res = await apiFetch(`/api/partidas/${sala}/passar`, {
        method: "POST",
        body: JSON.stringify({ usuarioId: id }),
      })
      const data = await res.json()
      if (!res.ok) { showError(data.erro ?? "Não é possível passar agora."); return }
      setPartida(data); setSelectedPedra(null)
      if (data.encerrado) setShowVencedor(true)
    } catch { showError("Erro de conexão com o servidor.") }
    finally { setEnviando(false) }
  }, [partida, enviando, showError])

  // ─── DRAG & DROP ──────────────────────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, pedraId: string) => {
    e.dataTransfer.setData("pedraId", pedraId)
    e.dataTransfer.effectAllowed = "move"
    setDraggingId(pedraId); setSelectedPedra(pedraId)
  }
  const handleDragOver = (e: React.DragEvent, side: DropZone) => {
    e.preventDefault(); e.dataTransfer.dropEffect = "move"
    if (side === "esquerda") setDropOverLeft(true); else setDropOverRight(true)
  }
  const handleDragLeave = (side: DropZone) => {
    if (side === "esquerda") setDropOverLeft(false); else setDropOverRight(false)
  }
  const handleDrop = async (e: React.DragEvent, _side: DropZone) => {
    e.preventDefault(); setDropOverLeft(false); setDropOverRight(false)
    const pedraId = e.dataTransfer.getData("pedraId")
    if (!pedraId) return
    await jogarPedra(pedraId)
  }
  const handleClickPonta = useCallback(async (_side: DropZone) => {
    if (!selectedPedra || !ehMeuTurno) return
    await jogarPedra(selectedPedra)
  }, [selectedPedra, ehMeuTurno, jogarPedra])

  const handleClickPedra = useCallback(async (pedraId: string) => {
    if (!ehMeuTurno) { showError("Aguarde o seu turno!"); return }
    if (selectedPedra === pedraId) { await jogarPedra(pedraId) }
    else { setSelectedPedra(pedraId) }
  }, [ehMeuTurno, selectedPedra, jogarPedra, showError])

  // ─── HELPERS ──────────────────────────────────────────────────────────────────
  const minhaMao = partida?.minha_mao ?? []
  const mesa = partida?.mesa ?? []
  const snakeRows = buildSnakeRows(mesa)

  const quantidadePedras = (nome: string): number => {
    if (!partida) return 0
    const val = partida.maos[nome]
    return typeof val === "number" ? val : (val as Pedra[]).length
  }

  // ─── LOADING / ERRO ───────────────────────────────────────────────────────────
  if (carregando) {
    return (
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F172A" }}>
        <div style={{ textAlign: "center", color: "#94A3B8" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #334155", borderTopColor: "#C62828", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, fontWeight: 500 }}>Carregando partida...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  if (erroBusca && !partida) {
    return (
      <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#0F172A", color: "#94A3B8" }}>
        <AlertCircle size={36} color="#DC2626" />
        <p style={{ fontSize: 14 }}>{erroBusca}</p>
        <button onClick={buscarEstado} style={{ background: "#C62828", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 700, cursor: "pointer" }}>
          Tentar novamente
        </button>
      </div>
    )
  }

  // ─── RENDER PRINCIPAL ─────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100svh", height: "100svh", background: "#0F172A", fontFamily: "'Inter', 'Segoe UI', sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
      `}</style>

      {/* ── MODAL VENCEDOR ── */}
      {showVencedor && partida?.encerrado && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", padding: 16 }}>
          <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 20, padding: 40, textAlign: "center", maxWidth: 380, width: "100%" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: partida.vencedor === meuNome ? "#FEF3C7" : "#1E293B", border: "2px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trophy size={34} color={partida.vencedor === meuNome ? "#D97706" : "#475569"} />
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#F1F5F9", margin: "0 0 8px" }}>
              {partida.vencedor === meuNome ? "Você venceu! 🎉" : `${partida.vencedor} venceu!`}
            </h2>
            <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 28px" }}>
              {partida.motivo === "vitoria"
                ? `${partida.vencedor} esvaziou a mão primeiro.`
                : partida.motivo === "fechamento"
                  ? `${partida.vencedor} fechou o ciclo — as pontas se encontraram!`
                  : "O jogo travou — ninguém conseguia jogar."}
            </p>
            <button onClick={() => router.push("/aluno")} style={{ width: "100%", background: "#C62828", color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <RefreshCw size={16} /> Voltar ao Menu
            </button>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {errorMsg && <ErrorToast message={errorMsg} onClose={() => setErrorMsg("")} />}

      {/* ── HEADER ── */}
      <header style={{ background: "#1E293B", borderBottom: "1px solid #334155", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 100 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#F1F5F9", letterSpacing: -0.3 }}>
            Dominó <span style={{ color: "#EF4444" }}>Químico</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Chip label="Sala" value={codigoSala} accent="#2563EB" />
          <Chip label="Jogador" value={meuNome} />
          <Chip label="Turno" value={partida?.turnoAtual ?? "—"} accent={ehMeuTurno ? "#16A34A" : undefined} />
          <Chip label="Monte" value={`${partida?.monte ?? 0}`} />
        </div>
        <button
          onClick={() => router.push("/aluno")}
          style={{ background: "transparent", border: "1px solid #475569", borderRadius: 8, padding: "6px 14px", color: "#94A3B8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          Sair
        </button>
      </header>

      {/* ── MESA + MÃO ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>

        {/* ── MESA ── */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, #1B4332 0%, #14532D 40%, #0F3D22 100%)" }} />
          <div style={{ position: "absolute", inset: 10, border: "2px solid rgba(255,255,255,0.07)", borderRadius: 14, pointerEvents: "none" }} />

          <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 12px", gap: 12, overflow: "auto", minHeight: 0 }}>

            {/* Cards dos jogadores */}
            {partida && partida.jogadores.length > 0 && (
              <div style={{ position: "absolute", top: 12, right: 12, display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                {partida.jogadores.map((nome) => (
                  <PlayerInfoCard
                    key={nome} nome={nome}
                    pecas={quantidadePedras(nome)}
                    turno={partida.turnoAtual === nome}
                    isSelf={nome === meuNome}
                  />
                ))}
              </div>
            )}

            {/* Mesa vazia */}
            {mesa.length === 0 ? (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 14, fontWeight: 500, letterSpacing: 1 }}>
                Mesa vazia — aguardando o host iniciar
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "stretch" }}>
                {snakeRows.map((row, rowIdx) => {
                  const isFirst = rowIdx === 0
                  const isLast = rowIdx === snakeRows.length - 1
                  const isOnly = snakeRows.length === 1
                  const justif = row.reversed ? "flex-end" : "flex-start"
                  const dropEsqVisible = ehMeuTurno && (isFirst || isOnly) && !row.reversed
                  const dropDirVisible = ehMeuTurno && (isLast || isOnly) && !row.reversed
                  const dropDirReversed = ehMeuTurno && isLast && !isOnly && row.reversed && !dropDirVisible

                  return (
                    <div key={rowIdx} style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: justif, flexWrap: "nowrap" }}>
                      {dropEsqVisible && (
                        <RichInlineDropZone side="esquerda" ponta={partida?.pontas?.esquerda ?? null} over={dropOverLeft} nivel={partida?.nivel ?? 1}
                          onDragOver={(e) => handleDragOver(e, "esquerda")} onDragLeave={() => handleDragLeave("esquerda")}
                          onDrop={handleDrop} onClick={() => handleClickPonta("esquerda")} />
                      )}
                      {dropDirReversed && (
                        <RichInlineDropZone side="direita" ponta={partida?.pontas?.direita ?? null} over={dropOverRight} nivel={partida?.nivel ?? 1}
                          onDragOver={(e) => handleDragOver(e, "direita")} onDragLeave={() => handleDragLeave("direita")}
                          onDrop={handleDrop} onClick={() => handleClickPonta("direita")} />
                      )}
                      {(row.reversed ? [...row.tiles].reverse() : row.tiles).map(({ pedra, kind }, idx) => (
                        <div key={`${pedra.id}-${rowIdx}-${idx}`} style={{ flexShrink: 0, transform: kind === "v-exit" ? "rotate(90deg)" : "none", margin: kind === "v-exit" ? "0 10px" : "0", transition: "transform 0.2s ease" }}>
                          <RichDominoTile pedra={pedra} nivel={partida?.nivel ?? 1} small />
                        </div>
                      ))}
                      {dropDirVisible && (
                        <RichInlineDropZone side="direita" ponta={partida?.pontas?.direita ?? null} over={dropOverRight} nivel={partida?.nivel ?? 1}
                          onDragOver={(e) => handleDragOver(e, "direita")} onDragLeave={() => handleDragLeave("direita")}
                          onDrop={handleDrop} onClick={() => handleClickPonta("direita")} />
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Aviso de turno */}
            <div style={{ background: ehMeuTurno ? "rgba(22,163,74,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${ehMeuTurno ? "#16A34A44" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: ehMeuTurno ? "#86EFAC" : "#94A3B8", letterSpacing: 0.4, textAlign: "center" }}>
              {ehMeuTurno
                ? selectedPedra ? "✦ Clique numa ponta ou arraste para jogar" : "✦ Sua vez — selecione uma pedra"
                : `⟳ Vez de ${partida?.turnoAtual ?? "..."}`}
            </div>
          </div>
        </div>

        {/* ── MÃO DO JOGADOR ── */}
        <div style={{ background: "#1E293B", borderTop: "1px solid #334155", padding: "12px 16px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
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
                      pedra={pedra} nivel={partida?.nivel ?? 1}
                      selected={isSelected}
                      disabled={!ehMeuTurno} draggable={ehMeuTurno}
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
            <LegendaCores nivel={partida?.nivel ?? 1} />
          </div>
        </div>
      </div>
    </div>
  )
}