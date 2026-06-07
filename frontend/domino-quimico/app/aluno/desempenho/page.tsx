"use client"

import Image from "next/image"
import { useMemo, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  FlaskConical,
  Flame,
  Activity,
  Medal,
  LogOut,
  ArrowLeft,
  Lock,
  Lightbulb,
  Zap,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Rocket,
  Target,
  Heart,
  BookOpen,
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
  "A água é a única substância que existe naturalmente nos três estados: sólido, líquido e gasoso.",
  "O diamante e o grafite são feitos do mesmo elemento: o carbono. A diferença está na estrutura.",
]

// Frases motivacionais baseadas em contexto
const FRASES_POR_NIVEL: Record<string, string[]> = {
  inicio: [
    "Toda grande jornada começa com uma peça de dominó. A sua acabou de começar! 🧪",
    "Você está no começo de algo incrível. Cada partida é um passo no laboratório da química!",
    "Cientistas começaram do zero — e olha onde chegaram. Sua vez! ⚗️",
  ],
  progredindo: [
    "Você já provou que tem o que é preciso. Continue conectando os elementos! 🔗",
    "Cada vitória sua é uma reação em cadeia. Continue e veja onde isso chega! ⚡",
    "Seu progresso não é sorte — é dedicação transformada em XP. Vai fundo! 🚀",
  ],
  avancado: [
    "Você está dominando a tabela periódica peça por peça. Respeito! 🏆",
    "Poucos chegam onde você está. Continue sendo uma força da natureza! ⚛️",
    "Sua jornada no laboratório virou inspiração. Continue escrevendo essa história! 📖",
  ],
  mestre: [
    "Mestre dos Elementos — título conquistado com mérito. Você é o experimento que deu certo! 🥇",
    "Você transformou esforço em excelência. A química agradece por ter você! 🌟",
    "Lendário. Seu nome já deveria estar gravado na tabela periódica! ⚗️✨",
  ],
}

const FRASES_SEQUENCIA = [
  "🔥 Sequência ativa! Seu cérebro está no modo reação em cadeia.",
  "🔥 Dias seguidos! Consistência é o elemento mais raro — e você tem de sobra.",
  "🔥 Você não para! Isso é o que separa os curiosos dos verdadeiros cientistas.",
]

const MISSOES_MOTIVACIONAIS = [
  { emoji: "🎯", titulo: "Foco Total", desc: "Jogue 3 partidas hoje e sinta a evolução acontecer." },
  { emoji: "⚗️", titulo: "Alquimia do Conhecimento", desc: "Cada erro é um experimento. Cada acerto é uma descoberta." },
  { emoji: "🧬", titulo: "DNA de Campeão", desc: "Você tem o que todo cientista precisa: curiosidade e persistência." },
  { emoji: "🌡️", titulo: "Temperatura no Máximo", desc: "Quando a pressão aumenta, os diamantes se formam. Pressione mais!" },
  { emoji: "⚡", titulo: "Carga Total", desc: "Sua energia hoje pode ser o XP de amanhã. Não desperdice!" },
]

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface HistoricoItem {
  id: number
  nomeModo: string
  data: string
  xpGanho: number
  acertos: number
  erros: number
  venceu: boolean
  tempoSegundos: number
}

interface Medalha {
  titulo: string
  descricao: string
  desbloqueado: boolean
  emoji: string
}

interface Desempenho {
  xpTotal: number
  xpHoje: number
  totalPartidas: number
  totalVitorias: number
  totalAcertos: number
  totalErros: number
  diasSeguidos: number
  vitoriasSeguidas: number
  reacoesDescobertas: number
  proximoDesbloqueio: number
  medalhas: Medalha[]
  historico: HistoricoItem[]
}

// ── Barra de XP animada ───────────────────────────────────────────────────────
function XpProgressBar({ pct, mounted }: { pct: number; mounted: boolean }) {
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/20">
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
  const minutos = item.tempoSegundos > 0
    ? `${Math.floor(item.tempoSegundos / 60)}m ${item.tempoSegundos % 60}s`
    : null

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/40 last:border-none hover:bg-white/20 transition-colors group">
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${item.venceu ? "bg-green-100" : "bg-red-100"}`}>
          {item.venceu
            ? <CheckCircle size={14} className="text-green-600" />
            : <XCircle size={14} className="text-red-400" />}
        </div>
        <div>
          <p className="text-sm font-bold text-[#2F2F2F]">{item.nomeModo}</p>
          <p className="text-[11px] text-[#A0A0A0] mt-0.5">
            {dataFormatada}
            {item.acertos > 0 && ` · ${item.acertos} acertos`}
            {item.erros > 0 && ` · ${item.erros} erros`}
            {minutos && ` · ${minutos}`}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-3">
        <span className={`text-xs font-black border px-2.5 py-0.5 rounded-full ${xpColors[index % xpColors.length]}`}>
          +{item.xpGanho} XP
        </span>
        {item.venceu && (
          <p className="text-[10px] text-green-600 font-bold mt-0.5">Vitória</p>
        )}
      </div>
    </div>
  )
}

// ── Medalha ───────────────────────────────────────────────────────────────────
function MedalhaItem({ titulo, descricao, desbloqueado, emoji }: Medalha) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center group">
      <div
        className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-[12px] flex items-center justify-center transition-transform duration-200 ${
          desbloqueado
            ? "bg-[#FEF2F2] ring-1 ring-[#fca5a5] group-hover:scale-110"
            : "bg-white/30 opacity-50 ring-1 ring-white/40"
        }`}
        title={descricao}
      >
        <span className="text-xl">{emoji}</span>
        {!desbloqueado && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white border border-white/60 rounded-full flex items-center justify-center shadow-sm">
            <Lock size={7} className="text-[#A0A0A0]" />
          </div>
        )}
        {desbloqueado && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#D62828] rounded-full flex items-center justify-center">
            <Star size={7} className="text-white fill-white" />
          </div>
        )}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-[.08em] text-[#8B8B8B] leading-tight">
        {titulo}
      </span>
    </div>
  )
}

// ── Mini card de stat ─────────────────────────────────────────────────────────
function StatCard({ icon, value, label, sublabel }: {
  icon: React.ReactNode; value: number; label: string; sublabel?: string
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-[22px] border border-white/60 bg-white/88 p-5 shadow-[0_20px_64px_rgba(0,0,0,0.07)] backdrop-blur-xl"
      style={{ fontFamily: '"Poppins", sans-serif' }}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#FEF2F2]">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black tracking-tight text-[#2F2F2F]">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 text-[#A0A0A0]">{label}</p>
        {sublabel && <p className="text-[10px] text-[#8B8B8B] mt-0.5">{sublabel}</p>}
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/40 ${className ?? ""}`} />
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function DesempenhoPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const [dados, setDados] = useState<Desempenho | null>(null)

  const [curioIdx, setCurioIdx] = useState(() => Math.floor(Math.random() * CURIOSIDADES.length))
  const [curioVisible, setCurioVisible] = useState(true)
  const [xpAnimado, setXpAnimado] = useState(0)
  const [missaoIdx] = useState(() => Math.floor(Math.random() * MISSOES_MOTIVACIONAIS.length))

  // ── Busca dados da API ────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem("dominoToken")
    if (!token) { router.push("/login"); return }

    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

    fetch(`${API_URL}/api/aluno/desempenho`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json() as Promise<Desempenho>
      })
      .then((data) => {
        setDados(data)
        setCarregando(false)
        const target = data.xpTotal
        let start = 0
        const step = Math.max(1, Math.ceil(target / 40))
        const timer = setInterval(() => {
          start += step
          if (start >= target) { setXpAnimado(target); clearInterval(timer) }
          else setXpAnimado(start)
        }, 30)
      })
      .catch((err) => {
        console.error(err)
        setErro("Não foi possível carregar seus dados. Tente novamente.")
        setCarregando(false)
      })
  }, [router])

  // ── Rotação de curiosidades ───────────────────────────────────────────────
  useEffect(() => {
    const rot = setInterval(() => {
      setCurioVisible(false)
      setTimeout(() => { setCurioIdx((i) => (i + 1) % CURIOSIDADES.length); setCurioVisible(true) }, 300)
    }, 8000)
    return () => clearInterval(rot)
  }, [])

  // ── Cálculos de nível ─────────────────────────────────────────────────────
  const xpTotal = dados?.xpTotal ?? 0

  const { nivelAtual, porcentagemNivel, xpRestante, xpParaProximo } = useMemo(() => {
    const nivelGanho = Math.floor(xpTotal / XP_POR_NIVEL)
    const xpRestante = xpTotal % XP_POR_NIVEL
    const porcentagem = xpTotal === 0 ? 0 : Math.round((xpRestante / XP_POR_NIVEL) * 100)
    return {
      nivelAtual: NIVEL_BASE + nivelGanho,
      porcentagemNivel: porcentagem,
      xpRestante,
      xpParaProximo: XP_POR_NIVEL - xpRestante,
    }
  }, [xpTotal])

  const patenteAtual = useMemo(() => {
    if (xpTotal === 0) return "Cientista Iniciante"
    if (xpTotal < 2000) return "Alquimista em Evolução"
    if (xpTotal < 5000) return "Técnico de Soluções"
    if (xpTotal < 10000) return "Engenheiro Molecular"
    return "Mestre dos Elementos"
  }, [xpTotal])

  const mensagemXp = useMemo(() => {
    if (xpTotal === 0) return "Complete sua primeira partida para ganhar XP!"
    if (porcentagemNivel >= 80) return `Quase lá! Faltam só ${xpParaProximo} XP para o próximo nível`
    if (porcentagemNivel >= 50) return "Você já passou da metade deste nível. Continue!"
    return `${xpParaProximo} XP para chegar ao nível ${nivelAtual + 1}`
  }, [xpTotal, porcentagemNivel, xpParaProximo, nivelAtual])

  // Frase motivacional contextual baseada nos dados reais
  const fraseMotivacional = useMemo(() => {
    const pool =
      xpTotal === 0 ? FRASES_POR_NIVEL.inicio :
      xpTotal < 3000 ? FRASES_POR_NIVEL.progredindo :
      xpTotal < 8000 ? FRASES_POR_NIVEL.avancado :
      FRASES_POR_NIVEL.mestre
    return pool[Math.floor(Math.random() * pool.length)]
  }, [xpTotal])

  const fraseSequencia = useMemo(() => {
    const dias = dados?.diasSeguidos ?? 0
    if (dias < 2) return null
    return FRASES_SEQUENCIA[Math.min(dias - 2, FRASES_SEQUENCIA.length - 1)]
  }, [dados])

  const handleLogout = useCallback(() => {
    localStorage.removeItem("dominoToken")
    localStorage.removeItem("dominoUsuario")
    router.push("/login")
  }, [router])

  const bg = {
    backgroundImage: "url('/ChatGPT Image 15 de mai. de 2026, 10_31_00.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    backgroundRepeat: "no-repeat",
    fontFamily: '"Poppins", sans-serif',
  }

  if (erro) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-4" style={bg}>
        <div className="rounded-[24px] border border-white/60 bg-white/88 backdrop-blur-xl p-8 text-center shadow-xl max-w-sm">
          <p className="text-[#D62828] font-black text-lg mb-4">Erro ao carregar</p>
          <p className="text-[#666] text-sm mb-6">{erro}</p>
          <button onClick={() => router.push("/aluno")} className="rounded-full bg-[#D62828] px-6 py-3 text-white font-black text-sm">
            Voltar ao menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full" style={bg}>

      {/* ══ HEADER — intocado ═══════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full border-b border-white/30 bg-white/70 backdrop-blur-2xl" style={{ boxShadow: "0 1px 20px rgba(0,0,0,0.06)" }}>
        <div className="w-full px-4 sm:px-6 lg:px-12">
          {/* Mobile */}
          <div className="py-3 sm:py-4 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <Image src="/etec_santo_andre.png" alt="ETEC Santo André" width={112} height={38} className="h-8 w-auto object-contain sm:h-9" priority />
              <button onClick={handleLogout} className="flex items-center justify-center rounded-full border border-[#ECECEC] bg-white p-2.5 text-[#666] transition hover:text-[#D62828]" aria-label="Sair">
                <LogOut size={16} />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 sm:gap-3">
              <Image src="/logo.png" alt="Dominó Químico" width={40} height={40} className="h-8 w-8 object-contain sm:h-9 sm:w-9" />
              <h1 className="text-xl font-black tracking-tight text-[#2F2F2F] sm:text-2xl">
                Dominó <span className="text-[#D62828]">Químico</span>
              </h1>
            </div>
          </div>
          {/* Desktop */}
          <div className="hidden items-center py-4 sm:py-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4 lg:py-5">
            <div className="flex items-center justify-start">
              <Image src="/etec_santo_andre.png" alt="ETEC Santo André" width={150} height={52} className="h-11 w-auto object-contain sm:h-12 lg:h-13" priority />
            </div>
            <div className="flex items-center justify-center gap-3 sm:gap-4 lg:gap-5">
              <Image src="/logo.png" alt="Dominó Químico" width={48} height={48} className="h-10 w-10 object-contain sm:h-12 sm:w-12 lg:h-13 lg:w-13" />
              <h1 className="text-xl font-black tracking-tight text-[#2F2F2F] sm:text-3xl lg:text-4xl">
                Dominó <span className="text-[#D62828]">Químico</span>
              </h1>
            </div>
            <div className="flex justify-end">
              <button onClick={handleLogout} className="flex items-center gap-2.5 rounded-full border border-[#ECECEC] bg-white px-4 py-2.5 text-sm font-bold text-[#666] transition hover:text-[#D62828] lg:px-5">
                <LogOut size={15} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ══ MAIN ══════════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8">

        {/* Intro */}
        <div className="mb-6 flex flex-col items-center gap-3 pt-3 sm:gap-4">
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

          <h2 className="text-2xl text-center font-black tracking-[-0.03em] text-[#2F2F2F] drop-shadow-sm sm:text-4xl lg:text-5xl">
            Meu Desenvolvimento
          </h2>

          {/* Banner motivacional contextual */}
          <div className="w-full max-w-2xl rounded-[22px] border border-white/60 bg-white/88 backdrop-blur-xl px-5 py-4 shadow-[0_20px_64px_rgba(0,0,0,0.07)]">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#FEF2F2]">
                <Rocket size={17} className="text-[#D62828]" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[#D62828] mb-1">Mensagem do Laboratório</p>
                <p className="text-sm font-semibold text-[#444] leading-relaxed">
                  {carregando ? "Carregando sua mensagem..." : fraseMotivacional}
                </p>
              </div>
            </div>
          </div>

          {/* Banner de sequência — só aparece se dias > 1 */}
          {!carregando && fraseSequencia && (
            <div
              className="w-full max-w-2xl rounded-[22px] px-5 py-3.5 text-white text-sm font-bold text-center shadow-[0_8px_24px_rgba(214,40,40,0.2)]"
              style={{ background: "linear-gradient(135deg, #DC2626, #b91c1c)" }}
            >
              {fraseSequencia}
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* ── COLUNA ESQUERDA ── */}
          <div className="space-y-4 md:col-span-2">

            {/* Card XP */}
            <div
              className="relative overflow-hidden rounded-[24px] p-5 shadow-[0_16px_48px_rgba(214,40,40,0.22)] text-white sm:p-6"
              style={{ background: "linear-gradient(135deg, #DC2626 0%, #b91c1c 60%, #991b1b 100%)" }}
            >
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
              <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white/5" />

              <div className="relative flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-200 sm:text-[12px]">
                  Potencial Atômico (XP)
                </p>
                <span className="self-start inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold sm:self-auto">
                  <Zap size={11} className="text-yellow-300" />
                  Nível {nivelAtual} — {patenteAtual}
                </span>
              </div>

              <div className="relative mt-3">
                {carregando ? (
                  <Skeleton className="h-10 w-40 bg-white/20" />
                ) : (
                  <>
                    <h3 className="text-4xl font-black tracking-tight sm:text-5xl">
                      {xpAnimado.toLocaleString("pt-BR")}
                      <span className="text-sm font-normal text-rose-200 ml-2">XP Total</span>
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <TrendingUp size={11} className="text-rose-300" />
                      <p className="text-[10px] font-bold text-rose-100 uppercase tracking-wide">
                        {xpTotal === 0
                          ? "Sua história começa agora — jogue a primeira partida!"
                          : `Você já conquistou ${xpTotal.toLocaleString("pt-BR")} pontos de conhecimento`}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {!carregando && (
                <>
                  <div className="relative mt-4">
                    <XpProgressBar pct={porcentagemNivel} mounted={mounted} />
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-rose-200">
                      <span>{porcentagemNivel}% para o próximo nível</span>
                      <span>{xpRestante} / {XP_POR_NIVEL} XP</span>
                    </div>
                  </div>
                  <div className="relative mt-3 rounded-[12px] bg-white/10 px-3.5 py-2">
                    <p className="text-[10px] font-semibold text-rose-100">{mensagemXp}</p>
                  </div>
                  {(dados?.xpHoje ?? 0) > 0 && (
                    <div className="relative mt-2 rounded-[12px] bg-white/15 px-3.5 py-2 flex items-center gap-2">
                      <Zap size={11} className="text-yellow-300 shrink-0" />
                      <p className="text-[10px] font-bold text-yellow-200">
                        Hoje você ganhou {dados!.xpHoje} XP — continue assim!
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Mini cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {carregando ? (
                <><Skeleton className="h-24" /><Skeleton className="h-24" /></>
              ) : (
                <>
                  <StatCard
                    icon={<Flame size={19} className="text-[#D62828]" />}
                    value={dados?.diasSeguidos ?? 0}
                    label="Dias de Ofensiva"
                    sublabel={
                      (dados?.diasSeguidos ?? 0) >= 7
                        ? "🔥 Uma semana seguida! Você é imparável!"
                        : (dados?.diasSeguidos ?? 0) > 0
                        ? "Continue! Não quebre a sequência"
                        : "Jogue hoje para começar sua ofensiva!"
                    }
                  />
                  <StatCard
                    icon={<Activity size={19} className="text-[#8B8B8B]" />}
                    value={dados?.reacoesDescobertas ?? 0}
                    label="Reações Descobertas"
                    sublabel={
                      (dados?.reacoesDescobertas ?? 0) > 0
                        ? `${dados!.reacoesDescobertas} conexões químicas já são suas!`
                        : "Descubra sua primeira reação"
                    }
                  />
                </>
              )}
            </div>

            {/* Estatísticas extras */}
            {!carregando && dados && (
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { label: "Partidas", value: dados.totalPartidas },
                  { label: "Vitórias", value: dados.totalVitorias },
                  { label: "Acertos", value: dados.totalAcertos },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-[18px] border border-white/60 bg-white/88 backdrop-blur-xl p-3.5 text-center shadow-sm"
                  >
                    <p className="text-xl font-black text-[#2F2F2F]">{s.value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Card motivacional de missão */}
            {!carregando && (
              <div
                className="relative overflow-hidden rounded-[24px] p-5 border border-white/60 bg-white/88 backdrop-blur-xl shadow-[0_20px_64px_rgba(0,0,0,0.07)]"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{MISSOES_MOTIVACIONAIS[missaoIdx].emoji}</span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#D62828] mb-0.5">
                      Mentalidade do Cientista
                    </p>
                    <p className="text-sm font-black text-[#2F2F2F]">
                      {MISSOES_MOTIVACIONAIS[missaoIdx].titulo}
                    </p>
                    <p className="text-xs text-[#666] mt-1 leading-relaxed">
                      {MISSOES_MOTIVACIONAIS[missaoIdx].desc}
                    </p>
                  </div>
                </div>
                {dados && dados.totalVitorias > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#F0F0F0] flex items-center gap-2">
                    <CheckCircle size={13} className="text-green-500 shrink-0" />
                    <p className="text-[11px] text-[#666]">
                      Você já venceu <strong className="text-[#2F2F2F]">{dados.totalVitorias} {dados.totalVitorias === 1 ? "partida" : "partidas"}</strong> — prova de que tem o que é preciso!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Histórico */}
            <div className="overflow-hidden rounded-[24px] border border-white/60 bg-white/88 shadow-[0_20px_64px_rgba(0,0,0,0.07)] backdrop-blur-xl">
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ background: "linear-gradient(135deg, #DC2626, #b91c1c)" }}
              >
                <div className="flex items-center gap-2">
                  <FlaskConical size={13} className="text-red-200" />
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-red-100">Histórico de Lab</h4>
                </div>
                <span className="text-[10px] text-red-200">Últimas partidas</span>
              </div>

              {carregando ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : (dados?.historico ?? []).length > 0 ? (
                dados!.historico.map((item, i) => (
                  <HistoricoRow key={item.id} item={item} index={i} />
                ))
              ) : (
                <div className="p-6 text-center">
                  <div className="mx-auto w-full max-w-md rounded-[16px] border border-dashed border-[#f5b8b8] bg-[#FEF2F2]/50 p-6">
                    <p className="text-2xl mb-2">🧪</p>
                    <p className="text-sm font-bold text-[#2F2F2F]">
                      Seu histórico está em branco — por enquanto!
                    </p>
                    <p className="mt-1 text-xs text-[#8B8B8B]">
                      Todo grande cientista começou com o primeiro experimento. O seu está a um clique de distância.
                    </p>
                    <button
                      onClick={() => router.push("/jogo")}
                      className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white transition hover:brightness-105"
                      style={{ background: "linear-gradient(135deg, #DC2626, #b91c1c)" }}
                    >
                      <Zap size={11} />
                      Fazer meu primeiro experimento
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ── COLUNA DIREITA ── */}
          <div className="space-y-4">

            {/* Medalhas */}
            <div className="overflow-hidden rounded-[24px] border border-white/60 bg-white/88 shadow-[0_20px_64px_rgba(0,0,0,0.07)] backdrop-blur-xl">
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #DC2626, #b91c1c)" }}
              >
                <Medal size={15} className="text-red-200" />
                <h4 className="text-[10px] font-black uppercase tracking-wider text-red-100">
                  Medalhas de Mérito
                </h4>
              </div>
              <div className="p-5">
                {carregando ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-[12px]" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {(dados?.medalhas ?? []).map((m) => (
                      <MedalhaItem key={m.titulo} {...m} />
                    ))}
                  </div>
                )}

                {/* Texto motivacional abaixo das medalhas */}
                {!carregando && (
                  <p className="mt-3 text-[10px] text-[#888] leading-relaxed text-center italic">
                    {(dados?.medalhas ?? []).filter(m => m.desbloqueado).length === 0
                      ? "Sua primeira medalha está esperando por você. Jogue e conquiste! 🏅"
                      : `Você já desbloqueou ${(dados?.medalhas ?? []).filter(m => m.desbloqueado).length} conquista(s). Continue e colecione todas! 🎖️`}
                  </p>
                )}


              </div>
            </div>

            {/* Desafio do Dia */}
            <div className="overflow-hidden rounded-[24px] border border-white/60 bg-white/88 shadow-[0_20px_64px_rgba(0,0,0,0.07)] backdrop-blur-xl">
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #DC2626, #b91c1c)" }}
              >
                <Star size={13} className="text-yellow-300 fill-yellow-300" />
                <h4 className="text-[10px] font-black uppercase tracking-wider text-red-100">
                  Desafio do Dia
                </h4>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-2.5 mb-1">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#FEF2F2]">
                    <Target size={16} className="text-[#D62828]" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#2F2F2F]">Jogue uma partida hoje!</p>
                    <p className="text-[10px] text-[#888] mt-0.5 leading-relaxed">
                      Cada partida é uma chance de subir de nível e provar do que você é feito.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/aluno?createRoom=1")}
                  className="mt-3 w-full rounded-[12px] py-2.5 text-[10px] font-black uppercase tracking-wider text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(214,40,40,0.28)]"
                  style={{ background: "linear-gradient(135deg, #DC2626, #b91c1c)" }}
                >
                  <Zap size={11} />
                  Aceitar o Desafio
                </button>
              </div>
            </div>

            {/* Curiosidades */}
            <div className="overflow-hidden rounded-[24px] border border-white/60 bg-white/88 shadow-[0_20px_64px_rgba(0,0,0,0.07)] backdrop-blur-xl">
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}
              >
                <Lightbulb size={13} className="text-yellow-200" />
                <span className="text-[10px] font-black uppercase tracking-wider text-yellow-100">
                  Você Sabia?
                </span>
              </div>
              <div className="p-5">
                <p
                  className="text-xs leading-relaxed text-[#555] transition-opacity duration-300 sm:text-sm"
                  style={{ opacity: curioVisible ? 1 : 0 }}
                >
                  {CURIOSIDADES[curioIdx]}
                </p>
                <p className="mt-3 text-[10px] text-[#AAA] italic">
                  O conhecimento é o XP que ninguém te tira. 📚
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}