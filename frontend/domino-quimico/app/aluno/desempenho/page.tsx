"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Beaker, Flame, History, Medal, Trophy, Users, Gamepad2, BarChart3 } from "lucide-react"

const historicoLab = [
{
titulo: "Titulado Acido-Base",
detalhe: "Hoje - 14:30 - Protocolo Medio",
xp: "+350 XP",
selo: "Excelente",
icone: Beaker,
},
{
titulo: "Combustao de Magnesio",
detalhe: "Ontem - 10:15 - Protocolo Dificil",
xp: "+520 XP",
selo: "Perfeito",
icone: Flame,
},
]

export default function DesempenhoPage() {
const router = useRouter()

return ( <div className="min-h-screen bg-[#eceff4]">

  <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10 lg:px-16 py-6">

    {/* HEADER */}
    <header className="mb-8 flex items-center justify-between rounded-2xl bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <Beaker className="h-5 w-5" />
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-slate-600">
          Domino <span className="text-rose-500">Quimico</span>
        </h1>
      </div>

      <button onClick={() => router.push("/aluno")}>
        <Image src="/logo.png" alt="Avatar" width={42} height={42} className="rounded-full" />
      </button>
    </header>

    {/* GRID PRINCIPAL */}
    <main className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">

      {/* ESQUERDA */}
      <section className="space-y-8">

        {/* TITULO */}
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-800">
            Meu Desempenho
          </h2>
          <p className="mt-2 text-slate-500">
            Sua evolução no laboratório de estratégia.
          </p>
        </div>

        {/* XP */}
        <div className="rounded-3xl bg-white p-8 md:p-10 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Potencial Atômico (XP)
          </p>

          <div className="mt-4 flex items-center gap-4">
            <p className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-800">
              12.450
            </p>

            <span className="rounded-full bg-rose-500 px-4 py-2 text-lg font-bold text-white">
              +450
            </span>
          </div>

          <div className="mt-6 h-3 bg-slate-200 rounded-full">
            <div className="h-3 w-[85%] bg-rose-500 rounded-full" />
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-5xl font-black text-slate-800">12</p>
            <p className="text-sm text-slate-400 mt-1">Dias de ofensiva</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-5xl font-black text-slate-800">158</p>
            <p className="text-sm text-slate-400 mt-1">Reações descobertas</p>
          </div>

        </div>

        {/* HISTORICO */}
        <div>
          <div className="mb-4 flex justify-between items-center">
            <p className="flex items-center gap-2 font-bold text-slate-500">
              <History className="h-4 w-4 text-rose-500" />
              Histórico de Lab
            </p>
            <button className="text-rose-500 text-sm font-bold">
              Ver tudo
            </button>
          </div>

          <div className="space-y-3">
            {historicoLab.map((item) => {
              const Icone = item.icone

              return (
                <div
                  key={item.titulo}
                  className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm"
                >
                  <div className="flex gap-3 items-center">
                    <Icone className="h-5 w-5 text-slate-500" />

                    <div>
                      <p className="font-bold text-slate-800">
                        {item.titulo}
                      </p>
                      <p className="text-sm text-slate-500">
                        {item.detalhe}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-rose-500 font-bold">
                      {item.xp}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.selo}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </section>

      {/* SIDEBAR */}
      <aside className="space-y-6 sticky top-6 h-fit">

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <p className="flex items-center gap-2 font-bold text-slate-500 mb-4">
            <Medal className="h-4 w-4 text-rose-500" />
            Medalhas
          </p>

          <div className="bg-slate-50 p-6 rounded-xl text-center">
            <Trophy className="mx-auto h-8 w-8 text-rose-500" />
            <p className="mt-2 font-bold text-slate-600">
              Mestre do Lab
            </p>
          </div>
        </div>

      </aside>

    </main>

  </div>
</div>

)
}
