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
  LogOut,
  ArrowLeft,
} from "lucide-react"

const XP_POR_NIVEL = 1000
const NIVEL_BASE = 1 

const curiosidades = [
  "O Carbono forma mais compostos do que qualquer outro elemento — é o coração da química orgânica.",
  "O Hidrogênio é o elemento mais livre e mais abundante do universo — é a base das estrelas.",
  "O Ouro é tão maleável que uma única onça pode ser esticada em mais de 300 metros de fio.",
  "O Mercúrio é o único metal que é líquido à temperatura ambiente.",
  "O Oxigênio suporta reações de combustão — sem ele, fogo não existe.",
]

export default function DesempenhoPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [curioIdx, setCurioIdx] = useState(() => Math.floor(Math.random() * curiosidades.length))

  // 🛠️ NOTA PARA O ARTHUR: 
  // Estes estados abaixo devem ser preenchidos com os dados vindos do seu banco de dados (Ex: Prisma, Supabase, etc.)
  // Você pode disparar um useEffect fazendo um fetch para /api/aluno/desempenho ou passar os dados inicialmente via props se preferir Server Components.
  const [xpAtual, setXpAtual] = useState(0)
  const [diasOfensiva, setDiasOfensiva] = useState(0)
  const [reacoesDescobertas, setReacoesDescobertas] = useState(0)
  const [proximoDesbloqueio, setProximoDesbloqueio] = useState(0)
  
  // 🛠️ NOTA PARA O ARTHUR: 
  // Tipifique essa Array com a estrutura de histórico de partidas que vem do banco (id, data, xpGanho, resultado, etc.)
  const [historico, setHistorico] = useState<any[]>([])
  
  // 🛠️ NOTA PARA O ARTHUR: 
  // O estado 'unlocked' deve mapear se o aluno já conquistou a medalha correspondente no banco de dados.
  const [medalhas, setMedalhas] = useState([
    { icon: Trophy, label: "Mestre do Lab", unlocked: false },
    { icon: Flame, label: "Persistente", unlocked: false },
    { icon: Trophy, label: "Nobel em Potencial", unlocked: false },
  ])

  useEffect(() => {
    setMounted(true)
    
    // 🛠️ NOTA PARA O ARTHUR:
    // Exemplo de integração provisória via localStorage que estava no código original.
    // Substitua esta lógica pela chamada da sua API / Banco de dados.
    // ex: fetch('/api/user/stats').then(res => res.json()).then(data => { setXpAtual(data.xp)... })
    const valorXp = window.localStorage.getItem("dominoQuimicoXp")
    if (valorXp) {
      const parsedXp = Number.parseInt(valorXp, 10)
      if (!Number.isNaN(parsedXp)) {
        setXpAtual(parsedXp)
        // Configure o restante dos dados do banco aqui...
      }
    }

    const rot = setInterval(() => setCurioIdx((i) => (i + 1) % curiosidades.length), 8000)
    return () => clearInterval(rot)
  }, [])

  // Cálculo matemático do nível atual baseado no XP acumulado no banco
  const { nivelAtual, porcentagemNivel } = useMemo(() => {
    const nivelGanho = Math.floor(xpAtual / XP_POR_NIVEL)
    const xpRestante = xpAtual % XP_POR_NIVEL
    const porcentagem = xpAtual === 0 ? 0 : (xpRestante / XP_POR_NIVEL) * 100
    return { nivelAtual: NIVEL_BASE + nivelGanho, porcentagemNivel: porcentagem }
  }, [xpAtual])

  // Lógica dinâmica de títulos/mensagens conforme o progresso do aluno
  const patenteAtual = useMemo(() => {
    if (xpAtual === 0) return "Cientista Iniciante"
    if (xpAtual < 2000) return "Alquimista em Evolução"
    if (xpAtual < 5000) return "Técnico de Soluções"
    if (xpAtual < 10000) return "Engenheiro Molecular"
    return "Mestre dos Elementos"
  }, [xpAtual])

  return (
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
      
      {/* HEADER INSTITUCIONAL - ETEC SANTO ANDRÉ */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-12">
          {/* Layout mobile */}
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
                  // 🛠️ NOTA PARA O ARTHUR: Adicione aqui a limpeza de cookies/sessões de autenticação do banco (Ex: NextAuth ou Supabase Auth)
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

          {/* Layout Desktop */}
          <div className="hidden items-center gap-3 py-4 sm:py-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4 lg:py-6">
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

            <div className="flex justify-end">
              <button
                onClick={() => {
                  // 🛠️ NOTA PARA O ARTHUR: Mesma limpeza de sessão comentada no bloco mobile acima
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

      {/* CONTAINER PRINCIPAL */}
      <main className="flex-1 w-full mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        
        <div className="mb-6 flex flex-col items-center gap-4 pt-4 sm:gap-6">
          <button
            onClick={() => router.push("/aluno")}
            className="self-start flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-xs transition hover:bg-slate-50 hover:text-slate-800"
          >
            <ArrowLeft size={13} />
            Voltar ao Menu
          </button>
          
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-rose-600 shadow-sm sm:px-4 sm:text-[11px] sm:tracking-[0.2em]">
            <FlaskConical size={13} className="text-rose-500" />
            Espaço de aprendizagem molecular
          </p>

          <h2 className="text-3xl text-center font-black tracking-tight text-slate-900 drop-shadow-sm sm:text-5xl lg:text-6xl">
            Meu Desenvolvimento
          </h2>
          <p className="text-sm text-slate-500 text-center sm:text-lg">
            Acompanhe suas conquistas e relatórios de laboratório.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          
          {/* COLUNA ESQUERDA (XP, Ofensiva, Reações e Histórico) */}
          <div className="space-y-6 md:col-span-2">
            
            {/* Card de XP Principal */}
            <div className="relative overflow-hidden rounded-2xl bg-[#DC2626] p-6 shadow-md text-white sm:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-base font-black uppercase tracking-widest text-rose-200 sm:text-[20px]">
                  Potencial Atômico (XP)
                </p>
                <span className="self-start inline-flex items-center rounded-full bg-white/20 px-3 py-0.5 text-xl font-bold sm:self-auto sm:text-[30px]">
                  Nível {nivelAtual}
                </span>
              </div>
              
              <div className="mt-4">
                <h3 className="text-4xl font-black tracking-tight sm:text-5xl">
                  {xpAtual.toLocaleString("pt-BR")} <span className="text-base font-normal text-rose-200 sm:text-lg">XP Total</span>
                </h3>
                {/* Texto dinâmico que muda conforme o nível do banco */}
                <p className="mt-2 text-xs font-medium text-rose-100 uppercase tracking-wide sm:text-sm">
                  {patenteAtual}
                </p>
              </div>

              <div className="mt-6">
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{ width: mounted ? `${porcentagemNivel}%` : "0%" }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-rose-200">
                  <span>{Math.round(porcentagemNivel)}% para o próximo nível</span>
                  <span>{xpAtual % XP_POR_NIVEL} / {XP_POR_NIVEL} XP</span>
                </div>
              </div>
            </div>

            {/* Sub-grid de Mini Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-xs ring-1 ring-black/[0.04]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <Flame size={22} className="text-[#DC2626]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800 sm:text-3xl">{diasOfensiva}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 sm:text-sm">Dias de Ofensiva</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-xs ring-1 ring-black/[0.04]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                  <Activity size={22} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800 sm:text-3xl">{reacoesDescobertas}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 sm:text-sm">Reações Descobertas</p>
                </div>
              </div>
            </div>

            {/* Histórico de Experimentos */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-xs ring-1 ring-black/[0.04]">
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <div className="flex items-center gap-2">
                  <FlaskConical size={14} className="text-[#DC2626]" />
                  <h4 className="text-xs font-black uppercase tracking-wider">Histórico de Lab</h4>
                </div>
              </div>

              {/* 🛠️ NOTA PARA O ARTHUR: 
                  Faça um .map() aqui na sua array de histórico real vinda do banco de dados 
                  para renderizar as linhas de partidas jogadas dinamicamente. */}
              {historico.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {historico.map((item, index) => (
                    <div key={item.id || index} className="p-4 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-bold text-slate-800">{item.nomeModo || "Partida Cooperativa"}</p>
                        <p className="text-xs text-slate-400">{new Date(item.data).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <span className="font-black text-green-600">+{item.xpGanho} XP</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center sm:p-12">
                  <div className="mx-auto w-full max-w-md rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 sm:p-8">
                    <p className="text-sm font-bold text-slate-700 sm:text-base">Nenhum experimento registrado.</p>
                    <p className="mt-2 text-xs text-slate-400 sm:text-sm">Quando você concluir partidas, seu histórico detalhado aparecerá aqui.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUNA DIREITA (Medalhas e Curiosidades) */}
          <div className="space-y-6">
            
            {/* Card de Conquistas */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-xs ring-1 ring-black/[0.04]">
              <div className="bg-[#DC2626] p-4 text-white">
                <div className="flex items-center gap-2">
                  <Medal size={24} className="sm:w-[30px] sm:h-[30px]" />
                  <h4 className="text-xs font-black uppercase tracking-wider">Medalhas de Mérito</h4>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  {medalhas.map(({ icon: Icon, label, unlocked }) => (
                    <div key={label} className="flex flex-col items-center gap-2 text-center">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all sm:h-14 sm:w-14 ${
                          unlocked
                            ? "bg-red-50 ring-1 ring-red-100"
                            : "bg-slate-50 opacity-40 ring-1 ring-slate-100"
                        }`}
                      >
                        <Icon size={18} className={unlocked ? "text-[#DC2626]" : "text-slate-400"} />
                      </div>
                      <span className="text-[10px] font-bold uppercase leading-tight text-slate-500 sm:text-[11px]">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-500">Próximo Desbloqueio</span>
                    <span className="font-black text-[#DC2626]">{proximoDesbloqueio}/10</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-[#DC2626] transition-all duration-300"
                      style={{ width: `${proximoDesbloqueio * 10}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Curiosidades Químicas */}
            <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/60 to-white p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">💡</span>
                <span className="text-xs font-black uppercase tracking-wider text-amber-600">Você Sabia?</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">{curiosidades[curioIdx]}</p>
            </div>

          </div>

        </div>
      </main>
    </div>
  )
}