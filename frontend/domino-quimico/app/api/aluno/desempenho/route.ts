import { NextResponse } from "next/server"

export async function GET() {
  const data = {
    xpTotal: 12450,
    xpHoje: 450,
    desempenho: 82,
    vitoriasSeguidas: 6,
    diasSeguidos: 12,
    reacoesDescobertas: 158,
    nivelTitulo: "Alquimista Sênior",
    medalhas: [
      { titulo: "Aprendiz de Laboratório", descricao: "Vença 3 partidas seguidas", desbloqueado: true, emoji: "🥉" },
      { titulo: "Pesquisador Estratégico", descricao: "Vença 5 partidas seguidas", desbloqueado: true, emoji: "🥈" },
      { titulo: "Mestre dos Elementos", descricao: "Vença 10 partidas seguidas", desbloqueado: false, emoji: "🥇" },
    ],
    historico: [
      { tipo: "titulação", nome: "Titulação Ácido-Base", meta: "Hoje · 14:30 · Protocolo Médio", xp: "+350 XP", resultado: "Excelente" },
      { tipo: "combustao", nome: "Combustão de Magnésio", meta: "Ontem · 10:15 · Protocolo Difícil", xp: "+520 XP", resultado: "Perfeito" },
    ],
  }

  return NextResponse.json(data)
}
