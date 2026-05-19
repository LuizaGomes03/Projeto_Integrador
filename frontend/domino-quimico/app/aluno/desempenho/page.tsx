"use client"

import Image from "next/image"
import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  FlaskConical,
  Trophy,
  Flame,
  Activity,
  Medal,
  BarChart3,
  Users,
  Gamepad2,
  LogOut,
  ArrowLeft,
  ChevronRight,
  Zap,
} from "lucide-react"

const XP_STORAGE_KEY = "dominoQuimicoXp"
const XP_POR_NIVEL = 1000
const NIVEL_BASE = 42

const historico = [
  {
    icon: FlaskConical,
    nome: "Titulação Ácido-Base",
    meta: "Hoje · 14:30 · Protocolo Médio",
    xp: "+350 XP",
    resultado: "Excelente",
  },
  {
    icon: Flame,
    nome: "Combustão de Magnésio",
    meta: "Ontem · 10:15 · Protocolo Difícil",
    xp: "+520 XP",
    resultado: "Perfeito",
  },
]

const curiosidades = [
  "O Carbono forma mais compostos do que qualquer outro elemento — é o coração da química orgânica.",
  "O Hidrogênio é o elemento mais leve e mais abundante do universo — é a base das estrelas.",
  "O Ouro é tão maleável que uma única onça pode ser esticada em mais de 300 metros de fio.",
  "O Mercúrio é o único metal que é líquido à temperatura ambiente.",
  "O Oxigênio suporta reações de combustão — sem ele, fogo não existe.",
]

export default function DesempenhoPage() {
  const router = useRouter()
  const [xpAtual, setXpAtual] = useState(12450)
  const [mounted, setMounted] = useState(false)
  const [curioIdx, setCurioIdx] = useState(() => Math.floor(Math.random() * curiosidades.length))

  useEffect(() => {
    setMounted(true)
    const valor = window.localStorage.getItem(XP_STORAGE_KEY)
    if (valor) {
      const parsed = Number.parseInt(valor, 10)
      if (!Number.isNaN(parsed)) setXpAtual(parsed)
    }
    const rot = setInterval(() => setCurioIdx((i) => (i + 1) % curiosidades.length), 8000)
    return () => clearInterval(rot)
  }, [])

  const { nivelAtual, porcentagemNivel } = useMemo(() => {
    const nivelGanho = Math.floor(xpAtual / XP_POR_NIVEL)
    const xpRestante = xpAtual % XP_POR_NIVEL
    const porcentagem = (xpRestante / XP_POR_NIVEL) * 100
    return { nivelAtual: NIVEL_BASE + nivelGanho, porcentagemNivel: porcentagem }
  }, [xpAtual])

  return (
    <>
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-center py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/logo.png"
                alt="Dominó Químico"
                width={42}
                height={42}
                className="h-8 w-8 object-contain sm:h-10 sm:w-10"
              />
              <h1 className="text-lg font-black tracking-tight text-slate-800 sm:text-xl">
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
              className="absolute right-0 flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-600 sm:gap-2 sm:px-4 sm:py-2"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main
        className="min-h-screen w-full"
        style={{
          background:
            "radial-gradient(ellipse at 15% 60%, #ffe4e6 0%, transparent 50%), radial-gradient(ellipse at 85% 10%, #fecdd3 0%, transparent 45%), #fdf2f4",
        }}
      >
        {/* Moléculas decorativas */}
        <svg
          aria-hidden
          className="pointer-events-none fixed inset-0 h-full w-full opacity-[0.08]"
          xmlns="http://www.w3.org/2000/svg"
        >
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

        <section className="relative mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 lg:px-10 lg:py-12">

          {/* ── TOPO ── */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/aluno")}
              className="flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800 sm:px-4 sm:py-2 sm:text-sm"
            >
              <ArrowLeft size={13} />
              Voltar
            </button>

            <div className="mx-auto w-full max-w-3xl text-center">
              <p className="mb-3 inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-white/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-rose-600 sm:px-4 sm:text-xs">
                <FlaskConical size={11} />
                Laboratório de Progresso
              </p>
              <h2 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl md:text-5xl lg:text-6xl">
                Meu Desenvolvimento
              </h2>
              <p className="mt-2 text-sm text-slate-500 sm:mt-3">
                Sua evolução no laboratório de estratégia.
              </p>
            </div>
          </div>

          {/* ── DASHBOARD GRID ──
              mobile (< sm) : 1 coluna
              tablet (sm)   : 2 colunas
              desktop (lg)  : 4 colunas
          */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Card XP — full em mobile, 2 cols em sm+, 2 cols em lg */}
            <div className="relative overflow-hidden rounded-2xl bg-[#DC2626] p-5 shadow-lg sm:col-span-2 sm:p-6">
              <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10 sm:h-40 sm:w-40" />
              <div aria-hidden className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-white/[0.07] sm:h-24 sm:w-24" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-200">
                    Potencial Atômico (XP)
                  </p>
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-50" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {xpAtual.toLocaleString("pt-BR")}
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black text-white">
                    +450 XP
                  </span>
                </div>
                <p className="mt-4 text-sm font-black text-white sm:text-base">
                  Cientista Nível {nivelAtual}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-200">
                  Protocolo: Alquimista Sênior
                </p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{ width: mounted ? `${porcentagemNivel}%` : "0%" }}
                  />
                </div>
                <p className="mt-2 text-xs text-rose-200">
                  {Math.round(porcentagemNivel)}% para o próximo nível
                </p>
              </div>
            </div>

            {/* Stat: Dias de ofensiva */}
            <div className="mx-auto w-full max-w-md flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.05] sm:max-w-none sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 sm:h-11 sm:w-11">
                <Flame size={20} className="text-[#DC2626]" />
              </div>
              <div>
                <p className="text-4xl font-black tracking-tight text-slate-800 sm:text-5xl">12</p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Dias de ofensiva
                </p>
              </div>
            </div>

            {/* Stat: Reações descobertas */}
            <div className="mx-auto w-full max-w-md flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.05] sm:max-w-none sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 sm:h-11 sm:w-11">
                <Activity size={20} className="text-slate-500" />
              </div>
              <div>
                <p className="text-4xl font-black tracking-tight text-slate-800 sm:text-5xl">158</p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Reações descobertas
                </p>
              </div>
            </div>

            {/* Card Nível — 2 cols em sm+, 2 cols em lg */}
            <div className="mx-auto w-full max-w-md flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.05] sm:col-span-2 sm:max-w-none sm:gap-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 sm:h-11 sm:w-11">
                  <Zap size={20} className="text-[#DC2626]" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Sua posição
                  </p>
                  <p className="text-xl font-black text-slate-800 sm:text-2xl">
                    Nível {nivelAtual}
                  </p>
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Alquimista Sênior
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#DC2626] transition-all duration-700"
                  style={{ width: mounted ? `${porcentagemNivel}%` : "0%" }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {Math.round(porcentagemNivel)}% concluído
                </p>
                <span className="flex items-center gap-1 text-xs font-black text-[#DC2626]">
                  <Zap size={11} />
                  {xpAtual.toLocaleString("pt-BR")} XP
                </span>
              </div>
            </div>

            {/* Card Medalhas — 2 cols em sm+, 2 cols em lg */}
            <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.05] sm:col-span-2 sm:max-w-none">
              <div className="relative overflow-hidden bg-[#DC2626] px-4 py-3 sm:px-5 sm:py-4">
                <div aria-hidden className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
                <div className="relative flex items-center gap-2">
                  <Medal size={14} className="text-white" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-white">
                    Medalhas de Mérito
                  </h3>
                </div>
              </div>
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { icon: Trophy, label: "Mestre do Lab", unlocked: true },
                    { icon: Flame, label: "Persistente", unlocked: true },
                    { icon: Trophy, label: "Nobel em Potencial", unlocked: false },
                  ].map(({ icon: Icon, label, unlocked }) => (
                    <div key={label} className="flex flex-col items-center gap-2 text-center">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-200 hover:-translate-y-0.5 sm:h-14 sm:w-14 ${
                          unlocked
                            ? "bg-red-50 ring-1 ring-red-200"
                            : "opacity-35 bg-slate-50 ring-1 ring-slate-200"
                        }`}
                      >
                        <Icon
                          size={20}
                          className={unlocked ? "text-[#DC2626]" : "text-slate-300"}
                        />
                      </div>
                      <p
                        className={`text-[9px] font-black uppercase leading-tight tracking-wide sm:text-[10px] ${
                          unlocked ? "text-slate-600" : "text-slate-400"
                        }`}
                      >
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                      Próximo desbloqueio
                    </p>
                    <p className="text-sm font-black text-[#DC2626]">6 / 10</p>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[60%] rounded-full bg-[#DC2626]" />
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                    Continue realizando experimentos para desbloquear novas medalhas.
                  </p>
                </div>
              </div>
            </div>

            {/* Histórico — 2 cols em sm+, 2 cols em lg */}
            <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.05] sm:col-span-2 sm:max-w-none">
              <div className="flex items-center justify-between px-4 pt-4 sm:px-5 sm:pt-5">
                <div className="flex items-center gap-2">
                  <FlaskConical size={13} className="text-[#DC2626]" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-500">
                    Histórico de Lab
                  </h3>
                </div>
                <button className="flex items-center gap-0.5 text-xs font-bold text-[#DC2626] transition hover:opacity-70">
                  Ver tudo <ChevronRight size={12} />
                </button>
              </div>
              <div className="mt-3 flex flex-col divide-y divide-slate-100">
                {historico.map(({ icon: Icon, nome, meta, xp, resultado }) => (
                  <div
                    key={nome}
                    className="flex items-center justify-between gap-2 px-4 py-3 transition-colors hover:bg-rose-50/30 sm:gap-0 sm:px-5 sm:py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 sm:h-10 sm:w-10">
                        <Icon size={16} className="text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-800">{nome}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-400">{meta}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-black text-[#DC2626]">{xp}</p>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {resultado}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pb-2" />
            </div>

            {/* Curiosidade — 2 cols em sm+, 2 cols em lg */}
            <div className="mx-auto w-full max-w-md rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm sm:col-span-2 sm:max-w-none sm:p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 sm:h-10 sm:w-10">
                  <span className="text-base sm:text-lg">💡</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-500">
                    Você sabia?
                  </p>
                  <p className="text-sm font-black text-slate-800">Curiosidade Química</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">{curiosidades[curioIdx]}</p>
            </div>

          </div>
        </section>

        {/* ── MENU MOBILE (removido: bloco sobrando) ── */}
      </main>
    </>
  )
}