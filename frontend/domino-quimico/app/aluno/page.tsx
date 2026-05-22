"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { FlaskConical, LogIn, Orbit, BarChart3, UserPlus, LogOut, Zap, Copy, Check, ArrowRight } from "lucide-react"

const XP_STORAGE_KEY = "dominoQuimicoXp"
const ROOMS_STORAGE_KEY = "dominoQuimicoRooms"
const HOST_ROOM_CODE_KEY = "dominoQuimicoHostRoomCode"
const XP_POR_NIVEL = 1000
const NIVEL_BASE = 42
const PLAYER_NAME = "Cientista"

type Room = {
  code: string
  hostName: string
  createdAt: string
  players: string[]
  status: string
}

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i += 1) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function loadRooms(): Record<string, Room> {
  try {
    const raw = window.localStorage.getItem(ROOMS_STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, Room>
  } catch {
    return {}
  }
}

function saveRooms(rooms: Record<string, Room>) {
  window.localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms))
}

export default function AlunoHome() {
  const router = useRouter()
  const [xpAtual, setXpAtual] = useState(0)
  const [criandoSala, setCriandoSala] = useState(false)
  const [mostrarModalEntrada, setMostrarModalEntrada] = useState(false)
  const [mostrarModalCriada, setMostrarModalCriada] = useState(false)
  const [codigoCriado, setCodigoCriado] = useState("")
  const [copiado, setCopiado] = useState(false)
  const [codigoSala, setCodigoSala] = useState("")

  const criarSala = async () => {
    try {
      setCriandoSala(true)
      const rooms = loadRooms()
      let code = generateRoomCode()
      while (rooms[code]) code = generateRoomCode()
      const room: Room = {
        code,
        hostName: PLAYER_NAME,
        createdAt: new Date().toISOString(),
        players: [PLAYER_NAME],
        status: "waiting",
      }
      rooms[code] = room
      saveRooms(rooms)
      window.sessionStorage.setItem(HOST_ROOM_CODE_KEY, code)
      setCodigoCriado(code)
      setMostrarModalCriada(true)
    } catch {
      alert("Nao foi possivel criar a sala agora.")
    } finally {
      setCriandoSala(false)
    }
  }

  const entrarNaSalaCriada = () => {
    setMostrarModalCriada(false)
    sessionStorage.setItem("dominoNome", PLAYER_NAME)
    sessionStorage.setItem("dominoSala", codigoCriado)
    router.push(`/jogo/jogo-online?jogador=${encodeURIComponent(PLAYER_NAME)}&sala=${codigoCriado}`)
  }

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(codigoCriado)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // fallback silencioso
    }
  }

  const entrarSala = () => {
    const code = codigoSala.trim().toUpperCase()
    if (!code) return
    setMostrarModalEntrada(false)
    setCodigoSala("")
    window.sessionStorage.removeItem(HOST_ROOM_CODE_KEY)
    sessionStorage.setItem("dominoNome", PLAYER_NAME)
    sessionStorage.setItem("dominoSala", code)
    router.push(`/jogo/jogo-online?jogador=${encodeURIComponent(PLAYER_NAME)}&sala=${code}`)
  }

  useEffect(() => {
    const carregarXp = () => {
      const valor = window.localStorage.getItem(XP_STORAGE_KEY)
      const parsed = Number.parseInt(valor ?? "0", 10)
      setXpAtual(Number.isNaN(parsed) ? 0 : Math.max(0, parsed))
    }
    carregarXp()
    window.addEventListener("storage", carregarXp)
    window.addEventListener("domino-xp-updated", carregarXp as EventListener)
    return () => {
      window.removeEventListener("storage", carregarXp)
      window.removeEventListener("domino-xp-updated", carregarXp as EventListener)
    }
  }, [])

  const { nivelAtual, xpNoNivel, porcentagemNivel } = useMemo(() => {
    const nivelGanho = Math.floor(xpAtual / XP_POR_NIVEL)
    const xpRestante = xpAtual % XP_POR_NIVEL
    const porcentagem = (xpRestante / XP_POR_NIVEL) * 100
    return {
      nivelAtual: NIVEL_BASE + nivelGanho,
      xpNoNivel: xpRestante,
      porcentagemNivel: Math.max(0, Math.min(100, porcentagem)),
    }
  }, [xpAtual])

  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
          <div className="w-full px-6 lg:px-12">
          <div className="relative flex items-center justify-center py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image src="/logo.png" alt="Dominó Químico" width={42} height={42} className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-800">
                Dominó <span className="text-red-600">Químico</span>
              </h1>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("dominoQuimicoXp")
                localStorage.removeItem("dominoQuimicoRooms")
                localStorage.removeItem("dominoQuimicoHostRoomCode")
                router.push("/login")
              }}
              className="absolute right-2 sm:right-0 flex items-center gap-2 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-600"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* FUNDO */}
      <div
        className="min-h-screen w-full"
        style={{
          background:
            "radial-gradient(ellipse at 15% 60%, #ffd6d6 0%, transparent 45%), radial-gradient(ellipse at 85% 10%, #ffc1c1 0%, transparent 40%), #ffe6e8",
        }}
      >
        {/* Moléculas decorativas */}
        <svg aria-hidden className="pointer-events-none fixed inset-0 h-full w-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
          <circle cx="6%" cy="30%" r="70" fill="none" stroke="#DC2626" strokeWidth="1.5" />
          <circle cx="6%" cy="30%" r="18" fill="#DC2626" />
          <line x1="6%" y1="30%" x2="12%" y2="20%" stroke="#DC2626" strokeWidth="1.2" />
          <circle cx="12%" cy="20%" r="11" fill="#DC2626" />
          <line x1="6%" y1="30%" x2="2%" y2="42%" stroke="#DC2626" strokeWidth="1.2" />
          <circle cx="2%" cy="42%" r="9" fill="#DC2626" />
          <circle cx="94%" cy="72%" r="55" fill="none" stroke="#DC2626" strokeWidth="1.5" />
          <circle cx="94%" cy="72%" r="14" fill="#DC2626" />
          <line x1="94%" y1="72%" x2="89%" y2="62%" stroke="#DC2626" strokeWidth="1.2" />
          <circle cx="89%" cy="62%" r="9" fill="#DC2626" />
          <line x1="94%" y1="72%" x2="98%" y2="82%" stroke="#DC2626" strokeWidth="1.2" />
          <circle cx="98%" cy="82%" r="7" fill="#DC2626" />
        </svg>

        <main className="relative mx-auto w-full max-w-[1700px] px-6 py-10 lg:px-12 lg:py-14">

          {/* Cabeçalho */}
          <div className="mb-10 text-center">
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">
              <FlaskConical size={11} />
              Espaço de aprendizagem molecular
            </p>
            <h2 className="text-4xl font-black tracking-tight text-slate-800 sm:text-5xl lg:text-6xl">
              Menu do Aluno
            </h2>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-600 ring-1 ring-slate-200 shadow-sm">
              <Zap size={14} className="text-rose-500" />
              Nível {nivelAtual} · {xpNoNivel} / {XP_POR_NIVEL} XP
            </div>
          </div>

          {/* Grid de ações */}
          <div className="flex flex-col gap-4">

            {/* Linha 1 — Criar Sala + Entrar em Sala */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={criarSala}
                disabled={criandoSala}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 transition-colors group-hover:bg-rose-100">
                  <UserPlus size={26} />
                </span>
                <p className="text-2xl font-black text-slate-800">
                  {criandoSala ? "Criando..." : "Criar Sala"}
                </p>
                <p className="mt-2 text-base leading-relaxed text-slate-400">
                  Inicie uma nova partida e convide seus colegas para o laboratório.
                </p>
              </button>

              <button
                onClick={() => setMostrarModalEntrada(true)}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lg"
              >
                <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 transition-colors group-hover:bg-rose-100">
                  <LogIn size={26} />
                </span>
                <p className="text-2xl font-black text-slate-800">Entrar em Sala</p>
                <p className="mt-2 text-base leading-relaxed text-slate-400">
                  Use um código de convite para participar de uma partida ativa.
                </p>
              </button>
            </div>

            {/* LINHA 2 — JOGAR + DESEMPENHO */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">

              {/* JOGAR SOZINHO */}
              <button
                onClick={() => router.push("/jogo")}
                className="group relative overflow-hidden rounded-3xl bg-[#DC2626] p-8 text-left shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Glow */}
                <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10" />

                <div className="relative flex h-full flex-col justify-between">

                  <div>
                    <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white">
                      <Orbit size={30} />
                    </span>

                    <p className="text-4xl font-black text-white">
                      Jogar Sozinho
                    </p>

                    <p className="mt-3 max-w-xl text-base leading-relaxed text-rose-100">
                      Pratique suas habilidades de ligações químicas
                      contra a IA do laboratório.
                    </p>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:translate-x-1">
                      <ArrowRight size={24} />
                    </div>
                  </div>
                </div>
              </button>

              {/* MEU DESEMPENHO */}
              <button
                onClick={() => router.push("/aluno/desempenho")}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl"
              >
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-rose-100/30 blur-3xl" />

                <div className="relative flex h-full flex-col justify-between">

                  <div>
                    <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 transition-colors group-hover:bg-rose-100">
                      <BarChart3 size={28} />
                    </span>

                    <p className="text-3xl font-black text-slate-800">
                      Meu Desempenho
                    </p>

                    <p className="mt-3 text-base leading-relaxed text-slate-500">
                      Confira suas conquistas, nível atual
                      e histórico de experimentos.
                    </p>
                  </div>

                  <div className="mt-8">

                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-black text-rose-500">
                        Nível {nivelAtual}
                      </span>

                      <span className="text-xs font-semibold text-slate-400">
                        {xpNoNivel} / {XP_POR_NIVEL} XP
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#DC2626] transition-all duration-500"
                        style={{ width: `${porcentagemNivel}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Barra de progresso global */}
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-rose-500">
                  <Zap size={12} />
                  Progresso Molecular
                </span>
                <span className="text-sm font-black text-slate-500">
                  {xpNoNivel} / {XP_POR_NIVEL} XP
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#DC2626] transition-all duration-500"
                  style={{ width: `${porcentagemNivel}%` }}
                />
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ── MODAL SALA CRIADA ── */}
      {mostrarModalCriada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* Header vermelho */}
            <div className="relative overflow-hidden bg-[#DC2626] px-6 py-7 text-center">
              <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
              <div aria-hidden className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-black/10" />
              <div className="relative mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <UserPlus size={26} className="text-white" />
              </div>
              <h2 className="relative text-2xl font-black text-white">Sala criada!</h2>
              <p className="relative mt-1 text-sm text-rose-100">
                Compartilhe o código com seus colegas.
              </p>
            </div>

            {/* Corpo */}
            <div className="px-6 py-7">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Código da sala
              </p>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <span className="text-4xl font-black tracking-[0.18em] text-slate-800">
                  {codigoCriado}
                </span>
                <button
                  onClick={copiarCodigo}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                    copiado
                      ? "bg-green-50 text-green-600"
                      : "bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-500 ring-1 ring-slate-200"
                  }`}
                  title="Copiar código"
                >
                  {copiado ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>

              {copiado && (
                <p className="mt-2 text-center text-xs font-semibold text-green-600">
                  Código copiado!
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={entrarNaSalaCriada}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#DC2626] px-5 py-3.5 font-black text-white transition hover:brightness-105"
                >
                  Entrar na sala
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => setMostrarModalCriada(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 font-semibold text-slate-500 transition hover:bg-slate-50"
                >
                  Voltar ao menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ENTRAR EM SALA ── */}
      {mostrarModalEntrada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* Header vermelho */}
            <div className="relative overflow-hidden bg-[#DC2626] px-6 py-7 text-center">
              <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
              <div aria-hidden className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-black/10" />
              <div className="relative mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <LogIn size={26} className="text-white" />
              </div>
              <h2 className="relative text-2xl font-black text-white">Entrar em Sala</h2>
              <p className="relative mt-1 text-sm text-rose-100">
                Digite o código da sala para participar.
              </p>
            </div>

            {/* Corpo */}
            <div className="px-6 py-7">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Código da sala
              </p>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <input
                  id="codigo-sala"
                  value={codigoSala}
                  onChange={(e) => setCodigoSala(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") entrarSala() }}
                  autoFocus
                  placeholder="Ex.: ABC123"
                  className="w-full bg-transparent text-4xl font-black uppercase tracking-[0.18em] text-slate-800 outline-none placeholder:text-slate-300 font-mono"
                />
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={entrarSala}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#DC2626] px-5 py-3.5 font-black text-white transition hover:brightness-105"
                >
                  Entrar na sala
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => { setMostrarModalEntrada(false); setCodigoSala("") }}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 font-semibold text-slate-500 transition hover:bg-slate-50"
                >
                  Voltar ao menu
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}