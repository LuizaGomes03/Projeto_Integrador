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

export default function DesempenhoPage() {
  const router = useRouter()
  const [xpAtual, setXpAtual] = useState(12450)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const valor = window.localStorage.getItem(XP_STORAGE_KEY)
    if (valor) {
      const parsed = Number.parseInt(valor, 10)
      if (!Number.isNaN(parsed)) setXpAtual(parsed)
    }
  }, [])

  const { nivelAtual, porcentagemNivel } = useMemo(() => {
    const nivelGanho = Math.floor(xpAtual / XP_POR_NIVEL)
    const xpRestante = xpAtual % XP_POR_NIVEL
    const porcentagem = (xpRestante / XP_POR_NIVEL) * 100
    return { nivelAtual: NIVEL_BASE + nivelGanho, porcentagemNivel: porcentagem }
  }, [xpAtual])

  return (
    <>
      {/* ── HEADER — inalterado ── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-center py-4">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Dominó Químico" width={42} height={42} className="h-10 w-10 object-contain" />
              <h1 className="text-xl font-black tracking-tight text-slate-800">
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
              className="absolute right-0 flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── FUNDO — igual ao AlunoHome ── */}
      <main
        className="min-h-screen w-full"
        style={{
          background:
            "radial-gradient(ellipse at 15% 60%, #ffe4e6 0%, transparent 50%), radial-gradient(ellipse at 85% 10%, #fecdd3 0%, transparent 45%), #fdf2f4",
        }}
      >
        {/* Moléculas decorativas — idênticas ao AlunoHome */}
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

       <section className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 overflow-hidden px-4 py-10 sm:px-6 lg:py-14">

          {/* ── TOPO ── */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => router.push("/aluno")}
              className="flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
            >
              <ArrowLeft size={15} />
              Voltar ao menu
            </button>

            <div>
              <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">
                <FlaskConical size={11} />
                Laboratório de progresso
              </p>
              <h2 className="text-5xl font-black tracking-tight text-slate-800 sm:text-6xl lg:text-7xl">
                Meu Desempenho
              </h2>
              <p className="mt-3 max-w-[560px] text-base leading-relaxed text-slate-400">
                Cada reação descoberta aproxima você de se tornar um verdadeiro mestre da química.
              </p>
            </div>
          </div>

          {/* ── GRID PRINCIPAL ── */}
          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">

            {/* ── COLUNA ESQUERDA ── */}
            <div className="flex flex-col gap-4">

              {/* XP Card */}
              <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/[0.06] sm:p-8">
                {/* blob decorativo — mesma lógica do card "Jogar Sozinho" */}
                <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-rose-50 opacity-70" />
                <div aria-hidden className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-rose-50 opacity-40" />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                      Potencial Atômico (XP)
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="text-4xl font-black tracking-tight text-slate-800 sm:text-6xl">
                        {xpAtual.toLocaleString("pt-BR")}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-[#DC2626] px-3.5 py-1.5 text-sm font-black text-white shadow">
                        <Zap size={13} />
                        +450 XP
                      </span>
                    </div>
                  </div>
                  {/* live dot */}
                  <span className="relative mt-1 flex h-3 w-3 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-[#DC2626]" />
                  </span>
                </div>

                <div className="relative mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xl font-black text-slate-800 sm:text-2xl">
                      Cientista Nível {nivelAtual}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Protocolo: Alquimista Sênior
                    </p>
                  </div>
                  <span className="text-2xl font-black text-[#DC2626]">
                    {Math.round(porcentagemNivel)}%
                  </span>
                </div>

                <div className="relative mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#DC2626] transition-all duration-700"
                    style={{ width: mounted ? `${porcentagemNivel}%` : "0%" }}
                  />
                </div>

                <p className="relative mt-4 text-sm leading-relaxed text-slate-400">
                  Continue jogando para desbloquear novos protocolos, medalhas e níveis no laboratório.
                </p>
              </div>

              {/* Stats */}
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Flame, value: "12", label: "Dias de ofensiva", accent: "#DC2626" },
                  { icon: Activity, value: "158", label: "Reações descobertas", accent: "#64748B" },
                ].map(({ icon: Icon, value, label, accent }) => (
                  <div
                    key={label}
                    className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/[0.06] transition-transform duration-200 hover:-translate-y-0.5 sm:p-7"
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: `${accent}18` }}
                    >
                      <Icon size={24} style={{ color: accent }} />
                    </div>
                    <div>
                      <p className="text-4xl font-black tracking-tight text-slate-800 sm:text-5xl">{value}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Histórico */}
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]">
                <div className="flex items-center justify-between px-6 pt-6">
                  <div className="flex items-center gap-2">
                    <FlaskConical size={15} className="text-[#DC2626]" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">
                      Histórico de Lab
                    </h3>
                  </div>
                  <button className="flex items-center gap-0.5 text-xs font-bold text-[#DC2626] transition hover:opacity-70">
                    Ver tudo <ChevronRight size={13} />
                  </button>
                </div>

                <div className="mt-4 flex flex-col divide-y divide-slate-100">
                  {historico.map(({ icon: Icon, nome, meta, xp, resultado }) => (
                    <div
                      key={nome}
                      className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-rose-50/30 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                          <Icon size={20} className="text-slate-500" />
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{nome}</p>
                          <p className="mt-0.5 text-xs text-slate-400">{meta}</p>
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-base font-black text-[#DC2626]">{xp}</p>
                        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {resultado}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pb-2" />
              </div>
            </div>

            {/* ── COLUNA DIREITA ── */}
            <div className="flex flex-col gap-4">

              {/* Medalhas */}
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]">
                {/* mini header vermelho igual ao "Jogar Sozinho" */}
                <div className="relative overflow-hidden bg-[#DC2626] px-6 py-5">
                  <div aria-hidden className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
                  <div className="relative flex items-center gap-2">
                    <Medal size={16} className="text-white" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-white">
                      Medalhas de Mérito
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                      { icon: Trophy, label: "Mestre do Lab", unlocked: true },
                      { icon: Flame, label: "Persistente", unlocked: true },
                      { icon: Trophy, label: "Nobel em Potencial", unlocked: false },
                    ].map(({ icon: Icon, label, unlocked }) => (
                      <div key={label} className="flex flex-col items-center gap-2.5 text-center">
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-200 hover:-translate-y-0.5 ${
                            unlocked
                              ? "bg-red-50 ring-1 ring-red-200"
                              : "opacity-35 bg-slate-50 ring-1 ring-slate-200"
                          }`}
                        >
                          <Icon size={24} className={unlocked ? "text-[#DC2626]" : "text-slate-300"} />
                        </div>
                        <p className={`text-[10px] font-black uppercase leading-tight tracking-wide ${unlocked ? "text-slate-600" : "text-slate-400"}`}>
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Progresso próxima medalha */}
                  <div className="mt-6 rounded-xl bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Próximo desbloqueio
                      </p>
                      <p className="text-sm font-black text-[#DC2626]">6 / 10</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full w-[60%] rounded-full bg-[#DC2626]" />
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-slate-400">
                      Continue realizando experimentos para desbloquear novas medalhas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card extra — resumo rápido de nível, para preencher a coluna */}
              <div className="rounded-2xl bg-[#DC2626] p-6 shadow-sm">
                <div aria-hidden className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-200">
                  Sua posição
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">Nível {nivelAtual}</span>
                </div>
                <p className="mt-1 text-sm text-rose-100">Alquimista Sênior</p>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{ width: mounted ? `${porcentagemNivel}%` : "0%" }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-rose-200">{Math.round(porcentagemNivel)}% para o próximo nível</p>
                  <span className="flex items-center gap-1 text-xs font-black text-white">
                    <Zap size={11} />
                    {xpAtual.toLocaleString("pt-BR")} XP
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── MENU MOBILE ── */}
        <nav className="sticky bottom-0 z-40 border-t border-slate-200 bg-white pb-safe lg:hidden">
          <div className="grid grid-cols-3">
            {[
              { icon: Gamepad2, label: "Play", active: false, action: () => {} },
              { icon: Users, label: "Lobby", active: false, action: () => {} },
              { icon: BarChart3, label: "Scores", active: true, action: () => {} },
            ].map(({ icon: Icon, label, active, action }) => (
              <button
                key={label}
                onClick={action}
                className={`flex flex-col items-center gap-1 py-4 transition-colors ${
                  active ? "text-[#DC2626]" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon size={22} />
                <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      </main>
    </>
  )
}
