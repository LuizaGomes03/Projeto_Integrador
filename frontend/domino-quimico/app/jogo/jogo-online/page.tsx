"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Settings, HelpCircle, LogOut, TriangleAlert, Trophy, RefreshCw } from "lucide-react"
import { apiFetch } from "@/lib/api"

const POLL_INTERVAL = 2000

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

type Feedback = {
  tipo: "sucesso" | "erro" | "info"
  mensagem: string
}

// ─── COMPONENTES ───────────────────────────────────────────────────────────────

function DominoPiece({
  top,
  bottom,
  selected = false,
  disabled = false,
  onClick,
}: {
  top: string
  bottom: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        flex h-[80px] w-[42px] flex-col overflow-hidden border bg-white shadow-md
        sm:h-[95px] sm:w-[50px]
        xl:h-[116px] xl:w-[58px]
        ${onClick && !disabled ? "cursor-pointer hover:-translate-y-2 transition-transform" : ""}
        ${selected ? "border-[#2563EB] ring-2 ring-[#2563EB]" : "border-[#D7DCE2]"}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
      `}
    >
      <div className="flex flex-1 items-center justify-center border-b border-[#D7DCE2] bg-[#EEF3FF] text-[13px] font-black text-[#2563EB] sm:text-[15px] xl:text-[17px] text-center px-1">
        {top}
      </div>
      <div className="flex flex-1 items-center justify-center bg-[#FFF1F1] text-[13px] font-black text-[#C62828] sm:text-[15px] xl:text-[17px] text-center px-1">
        {bottom}
      </div>
    </div>
  )
}

function PlayerCard({
  name,
  turn = false,
  connected = true,
  pecas,
  isSelf = false,
}: {
  name: string
  turn?: boolean
  connected?: boolean
  pecas: number
  isSelf?: boolean
}) {
  return (
    <div
      className={`
        flex h-[56px] sm:h-[64px] md:h-[72px] items-center justify-between border bg-white px-4 shadow-sm
        ${turn ? "border-[#2563EB] ring-2 ring-[#2563EB]" : "border-[#D7DCE2]"}
      `}
    >
      <div>
        <p className="text-[15px] font-bold text-[#3A3A3A]">
          {name}
          {isSelf && <span className="ml-2 text-xs font-normal text-[#2563EB]">(você)</span>}
        </p>
        <p className="text-xs text-[#8A96A8]">
          {turn ? "Jogando agora..." : connected ? `${pecas} pedras` : "Desconectado"}
        </p>
      </div>
      <div className={`h-3 w-3 rounded-full ${connected ? "bg-[#22C55E]" : "bg-[#CBD5E1]"}`} />
    </div>
  )
}

function FeedbackBanner({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return null
  const estilos = {
    sucesso: "bg-green-50 border-green-400 text-green-800",
    erro: "bg-red-50 border-red-400 text-red-800",
    info: "bg-blue-50 border-blue-400 text-blue-800",
  }
  return (
    <div className={`border-l-4 px-4 py-3 text-sm font-semibold ${estilos[feedback.tipo]} transition-all`}>
      {feedback.mensagem}
    </div>
  )
}

function ModalVencedor({
  encerrado,
  vencedor,
  vencedores,
  motivo,
  meuNome,
  onVoltar,
}: {
  encerrado: boolean
  vencedor: string | null
  vencedores: string[] | null
  motivo: string | null
  meuNome: string
  onVoltar: () => void
}) {
  if (!encerrado) return null
  const euVenci = vencedor === meuNome || (vencedores?.includes(meuNome) && vencedores.length > 1)
  const empate = !vencedor && (vencedores?.length ?? 0) > 1
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-[480px] rounded-2xl bg-white p-8 shadow-2xl text-center">
        <div className="mb-5 flex justify-center">
          <div className={`flex h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center rounded-full ${euVenci ? "bg-yellow-50" : "bg-slate-100"}`}>
            <Trophy size={34} className={euVenci ? "text-yellow-500" : "text-slate-400"} />
          </div>
        </div>
        <h2 className="text-[28px] font-black text-[#3A3A3A]">
          {empate ? "Empate!" : euVenci ? "Você venceu! 🎉" : `${vencedor} venceu!`}
        </h2>
        <p className="mt-3 text-sm text-[#64748B]">
          {motivo === "vitoria"
            ? `${vencedor} esvaziou a mão primeiro.`
            : "O jogo travou — ninguém conseguia jogar."}
        </p>
        {empate && vencedores && (
          <p className="mt-2 text-sm font-semibold text-[#64748B]">
            Empataram: {vencedores.join(", ")}
          </p>
        )}
        <button
          onClick={onVoltar}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-4 font-bold text-white transition hover:bg-rose-700"
        >
          <RefreshCw size={18} />
          Voltar ao Menu
        </button>
      </div>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ──────────────────────────────────────────────────────────

export default function JogoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ─── IDENTIDADE DO JOGADOR ───────────────────────────────────────────────
  // Derivado diretamente — sem setState em useEffect (evita cascading renders)
  // Na primeira render (SSR/hydration) sessionStorage não existe ainda;
  // useSearchParams() já é reativo, então basta ler aqui.
  const { meuNome, codigoSala } = useMemo(() => {
    const nomeParm = searchParams.get("jogador")
    const salaParm = searchParams.get("sala")
    const nomeSession = typeof window !== "undefined" ? sessionStorage.getItem("dominoNome") : null
    const salaSession = typeof window !== "undefined" ? sessionStorage.getItem("dominoSala") : null
    return {
      meuNome: nomeParm || nomeSession || "Jogador",
      codigoSala: (salaParm || salaSession || "DEMO").toUpperCase(),
    }
  }, [searchParams])

  // Estado da partida
  const [partida, setPartida] = useState<EstadoPartida | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erroBusca, setErroBusca] = useState("")

  // UI local
  const [pedraSelecionada, setPedraSelecionada] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  // ─── FEEDBACK ─────────────────────────────────────────────────────────────

  const exibirFeedback = useCallback((tipo: Feedback["tipo"], mensagem: string) => {
    setFeedback({ tipo, mensagem })
    setTimeout(() => setFeedback(null), 3500)
  }, [])

  // ─── REFS — guardam valores atuais sem recriar callbacks ──────────────────
  // Isso quebra a cadeia useCallback → deps → recriação → loop no useEffect

  const meuNomeRef = useRef(meuNome)
  const codigoSalaRef = useRef(codigoSala)
  const exibirFeedbackRef = useRef(exibirFeedback)

  useEffect(() => { meuNomeRef.current = meuNome }, [meuNome])
  useEffect(() => { codigoSalaRef.current = codigoSala }, [codigoSala])
  useEffect(() => { exibirFeedbackRef.current = exibirFeedback }, [exibirFeedback])

  // ─── INICIAR PARTIDA SOLO ─────────────────────────────────────────────────

  const iniciarPartidaSolo = useCallback(async () => {
    const nome = meuNomeRef.current
    const sala = codigoSalaRef.current
    try {
      const res = await apiFetch(`/api/partidas/iniciar`, {  
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigoSala: sala, jogadores: [nome, "IA Química"] }),
      })
      if (!res.ok) throw new Error("Falha ao iniciar partida")
      const data: EstadoPartida = await res.json()
      setPartida(data)
      setErroBusca("")
      exibirFeedbackRef.current("info", "Partida iniciada! A pedra Ácido-Hidreto já está na mesa.")
    } catch {
      setErroBusca("Não foi possível iniciar a partida.")
    } finally {
      setCarregando(false)
    }
  }, []) // estável — lê tudo via refs

  // ─── BUSCAR ESTADO DA PARTIDA ─────────────────────────────────────────────

  const buscarEstado = useCallback(async () => {
    const nome = meuNomeRef.current
    const sala = codigoSalaRef.current
    if (!sala || !nome) return
    try {
      const res = await apiFetch(
        `/api/partidas/${sala}?jogador={encodeURIComponent(nome)}`
      )
      if (res.status === 404) {
        await iniciarPartidaSolo()
        return
      }
      if (!res.ok) throw new Error("Erro ao buscar partida")
      const data: EstadoPartida = await res.json()
      setPartida(data)
      setErroBusca("")
    } catch {
      setErroBusca("Não foi possível conectar ao servidor.")
    } finally {
      setCarregando(false)
    }
  }, [iniciarPartidaSolo]) // iniciarPartidaSolo é estável (deps: [])

  // Polling — inicia direto, refs já têm os valores corretos
  useEffect(() => {
    buscarEstado()
    const interval = setInterval(buscarEstado, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [buscarEstado])

  // ─── JOGAR PEDRA ──────────────────────────────────────────────────────────

  const jogarPedra = useCallback(async () => {
    if (!pedraSelecionada || !partida || enviando) return
    const nome = meuNomeRef.current
    const sala = codigoSalaRef.current
    if (partida.turnoAtual !== nome) {
      exibirFeedbackRef.current("erro", "Não é o seu turno!")
      return
    }
    setEnviando(true)
    try {
      const res = await apiFetch(`/api/partidas/${sala}/jogar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jogador: nome, pedraId: pedraSelecionada }),
      })
      const data = await res.json()
      if (!res.ok) {
        exibirFeedbackRef.current("erro", data.erro ?? "Jogada inválida.")
        return
      }
      setPartida(data)
      setPedraSelecionada(null)
      exibirFeedbackRef.current("sucesso", "Pedra jogada com sucesso! ✓")
    } catch {
      exibirFeedbackRef.current("erro", "Erro de conexão com o servidor.")
    } finally {
      setEnviando(false)
    }
  }, [pedraSelecionada, partida, enviando]) // sem meuNome/codigoSala/exibirFeedback — todos via ref

  // ─── PASSAR VEZ ───────────────────────────────────────────────────────────

  const passarVez = useCallback(async () => {
    if (!partida || enviando) return
    const nome = meuNomeRef.current
    const sala = codigoSalaRef.current
    if (partida.turnoAtual !== nome) {
      exibirFeedbackRef.current("erro", "Não é o seu turno!")
      return
    }
    setEnviando(true)
    try {
      const res = await apiFetch(`/api/partidas/${sala}/passar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jogador: nome }),
      })
      const data = await res.json()
      if (!res.ok) {
        exibirFeedbackRef.current("erro", data.erro ?? "Não é possível passar agora.")
        return
      }
      setPartida(data)
      setPedraSelecionada(null)
      exibirFeedbackRef.current("info", "Você passou a vez.")
    } catch {
      exibirFeedbackRef.current("erro", "Erro de conexão com o servidor.")
    } finally {
      setEnviando(false)
    }
  }, [partida, enviando])

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  const ehMeuTurno = partida?.turnoAtual === meuNome
  const minhaMao: Pedra[] = partida?.minha_mao ?? []

  const pedradePodeJogar = (pedra: Pedra): boolean => {
    if (!partida) return false
    const { esquerda, direita } = partida.pontas
    return (
      pedra.left === direita ||
      pedra.right === direita ||
      pedra.right === esquerda ||
      pedra.left === esquerda
    )
  }

  const quantidadePedras = (nome: string): number => {
    if (!partida) return 0
    const val = partida.maos[nome]
    return typeof val === "number" ? val : (val as Pedra[]).length
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2F4F7]">
        <p className="text-lg font-semibold text-slate-500 animate-pulse">Carregando partida...</p>
      </div>
    )
  }

  if (erroBusca && !partida) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F2F4F7] px-4">
        <p className="text-red-600 font-semibold">{erroBusca}</p>
        <button
          onClick={buscarEstado}
          className="rounded-xl bg-rose-600 px-6 py-3 font-bold text-white hover:bg-rose-700"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#F2F4F7] text-[#3A3A3A]">

      {/* MODAL FIM DE JOGO */}
      <ModalVencedor
        encerrado={partida?.encerrado ?? false}
        vencedor={partida?.vencedor ?? null}
        vencedores={partida?.vencedores ?? null}
        motivo={partida?.motivo ?? null}
        meuNome={meuNome}
        onVoltar={() => router.push("/aluno")}
      />

      {/* HEADER */}
      <header className="flex flex-col gap-4 border-b border-[#D7DCE2] bg-white p-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex flex-1 items-center justify-center gap-4">
          <img src="/logo.png" alt="Dominó Químico" className="h-12 object-contain sm:h-14 lg:h-16" />
          <div className="text-center">
            <h1 className="text-[24px] font-black leading-none text-[#3A3A3A] sm:text-[28px]">
              Dominó <span className="text-[#EF2B2B]">Químico</span>
            </h1>
            <p className="mt-1 text-sm text-[#8A96A8]">Sala Multiplayer Educacional</p>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-5">
          <div className="border border-[#D7DCE2] bg-[#F8FAFC] px-4 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8A96A8]">Sala</p>
            <p className="text-[18px] font-black tracking-[0.18em] text-[#2563EB]">{codigoSala}</p>
          </div>

          <div className="border border-[#D7DCE2] bg-[#F8FAFC] px-4 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8A96A8]">Jogador</p>
            <p className="text-[14px] font-black text-[#3A3A3A]">{meuNome}</p>
          </div>

          <div className={`border px-4 py-2 ${ehMeuTurno ? "border-green-400 bg-green-50" : "border-[#D7DCE2] bg-[#F8FAFC]"}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8A96A8]">Turno</p>
            <p className={`text-[14px] font-black ${ehMeuTurno ? "text-green-700" : "text-[#3A3A3A]"}`}>
              {partida?.turnoAtual ?? "—"}
            </p>
          </div>

          <button className="flex h-11 w-11 items-center justify-center border border-[#D7DCE2] bg-[#F8FAFC] text-[#64748B] transition hover:bg-[#EEF2F7]">
            <Settings size={21} />
          </button>

          <button
            onClick={() => setShowExitModal(true)}
            className="flex h-11 w-11 items-center justify-center border border-[#D7DCE2] bg-[#F8FAFC] text-[#64748B] transition hover:bg-[#FEE2E2]"
          >
            <LogOut size={21} />
          </button>
        </div>

        {/* MODAL SAIR */}
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-[92%] max-w-[520px] rounded-2xl bg-white p-8 shadow-2xl">
              <div className="mb-5 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FEF2F2]">
                  <TriangleAlert size={42} className="text-[#DC2626]" />
                </div>
              </div>
              <h2 className="text-center text-[28px] font-black text-[#3A3A3A]">Deseja sair da partida?</h2>
              <p className="mt-5 text-center text-[16px] leading-relaxed text-[#64748B]">
                Seu progresso atual poderá ser perdido se sair agora.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 rounded-xl border border-[#D7DCE2] bg-[#F8FAFC] px-6 py-4 font-bold text-[#3A3A3A] transition hover:bg-[#EEF2F7]"
                >
                  Continuar Jogando
                </button>
                <button
                  onClick={() => router.push("/aluno")}
                  className="flex-1 rounded-xl bg-[#DC2626] px-6 py-4 font-bold text-white shadow-lg transition hover:brightness-110"
                >
                  Sair da Partida
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* FEEDBACK BANNER */}
      <FeedbackBanner feedback={feedback} />

      {/* MAIN */}
      <section className="grid min-h-[calc(100vh-78px)] grid-cols-1 gap-4 p-4 xl:grid-cols-[240px_1fr_240px] xl:gap-6 xl:p-6">

        {/* LEFT — jogadores 1 e 2 */}
        <aside className="flex flex-col gap-4 md:grid md:grid-cols-2 xl:flex">
          {(partida?.jogadores ?? []).slice(0, 2).map((nome) => (
            <PlayerCard
              key={nome}
              name={nome}
              turn={partida?.turnoAtual === nome}
              connected
              isSelf={nome === meuNome}
              pecas={quantidadePedras(nome)}
            />
          ))}
          <div className="border border-[#D7DCE2] bg-white p-5 shadow-sm xl:mt-auto">
            <p className="text-[12px] font-black uppercase tracking-[0.22em] text-[#8A96A8]">Pontas da Mesa</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex-1 rounded-lg border border-[#D7DCE2] bg-[#EEF3FF] p-2 text-center text-xs font-black text-[#2563EB]">
                ← {partida?.pontas.esquerda ?? "—"}
              </div>
              <div className="flex-1 rounded-lg border border-[#D7DCE2] bg-[#FFF1F1] p-2 text-center text-xs font-black text-[#C62828]">
                {partida?.pontas.direita ?? "—"} →
              </div>
            </div>
            <p className="mt-3 text-xs text-[#64748B]">
              Monte: <span className="font-bold">{partida?.monte ?? 0}</span> pedras
            </p>
          </div>
        </aside>

        {/* BOARD */}
        <div className="relative flex flex-col overflow-hidden border border-[#D7DCE2] bg-white shadow-sm">
          <div className="relative flex min-h-[300px] flex-1 items-center justify-center overflow-auto bg-[#E3ECE1] p-6 sm:min-h-[400px]">
            <div className="absolute inset-2 border-[4px] border-[#CDD8C8] bg-[#DDE8D8] sm:inset-4 xl:inset-8 xl:border-[6px]" />
            <div className="relative z-10 flex flex-wrap items-center justify-center gap-1">
              {(partida?.mesa ?? []).map((pedra, idx) => (
                <DominoPiece
                  key={`${pedra.id}-${idx}`}
                  top={pedra.left}
                  bottom={pedra.right}
                />
              ))}
              {(partida?.mesa ?? []).length === 0 && (
                <p className="text-sm font-semibold text-[#8A96A8]">Mesa vazia</p>
              )}
            </div>
          </div>

          {/* MÃO DO JOGADOR */}
          <footer className="border-t border-[#D7DCE2] bg-white px-4 py-5 sm:px-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[12px] font-black uppercase tracking-[0.25em] text-[#8A96A8]">
                Sua mão — {meuNome}
              </p>
              <div className="flex items-center gap-2">
                <p className="bg-[#EEF3FF] px-3 py-1 text-xs font-bold text-[#2563EB]">
                  {minhaMao.length} pedras
                </p>
                {!ehMeuTurno && (
                  <p className="bg-[#FFF1F1] px-3 py-1 text-xs font-bold text-[#C62828]">
                    Vez de {partida?.turnoAtual}...
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 xl:justify-center">
              {minhaMao.map((pedra) => {
                const podeJogar = pedradePodeJogar(pedra)
                return (
                  <div
                    key={pedra.id}
                    onClick={() => {
                      if (!ehMeuTurno) {
                        exibirFeedback("erro", "Aguarde o seu turno.")
                        return
                      }
                      setPedraSelecionada(pedraSelecionada === pedra.id ? null : pedra.id)
                    }}
                    className="shrink-0"
                  >
                    <DominoPiece
                      top={pedra.left}
                      bottom={pedra.right}
                      selected={pedraSelecionada === pedra.id}
                      disabled={!ehMeuTurno || !podeJogar}
                    />
                    {ehMeuTurno && (
                      <div className={`mt-1 h-1 rounded-full ${podeJogar ? "bg-green-400" : "bg-slate-200"}`} />
                    )}
                  </div>
                )
              })}
              {minhaMao.length === 0 && (
                <p className="py-4 text-sm text-[#8A96A8]">Sem pedras na mão</p>
              )}
            </div>

            {ehMeuTurno && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={jogarPedra}
                  disabled={!pedraSelecionada || enviando}
                  className="flex-1 rounded-xl bg-[#2563EB] px-4 py-3 font-bold text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {enviando ? "Jogando..." : "Jogar Pedra Selecionada"}
                </button>
                <button
                  onClick={passarVez}
                  disabled={enviando}
                  className="rounded-xl border border-[#D7DCE2] bg-[#F8FAFC] px-4 py-3 font-bold text-[#64748B] transition hover:bg-slate-100 disabled:opacity-40"
                >
                  Passar Vez
                </button>
              </div>
            )}
          </footer>
        </div>

        {/* RIGHT — jogadores 3 e 4 */}
        <aside className="flex flex-col gap-4 md:grid md:grid-cols-2 xl:flex">
          {(partida?.jogadores ?? []).slice(2, 4).map((nome) => (
            <PlayerCard
              key={nome}
              name={nome}
              turn={partida?.turnoAtual === nome}
              connected
              isSelf={nome === meuNome}
              pecas={quantidadePedras(nome)}
            />
          ))}
          <div className="border border-[#D7DCE2] bg-white p-5 shadow-sm xl:mt-auto">
            <div className="mb-4 flex items-center gap-3">
              <HelpCircle className="text-[#2563EB]" size={22} />
              <h3 className="font-black">Regras rápidas</h3>
            </div>
            <ul className="space-y-3 text-sm text-[#64748B]">
              <li>• Inicia com a pedra <strong>Ácido-Hidreto</strong>.</li>
              <li>• Encaixe função com função nas pontas.</li>
              <li>• Barras <span className="text-green-600 font-bold">verdes</span> = pedra válida.</li>
              <li>• Passe a vez se não tiver jogada.</li>
              <li>• Ganha quem esvaziar a mão primeiro.</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  )
}