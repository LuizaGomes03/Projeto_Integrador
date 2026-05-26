"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { FlaskConical, LogOut, Copy, Check, Clock, Play, DoorOpen, UserPlus } from "lucide-react"

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type Player = { id: number; nome: string }

type Room = {
  code: string
  hostId: number
  createdAt: string
  players: Player[]
  status: "waiting" | "playing"
}

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const MAX_PLAYERS = 4
const POLL_INTERVAL_MS = 1500
const SCIENTIST_AVATARS = ["🧑‍🔬", "👩‍🔬", "🧪", "⚗️", "🔬", "🧬", "👨‍🔬", "🧫"]

function getAvatar(index: number) {
  return SCIENTIST_AVATARS[index % SCIENTIST_AVATARS.length]
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function SalaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Bug fix: sessionStorage is browser-only. Reading it directly during render
  // causes two problems:
  //   1. On the server (SSR), window doesn't exist → playerId = -99 always.
  //   2. Even on the client, the value is captured once at the first render, so
  //      if sessionStorage was written just before navigation it may be stale.
  // The backend receives usuarioId:-99, finds no user with that id, and the
  // FK insert on sala_jogadores throws a constraint error → 500, or the sala
  // lookup returns an unexpected state → 404. This is the root cause of the
  // "Sala não encontrada" screen even when the room exists.
  //
  // Fix: initialise from URL params (safe on server + client) and hydrate from
  // sessionStorage in a useEffect that runs only after mount. The /entrar fetch
  // is gated on clientReady so it never fires with the -99 sentinel.
  const nomeParm = searchParams.get("jogador")
  const salaParm = searchParams.get("sala")

  const [playerName, setPlayerName] = useState(nomeParm ?? "Cientista")
  const [playerId, setPlayerId] = useState<number>(-99)
  const [roomCode, setRoomCode] = useState((salaParm ?? "").toUpperCase())
  const [clientReady, setClientReady] = useState(false)

  useEffect(() => {
    const storedName = sessionStorage.getItem("dominoNome")
    const storedId = sessionStorage.getItem("dominoUserId")
    const storedSala = sessionStorage.getItem("dominoSala")
    if (!nomeParm && storedName) setPlayerName(storedName)
    if (storedId) setPlayerId(Number(storedId))
    if (!salaParm && storedSala) setRoomCode(storedSala.toUpperCase())
    setClientReady(true)
  }, [nomeParm, salaParm])

  const [room, setRoom] = useState<Room | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [iniciando, setIniciando] = useState(false)
  const [erro, setErro] = useState("")
  const [entrando, setEntrando] = useState(true)

  // Bug fix: entradaFeita was a ref, but refs don't trigger re-renders or
  // re-run useEffect. The polling effect checked entradaFeita.current on mount
  // (always false at that point) and never re-ran, so polling never started.
  // Using a state variable makes React re-run the polling effect when entry completes.
  const [entradaFeita, setEntradaFeita] = useState(false)

  // ─── ENTRAR NA SALA VIA BACKEND ──────────────────────────────────────────

  useEffect(() => {
    // Gate: wait until sessionStorage has been read (clientReady) and we have a
    // real playerId before attempting to join. Without this guard the POST fires
    // with usuarioId:-99 on the very first render.
    if (!roomCode || !clientReady || playerId === -99 || entradaFeita) return

    const entrar = async () => {
      try {
        // Tenta entrar na sala
        const res = await fetch(`${API_URL}/api/salas/${roomCode}/entrar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuarioId: playerId }),
        })

        if (res.status === 404) {
          setErro("Sala não encontrada ou já encerrada.")
          setEntrando(false)
          return
        }

        if (!res.ok) {
          const data = await res.json()
          setErro(data.erro ?? "Erro ao entrar na sala.")
          setEntrando(false)
          return
        }

        const data: Room = await res.json()
        setRoom(data)
        setIsHost(data.hostId === playerId)
        setEntradaFeita(true)
        setEntrando(false)
      } catch {
        setErro("Sem conexão com o servidor.")
        setEntrando(false)
      }
    }

    entrar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, clientReady, playerId])

  // ─── POLLING — busca estado da sala periodicamente ───────────────────────

  useEffect(() => {
    if (!roomCode || !entradaFeita) return

    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/api/salas/${roomCode}`)

        if (!res.ok) {
          setErro("A sala foi encerrada pelo anfitrião.")
          return
        }

        const data: Room = await res.json()
        setRoom(data)
        setIsHost(data.hostId === playerId)

        // Se a partida foi iniciada, redireciona para o jogo online
        if (data.status === "playing") {
          router.push(
            `/jogo/jogo-online?jogador=${encodeURIComponent(playerName)}&sala=${roomCode}`
          )
        }
      } catch {
        // silencioso — tenta no próximo tick
      }
    }

    const firstTick = window.setTimeout(poll, 500)
    const interval = window.setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      window.clearTimeout(firstTick)
      window.clearInterval(interval)
    }
  }, [roomCode, playerName, playerId, router, entradaFeita])

  // ─── COPIAR CÓDIGO ────────────────────────────────────────────────────────

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // silencioso
    }
  }

  // ─── INICIAR PARTIDA ──────────────────────────────────────────────────────

  const iniciarPartida = async () => {
    if (!isHost || iniciando) return
    setIniciando(true)

    try {
      const res = await fetch(`${API_URL}/api/partidas/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigoSala: roomCode }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.erro ?? "Erro ao iniciar a partida.")
        setIniciando(false)
        return
      }

      // Redireciona — os outros jogadores são redirecionados pelo polling
      router.push(
        `/jogo/jogo-online?jogador=${encodeURIComponent(playerName)}&sala=${roomCode}`
      )
    } catch {
      alert("Sem conexão com o servidor.")
      setIniciando(false)
    }
  }

  // ─── SAIR DA SALA ─────────────────────────────────────────────────────────

  const sairDaSala = () => {
    // Não há endpoint de "sair" — apenas redireciona
    // O jogador some da sala na próxima vez que o host iniciar (não está na lista ativa)
    sessionStorage.removeItem("dominoNome")
    sessionStorage.removeItem("dominoSala")
    router.push("/aluno")
  }

  // ─── ESTADO DE ERRO ───────────────────────────────────────────────────────

  if (erro) {
    return (
      <div
        className="min-h-screen w-full px-4"
        style={{
          background:
            "radial-gradient(ellipse at 15% 60%, #ffd6d6 0%, transparent 45%), radial-gradient(ellipse at 85% 10%, #ffc1c1 0%, transparent 40%), #ffe6e8",
        }}
      >
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-md">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <FlaskConical size={26} />
            </div>
            <p className="text-lg font-black text-slate-800">{erro}</p>
            <button
              onClick={() => router.push("/aluno")}
              className="mt-6 rounded-2xl bg-[#DC2626] px-6 py-3 font-black text-white transition hover:brightness-105"
            >
              Voltar ao Menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── ESTADO DE CARREGANDO ─────────────────────────────────────────────────

  if (entrando || !room) {
    return (
      <div
        className="min-h-screen w-full"
        style={{
          background:
            "radial-gradient(ellipse at 15% 60%, #ffd6d6 0%, transparent 45%), radial-gradient(ellipse at 85% 10%, #ffc1c1 0%, transparent 40%), #ffe6e8",
        }}
      >
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="animate-pulse text-4xl">🧪</span>
            <p className="text-sm font-bold text-slate-500">Entrando na sala…</p>
          </div>
        </div>
      </div>
    )
  }

  // ─── RENDER PRINCIPAL ─────────────────────────────────────────────────────

  const players = room.players
  const emptySlots = Math.max(0, MAX_PLAYERS - players.length)
  const podeIniciar = isHost && players.length >= 2

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="w-full px-6 lg:px-12">
          {/* Mobile */}
          <div className="py-3 sm:py-4 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <Image
                src="/etec_santo_andre.png"
                alt="ETEC Santo André"
                width={112}
                height={38}
                className="h-8 w-auto object-contain"
                priority
              />
              <button
                onClick={sairDaSala}
                className="flex items-center justify-center rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
                aria-label="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Image src="/logo.png" alt="Dominó Químico" width={36} height={36} className="h-8 w-8 object-contain" />
              <h1 className="text-xl font-black tracking-tight text-slate-800">
                Dominó <span className="text-red-600">Químico</span>
              </h1>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4 items-center py-5">
            <div className="flex items-center justify-start">
              <Image
                src="/etec_santo_andre.png"
                alt="ETEC Santo André"
                width={150}
                height={52}
                className="h-12 w-auto object-contain"
                priority
              />
            </div>
            <div className="flex items-center justify-center gap-4">
              <Image src="/logo.png" alt="Dominó Químico" width={48} height={48} className="h-12 w-12 object-contain" />
              <h1 className="text-3xl font-black tracking-tight text-slate-800">
                Dominó <span className="text-red-600">Químico</span>
              </h1>
            </div>
            <div className="flex justify-end">
              <button
                onClick={sairDaSala}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
              >
                <LogOut size={16} />
                Sair da Sala
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className="min-h-screen w-full"
        style={{
          background:
            "radial-gradient(ellipse at 15% 60%, #ffd6d6 0%, transparent 45%), radial-gradient(ellipse at 85% 10%, #ffc1c1 0%, transparent 40%), #ffe6e8",
        }}
      >
        <main className="relative mx-auto w-full max-w-2xl px-4 pt-6 pb-12 sm:px-6 lg:pt-8">

          {/* Título */}
          <div className="mx-auto mb-8 max-w-xl text-center">
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-rose-600 shadow-sm">
              <FlaskConical size={12} />
              Laboratório Colaborativo
            </p>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Sala de Espera</h2>
          </div>

          {/* Card principal */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">

            {/* Código da sala */}
            <div className="relative overflow-hidden bg-[#DC2626] px-6 py-7 text-center">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -left-6 -bottom-8 h-24 w-24 rounded-full bg-white/10" />
              <p className="relative mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-rose-200">Código da Sala</p>
              <div className="relative inline-flex items-center gap-3 rounded-2xl bg-white/15 px-6 py-4">
                <span className="font-mono text-4xl font-black tracking-[0.22em] text-white">{roomCode}</span>
                <button
                  onClick={copiarCodigo}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${copiado ? "bg-green-400/30 text-green-200" : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  aria-label="Copiar código"
                >
                  {copiado ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <div className="relative mt-4 flex items-center justify-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                <span className="text-xs font-bold text-rose-100">
                  {isHost ? "Aguardando jogadores entrarem…" : "Aguardando o anfitrião iniciar…"}
                </span>
              </div>
            </div>

            {/* Lista de jogadores */}
            <div className="px-6 py-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-rose-500">Jogadores na Sala</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                  {players.length} / {MAX_PLAYERS}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {players.map((player, idx) => {
                  const isCurrentPlayer = player.id === playerId
                  const isRoomHost = player.id === room.hostId
                  return (
                    <div
                      key={player.id}
                      className={`flex flex-col items-center rounded-2xl p-4 text-center ${isRoomHost
                        ? "border-2 border-[#DC2626] bg-rose-50"
                        : isCurrentPlayer
                          ? "border border-rose-200 bg-rose-50/60"
                          : "border border-slate-100 bg-slate-50"
                        }`}
                    >
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-2xl">
                        {getAvatar(idx)}
                      </div>
                      <p className="w-full truncate text-sm font-black text-slate-800">
                        {player.nome}
                        {isCurrentPlayer && <span className="text-rose-400"> (você)</span>}
                      </p>
                      {isRoomHost && (
                        <span className="mt-1.5 rounded-md bg-[#DC2626] px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                          Anfitrião
                        </span>
                      )}
                    </div>
                  )
                })}

                {Array.from({ length: emptySlots }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 p-4 text-center opacity-50"
                  >
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <Clock size={20} className="text-slate-400" />
                    </div>
                    <p className="text-xs font-semibold text-slate-400">Aguardando…</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 border-t border-slate-100 px-6 py-5">
              {isHost ? (
                <>
                  <button
                    onClick={iniciarPartida}
                    disabled={!podeIniciar || iniciando}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#DC2626] px-5 py-3.5 font-black text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Play size={18} />
                    {iniciando ? "Iniciando…" : "Iniciar Partida"}
                  </button>
                  <button
                    onClick={sairDaSala}
                    className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 font-bold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <DoorOpen size={18} />
                    <span className="hidden sm:inline">Encerrar Sala</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={sairDaSala}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 font-bold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  <DoorOpen size={18} />
                  Sair da Sala
                </button>
              )}
            </div>
          </div>

          {/* Dica */}
          <div className="mt-5 flex items-start gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
              <UserPlus size={20} />
            </div>
            <div>
              {isHost ? (
                <>
                  <p className="text-sm font-black text-slate-800">Compartilhe o código com seus colegas</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    Com pelo menos 2 jogadores, o botão <strong className="text-slate-700">Iniciar Partida</strong> fica disponível.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-black text-slate-800">Você está na sala — aguarde o anfitrião</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    A partida começa automaticamente assim que o anfitrião clicar em Iniciar.
                  </p>
                </>
              )}
            </div>
          </div>

        </main>
      </div>
    </>
  )
}