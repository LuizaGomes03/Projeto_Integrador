"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"

const ROOMS_STORAGE_KEY = "dominoQuimicoRooms"

type Room = {
  code: string
  hostName: string
  createdAt: string
  players: string[]
  status: string
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

export default function SalaPage() {
  const router = useRouter()
  const params = useParams<{ code: string }>()
  const code = useMemo(() => String(params?.code ?? "").toUpperCase(), [params])

  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState("")
  const [room, setRoom] = useState<Room | null>(null)

  useEffect(() => {
    if (!code) {
      return
    }

    const carregarSala = async () => {
      try {
        setLoading(true)
        setErro("")

        const rooms = loadRooms()
        const existingRoom = rooms[code]

        if (existingRoom) {
          setRoom(existingRoom)
          return
        }

        const mockRoom: Room = {
          code,
          hostName: "Anfitriao",
          createdAt: new Date().toISOString(),
          players: [],
          status: "waiting",
        }

        rooms[code] = mockRoom
        saveRooms(rooms)
        setRoom(mockRoom)
      } catch {
        setErro("Nao foi possivel abrir essa sala.")
      } finally {
        setLoading(false)
      }
    }

    carregarSala()
  }, [code])

  return (
    <div className="min-h-screen w-full bg-[#e9edf2] px-6 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-black tracking-tight text-slate-800">Sala de Jogo</h1>
        <p className="mt-2 text-slate-500">Use este codigo para convidar outros jogadores.</p>

        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">Codigo da Sala</p>
          <p className="mt-2 text-4xl font-black tracking-[0.2em] text-rose-600">{code || "------"}</p>
        </div>

        {loading && <p className="mt-6 text-slate-500">Carregando sala...</p>}

        {!loading && erro && <p className="mt-6 text-red-600">{erro}</p>}

        {!loading && room && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-600">Anfitriao: <span className="font-semibold text-slate-800">{room.hostName}</span></p>
            <p className="mt-1 text-sm text-slate-600">Status: <span className="font-semibold text-slate-800">{room.status}</span></p>
            <p className="mt-1 text-sm text-slate-600">Jogadores conectados: <span className="font-semibold text-slate-800">{room.players.length + 1}</span></p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Modo local (mock) sem backend</p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => router.push("/aluno")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Voltar
          </button>
          <button
            onClick={() => alert("Em breve: iniciar partida multiplayer")}
            className="rounded-xl border border-rose-500 bg-rose-500 px-4 py-2 font-semibold text-white transition hover:bg-rose-600"
          >
            Iniciar Partida
          </button>
        </div>
      </div>
    </div>
  )
}
