"use client"

import { useState, useCallback, useEffect } from "react"
import { RefreshCw, RotateCcw, AlertCircle, X, ChevronLeft } from "lucide-react"
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

// ─── ESTILOS GLOBAIS ──────────────────────────────────────────────────────────

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; }
  :root {
    --red: #C62828;
    --bg: #FAF9F7;
    --surface: #FFFFFF;
    --surface2: #F5F0EB;
    --border: #E8E0D5;
    --border2: #D4C8BC;
    --text: #1A1A1A;
    --text2: #6B5E52;
    --text3: #9E8E82;
    --domino-bg: #FFFDF9;
    --domino-border: #C8B89A;
  }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 2px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
`

// ─── CORES POR CLASSE QUÍMICA ─────────────────────────────────────────────────

const DOT_COLOR: Record<string, string> = {
  Ácido:   "#EF4444",
  Base:    "#2563EB",
  Sal:     "#16A34A",
  Hidreto: "#9333EA",
  Amida:   "#E11D48",
  Óxido:   "#D97706",
  Éter:    "#0891B2",
}

const TEXT_COLOR: Record<string, string> = {
  Ácido:   "#DC2626",
  Base:    "#1D4ED8",
  Sal:     "#15803D",
  Hidreto: "#7E22CE",
  Amida:   "#BE185D",
  Óxido:   "#B45309",
  Éter:    "#0E7490",
}

// Cada metade da pedra pode ser uma string OU um objeto {encaixe, display, subtitulo, tipo, ...}
// Esta função normaliza para { encaixe: string, display: string }
type MetadeRaw = string | { encaixe?: string; display?: string; subtitulo?: string; tipo?: string; [key: string]: unknown }

function resolveMetade(raw: MetadeRaw): { encaixe: string; display: string } {
  if (typeof raw === "string") return { encaixe: raw, display: raw }
  return {
    encaixe: String(raw.encaixe ?? raw.tipo ?? ""),
    display: String(raw.display ?? raw.subtitulo ?? raw.encaixe ?? raw.tipo ?? ""),
  }
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
      animation: "fadeIn 0.2s ease",
      fontFamily: "'Sora', sans-serif",
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

function Chip({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return (
    <div style={{
      background: active ? "#ECFDF5" : "var(--surface2, #F5F0EB)",
      border: `1.5px solid ${active ? "#22C55E" : "var(--border, #E8E0D5)"}`,
      borderRadius: 8, padding: "5px 12px", textAlign: "center",
    }}>
      <div style={{ fontSize: 9, color: "var(--text3, #9E8E82)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: active ? "#15803D" : "var(--text, #1A1A1A)" }}>{value}</div>
    </div>
  )
}

// ─── PEÇA DE DOMINÓ (VERTICAL — como dominó real) ────────────────────────────

function DominoTile({
  pedra, small = false, selected = false, disabled = false,
  draggable = false, onDragStart, onClick,
}: {
  pedra: Pedra
  small?: boolean
  selected?: boolean
  disabled?: boolean
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onClick?: () => void
}) {
  const tileW    = small ? 52 : 72
  const halfH    = small ? 40 : 56
  const fontSize = small ? 9  : 11
  const dotSize  = small ? 8  : 10

  // Normaliza cada metade — pode ser string ou objeto {encaixe, display, ...}
  const leftMeta  = resolveMetade(pedra.left  as MetadeRaw)
  const rightMeta = resolveMetade(pedra.right as MetadeRaw)

  const half = (encaixe: string, display: string) => (
    <div style={{
      width: tileW, height: halfH,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 4, padding: "6px 4px",
    }}>
      <div style={{
        width: dotSize, height: dotSize, borderRadius: "50%",
        background: DOT_COLOR[encaixe] ?? "#888",
        flexShrink: 0,
        boxShadow: "0 0 0 1.5px rgba(0,0,0,0.08)",
      }} />
      <span style={{
        fontSize, fontWeight: 700,
        color: TEXT_COLOR[encaixe] ?? "#333",
        letterSpacing: 0.1, fontFamily: "'Sora', sans-serif",
        lineHeight: 1.1, textAlign: "center",
        maxWidth: tileW - 8,
        wordBreak: "break-word",
      }}>{display}</span>
    </div>
  )

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={disabled ? undefined : onClick}
      style={{
        background: "var(--domino-bg, #FFFDF9)",
        border: `2px solid ${selected ? "#C62828" : "var(--domino-border, #C8B89A)"}`,
        borderRadius: 8,
        // VERTICAL — como um dominó real
        display: "flex", flexDirection: "column", alignItems: "center",
        boxShadow: selected
          ? "3px 4px 0 rgba(0,0,0,0.20), 0 0 0 3px #C6282825"
          : "3px 4px 0 rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)",
        flexShrink: 0,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.65 : 1,
        transition: "transform 0.15s, box-shadow 0.15s",
        userSelect: "none",
        overflow: "hidden",
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)" }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)" }}
    >
      {half(leftMeta.encaixe, leftMeta.display)}

      {/* Divisória central com dois pontinhos — detalhe clássico de dominó físico */}
      <div style={{
        width: "100%", height: 2,
        background: "var(--domino-border, #C8B89A)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 6, marginTop: -3 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#B8A48A", border: "1px solid rgba(0,0,0,0.08)" }} />
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#B8A48A", border: "1px solid rgba(0,0,0,0.08)" }} />
        </div>
      </div>

      {half(rightMeta.encaixe, rightMeta.display)}
    </div>
  )
}

// ─── PEÇA DEITADA (na mesa) ───────────────────────────────────────────────────
// Peças na mesa ficam HORIZONTAIS — layout em linha como dominó deitado

function DominoTileH({ pedra }: { pedra: Pedra }) {
  const halfW  = 44
  const tileH  = 36
  const fontSize = 9
  const dotSize  = 7

  const leftMeta  = resolveMetade(pedra.left  as MetadeRaw)
  const rightMeta = resolveMetade(pedra.right as MetadeRaw)

  const half = (encaixe: string, display: string) => (
    <div style={{
      width: halfW, height: tileH,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 3, padding: "3px 4px",
    }}>
      <div style={{
        width: dotSize, height: dotSize, borderRadius: "50%",
        background: DOT_COLOR[encaixe] ?? "#888",
        flexShrink: 0,
        boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
      }} />
      <span style={{
        fontSize, fontWeight: 700,
        color: TEXT_COLOR[encaixe] ?? "#333",
        letterSpacing: 0, fontFamily: "'Sora', sans-serif",
        lineHeight: 1.1, textAlign: "center",
        maxWidth: halfW - 6,
        wordBreak: "break-word",
      }}>{display}</span>
    </div>
  )

  return (
    <div style={{
      background: "var(--domino-bg, #FFFDF9)",
      border: "2px solid var(--domino-border, #C8B89A)",
      borderRadius: 7,
      // HORIZONTAL — deitado na mesa
      display: "flex", flexDirection: "row", alignItems: "center",
      boxShadow: "2px 3px 0 rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08)",
      flexShrink: 0,
      userSelect: "none",
      overflow: "hidden",
    }}>
      {half(leftMeta.encaixe, leftMeta.display)}
      {/* Divisória vertical */}
      <div style={{ width: 2, alignSelf: "stretch", background: "var(--domino-border, #C8B89A)", margin: "3px 0", flexShrink: 0 }} />
      {half(rightMeta.encaixe, rightMeta.display)}
    </div>
  )
}

// ─── TELA DE SELEÇÃO DE NÍVEL ─────────────────────────────────────────────────

function TelaSelecaoNivel({
  nivelSel,
  setNivelSel,
  onIniciar,
  playerName,
  carregando,
}: {
  nivelSel: number
  setNivelSel: (n: number) => void
  onIniciar: () => void
  playerName: string
  carregando: boolean
}) {
  const router = useRouter()
  const nivelInfo = NIVEIS_OPCOES.find((n) => n.id === nivelSel)!

  return (
    <div style={{
      minHeight: "100svh",
      background: "var(--bg, #FAF9F7)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Sora', 'Segoe UI', sans-serif",
      position: "relative",
    }}>
      <style>{GLOBAL_STYLES}</style>

      {/* Botão voltar */}
      <button
        onClick={() => router.push("/aluno")}
        style={{
          position: "absolute", top: 20, left: 20,
          display: "flex", alignItems: "center", gap: 6,
          background: "var(--surface, #fff)",
          border: "1.5px solid var(--border, #E8E0D5)",
          borderRadius: 10, padding: "8px 14px",
          color: "var(--text2, #6B5E52)", fontSize: 13, fontWeight: 700,
          cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          fontFamily: "'Sora', sans-serif",
        }}
      >
        <ChevronLeft size={15} /> Menu
      </button>

      <div style={{ maxWidth: 560, width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Cabeçalho */}
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            {/* ← logo real do projeto */}
            <img src="/logo.png" alt="Dominó Químico" style={{ width: 44, height: 44, objectFit: "contain", flexShrink: 0 }} />
            <span style={{ fontSize: 24, fontWeight: 800, color: "var(--text, #1A1A1A)", letterSpacing: -0.3 }}>
              Dominó <span style={{ color: "#C62828" }}>Químico</span>
            </span>
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#FEF2F2", border: "1.5px solid #FECACA",
            borderRadius: 999, padding: "6px 16px", marginBottom: 14,
          }}>
            <span style={{ fontSize: 14 }}>⚗️</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#991B1B", letterSpacing: "0.1em" }}>MODO SOLO</span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text, #1A1A1A)", margin: 0, letterSpacing: -0.5 }}>
            Escolha a dificuldade
          </h1>
          <p style={{ fontSize: 14, color: "var(--text2, #6B5E52)", margin: "8px 0 0", fontWeight: 500 }}>
            Olá, <strong style={{ color: "var(--text, #1A1A1A)" }}>{playerName}</strong>! Pratique suas habilidades de ligações químicas.
          </p>
        </div>

        {/* Seletor de nível — card branco com borda */}
        <div style={{
          background: "var(--surface, #fff)",
          border: "1.5px solid var(--border, #E8E0D5)",
          borderRadius: 20, padding: 24,
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}>
          {/* Label */}
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
            color: "var(--text3, #9E8E82)", textTransform: "uppercase",
            margin: "0 0 12px", fontFamily: "'Sora', sans-serif",
          }}>
            Nível de Dificuldade
          </p>

          {/* Grade de botões de nível */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {NIVEIS_OPCOES.map((n) => {
              const active = nivelSel === n.id
              return (
                <button
                  key={n.id}
                  onClick={() => setNivelSel(n.id)}
                  style={{
                    background: active ? `${n.cor}18` : "#FAFAFA",
                    border: `2px solid ${active ? n.cor : "var(--border, #E8E0D5)"}`,
                    borderRadius: 12, padding: "14px 10px",
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.15s",
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  {/* Emoji + nome */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>{n.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: active ? n.cor : "var(--text, #1A1A1A)" }}>
                      {n.nome}
                    </span>
                    {active && (
                      <span style={{
                        background: n.cor, color: "#fff",
                        fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                        borderRadius: 4, padding: "1px 6px", marginLeft: "auto",
                      }}>
                        ATIVO
                      </span>
                    )}
                  </div>
                  {/* Descrição curta — cor escura, legível */}
                  <p style={{
                    margin: "0 0 4px", fontSize: 11, fontWeight: 700,
                    color: active ? n.cor : "var(--text2, #6B5E52)",
                    lineHeight: 1.3,
                  }}>
                    {n.descricao}
                  </p>
                  {/* Detalhe — sempre cor escura */}
                  <p style={{
                    margin: 0, fontSize: 10,
                    color: "var(--text3, #9E8E82)",
                    lineHeight: 1.4,
                  }}>
                    {n.detalhes}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Preview do nível selecionado */}
        <div style={{
          background: `${nivelInfo.cor}0F`,
          border: `1.5px solid ${nivelInfo.cor}33`,
          borderRadius: 14, padding: "14px 18px",
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>{nivelInfo.emoji}</span>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: nivelInfo.cor }}>
              {nivelInfo.nome} — {nivelInfo.descricao}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text2, #6B5E52)", lineHeight: 1.5 }}>
              {nivelInfo.detalhes}
            </p>
          </div>
        </div>

        {/* Botão iniciar */}
        <button
          onClick={onIniciar}
          disabled={carregando}
          style={{
            width: "100%", padding: "16px 0",
            background: "#C62828",
            border: "none", borderRadius: 14,
            color: "#fff", fontSize: 15, fontWeight: 800,
            cursor: carregando ? "not-allowed" : "pointer",
            letterSpacing: "0.04em",
            boxShadow: "0 6px 20px rgba(198,40,40,0.28)",
            opacity: carregando ? 0.7 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "'Sora', sans-serif",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => { if (!carregando) e.currentTarget.style.opacity = "0.88" }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = carregando ? "0.7" : "1" }}
        >
          {carregando ? (
            <>
              <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Iniciando...
            </>
          ) : "🎲 Iniciar Partida"}
        </button>
      </div>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

const POLL_INTERVAL = 2000

export default function GameBoard() {
  const router = useRouter()

  // Inicializa com valores neutros iguais no servidor e no cliente
  // para evitar hydration mismatch. O useEffect abaixo popula os valores reais.
  const [meuNome, setMeuNome] = useState("Jogador")
  const [meuId, setMeuId] = useState<number>(-99)
  const [codigoSala, setCodigoSala] = useState("")
  const [clientReady, setClientReady] = useState(false)

  const [nivelSel, setNivelSel] = useState(1)
  const [fase, setFase] = useState<"selecao" | "jogo">("selecao")

  const [partida, setPartida] = useState<EstadoPartida | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erroBusca, setErroBusca] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const [selectedPedra, setSelectedPedra] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropOverLeft, setDropOverLeft] = useState(false)
  const [dropOverRight, setDropOverRight] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [showVencedor, setShowVencedor] = useState(false)

  // Estado para animação da IA jogando
  const [iaJogando, setIaJogando] = useState(false)
  const [iaUltimaPedra, setIaUltimaPedra] = useState<Pedra | null>(null)
  const [aguardeIA, setAguardeIA] = useState(false)

  const showError = useCallback((msg: string) => setErrorMsg(msg), [])

  useEffect(() => {
    let nome = sessionStorage.getItem("dominoNome")
    let uid = sessionStorage.getItem("dominoUserId")
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
  const nivelInfo = NIVEIS_OPCOES.find((n) => n.id === nivel) ?? NIVEIS_OPCOES[0]

  // ─── INICIAR PARTIDA ──────────────────────────────────────────────────────

  const iniciarPartida = useCallback(async (nivelOpt?: number) => {
    if (!clientReady || meuId === -99) return
    const nivelParaUsar = nivelOpt ?? nivelSel
    setCarregando(true); setErroBusca("")
    try {
      if (codigoSala) {
        await apiFetch(`/api/salas/${codigoSala}/sair`, {
          method: "DELETE",
          body: JSON.stringify({ usuarioId: meuId }),
        }).catch(() => {})
      }
      const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
      const novaSala = Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("")
      sessionStorage.setItem("dominoSoloCodigo", novaSala)
      setCodigoSala(novaSala)

      const r = await apiFetch(`/api/partidas/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigoSala: novaSala, nivel: nivelParaUsar,
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
      setPartida(data); setFase("jogo")
    } catch (err) {
      setErroBusca(err instanceof Error ? err.message : "Erro ao iniciar.")
    } finally { setCarregando(false) }
  }, [clientReady, meuId, meuNome, codigoSala, nivelSel])

  // ─── POLLING ──────────────────────────────────────────────────────────────

  const buscarEstado = useCallback(async () => {
    if (!codigoSala || meuId === -99 || fase !== "jogo") return
    try {
      const res = await apiFetch(`/api/partidas/${codigoSala}?jogador=${encodeURIComponent(meuId)}`)
      if (res.status === 404) { setErroBusca("Partida encerrada."); return }
      if (!res.ok) throw new Error()
      const data: EstadoPartida = await res.json()
      // Detecta se a IA acabou de jogar (turno voltou pro jogador e mesa cresceu)
      setPartida(prev => {
        if (prev && data.turnoAtual === meuNome && data.mesa.length > prev.mesa.length) {
          // A peça nova que a IA colocou é a última da mesa
          const novaPedra = data.mesa[data.mesa.length - 1]
          setIaUltimaPedra(novaPedra)
          setAguardeIA(false)
          setIaJogando(true)
          setTimeout(() => { setIaJogando(false); setIaUltimaPedra(null) }, 2000)
        }
        return data
      })
      setErroBusca("")
      if (data.encerrado && !showVencedor) setShowVencedor(true)
    } catch { /* silencioso */ }
  }, [codigoSala, meuId, fase, showVencedor, meuNome])

  useEffect(() => {
    if (fase !== "jogo") return
    const id = setInterval(buscarEstado, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [buscarEstado, fase])

  // ─── JOGAR PEDRA ──────────────────────────────────────────────────────────

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
      // Se o turno passou para a IA, mostra a mensagem de aguarde
      if ((data.turnoAtual ?? "").toLowerCase().includes("ia")) setAguardeIA(true)
      else setAguardeIA(false)
      if (data.encerrado) setShowVencedor(true)
    } catch { showError("Erro de conexão.") }
    finally { setEnviando(false) }
  }, [partida, enviando, meuNome, meuId, codigoSala, showError])

  // ─── PASSAR VEZ ───────────────────────────────────────────────────────────

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
      if ((data.turnoAtual ?? "").toLowerCase().includes("ia")) setAguardeIA(true)
      else setAguardeIA(false)
      if (data.encerrado) setShowVencedor(true)
    } catch { showError("Erro de conexão.") }
    finally { setEnviando(false) }
  }, [partida, enviando, meuNome, meuId, codigoSala, showError])

  // ─── DRAG & DROP ──────────────────────────────────────────────────────────

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

  // ─── REINICIAR ────────────────────────────────────────────────────────────

  const reiniciar = () => {
    sessionStorage.removeItem("dominoSoloCodigo")
    setPartida(null); setShowVencedor(false)
    setSelectedPedra(null); setDraggingId(null)
    setFase("selecao"); setErroBusca("")
    const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    const sala = Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("")
    sessionStorage.setItem("dominoSoloCodigo", sala)
    setCodigoSala(sala)
  }

  const jogarNovamente = useCallback(async () => {
    const nivelAtual = partida?.nivel ?? nivelSel
    setNivelSel(nivelAtual)
    setShowVencedor(false)
    setPartida(null)
    setSelectedPedra(null)
    setDraggingId(null)
    setDropOverLeft(false)
    setDropOverRight(false)
    setErroBusca("")
    await iniciarPartida(nivelAtual)
  }, [partida?.nivel, nivelSel, iniciarPartida])

  const voltarAoMenu = () => {
    reiniciar()
    router.push("/aluno")
  }

  // ─── TELA DE SELEÇÃO ──────────────────────────────────────────────────────

  if (fase === "selecao") {
    return (
      <TelaSelecaoNivel
        nivelSel={nivelSel}
        setNivelSel={setNivelSel}
        onIniciar={iniciarPartida}
        playerName={meuNome}
        carregando={carregando}
      />
    )
  }

  // ─── LOADING ──────────────────────────────────────────────────────────────

  if (carregando && !partida) {
    return (
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF9F7", fontFamily: "'Sora', sans-serif" }}>
        <style>{GLOBAL_STYLES}</style>
        <div style={{ textAlign: "center", color: "#9E8E82" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #E8E0D5", borderTopColor: "#C62828", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, fontWeight: 600 }}>Iniciando partida...</p>
        </div>
      </div>
    )
  }

  // ─── ERRO FATAL ───────────────────────────────────────────────────────────

  if (erroBusca && !partida) {
    return (
      <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#FAF9F7", fontFamily: "'Sora', sans-serif", color: "#6B5E52" }}>
        <style>{GLOBAL_STYLES}</style>
        <AlertCircle size={36} color="#C62828" />
        <p style={{ fontSize: 14, fontWeight: 600 }}>{erroBusca}</p>
        <button onClick={reiniciar} style={{ background: "#C62828", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
          Tentar novamente
        </button>
      </div>
    )
  }

  // ─── JOGO ─────────────────────────────────────────────────────────────────

  const minhaMao = partida?.minha_mao ?? []
  const mesa = partida?.mesa ?? []
  const snakeRows = buildSnakeRows(mesa)

  return (
    <div style={{
      minHeight: "100svh", height: "100svh",
      background: "var(--bg, #FAF9F7)",
      fontFamily: "'Sora', 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <style>{GLOBAL_STYLES}</style>

      {/* ── MODAL VENCEDOR ── */}
      {showVencedor && partida?.encerrado && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", padding: 16,
        }}>
          <div style={{
            background: "#FFFFFF", border: "1.5px solid #E8E0D5",
            borderRadius: 20, padding: 40, textAlign: "center",
            maxWidth: 380, width: "100%",
            boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
            animation: "fadeIn 0.25s ease",
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {partida.vencedor === meuNome ? "🏆" : "😔"}
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1A1A1A", margin: "0 0 8px" }}>
              {partida.vencedor === meuNome ? "Você venceu!" : `${partida.vencedor} venceu!`}
            </h2>
            <p style={{ fontSize: 13, color: "#6B5E52", margin: "0 0 6px", lineHeight: 1.6 }}>
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
              <button
                onClick={jogarNovamente}
                style={{
                  width: "100%", background: "#C62828", color: "#fff",
                  border: "none", borderRadius: 12, padding: "14px 0",
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                <RefreshCw size={16} /> Jogar novamente
              </button>
              <button
                onClick={voltarAoMenu}
                style={{
                  width: "100%", background: "transparent", color: "#6B5E52",
                  border: "1.5px solid #E8E0D5", borderRadius: 12, padding: "12px 0",
                  fontWeight: 600, fontSize: 13, cursor: "pointer",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Voltar ao Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMsg && <ErrorToast message={errorMsg} onClose={() => setErrorMsg("")} />}

      {/* ── HEADER ── */}
      <header style={{
        background: "var(--surface, #fff)",
        borderBottom: "1.5px solid var(--border, #E8E0D5)",
        padding: "10px 20px",
        display: "flex", alignItems: "center", gap: 12,
        flexShrink: 0, flexWrap: "wrap",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 120 }}>
          {/* ← logo real do projeto */}
          <img src="/logo.png" alt="Dominó Químico" style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0 }} />
          <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text, #1A1A1A)", letterSpacing: -0.3 }}>
            Dominó <span style={{ color: "#C62828" }}>Químico</span>
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Chip label="Turno" value={ehMeuTurno ? "você" : (partida?.turnoAtual ?? "—")} active={ehMeuTurno} />
          <Chip label="Monte" value={`${partida?.monte ?? 0}`} />
          <NivelBadge nivel={nivel} />
        </div>

        <button
          onClick={() => { sessionStorage.removeItem("dominoSoloCodigo"); router.push("/aluno") }}
          style={{
            background: "transparent", border: "1.5px solid var(--border2, #D4C8BC)",
            borderRadius: 8, padding: "6px 16px",
            color: "var(--text2, #6B5E52)", fontSize: 12, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Sora', sans-serif",
          }}
        >
          Sair
        </button>
      </header>

      {/* ── MESA + MÃO ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>

        {/* Feltro */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, #2D6A4F 0%, #1B4332 60%, #14532D 100%)" }} />
          <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "20px 20px" }} />
          <div style={{ position: "absolute", inset: 14, border: "2px solid rgba(255,255,255,0.08)", borderRadius: 16, pointerEvents: "none" }} />

          <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 12px", gap: 12, overflow: "auto", minHeight: 0 }}>

            {mesa.length === 0 ? (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 14, fontWeight: 600 }}>
                Mesa vazia — aguardando...
              </div>
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
                          {/* Peça DEITADA na mesa */}
                          <DominoTileH pedra={pedra} />
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

            {/* ── BANNER DE ESTADO ── */}
            <style>{`
              @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
              @keyframes bounce { from{transform:translateY(0)} to{transform:translateY(-5px)} }
              @keyframes slideIn { from{opacity:0;transform:scale(0.85) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
            `}</style>

            {/* IA acabou de jogar — mostra a peça que ela colocou */}
            {iaJogando && iaUltimaPedra && (() => {
              const lm = resolveMetade(iaUltimaPedra.left as MetadeRaw)
              const rm = resolveMetade(iaUltimaPedra.right as MetadeRaw)
              return (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, animation: "slideIn 0.35s ease" }}>
                  <div style={{ background: "rgba(99,102,241,0.2)", border: "1.5px solid rgba(99,102,241,0.5)", borderRadius: 14, padding: "10px 20px", display: "flex", alignItems: "center", gap: 10, backdropFilter: "blur(6px)" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#C7D2FE" }}>⚗ IA Química jogou:</span>
                    {/* Mini peça animada */}
                    <div style={{ display: "flex", flexDirection: "row", background: "#FFFDF9", border: "2px solid #C8B89A", borderRadius: 7, boxShadow: "2px 3px 0 rgba(0,0,0,0.18)", overflow: "hidden", animation: "slideIn 0.4s ease" }}>
                      <div style={{ width: 52, height: 42, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: DOT_COLOR[lm.encaixe] ?? "#888" }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: TEXT_COLOR[lm.encaixe] ?? "#333", fontFamily: "'Sora',sans-serif" }}>{lm.display}</span>
                      </div>
                      <div style={{ width: 2, background: "#C8B89A", margin: "4px 0" }} />
                      <div style={{ width: 52, height: 42, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: DOT_COLOR[rm.encaixe] ?? "#888" }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: TEXT_COLOR[rm.encaixe] ?? "#333", fontFamily: "'Sora',sans-serif" }}>{rm.display}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Mensagem após a sua jogada, enquanto for a vez da IA */}
            {!ehMeuTurno && aguardeIA && (
              <div style={{ padding: "7px 18px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 0.3, background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.06)", color: "#374151" }}>
                Aguarde, agora é a vez da IA
              </div>
            )}

            {/* IA ainda pensando */}
            {!ehMeuTurno && !iaJogando && (
              <div style={{ background: "rgba(234,179,8,0.18)", border: "1.5px solid rgba(234,179,8,0.5)", borderRadius: 14, padding: "10px 24px", display: "flex", alignItems: "center", gap: 10, backdropFilter: "blur(6px)" }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#EAB308", boxShadow: "0 0 8px #EAB308", animation: "pulse 1.1s ease-in-out infinite" }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: "#FDE68A" }}>IA Química está pensando...</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#FDE68A", animation: `bounce 0.5s ${i*0.15}s ease-in-out infinite alternate` }} />)}
                </div>
              </div>
            )}

            {/* Vez do jogador */}
            {ehMeuTurno && (
              <div style={{ padding: "7px 18px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 0.3, background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)", color: "#86EFAC", backdropFilter: "blur(4px)" }}>
                {selectedPedra ? "✦ Clique numa ponta para jogar" : "✦ Sua vez — selecione uma pedra"}
              </div>
            )}

            {/* Dica de nível */}
            {nivel > 1 && (
              <div style={{
                background: `${nivelInfo.cor}15`,
                border: `1px solid ${nivelInfo.cor}33`,
                borderRadius: 8, padding: "5px 12px",
                fontSize: 11, color: nivelInfo.cor, fontWeight: 600, textAlign: "center",
              }}>
                {nivelInfo.emoji} {nivelInfo.nome}: encaixe pela <strong>função inorgânica</strong> (ponto colorido)
              </div>
            )}
          </div>
        </div>

        {/* ── MÃO DO JOGADOR ── */}
        <div style={{
          background: "var(--surface, #fff)",
          borderTop: "1.5px solid var(--border, #E8E0D5)",
          padding: "14px 20px", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text3, #9E8E82)", letterSpacing: 1.2, textTransform: "uppercase" }}>
                Sua mão
              </span>
              <span style={{ background: "var(--surface2, #F5F0EB)", border: "1.5px solid var(--border, #E8E0D5)", borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: "var(--text2, #6B5E52)" }}>
                {minhaMao.length} pedras
              </span>
              {selectedPedra && (
                <span style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 600, color: "#1E40AF" }}>
                  Clique na ponta ↑ ou 2× na pedra
                </span>
              )}
            </div>
            {ehMeuTurno && (
              <button
                onClick={passarVez}
                disabled={enviando}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "transparent", border: "1.5px solid var(--border2, #D4C8BC)",
                  borderRadius: 8, padding: "6px 16px",
                  color: "var(--text2, #6B5E52)", fontSize: 12, fontWeight: 700,
                  cursor: enviando ? "not-allowed" : "pointer",
                  opacity: enviando ? 0.5 : 1,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                <RotateCcw size={13} /> Passar vez
              </button>
            )}
          </div>

          {/* Pedras na mão — grade que ocupa toda a largura */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, padding: "4px 3px 8px 100px" }}>
            {minhaMao.length === 0 ? (
              <span style={{ fontSize: 13, color: "var(--text3, #9E8E82)", fontWeight: 600, gridColumn: "1/-1" }}>Sem pedras na mão</span>
            ) : (
              minhaMao.map((pedra) => {
                const isSelected = selectedPedra === pedra.id
                const isDragging = draggingId === pedra.id
                const lm = resolveMetade(pedra.left  as MetadeRaw)
                const rm = resolveMetade(pedra.right as MetadeRaw)
                // Verifica se esta pedra encaixa em alguma das pontas
                const encaixaEsq = partida?.pontas.esquerda ? (lm.encaixe === partida.pontas.esquerda || rm.encaixe === partida.pontas.esquerda) : true
                const encaixaDir = partida?.pontas.direita ? (lm.encaixe === partida.pontas.direita || rm.encaixe === partida.pontas.direita) : true
                const encaixa = encaixaEsq || encaixaDir
                return (
                  <div
                    key={pedra.id}
                    draggable={ehMeuTurno}
                    onDragStart={(e) => handleDragStart(e, pedra.id)}
                    onClick={() => handleClickPedra(pedra.id)}
                    style={{
                      display: "flex", flexDirection: "row",
                      background: isSelected ? "#FFF5F5" : "var(--domino-bg, #FFFDF9)",
                      border: `2px solid ${isSelected ? "#C62828" : !ehMeuTurno || !encaixa ? "#E8E0D5" : "var(--domino-border, #C8B89A)"}`,
                      borderRadius: 10,
                      boxShadow: isSelected
                        ? "3px 4px 0 rgba(198,40,40,0.25), 0 0 0 3px #C6282818"
                        : encaixa && ehMeuTurno
                          ? "3px 4px 0 rgba(0,0,0,0.16), 0 1px 4px rgba(0,0,0,0.08)"
                          : "1px 2px 0 rgba(0,0,0,0.08)",
                      cursor: !ehMeuTurno ? "default" : "pointer",
                      opacity: isDragging ? 0.3 : (!ehMeuTurno || !encaixa) ? 0.5 : 1,
                      transition: "transform 0.15s, box-shadow 0.15s, opacity 0.2s",
                      userSelect: "none",
                      overflow: "hidden",
                      width: "100%",
                    }}
                    onMouseEnter={e => { if (ehMeuTurno && encaixa) (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)" }}
                  >
                    {/* Metade esquerda */}
                    <div style={{ flex: 1, height: 58, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "6px" }}>
                      <div style={{ width: 11, height: 11, borderRadius: "50%", background: DOT_COLOR[lm.encaixe] ?? "#888", boxShadow: "0 0 0 1.5px rgba(0,0,0,0.08)" }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: TEXT_COLOR[lm.encaixe] ?? "#333", textAlign: "center", lineHeight: 1.1, fontFamily: "'Sora', sans-serif" }}>{lm.display}</span>
                    </div>
                    {/* Divisória central */}
                    <div style={{ width: 2, alignSelf: "stretch", background: "var(--domino-border, #C8B89A)", margin: "5px 0", flexShrink: 0, position: "relative" }}>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#B8A48A" }} />
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#B8A48A" }} />
                      </div>
                    </div>
                    {/* Metade direita */}
                    <div style={{ flex: 1, height: 58, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "6px" }}>
                      <div style={{ width: 11, height: 11, borderRadius: "50%", background: DOT_COLOR[rm.encaixe] ?? "#888", boxShadow: "0 0 0 1.5px rgba(0,0,0,0.08)" }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: TEXT_COLOR[rm.encaixe] ?? "#333", textAlign: "center", lineHeight: 1.1, fontFamily: "'Sora', sans-serif" }}>{rm.display}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Legenda removida conforme solicitado */}
        </div>
      </div>
    </div>
  )
}