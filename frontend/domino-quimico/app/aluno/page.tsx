"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import {
  FlaskConical,
  LogIn,
  Orbit,
  BarChart3,
  UserPlus,
  LogOut,
  Zap,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
} from "lucide-react"

const XP_STORAGE_KEY = "dominoQuimicoXp"
const HOST_ROOM_CODE_KEY = "dominoQuimicoHostRoomCode"
const XP_POR_NIVEL = 1000
const NIVEL_BASE = 42
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

type Room = {
  code: string
  hostId: number
  createdAt: string
  players: { id: number; nome: string }[]
  status: string
}

export default function AlunoHome() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [xpAtual, setXpAtual] = useState(0)
  const [criandoSala, setCriandoSala] = useState(false)
  const [mostrarModalEntrada, setMostrarModalEntrada] = useState(false)
  const [mostrarModalCriada, setMostrarModalCriada] = useState(false)
  const [codigoCriado, setCodigoCriado] = useState("")
  const [copiado, setCopiado] = useState(false)
  const [codigoSala, setCodigoSala] = useState("")

  const [playerName, setPlayerName] = useState("Cientista")
  const [playerId,   setPlayerId]   = useState<number>(-99)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("dominoUsuario")
      if (raw) {
        const user = JSON.parse(raw) as { id?: number; nome?: string }
        if (user.nome) setPlayerName(user.nome)
        if (user.id)   setPlayerId(user.id)
      }
    } catch { /* localStorage indisponível ou JSON inválido */ }
  }, [])

  const criarSala = async () => {
    if (playerId === -99) { alert("Aguarde — carregando dados do usuário."); return }
    try {
      setCriandoSala(true)
      const res = await fetch(`${API_URL}/api/salas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId: playerId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.erro ?? "Não foi possível criar a sala agora.")
        return
      }
      const sala = await res.json() as { code: string }
      window.sessionStorage.setItem(HOST_ROOM_CODE_KEY, sala.code)
      setCodigoCriado(sala.code)
      setMostrarModalCriada(true)
    } catch {
      alert("Sem conexão com o servidor.")
    } finally {
      setCriandoSala(false)
    }
  }

  useEffect(() => {
    if (playerId === -99) return   // aguarda o useEffect de auth carregar o id
    try {
      const shouldCreate = searchParams?.get("createRoom") === "1"
      if (shouldCreate && !mostrarModalCriada && !criandoSala) criarSala()
    } catch { /* silencioso */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, playerId])

  const entrarNaSalaCriada = () => {
    setMostrarModalCriada(false)
    sessionStorage.setItem("dominoNome", playerName)
    sessionStorage.setItem("dominoUserId", String(playerId))
    sessionStorage.setItem("dominoSala", codigoCriado)
    router.push(`/sala/${codigoCriado}?jogador=${encodeURIComponent(playerName)}&sala=${codigoCriado}`)
  }

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(codigoCriado)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch { /* fallback silencioso */ }
  }

  const entrarSala = () => {
    const code = codigoSala.trim().toUpperCase()
    if (!code) return
    setMostrarModalEntrada(false)
    setCodigoSala("")
    window.sessionStorage.removeItem(HOST_ROOM_CODE_KEY)
    // Bug fix: dominoUserId nunca era gravado no sessionStorage, então a página
    // da sala recebia playerId=-99 e o POST /entrar falhava com 404/500.
    sessionStorage.setItem("dominoNome", playerName)
    sessionStorage.setItem("dominoUserId", String(playerId))
    sessionStorage.setItem("dominoSala", code)
    router.push(`/sala/${code}?jogador=${encodeURIComponent(playerName)}&sala=${code}`)
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

  const handleLogout = () => {
    localStorage.removeItem("dominoQuimicoXp")
    localStorage.removeItem("dominoQuimicoHostRoomCode")
    router.push("/login")
  }

  return (
    <>
      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full border-b border-white/30 bg-white/70 backdrop-blur-2xl"
        style={{ fontFamily: '"Poppins", sans-serif', boxShadow: "0 1px 20px rgba(0,0,0,0.06)" }}>
        <div className="w-full px-4 sm:px-6 lg:px-12">

          {/* Mobile */}
          <div className="py-3 sm:py-4 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <Image src="/etec_santo_andre.png" alt="ETEC Santo André" width={112} height={38}
                className="h-8 w-auto object-contain sm:h-9" priority />
              <button onClick={handleLogout}
                className="flex items-center justify-center rounded-full border border-[#ECECEC] bg-white p-2.5 text-[#666] transition hover:text-[#D62828]"
                aria-label="Sair">
                <LogOut size={16} />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 sm:gap-3">
              <Image src="/logo.png" alt="Dominó Químico" width={40} height={40}
                className="h-8 w-8 object-contain sm:h-9 sm:w-9" />
              <h1 className="text-xl font-black tracking-tight text-[#2F2F2F] sm:text-2xl">
                Dominó <span className="text-[#D62828]">Químico</span>
              </h1>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden items-center py-4 sm:py-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4 lg:py-5">
            <div className="flex items-center justify-start">
              <Image src="/etec_santo_andre.png" alt="ETEC Santo André" width={150} height={52}
                className="h-11 w-auto object-contain sm:h-12 lg:h-13" priority />
            </div>
            <div className="flex items-center justify-center gap-3 sm:gap-4 lg:gap-5">
              <Image src="/logo.png" alt="Dominó Químico" width={48} height={48}
                className="h-10 w-10 object-contain sm:h-12 sm:w-12 lg:h-13 lg:w-13" />
              <h1 className="text-xl font-black tracking-tight text-[#2F2F2F] sm:text-3xl lg:text-4xl">
                Dominó <span className="text-[#D62828]">Químico</span>
              </h1>
            </div>
            <div className="flex justify-end">
              <button onClick={handleLogout}
                className="flex items-center gap-2.5 rounded-full border border-[#ECECEC] bg-white px-4 py-2.5 text-sm font-bold text-[#666] transition hover:text-[#D62828] lg:px-5"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* ══ FUNDO — mesmo background da tela de login ════════════════════════ */}
      <div
        className="relative min-h-screen w-full overflow-hidden"
        style={{
          backgroundImage: "url('/ChatGPT Image 15 de mai. de 2026, 10_31_00.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
          fontFamily: '"Poppins", sans-serif',
        }}
      >

        {/* ══ MAIN ══════════════════════════════════════════════════════════ */}
        <main className="relative mx-auto w-full max-w-4xl px-4 pt-8 pb-14 sm:px-6 lg:pt-10 lg:pb-18">

          {/* Cabeçalho */}
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
            <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#f5b8b8] bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#D62828] shadow-sm backdrop-blur-sm sm:px-4 sm:text-[11px] sm:tracking-[0.2em]">
              <FlaskConical size={13} className="text-[#D62828]" />
              Espaço de aprendizagem molecular
            </p>
            <h2 className="text-4xl font-black tracking-[-0.03em] text-[#2F2F2F] drop-shadow-sm sm:text-5xl lg:text-6xl">
              Menu do Aluno
            </h2>
          </div>

          {/* ══ GRID DE CARDS ════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* ── JOGAR SOZINHO ── */}
            <button
              onClick={() => router.push("/jogo")}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] p-7 text-left shadow-[0_20px_60px_rgba(214,40,40,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(214,40,40,0.35)] min-h-[220px]"
              style={{ background: "linear-gradient(135deg, #DC2626 0%, #b91c1c 60%, #991b1b 100%)" }}
            >
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -left-6 w-28 h-28 rounded-full bg-white/5" />
              <div className="relative flex h-full flex-col justify-between w-full">
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-white/20">
                    <Orbit size={22} className="text-white" />
                  </div>
                  <p className="text-2xl font-black tracking-tight text-white">Jogar Sozinho</p>
                  <p className="mt-2 text-sm leading-relaxed text-rose-100 sm:text-base">
                    Pratique suas habilidades de ligações químicas contra a IA do laboratório.
                  </p>
                </div>
                <div className="mt-5 flex justify-end">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </button>

            {/* ── MEU DESEMPENHO ── */}
            <button
              onClick={() => router.push("/aluno/desempenho")}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-white/60 bg-white/88 p-7 text-left shadow-[0_25px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(0,0,0,0.12)] min-h-[220px]"
            >
              <div className="relative flex h-full flex-col justify-between w-full">
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#FEF2F2] transition-colors group-hover:bg-[#FEE2E2]">
                    <BarChart3 size={22} className="text-[#D62828]" />
                  </div>
                  <p className="text-2xl font-black tracking-tight text-[#2F2F2F]">Meu Desempenho</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#8B8B8B] sm:text-base">
                    Confira suas conquistas, nível atual e histórico de experimentos.
                  </p>
                </div>
                <div className="mt-5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={11} className="text-[#D62828]" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#D62828]">Nível {nivelAtual}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#A0A0A0]">{xpNoNivel} / {XP_POR_NIVEL} XP</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#F0F0F0]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${porcentagemNivel}%`,
                        background: "linear-gradient(90deg, #DC2626, #f87171)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </button>

            {/* ── CRIAR SALA ── */}
            <button
              onClick={criarSala}
              disabled={criandoSala}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-white/60 bg-white/88 p-7 text-left shadow-[0_25px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(0,0,0,0.12)] disabled:cursor-not-allowed disabled:opacity-60 min-h-[180px]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#FEF2F2] transition-colors group-hover:bg-[#FEE2E2]">
                <UserPlus size={22} className="text-[#D62828]" />
              </div>
              <p className="text-2xl font-black tracking-tight text-[#2F2F2F]">
                {criandoSala ? "Criando..." : "Criar Sala"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#8B8B8B] sm:text-base">
                Inicie uma nova partida e convide seus colegas para o laboratório.
              </p>
            </button>

            {/* ── ENTRAR EM SALA ── */}
            <button
              onClick={() => setMostrarModalEntrada(true)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-white/60 bg-white/88 p-7 text-left shadow-[0_25px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(0,0,0,0.12)] min-h-[180px]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#FEF2F2] transition-colors group-hover:bg-[#FEE2E2]">
                <LogIn size={22} className="text-[#D62828]" />
              </div>
              <p className="text-2xl font-black tracking-tight text-[#2F2F2F]">Entrar em Sala</p>
              <p className="mt-2 text-sm leading-relaxed text-[#8B8B8B] sm:text-base">
                Use um código de convite para participar de uma partida ativa.
              </p>
            </button>

            {/* ── DESAFIO DIÁRIO ── */}
            <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/88 shadow-[0_25px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:col-span-2">
              <div
                className="px-5 py-3.5 flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #DC2626, #b91c1c)" }}
              >
                <FlaskConical size={15} className="text-red-200" />
                <span className="text-[10px] font-black uppercase tracking-wider text-red-100">
                  Desafio Diário
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5">
                <div>
                  <p className="text-lg font-black tracking-tight text-[#2F2F2F] sm:text-xl">
                    Conecte 5 compostos seguidos sem errar.
                  </p>
                  <p className="mt-1 text-sm text-[#8B8B8B]">
                    Complete o desafio para ganhar experiência bônus no laboratório.
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-[#F0F0F0]">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-black text-white whitespace-nowrap shadow-[0_4px_14px_rgba(249,115,22,0.35)]">
                    <Zap size={11} fill="currentColor" />
                    +200 XP
                  </span>
                  <button
                    onClick={() => router.push("/jogo")}
                    className="rounded-xl border border-[#f5b8b8] bg-white px-4 py-1.5 text-sm font-bold text-[#D62828] transition hover:bg-[#FEF2F2] whitespace-nowrap"
                  >
                    Começar desafio
                  </button>
                </div>
              </div>
         

           
            
              <div className="px-6 py-5">
                <div className="h-3 overflow-hidden rounded-full bg-[#F0F0F0]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${porcentagemNivel}%`,
                      background: "linear-gradient(90deg, #DC2626, #f87171)",
                      boxShadow: "0 0 8px rgba(220,38,38,0.4)",
                    }}
                  />
                </div>
                <p className="mt-2.5 text-[12px] font-medium text-[#A0A0A0]">
                  {porcentagemNivel >= 80
                    ? `Quase no próximo nível! Faltam ${XP_POR_NIVEL - xpNoNivel} XP`
                    : `${XP_POR_NIVEL - xpNoNivel} XP para o nível ${nivelAtual + 1}`}
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ══ MODAL: SALA CRIADA ══════════════════════════════════════════════ */}
      {mostrarModalCriada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-[6px]" style={{ background: "rgba(0,0,0,0.35)" }}>
          <div className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.25)]"
            style={{ fontFamily: '"Poppins", sans-serif' }}>
            <div
              className="px-6 py-7 text-center"
              style={{ background: "linear-gradient(135deg, #DC2626, #991b1b)" }}
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[18px] bg-white/20">
                <UserPlus size={26} className="text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">Sala criada!</h2>
            </div>
            <div className="px-6 py-7">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.32em] text-[#8A8A8A]">Código da sala</p>
              <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[#EEEEEE] bg-[#FAFAFA] px-5 py-4">
                <span className="font-mono text-4xl font-black tracking-[0.18em] text-[#2F2F2F]">{codigoCriado}</span>
                <button
                  onClick={copiarCodigo}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                    copiado
                      ? "bg-green-50 text-green-600"
                      : "bg-white text-[#C7C7C7] hover:bg-[#FEF2F2] hover:text-[#D62828] ring-1 ring-[#EEEEEE]"
                  }`}
                  aria-label="Copiar código"
                >
                  {copiado ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={entrarNaSalaCriada}
                  className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full font-black text-white shadow-[0_14px_30px_rgba(214,40,40,0.28)] transition hover:brightness-105"
                  style={{ background: "linear-gradient(135deg, #DC2626, #b91c1c)" }}
                >
                  Entrar na sala <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => { setMostrarModalCriada(false); setCopiado(false) }}
                  className="h-[52px] rounded-full border border-[#E5E5E5] font-semibold text-[#666] transition hover:bg-[#F8F8F8]"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: ENTRAR EM SALA ══════════════════════════════════════════ */}
      {mostrarModalEntrada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-[6px]" style={{ background: "rgba(0,0,0,0.35)" }}>
          <div className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.25)]"
            style={{ fontFamily: '"Poppins", sans-serif' }}>
            <div
              className="px-6 py-7 text-center"
              style={{ background: "linear-gradient(135deg, #DC2626, #991b1b)" }}
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[18px] bg-white/20">
                <LogIn size={26} className="text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">Entrar em Sala</h2>
            </div>
            <div className="px-6 py-7">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.32em] text-[#8A8A8A]">Código da sala</p>
              <div className="flex items-center gap-3 rounded-[18px] border border-[#EEEEEE] bg-[#FAFAFA] px-5 py-4 focus-within:border-[#D62828] transition-colors">
                <input
                  id="codigo-sala"
                  value={codigoSala}
                  onChange={(e) => setCodigoSala(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") entrarSala() }}
                  autoFocus
                  placeholder="Ex.: ABC123"
                  className="w-full bg-transparent font-mono text-4xl font-black uppercase tracking-[0.18em] text-[#2F2F2F] outline-none placeholder:text-[#C7C7C7]"
                />
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={entrarSala}
                  className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full font-black text-white shadow-[0_14px_30px_rgba(214,40,40,0.28)] transition hover:brightness-105"
                  style={{ background: "linear-gradient(135deg, #DC2626, #b91c1c)" }}
                >
                  Entrar na sala <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => { setMostrarModalEntrada(false); setCodigoSala("") }}
                  className="h-[52px] rounded-full border border-[#E5E5E5] font-semibold text-[#666] transition hover:bg-[#F8F8F8]"
                >
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