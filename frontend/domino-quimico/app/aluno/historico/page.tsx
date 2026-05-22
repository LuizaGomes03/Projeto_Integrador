"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { FlaskConical, Flame } from "lucide-react"
import Image from "next/image"

const historico = [
  { icon: FlaskConical, titulo: "Titulação Ácido-Base", detalhe: "Hoje · 14:30 · Protocolo Médio", xp: "+350 XP", selo: "Excelente" },
  { icon: Flame, titulo: "Combustão de Magnésio", detalhe: "Ontem · 10:15 · Protocolo Difícil", xp: "+520 XP", selo: "Perfeito" },
]

export default function HistoricoPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_15%_60%,#ffd6d6_0%,transparent_45%),radial-gradient(ellipse_at_85%_10%,#ffc1c1_0%,transparent_40%),#ffe6e8]">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image src="/logo.png" alt="Dominó Químico" width={36} height={36} className="h-8 w-8 sm:h-9 sm:w-9" />
              <h1 className="text-lg sm:text-xl font-black text-slate-800">Histórico de Laboratório</h1>
            </div>
            <button onClick={() => router.push('/aluno')} className="rounded bg-red-500 px-3 py-1 text-sm font-semibold text-white">Voltar</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-800">Todas as experiências</h2>
          <p className="mt-2 text-sm text-slate-500">Lista completa de partidas e experimentos realizados.</p>
        </div>

        <div className="space-y-4">
          {historico.map((h) => {
            const Icon = h.icon
            return (
              <div key={h.titulo} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-rose-50 text-[#DC2626]"><Icon size={18} /></div>
                  <div>
                    <div className="font-black text-slate-800">{h.titulo}</div>
                    <div className="text-xs text-slate-400">{h.detalhe}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-[#DC2626]">{h.xp}</div>
                  <div className="text-[10px] text-slate-400 uppercase">{h.selo}</div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
