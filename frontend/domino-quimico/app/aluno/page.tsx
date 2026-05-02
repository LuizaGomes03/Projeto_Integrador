"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { FlaskConical, LogIn, Orbit, BarChart3, LogOut, UserPlus } from "lucide-react"

const XP_STORAGE_KEY = "dominoQuimicoXp"
const ROOMS_STORAGE_KEY = "dominoQuimicoRooms"
const HOST_ROOM_CODE_KEY = "dominoQuimicoHostRoomCode"
const XP_POR_NIVEL = 1000
const NIVEL_BASE = 42
const PLAYER_NAME = "Cientista"

type Room = {
  code: string
  hostName: string
  createdAt: string
  players: string[]
  status: string
}

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""

  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }

  return code
}

function loadRooms(): Record<string, Room> {
  try {
    const raw = window.localStorage.getItem(ROOMS_STORAGE_KEY)
    if (!raw) {
      return {}
    }

    return JSON.parse(raw) as Record<string, Room>
  } catch {
    return {}
  }
}

function saveRooms(rooms: Record<string, Room>) {
  window.localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms))
}

export default function AlunoHome() {
  const router = useRouter()
  const [xpAtual, setXpAtual] = useState(0)
  const [criandoSala, setCriandoSala] = useState(false)
  const [mostrarModalEntrada, setMostrarModalEntrada] = useState(false)
  const [codigoSala, setCodigoSala] = useState("")

  const criarSala = async () => {
    try {
      setCriandoSala(true)

      const rooms = loadRooms()
      let code = generateRoomCode()

      while (rooms[code]) {
        code = generateRoomCode()
      }

      const room: Room = {
        code,
        hostName: PLAYER_NAME,
        createdAt: new Date().toISOString(),
        players: [PLAYER_NAME],
        status: "waiting",
      }

      rooms[code] = room
      saveRooms(rooms)
      window.sessionStorage.setItem(HOST_ROOM_CODE_KEY, code)
      router.push(`/sala/${code}`)
    } catch {
      alert("Nao foi possivel criar a sala agora.")
    } finally {
      setCriandoSala(false)
    }
  }

  const entrarSala = () => {
    const code = codigoSala.trim().toUpperCase()

    if (!code) {
      return
    }

    setMostrarModalEntrada(false)
    setCodigoSala("")
    window.sessionStorage.removeItem(HOST_ROOM_CODE_KEY)
    router.push(`/sala/${code}`)
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

  return (
    <div className="min-h-screen w-full bg-[#e9edf2]">
      <header className="w-full border-b border-slate-300 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Domino Químico" width={28} height={28} className="h-auto w-7" />
            <p className="text-2xl font-black tracking-tight text-slate-900">DOMINÓ QUÍMICO</p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm">
            <span className="text-base">👤</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-8 lg:py-10">
        <section className="rounded-[30px] border border-slate-200 bg-[#f1f4f8] p-6 shadow-lg lg:p-8">
          <div className="mb-7 flex items-start justify-between gap-4 border-b border-slate-200 pb-5 max-md:flex-col max-md:items-center">
            <div className="w-full text-center">
              <h1 className="text-4xl font-black tracking-tight text-slate-800 lg:text-5xl">Menu do Aluno</h1>
              <p className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-rose-600">
                <FlaskConical className="h-4 w-4" />
                Espaço de Aprendizagem Molecular
              </p>
            </div>

            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-400 transition hover:text-rose-600"
            >
              Sair
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <button
              onClick={criarSala}
              disabled={criandoSala}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <UserPlus className="h-5 w-5" />
              </span>
              <h2 className="text-2xl font-bold text-slate-800">{criandoSala ? "Criando Sala..." : "Criar Sala"}</h2>
              <p className="mt-2 text-base leading-7 text-slate-600">Inicie uma nova partida e convide seus colegas para o laboratório.</p>
            </button>

            <button
              onClick={() => setMostrarModalEntrada(true)}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
            >
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <LogIn className="h-5 w-5" />
              </span>
              <h2 className="text-2xl font-bold text-slate-800">Entrar em Sala</h2>
              <p className="mt-2 text-base leading-7 text-slate-600">Use um código de convite para participar de uma partida ativa.</p>
            </button>

            <button
              onClick={() => router.push("/jogo")}
              className="md:col-span-2 rounded-2xl border border-rose-500 bg-gradient-to-br from-rose-500 to-rose-600 p-6 text-left text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-105"
            >
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white">
                <Orbit className="h-5 w-5" />
              </span>
              <h2 className="text-3xl font-bold">Jogar Sozinho</h2>
              <p className="mt-2 text-base leading-7 text-rose-50">Pratique suas habilidades de ligações químicas contra a IA do laboratório.</p>
            </button>

            <button
              onClick={() => router.push("/aluno/desempenho")}
              className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
            >
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
                <BarChart3 className="h-5 w-5" />
              </span>
              <h2 className="text-2xl font-bold text-slate-800">Meu Desempenho</h2>
              <p className="mt-2 text-base leading-7 text-slate-600">Confira suas conquistas, nível atual e histórico de experimentos. Nível atual: {nivelAtual}.</p>
            </button>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-rose-600">
              <span>Progresso Molecular</span>
              <span>{xpNoNivel}/{XP_POR_NIVEL} XP</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-600 to-pink-500 transition-all duration-500"
                style={{ width: `${porcentagemNivel}%` }}
              />
            </div>
          </div>
        </section>
      </main>

      {mostrarModalEntrada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-black tracking-tight text-slate-800">Entrar em Sala</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Digite o código da sala para entrar sem usar a caixa de diálogo do navegador.</p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <label htmlFor="codigo-sala" className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Código da sala
              </label>
              <input
                id="codigo-sala"
                value={codigoSala}
                onChange={(e) => setCodigoSala(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    entrarSala()
                  }
                }}
                autoFocus
                placeholder="Ex.: ABC123"
                className="w-full bg-transparent text-lg font-semibold uppercase tracking-[0.2em] text-slate-800 outline-none placeholder:text-slate-300"
              />
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                onClick={() => {
                  setMostrarModalEntrada(false)
                  setCodigoSala("")
                }}
                className="rounded-full border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={entrarSala}
                className="rounded-full bg-rose-600 px-5 py-3 font-semibold text-white transition hover:bg-rose-700"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}