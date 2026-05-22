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
      alert("Não foi possível criar a sala agora.")
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
      {/* HEADER INSTITUCIONAL - ETEC SANTO ANDRÉ */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="w-full px-6 lg:px-12">
          {/* Layout responsivo para telas menores (Mobile/Tablet) */}
          <div className="py-3 sm:py-4 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <Image
                src="/etec_santo_andre.png"
                alt="ETEC Santo André"
                width={112}
                height={38}
                className="h-8 w-auto object-contain sm:h-9"
                priority
              />
              <button
                onClick={() => {
                  localStorage.removeItem("dominoQuimicoXp")
                  localStorage.removeItem("dominoQuimicoRooms")
                  localStorage.removeItem("dominoQuimicoHostRoomCode")
                  router.push("/login")
                }}
                className="flex items-center justify-center rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
                aria-label="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 sm:gap-3">
              <Image
                src="/logo.png"
                alt="Dominó Químico"
                width={40}
                height={40}
                className="h-8 w-8 object-contain sm:h-9 sm:w-9"
              />
              <h1 className="text-xl font-black tracking-tight text-slate-800 sm:text-2xl">
                Dominó <span className="text-red-600">Químico</span>
              </h1>
            </div>
          </div>

          {/* Layout para telas grandes (Desktop) */}
          <div className="hidden items-center gap-3 py-4 sm:py-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4 lg:py-6">
            {/* Lado Esquerdo: Identidade Institucional da Mauá */}
            <div className="flex items-center justify-start gap-4 sm:gap-5">
              <Image
                src="/etec_santo_andre.png"
                alt="ETEC Santo André"
                width={150}
                height={52}
                className="h-11 w-auto object-contain sm:h-12 lg:h-14"
                priority
              />
            </div>

            {/* Centro: Nome do Software Acadêmico */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 lg:gap-5">
              <Image
                src="/logo.png"
                alt="Dominó Químico"
                width={48}
                height={48}
                className="h-10 w-10 object-contain sm:h-12 sm:w-12 lg:h-14 lg:w-14"
              />
              <h1 className="text-xl font-black tracking-tight text-slate-800 sm:text-3xl lg:text-4xl">
                Dominó <span className="text-red-600">Químico</span>
              </h1>
            </div>

            {/* Lado Direito: Ação de Logout */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  localStorage.removeItem("dominoQuimicoXp")
                  localStorage.removeItem("dominoQuimicoRooms")
                  localStorage.removeItem("dominoQuimicoHostRoomCode")
                  router.push("/login")
                }}
                className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-red-600 lg:px-5 lg:py-3.5 lg:text-base"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* FUNDO DA TELA */}
      <div
        className="min-h-screen w-full"
        style={{
          background:
            "radial-gradient(ellipse at 15% 60%, #ffd6d6 0%, transparent 45%), radial-gradient(ellipse at 85% 10%, #ffc1c1 0%, transparent 40%), #ffe6e8",
        }}
      >
        {/* Elementos decorativos em SVG */}
        <svg aria-hidden className="pointer-events-none fixed inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <circle cx="6%" cy="30%" r="70" fill="none" stroke="#DC2626" strokeWidth="1.5" />
          <circle cx="6%" cy="30%" r="18" fill="#DC2626" />
          <line x1="6%" y1="30%" x2="12%" y2="20%" stroke="#DC2626" strokeWidth="1.2" />
          <circle cx="12%" cy="20%" r="11" fill="#DC2626" />
          <circle cx="94%" cy="72%" r="55" fill="none" stroke="#DC2626" strokeWidth="1.5" />
          <circle cx="94%" cy="72%" r="14" fill="#DC2626" />
        </svg>

        {/* CONTEÚDO CENTRALIZADO */}
        <main className="relative mx-auto w-full max-w-4xl px-4 pt-6 pb-12 sm:px-6 lg:pt-8 lg:pb-16">

          {/* Cabeçalho de Boas-Vindas */}
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
            <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-rose-600 shadow-sm sm:px-4 sm:text-[11px] sm:tracking-[0.2em]">
              <FlaskConical size={13} className="text-rose-500" />
              Espaço de aprendizagem molecular
            </p>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 drop-shadow-sm sm:text-5xl lg:text-6xl">
              Menu do Aluno
            </h2>
          </div>

          {/* GRID DE BOTÕES */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            
            {/* BOTÃO: JOGAR SOZINHO */}
            <button
              onClick={() => router.push("/jogo")}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#DC2626] p-8 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
              <div className="relative flex h-full flex-col justify-between w-full">
                <div>
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white">
                    <Orbit size={24} />
                  </span>
                  <p className="text-3xl font-black text-white">Jogar Sozinho</p>
                  <p className="mt-3 text-lg leading-relaxed text-rose-100 sm:text-xl">
                    Pratique suas habilidades de ligações químicas contra a IA do laboratório.
                  </p>
                </div>
                <div className="mt-6 flex justify-end">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            </button>

            {/* BOTÃO: MEU DESEMPENHO */}
            <button
              onClick={() => router.push("/aluno/desempenho")}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-md"
            >
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-rose-100/20 blur-2xl" />
              <div className="relative flex h-full flex-col justify-between w-full">
                <div>
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition-colors group-hover:bg-rose-100">
                    <BarChart3 size={24} />
                  </span>
                  <p className="text-2xl font-black text-slate-800">Meu Desempenho</p>
                  <p className="mt-3 text-lg leading-relaxed text-slate-500 sm:text-xl">
                    Confira suas conquistas, nível atual e histórico de experimentos.
                  </p>
                </div>
                <div className="mt-6">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-black text-rose-500">Nível {nivelAtual}</span>
                    <span className="text-[11px] font-semibold text-slate-400">{xpNoNivel} / {XP_POR_NIVEL} XP</span>
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

            {/* BOTÃO: CRIAR SALA */}
            <button
              onClick={criarSala}
              disabled={criandoSala}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-rose-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div>
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition-colors group-hover:bg-rose-100">
                  <UserPlus size={24} />
                </span>
                  <p className="text-2xl font-black text-slate-800">
                  {criandoSala ? "Criando..." : "Criar Sala"}
                </p>
                <p className="mt-2 text-base leading-relaxed text-slate-500 sm:text-lg">
                  Inicie uma nova partida e convide seus colegas para o laboratório.
                </p>
              </div>
            </button>

            {/* BOTÃO: ENTRAR EM SALA */}
            <button
              onClick={() => setMostrarModalEntrada(true)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-rose-200 hover:shadow-md"
            >
              <div>
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition-colors group-hover:bg-rose-100">
                  <LogIn size={24} />
                </span>
                  <p className="text-2xl font-black text-slate-800">Entrar em Sala</p>
                  <p className="mt-3 text-lg leading-relaxed text-slate-500 sm:text-xl">
                  Use um código de convite para participar de uma partida activa.
                </p>
              </div>
            </button>

            {/* CARD: DESAFIO DIÁRIO */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                  <FlaskConical size={24} />
                </div>
                <div>
                  <span className="mb-1 block text-[12px] font-black uppercase tracking-wider text-rose-500 sm:text-sm">
                    Desafio Diário
                  </span>
                  <p className="text-xl font-black text-slate-800 sm:text-2xl">
                    Conecte 5 compostos seguidos sem errar.
                  </p>
                  <p className="mt-2 text-base text-slate-500 sm:text-lg">
                    Complete o desafio para ganhar experiência bônus no laboratório.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <span className="inline-flex items-center gap-1 rounded-xl bg-orange-500 px-3 py-1.5 text-sm font-black text-white sm:text-base">
                  <Zap size={12} fill="currentColor" />
                  +200 XP RECOMPENSA
                </span>
                <button className="rounded-xl border border-rose-200 bg-white px-4 py-1.5 text-sm font-bold text-rose-500 shadow-sm transition hover:bg-rose-50 sm:text-base">
                  Começar desafio
                </button>
              </div>
            </div>

            {/* BARRA: PROGRESSO MOLECULAR */}
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[12px] font-black uppercase tracking-[0.16em] text-rose-500 sm:text-sm">
                  <Zap size={12} />
                  Progresso Molecular
                </span>
                <span className="text-base font-black text-slate-500 sm:text-lg">{xpNoNivel} / {XP_POR_NIVEL} XP</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#DC2626] transition-all duration-500"
                  style={{ width: `${porcentagemNivel}%` }}
                />
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ── MODAL: SALA CRIADA ── */}
      {mostrarModalCriada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative overflow-hidden bg-[#DC2626] px-6 py-7 text-center">
              <div className="relative mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <UserPlus size={26} className="text-white" />
              </div>
              <h2 className="relative text-2xl font-black text-white">Sala criada!</h2>
            </div>
            <div className="px-6 py-7">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Código da sala</p>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <span className="text-4xl font-black tracking-[0.18em] text-slate-800">{codigoCriado}</span>
                <button
                  onClick={copiarCodigo}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                    copiado ? "bg-green-50 text-green-600" : "bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-500 ring-1 ring-slate-200"
                  }`}
                >
                  {copiado ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <button onClick={entrarNaSalaCriada} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#DC2626] px-5 py-3.5 font-black text-white transition hover:brightness-105">
                  Entrar na sala <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ENTRAR EM SALA ── */}
      {mostrarModalEntrada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative overflow-hidden bg-[#DC2626] px-6 py-7 text-center">
              <div className="relative mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <LogIn size={26} className="text-white" />
              </div>
              <h2 className="relative text-2xl font-black text-white">Entrar em Sala</h2>
            </div>
            <div className="px-6 py-7">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Código da sala</p>
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
                <button onClick={entrarSala} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#DC2626] px-5 py-3.5 font-black text-white transition hover:brightness-105">
                  Entrar na sala <ArrowRight size={18} />
                </button>
                <button onClick={() => { setMostrarModalEntrada(false); setCodigoSala("") }} className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 font-semibold text-slate-500 transition hover:bg-slate-50">
                  Voltar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}