"use client"

import Image from "next/image"
import { useMemo, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  FlaskConical,
  Trophy,
  Flame,
  Activity,
  Medal,
  LogOut,
  ArrowLeft,
  Lock,
  Lightbulb,
  Award,
  Zap,
  Star,
  TrendingUp,
  Users,
} from "lucide-react"

// ── Constantes ────────────────────────────────────────────────────────────────
const XP_POR_NIVEL = 1000
const NIVEL_BASE = 1

const CURIOSIDADES = [
  "O Carbono forma mais compostos do que qualquer outro elemento — é o coração da química orgânica.",
  "O Hidrogênio é o elemento mais abundante do universo — é a base das estrelas.",
  "O Ouro é tão maleável que uma única onça pode ser esticada em mais de 300 metros de fio.",
  "O Mercúrio é o único metal que é líquido à temperatura ambiente.",
  "O Oxigênio suporta reações de combustão — sem ele, fogo não existe.",
]

const FRASES_MOTIVACIONAIS = [
  "Continue assim! Cada reação descoberta te aproxima do topo.",
  "Cientistas não desistem — eles reformulam a hipótese e tentam de novo.",
  "Você está construindo algo incrível, elemento por elemento.",
  "A persistência é o reagente mais poderoso da sua jornada.",
  "Cada partida jogada é um experimento que te torna mais sábio.",
]

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface HistoricoItem {
  id: string | number
  nomeModo: string
  data: string | Date
  xpGanho: number
}

interface Medalha {
  icon: React.ElementType
  label: string
  unlocked: boolean
}

// ── Barra de XP animada ───────────────────────────────────────────────────────
function XpProgressBar({ pct, mounted }: { pct: number; mounted: boolean }) {
  return (
    <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/20">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: mounted ? `${pct}%` : "0%",
          background: "linear-gradient(90deg, rgba(255,255,255,0.7) 0%, #fff 100%)",
          boxShadow: "0 0 8px rgba(255,255,255,0.6)",
        }}
      />
    </div>
  )
}

// ── Linha do histórico ────────────────────────────────────────────────────────
function HistoricoRow({ item, index }: { item: HistoricoItem; index: number }) {
  const dataFormatada = new Date(item.data).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  })
  const xpColors = [
    "text-green-700 bg-green-50 border-green-200",
    "text-emerald-700 bg-emerald-50 border-emerald-200",
    "text-teal-700 bg-teal-50 border-teal-200",
  ]
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-white/40 last:border-none hover:bg-white/20 transition-colors group">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors flex-shrink-0">
          <FlaskConical size={14} className="text-[#D62828]" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#2F2F2F]">{item.nomeModo}</p>
          <p className="text-[11px] text-[#A0A0A0] mt-0.5">{dataFormatada}</p>
        </div>
      </div>
      <span className={`text-xs font-black border px-3 py-1 rounded-full ${xpColors[index % xpColors.length]}`}>
        +{item.xpGanho} XP
      </span>
    </div>
  )
}

// ── Medalha ───────────────────────────────────────────────────────────────────
function MedalhaItem({ icon: Icon, label, unlocked }: Medalha) {
  return (
    <div className="flex flex-col items-center gap-2 text-center group">
      <div
        className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-[14px] flex items-center justify-center transition-transform duration-200 ${
          unlocked
            ? "bg-[#FEF2F2] ring-1 ring-[#fca5a5] group-hover:scale-110"
            : "bg-white/30 opacity-50 ring-1 ring-white/40"
        }`}
        aria-label={`${unlocked ? "Medalha desbloqueada" : "Medalha bloqueada"}: ${label}`}
      >
        <Icon size={22} className={unlocked ? "text-[#D62828]" : "text-[#A0A0A0]"} aria-hidden />
        {!unlocked && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white border border-white/60 rounded-full flex items-center justify-center shadow-sm" aria-hidden>
            <Lock size={7} className="text-[#A0A0A0]" />
          </div>
        )}
        {unlocked && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#D62828] rounded-full flex items-center justify-center" aria-hidden>
            <Star size={7} className="text-white fill-white" />
          </div>
        )}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[.08em] text-[#8B8B8B] leading-tight">
        {label}
      </span>
    </div>
  )
}

// ── Mini card de stat ─────────────────────────────────────────────────────────
function StatCard({ icon, value, label, sublabel }: {
  icon: React.ReactNode
  value: number
  label: string
  sublabel?: string
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-[28px] border border-white/60 bg-white/88 p-7 shadow-[0_25px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl"
      style={{ fontFamily: '"Poppins", sans-serif' }}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#FEF2F2]">
        {icon}
      </div>
      <div>
        <p className="text-3xl font-black tracking-tight text-[#2F2F2F]">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 text-[#A0A0A0]">{label}</p>
        {sublabel && <p className="text-[11px] text-[#8B8B8B] mt-1">{sublabel}</p>}
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function DesempenhoPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [curioIdx, setCurioIdx] = useState(() => Math.floor(Math.random() * CURIOSIDADES.length))
  const [curioVisible, setCurioVisible] = useState(true)
  const [fraseIdx] = useState(() => Math.floor(Math.random() * FRASES_MOTIVACIONAIS.length))
  const [xpAnimado, setXpAnimado] = useState(0)

  // 🛠️ NOTA PARA O ARTHUR: substitua pelos dados da sua API/banco
  const [xpAtual, setXpAtual] = useState(0)
  const [diasOfensiva, setDiasOfensiva] = useState(0)
  const [reacoesDescobertas, setReacoesDescobertas] = useState(0)
  const [proximoDesbloqueio, setProximoDesbloqueio] = useState(0)

  // 🛠️ NOTA PARA O ARTHUR: preencha com HistoricoItem[] via API
  const [historico, setHistorico] = useState<HistoricoItem[]>([])

  // 🛠️ NOTA PARA O ARTHUR: `unlocked` deve vir do banco
  const [medalhas] = useState<Medalha[]>([
    { icon: Trophy, label: "Mestre do Lab", unlocked: false },
    { icon: Flame, label: "Persistente", unlocked: false },
    { icon: Award, label: "Nobel em Potencial", unlocked: false },
  ])

  useEffect(() => {
    setMounted(true)
    // 🛠️ NOTA PARA O ARTHUR: substitua pelo fetch real
    const valorXp = window.localStorage.getItem("dominoQuimicoXp")
    if (valorXp) {
      const parsed = parseInt(valorXp, 10)
      if (!isNaN(parsed)) {
        setXpAtual(parsed)
        let start = 0
        const step = Math.ceil(parsed / 40)
        const timer = setInterval(() => {
          start += step
          if (start >= parsed) { setXpAnimado(parsed); clearInterval(timer) }
          else setXpAnimado(start)
        }, 30)
      }
    }
  }, [])

  useEffect(() => {
    const rot = setInterval(() => {
      setCurioVisible(false)
      setTimeout(() => {
        setCurioIdx((i) => (i + 1) % CURIOSIDADES.length)
        setCurioVisible(true)
      }, 300)
    }, 8000)
    return () => clearInterval(rot)
  }, [])

  const { nivelAtual, porcentagemNivel, xpRestante, xpParaProximo } = useMemo(() => {
    const nivelGanho = Math.floor(xpAtual / XP_POR_NIVEL)
    const xpRestante = xpAtual % XP_POR_NIVEL
    const porcentagem = xpAtual === 0 ? 0 : Math.round((xpRestante / XP_POR_NIVEL) * 100)
    return {
      nivelAtual: NIVEL_BASE + nivelGanho,
      porcentagemNivel: porcentagem,
      xpRestante,
      xpParaProximo: XP_POR_NIVEL - xpRestante,
    }
  }, [xpAtual])

  const patenteAtual = useMemo(() => {
    if (xpAtual === 0) return "Cientista Iniciante"
    if (xpAtual < 2000) return "Alquimista em Evolução"
    if (xpAtual < 5000) return "Técnico de Soluções"
    if (xpAtual < 10000) return "Engenheiro Molecular"
    return "Mestre dos Elementos"
  }, [xpAtual])

  const mensagemXp = useMemo(() => {
    if (xpAtual === 0) return "Complete sua primeira partida para ganhar XP!"
    if (porcentagemNivel >= 80) return `Quase lá! Faltam só ${xpParaProximo} XP para o próximo nível`
    if (porcentagemNivel >= 50) return `Você já passou da metade deste nível. Continue!`
    return `${xpParaProximo} XP para chegar ao nível ${nivelAtual + 1}`
  }, [xpAtual, porcentagemNivel, xpParaProximo, nivelAtual])

  const handleLogout = useCallback(() => {
    // 🛠️ NOTA PARA O ARTHUR: limpeza de sessão (NextAuth, Supabase, etc.)
    localStorage.removeItem("dominoQuimicoXp")
    localStorage.removeItem("dominoQuimicoRooms")
    localStorage.removeItem("dominoQuimicoHostRoomCode")
    router.push("/login")
  }, [router])

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundImage: "url('/ChatGPT Image 15 de mai. de 2026, 10_31_00.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        fontFamily: '"Poppins", sans-serif',
      }}
    >

      {/* ══ HEADER — mesmo padrão do menu ══════════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full border-b border-white/30 bg-white/70 backdrop-blur-2xl"
        style={{ boxShadow: "0 1px 20px rgba(0,0,0,0.06)" }}>
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
                className="h-11 w-auto object-contain sm:h-12 lg:h-14" priority />
            </div>
            <div className="flex items-center justify-center gap-3 sm:gap-4 lg:gap-5">
              <Image src="/logo.png" alt="Dominó Químico" width={48} height={48}
                className="h-10 w-10 object-contain sm:h-12 sm:w-12 lg:h-14 lg:w-14" />
              <h1 className="text-xl font-black tracking-tight text-[#2F2F2F] sm:text-3xl lg:text-4xl">
                Dominó <span className="text-[#D62828]">Químico</span>
              </h1>
            </div>
            <div className="flex justify-end">
              <button onClick={handleLogout}
                className="flex items-center gap-2.5 rounded-full border border-[#ECECEC] bg-white px-4 py-2.5 text-sm font-bold text-[#666] transition hover:text-[#D62828] lg:px-5">
                <LogOut size={15} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* ══ MAIN ══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Intro */}
        <div className="mb-7 flex flex-col items-center gap-3 pt-4 sm:gap-5">
          <button
            onClick={() => router.push("/aluno")}
            className="self-start flex items-center gap-2 rounded-full border border-white/60 bg-white/70 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-[#666] shadow-sm transition hover:bg-white/90 hover:text-[#2F2F2F]"
          >
            <ArrowLeft size={13} />
            Voltar ao Menu
          </button>

          <p className="inline-flex items-center gap-1.5 rounded-full border border-[#f5b8b8] bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#D62828] shadow-sm backdrop-blur-sm sm:px-4 sm:text-[11px]">
            <FlaskConical size={13} className="text-[#D62828]" />
            Espaço de aprendizagem molecular
          </p>

          <h2 className="text-3xl text-center font-black tracking-[-0.03em] text-[#2F2F2F] drop-shadow-sm sm:text-5xl lg:text-6xl">
            Meu Desenvolvimento
          </h2>

          {/* Banner motivacional */}
          <div className="w-full max-w-2xl rounded-[28px] border border-white/60 bg-white/88 backdrop-blur-xl px-6 py-4 shadow-[0_25px_80px_rgba(0,0,0,0.08)] flex items-center justify-center">
            <p className="text-sm font-semibold text-[#555] leading-relaxed italic text-center">
              "{FRASES_MOTIVACIONAIS[fraseIdx]}"
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

          {/* ── COLUNA ESQUERDA ── */}
          <div className="space-y-5 md:col-span-2">

            {/* Card XP */}
            <div
              className="relative overflow-hidden rounded-[28px] p-7 shadow-[0_20px_60px_rgba(214,40,40,0.25)] text-white sm:p-8"
              style={{ background: "linear-gradient(135deg, #DC2626 0%, #b91c1c 60%, #991b1b 100%)" }}
            >
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white/5" />

              <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] font-black uppercase tracking-widest text-rose-200 sm:text-[13px]">
                  Potencial Atômico (XP)
                </p>
                <span className="self-start inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-bold sm:self-auto">
                  <Zap size={13} className="text-yellow-300" />
                  Nível {nivelAtual}
                </span>
              </div>

              <div className="relative mt-4">
                <h3 className="text-5xl font-black tracking-tight sm:text-6xl">
                  {xpAnimado.toLocaleString("pt-BR")}
                  <span className="text-base font-normal text-rose-200 ml-2 sm:text-lg">XP Total</span>
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <TrendingUp size={12} className="text-rose-300" />
                  <p className="text-[10px] font-bold text-rose-100 uppercase tracking-wide sm:text-xs">
                    {patenteAtual}
                  </p>
                </div>
              </div>

              <div className="relative mt-6">
                <XpProgressBar pct={porcentagemNivel} mounted={mounted} />
                <div className="mt-2 flex items-center justify-between text-[11px] text-rose-200">
                  <span>{porcentagemNivel}% para o próximo nível</span>
                  <span>{xpRestante} / {XP_POR_NIVEL} XP</span>
                </div>
              </div>

              <div className="relative mt-4 rounded-[14px] bg-white/10 px-4 py-2.5">
                <p className="text-[11px] font-semibold text-rose-100">{mensagemXp}</p>
              </div>
            </div>

            {/* Mini cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard
                icon={<Flame size={22} className="text-[#D62828]" />}
                value={diasOfensiva}
                label="Dias de Ofensiva"
                sublabel={diasOfensiva > 0 ? "Continue! Não quebre a sequência" : "Jogue hoje para começar sua ofensiva!"}
              />
              <StatCard
                icon={<Activity size={22} className="text-[#8B8B8B]" />}
                value={reacoesDescobertas}
                label="Reações Descobertas"
                sublabel={reacoesDescobertas > 0 ? `${reacoesDescobertas} reações já são suas!` : "Descubra sua primeira reação"}
              />
            </div>

            {/* Histórico */}
            <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/88 shadow-[0_25px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <div
                className="flex items-center justify-between px-5 py-3.5"
                style={{ background: "linear-gradient(135deg, #DC2626, #b91c1c)" }}
              >
                <div className="flex items-center gap-2">
                  <FlaskConical size={14} className="text-red-200" />
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-red-100">Histórico de Lab</h4>
                </div>
                <span className="text-[10px] text-red-200">Últimas partidas</span>
              </div>

              {/* 🛠️ NOTA PARA O ARTHUR: .map() no array `historico` vindo do banco */}
              {historico.length > 0 ? (
                historico.map((item, i) => <HistoricoRow key={item.id ?? i} item={item} index={i} />)
              ) : (
                <div className="p-8 text-center">
                  <div className="mx-auto w-full max-w-md rounded-[18px] border border-dashed border-[#f5b8b8] bg-[#FEF2F2]/50 p-7 sm:p-8">
                    <p className="text-sm font-bold text-[#2F2F2F] sm:text-base">
                      Seu histórico está em branco — por enquanto!
                    </p>
                    <p className="mt-1.5 text-xs text-[#8B8B8B] sm:text-sm">
                      Cada partida que você jogar vai aparecer aqui com os XP conquistados.
                    </p>
                    <button
                      onClick={() => router.push("/jogo")}
                      className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white transition hover:brightness-105"
                      style={{ background: "linear-gradient(135deg, #DC2626, #b91c1c)" }}
                    >
                      <Zap size={12} />
                      Jogar agora
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ── COLUNA DIREITA ── */}
          <div className="space-y-5">

            {/* Medalhas */}
            <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/88 shadow-[0_25px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <div
                className="px-4 py-3.5 flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #DC2626, #b91c1c)" }}
              >
                <Medal size={18} className="text-red-200" />
                <h4 className="text-[10px] font-black uppercase tracking-wider text-red-100">
                  Medalhas de Mérito
                </h4>
              </div>
              <div className="p-7">
                <div className="grid grid-cols-3 gap-4">
                  {medalhas.map(({ icon: Icon, label, unlocked }) => (
                    <MedalhaItem key={label} icon={Icon} label={label} unlocked={unlocked} />
                  ))}
                </div>
                <div className="mt-5 rounded-[14px] bg-[#FAFAFA] p-3.5 ring-1 ring-[#EEEEEE]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#666]">Próximo Desbloqueio</span>
                    <span className="text-[13px] font-black text-[#D62828]">{proximoDesbloqueio}/10</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#EEEEEE] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${proximoDesbloqueio * 10}%`,
                        background: "linear-gradient(90deg, #DC2626, #f87171)",
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-[#A0A0A0]">
                    {proximoDesbloqueio === 0
                      ? "Complete partidas para desbloquear conquistas!"
                      : `${10 - proximoDesbloqueio} partidas para a próxima medalha`}
                  </p>
                </div>
              </div>
            </div>

            {/* Desafio do Dia */}
            <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/88 shadow-[0_25px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <div
                className="px-4 py-3.5 flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #DC2626, #b91c1c)" }}
              >
                <Star size={14} className="text-yellow-300 fill-yellow-300" />
                <h4 className="text-[10px] font-black uppercase tracking-wider text-red-100">
                  Desafio do Dia
                </h4>
              </div>
              <div className="p-7">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#FEF2F2]">
                    <Users size={18} className="text-[#D62828]" />
                  </div>
                  <p className="text-sm font-semibold text-[#555] leading-relaxed">
                    Jogue uma partida cooperativa e ganhe XP bônus com seus colegas!
                  </p>
                </div>
                <button
                  onClick={() => router.push("/aluno?createRoom=1")}
                  className="w-full rounded-[14px] py-2.5 text-[11px] font-black uppercase tracking-wider text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(214,40,40,0.28)]"
                  style={{ background: "linear-gradient(135deg, #DC2626, #b91c1c)" }}
                >
                  <Zap size={12} />
                  Criar Sala
                </button>
              </div>
            </div>

            {/* Curiosidades */}
            <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/88 shadow-[0_25px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <div
                className="px-4 py-3.5 flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}
              >
                <Lightbulb size={14} className="text-yellow-200" />
                <span className="text-[10px] font-black uppercase tracking-wider text-yellow-100">
                  Você Sabia?
                </span>
              </div>
              <div className="p-7">
                <p
                  className="text-sm leading-relaxed text-[#555] transition-opacity duration-300"
                  style={{ opacity: curioVisible ? 1 : 0 }}
                >
                  {CURIOSIDADES[curioIdx]}
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}