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
} from "lucide-react"

const XP_STORAGE_KEY = "dominoQuimicoXp"
const XP_POR_NIVEL = 1000
const NIVEL_BASE = 42

export default function DesempenhoPage() {
  const router = useRouter()

  const [xpAtual, setXpAtual] = useState(12450)

  useEffect(() => {
    const valor = window.localStorage.getItem(XP_STORAGE_KEY)

    if (valor) {
      const parsed = Number.parseInt(valor, 10)

      if (!Number.isNaN(parsed)) {
        setXpAtual(parsed)
      }
    }
  }, [])

  const { nivelAtual, porcentagemNivel } = useMemo(() => {
    const nivelGanho = Math.floor(xpAtual / XP_POR_NIVEL)
    const xpRestante = xpAtual % XP_POR_NIVEL
    const porcentagem = (xpRestante / XP_POR_NIVEL) * 100

    return {
      nivelAtual: NIVEL_BASE + nivelGanho,
      porcentagemNivel: porcentagem,
    }
  }, [xpAtual])

  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="relative flex items-center justify-center py-4">

            {/* LOGO + TITULO */}
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Dominó Químico"
                width={42}
                height={42}
                className="h-10 w-10 object-contain"
              />

              <h1 className="text-xl font-black tracking-tight text-slate-800">
                Dominó <span className="text-red-600">Químico</span>
              </h1>
            </div>

            {/* BOTAO SAIR */}
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

      <main className="min-h-screen bg-[#F5F6F8]">
        {/* CONTEÚDO */}
        <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* TOPO */}
          <div>
            <h2 className="text-3xl font-black tracking-[-0.04em] text-[#2F2F2F] sm:text-4xl lg:text-6xl">
              Meu Desempenho
            </h2>

            <div className="mt-4 flex items-start gap-3">
              <div className="mt-2 h-[4px] w-10 rounded-full bg-[#FCA5A5]" />

              <p className="max-w-[700px] text-sm leading-relaxed text-[#64748B] sm:text-base">
                Cada reação descoberta aproxima você de se tornar um verdadeiro mestre da química.
                Continue praticando, evoluindo e desbloqueando novos conhecimentos no laboratório.
              </p>
            </div>
          </div>

          {/* GRID */}
          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            {/* ESQUERDA */}
            <div className="flex flex-col gap-6">
              {/* XP */}
              <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.06)] sm:p-6 lg:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#94A3B8]">
                      Potencial Atômico (XP)
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <h1 className="text-5xl font-black tracking-[-0.06em] text-[#1E293B] sm:text-6xl lg:text-7xl">
                        12.450
                      </h1>

                      <div className="rounded-full bg-[#FF2E63] px-4 py-2 text-sm font-black text-white shadow-lg sm:text-base">
                        +450 XP
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 h-3 w-3 rounded-full bg-[#DC2626]" />
                </div>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#3A3A3A] sm:text-2xl">
                      Cientista Nível {nivelAtual}
                    </h3>

                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#8B8B8B] sm:text-sm">
                      Protocolo: Alquimista Senior
                    </p>
                  </div>

                  <p className="text-xl font-black text-[#DC2626] sm:text-2xl">
                    85%
                  </p>
                </div>

                {/* XP BAR */}
                <div className="mt-5 h-4 overflow-hidden rounded-full bg-[#ECEFF3] shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#DC2626] to-[#FF3B5C] transition-all duration-700"
                    style={{
                      width: `${porcentagemNivel}%`,
                    }}
                  />
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[#64748B]">
                  Continue jogando para desbloquear novos protocolos químicos, medalhas especiais e novos níveis no laboratório.
                </p>
              </div>

              {/* STATS */}
              <div className="grid gap-6 sm:grid-cols-2">
                {/* CARD */}
                <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F8F8]">
                    <Flame className="text-[#DC2626]" size={24} />
                  </div>

                  <h3 className="mt-5 text-5xl font-black tracking-[-0.04em] text-[#1E293B]">
                    12
                  </h3>

                  <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-[#64748B]">
                    Dias de Ofensiva
                  </p>
                </div>

                {/* CARD */}
                <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F8F8]">
                    <Activity className="text-[#64748B]" size={24} />
                  </div>

                  <h3 className="mt-5 text-5xl font-black tracking-[-0.04em] text-[#1E293B]">
                    158
                  </h3>

                  <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-[#64748B]">
                    Reações Descobertas
                  </p>
                </div>
              </div>

              {/* HISTÓRICO */}
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="text-[#DC2626]" size={18} />

                    <h3 className="text-lg font-black uppercase tracking-[0.10em] text-[#555] sm:text-xl">
                      Histórico de Lab
                    </h3>
                  </div>

                  <button className="text-sm font-semibold text-[#DC2626] transition hover:opacity-70">
                    Ver tudo
                  </button>
                </div>

                <div className="space-y-4">
                  {/* ITEM */}
                  <div className="flex flex-col gap-5 rounded-[28px] border border-[#E5E7EB] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#FBCACA] hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F8F8]">
                        <FlaskConical className="text-[#64748B]" size={24} />
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-[#2F2F2F] sm:text-xl">
                          Titulação Ácido-Base
                        </h4>

                        <p className="mt-1 text-sm text-[#64748B]">
                          Hoje • 14:30 • Protocolo Médio
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xl font-black text-[#FF2E63] sm:text-2xl">
                        +350 XP
                      </p>

                      <p className="mt-1 text-xs uppercase tracking-wide text-[#8B8B8B]">
                        Excelente
                      </p>
                    </div>
                  </div>

                  {/* ITEM */}
                  <div className="flex flex-col gap-5 rounded-[28px] border border-[#E5E7EB] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#FBCACA] hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F8F8]">
                        <Flame className="text-[#64748B]" size={24} />
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-[#2F2F2F] sm:text-xl">
                          Combustão de Magnésio
                        </h4>

                        <p className="mt-1 text-sm text-[#64748B]">
                          Ontem • 10:15 • Protocolo Difícil
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xl font-black text-[#FF2E63] sm:text-2xl">
                        +520 XP
                      </p>

                      <p className="mt-1 text-xs uppercase tracking-wide text-[#8B8B8B]">
                        Perfeito
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DIREITA */}
            <div className="flex flex-col gap-6">
              {/* MEDALHAS */}
              <div className="rounded-[32px] border border-[#ECECEC] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] sm:p-6">
                <div className="flex items-center gap-2">
                  <Medal className="text-[#DC2626]" size={16} />

                  <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[#555]">
                    Medalhas de Mérito
                  </h3>
                </div>

                {/* MEDALHAS */}
                <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3">
                  {/* MEDALHA 1 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#F8B4B4] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 sm:h-24 sm:w-24">
                      <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full border border-[#F3D1D1] sm:h-[78px] sm:w-[78px]">
                        <Trophy className="text-[#DC2626]" size={26} />
                      </div>
                    </div>

                    <p className="mt-4 text-[11px] font-black uppercase tracking-[0.10em] text-[#777]">
                      Mestre do Lab
                    </p>
                  </div>

                  {/* MEDALHA 2 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#F8B4B4] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 sm:h-24 sm:w-24">
                      <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full border border-[#F3D1D1] sm:h-[78px] sm:w-[78px]">
                        <Flame className="text-[#DC2626]" size={26} />
                      </div>
                    </div>

                    <p className="mt-4 text-[11px] font-black uppercase tracking-[0.10em] text-[#777]">
                      Persistente
                    </p>
                  </div>

                  {/* MEDALHA BLOQUEADA */}
                  <div className="flex flex-col items-center text-center opacity-40">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-[#DADADA] bg-[#FAFAFA] sm:h-24 sm:w-24">
                      <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full border border-dashed border-[#DADADA] sm:h-[78px] sm:w-[78px]">
                        <Trophy className="text-[#BDBDBD]" size={26} />
                      </div>
                    </div>

                    <p className="mt-4 text-[11px] font-black uppercase tracking-[0.10em] text-[#B5B5B5]">
                      Nobel em Potencial
                    </p>
                  </div>
                </div>

                {/* PROGRESSO */}
                <div className="mt-8 border-t border-[#F1F1F1] pt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8B8B8B]">
                      Próximo desbloqueio
                    </p>

                    <p className="text-sm font-black text-[#DC2626]">
                      6/10
                    </p>
                  </div>

                  {/* BARRA */}
                  <div className="h-[6px] overflow-hidden rounded-full bg-[#EFEFEF]">
                    <div className="h-full w-[60%] rounded-full bg-[#DC2626]" />
                  </div>

                  {/* MENSAGEM */}
                  <p className="mt-5 text-sm leading-relaxed text-[#64748B]">
                    Continue realizando experimentos e desafios para desbloquear novas medalhas e evoluir no laboratório químico.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MENU MOBILE */}
        <nav className="sticky bottom-0 z-40 border-t border-[#E5E7EB] bg-white pb-safe lg:hidden">
          <div className="grid grid-cols-3">
            <button className="flex flex-col items-center gap-1 py-4 text-[#888]">
              <Gamepad2 size={22} />

              <span className="text-[11px] font-semibold uppercase tracking-wide">
                Play
              </span>
            </button>

            <button className="flex flex-col items-center gap-1 py-4 text-[#888]">
              <Users size={22} />

              <span className="text-[11px] font-semibold uppercase tracking-wide">
                Lobby
              </span>
            </button>

            <button className="flex flex-col items-center gap-1 py-4 text-[#DC2626]">
              <BarChart3 size={22} />

              <span className="text-[11px] font-semibold uppercase tracking-wide">
                Scores
              </span>
            </button>
          </div>
        </nav>
      </main>
    </>
  )
}
