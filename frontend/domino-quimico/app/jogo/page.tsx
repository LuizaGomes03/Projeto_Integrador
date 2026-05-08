"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Settings, HelpCircle, LogOut, TriangleAlert } from "lucide-react"

/*
========================================================
ARTHUR - NOTAS DE IMPLEMENTAÇÃO
========================================================

IMPLEMENTAÇÕES FUTURAS:

- socket.io
- autenticação
- sincronização da sala
- jogadas em tempo real
- drag and drop
- regras do dominó
- timer
- reconnect
- chat
- ranking
- persistência da partida

O FRONT NÃO VALIDARÁ REGRAS.
O BACKEND SERÁ RESPONSÁVEL PELA LÓGICA.
========================================================
*/

function DominoPiece({
  top,
  bottom,
  selected = false,
  rotate = "0deg",
}: {
  top: string
  bottom: string
  selected?: boolean
  rotate?: string
}) {
  return (
    <div
      className={`
        flex
        h-[90px]
        w-[46px]
        flex-col
        overflow-hidden
        border
        bg-white
        shadow-md
        transition
        hover:-translate-y-2

        sm:h-[105px]
        sm:w-[52px]

        xl:h-[116px]
        xl:w-[58px]

        ${selected
          ? "border-[#2563EB] ring-2 ring-[#2563EB]"
          : "border-[#D7DCE2]"
        }
      `}
      style={{
        transform: `rotate(${rotate})`,
      }}
    >
      <div className="flex flex-1 items-center justify-center border-b border-[#D7DCE2] bg-[#EEF3FF] text-[20px] font-black text-[#2563EB] sm:text-[24px] xl:text-[26px]">
        {top}
      </div>

      <div className="flex flex-1 items-center justify-center bg-[#FFF1F1] text-[20px] font-black text-[#C62828] sm:text-[24px] xl:text-[26px]">
        {bottom}
      </div>
    </div>
  )
}

function PlayerCard({
  name,
  turn = false,
  connected = true,
}: {
  name: string
  turn?: boolean
  connected?: boolean
}) {
  return (
    <div
      className={`
        flex
        h-[72px]
        items-center
        justify-between
        border
        bg-white
        px-4
        shadow-sm

        ${turn
          ? "border-[#2563EB] ring-2 ring-[#2563EB]"
          : "border-[#D7DCE2]"
        }
      `}
    >
      <div>
        <p className="text-[15px] font-bold text-[#3A3A3A]">
          {name}
        </p>

        <p className="text-xs text-[#8A96A8]">
          {turn
            ? "Seu turno"
            : connected
              ? "Conectado"
              : "Desconectado"}
        </p>
      </div>

      <div
        className={`h-3 w-3 rounded-full ${connected ? "bg-[#22C55E]" : "bg-[#CBD5E1]"
          }`}
      />
    </div>
  )
}

export default function SalaJogoPage() {
  /*
  ========================================================
  TODO BACKEND
  ========================================================
  */
  const router = useRouter()

  const [showExitModal, setShowExitModal] = useState(false)
  const roomCode = "5821"

  const players = [
    {
      id: 1,
      name: "Você",
      turn: true,
      connected: true,
    },
    {
      id: 2,
      name: "Carlos",
      turn: false,
      connected: true,
    },
    {
      id: 3,
      name: "Ana",
      turn: false,
      connected: true,
    },
    {
      id: 4,
      name: "Bia",
      turn: false,
      connected: true,
    },
  ]

  /*
  TODO BACK:
  posições reais virão do backend/socket
  */

  const boardPieces = [
    {
      id: 1,
      top: "Na",
      bottom: "Cl",
      x: "42%",
      y: "38%",
      rotate: "-90deg",
    },
    {
      id: 2,
      top: "Cl",
      bottom: "O",
      x: "48%",
      y: "38%",
      rotate: "-90deg",
    },
    {
      id: 3,
      top: "O",
      bottom: "H",
      x: "54%",
      y: "31%",
      rotate: "38deg",
    },
    {
      id: 4,
      top: "H",
      bottom: "Na",
      x: "40%",
      y: "48%",
      rotate: "25deg",
    },
  ]

  /*
  TODO BACK:
  mão do jogador logado
  */

  const playerHand = [
    { id: 10, top: "O", bottom: "H" },
    { id: 11, top: "Na", bottom: "Cl" },
    { id: 12, top: "H", bottom: "O" },
    { id: 13, top: "Cl", bottom: "Na" },
    { id: 14, top: "O", bottom: "Cl" },
  ]

  const selectedPieceId = 10

  /*
  TODO BACK:
  socket.emit("game:play-piece")
  */

  const handlePlayPiece = (pieceId: number) => {
    console.log("Jogar peça:", pieceId)
  }

  return (
    <main className="min-h-screen bg-[#F2F4F7] text-[#3A3A3A]">

      {/* HEADER */}
      <header
        className="
    flex
    flex-col
    gap-4
    border-b
    border-[#D7DCE2]
    bg-white
    p-4

    lg:flex-row
    lg:items-center
    lg:justify-between
    lg:px-8
  "
      >

        {/* LOGO + TEXTO CENTRALIZADOS */}
        <div className="flex flex-1 items-center justify-center gap-4">

          <img
            src="/logo.png"
            alt="Dominó Químico"
            className="
      h-12
      object-contain

      sm:h-14
      lg:h-16
    "
          />

          <div className="text-center">
            <h1 className="text-[24px] font-black leading-none text-[#3A3A3A] sm:text-[28px]">
              Dominó <span className="text-[#EF2B2B]">Químico</span>
            </h1>

            <p className="mt-1 text-sm text-[#8A96A8]">
              Sala Multiplayer Educacional
            </p>
          </div>

        </div>

        {/* DIREITA */}
        <div className="flex items-center gap-3 lg:gap-5">

          {/* SALA */}
          <div className="border border-[#D7DCE2] bg-[#F8FAFC] px-4 py-2">

            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8A96A8]">
              Sala
            </p>

            <p className="text-[18px] font-black tracking-[0.18em] text-[#2563EB]">
              {roomCode}
            </p>
          </div>

          {/* CONFIG */}
          <button className="flex h-11 w-11 items-center justify-center border border-[#D7DCE2] bg-[#F8FAFC] text-[#64748B] transition hover:bg-[#EEF2F7]">
            <Settings size={21} />
          </button>

          {/* SAIR */}
          <button
            onClick={() => setShowExitModal(true)}
            className="flex h-11 w-11 items-center justify-center border border-[#D7DCE2] bg-[#F8FAFC] text-[#64748B] transition hover:bg-[#FEE2E2]"
          >
            <LogOut size={21} />
          </button>
        </div>

        {/* MODAL SAIR */}
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

            <div
              className="
        w-[92%]
        max-w-[520px]
        rounded-2xl
        bg-white
        p-8
        shadow-2xl
        animate-in
        fade-in
        zoom-in-95
      "
            >

              {/* ÍCONE */}
              <div className="mb-5 flex justify-center">

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FEF2F2]">
                  <TriangleAlert size={42} className="text-[#DC2626]" />
                </div>

              </div>

              {/* TÍTULO */}
              <h2 className="text-center text-[28px] font-black text-[#3A3A3A]">
                Deseja sair da partida?
              </h2>

              {/* TEXTO */}
              <p className="mt-5 text-center text-[16px] leading-relaxed text-[#64748B]">
                Você ainda está no meio de uma partida do Dominó Químico.
                <br />
                <br />
                Cada jogada é uma oportunidade de praticar química e melhorar seu desempenho.
                <br />
                <br />
                Se sair agora, seu progresso atual poderá ser perdido.
                <br />
                <br />
                Tem certeza que deseja voltar ao Menu do Aluno?
              </p>
              {/* BOTÕES */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                {/* CONTINUAR */}
                <button
                  onClick={() => setShowExitModal(false)}
                  className="
            flex-1
            rounded-xl
            border
            border-[#D7DCE2]
            bg-[#F8FAFC]
            px-6
            py-4
            font-bold
            text-[#3A3A3A]
            transition
            hover:bg-[#EEF2F7]
          "
                >
                  Continuar Jogando
                </button>

                {/* SAIR */}
                <button
                  onClick={() => router.push("/aluno")}
                  className="
            flex-1
            rounded-xl
            bg-[#DC2626]
            px-6
            py-4
            font-bold
            text-white
            shadow-lg
            transition
            hover:brightness-110
          "
                >
                  Sair da Partida
                </button>

              </div>
            </div>
          </div>
        )}
      </header>

      {/* MAIN */}
      <section
        className="
          grid
          min-h-[calc(100vh-78px)]
          grid-cols-1
          gap-4
          p-4

          xl:grid-cols-[240px_1fr_240px]
          xl:gap-6
          xl:p-6
        "
      >

        {/* LEFT */}
        <aside
          className="
            flex
            flex-col
            gap-4

            md:grid
            md:grid-cols-2

            xl:flex
          "
        >
          <PlayerCard
            name={players[0].name}
            turn={players[0].turn}
            connected={players[0].connected}
          />

          <PlayerCard
            name={players[1].name}
            turn={players[1].turn}
            connected={players[1].connected}
          />

          <div className="border border-[#D7DCE2] bg-white p-5 shadow-sm xl:mt-auto">
            <p className="text-[12px] font-black uppercase tracking-[0.22em] text-[#8A96A8]">
              Objetivo
            </p>

            <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
              Relacione corretamente as funções químicas e elimine todas as peças da mão.
            </p>
          </div>
        </aside>

        {/* BOARD */}
        <div className="relative flex flex-col overflow-hidden border border-[#D7DCE2] bg-white shadow-sm">

          {/* TABLE */}
          <div
            className="
              relative
              flex
              min-h-[420px]
              flex-1
              items-center
              justify-center
              overflow-hidden
              bg-[#E3ECE1]

              sm:min-h-[520px]
              xl:min-h-0
            "
          >
            {/* MESA */}
            <div
              className="
                absolute
                inset-2
                border-[4px]
                border-[#CDD8C8]
                bg-[#DDE8D8]

                sm:inset-4

                xl:inset-8
                xl:border-[6px]
              "
            />

            <div className="relative h-full w-full">

              {/* TODO BACK:
              renderizar peças reais */}
              {boardPieces.map((piece) => (
                <div
                  key={piece.id}
                  className="absolute"
                  style={{
                    left: piece.x,
                    top: piece.y,
                  }}
                >
                  <DominoPiece
                    top={piece.top}
                    bottom={piece.bottom}
                    rotate={piece.rotate}
                  />
                </div>
              ))}

              {/* DROP ZONE */}
              <div
                className="
                  absolute
                  bottom-4
                  right-4
                  border
                  border-dashed
                  border-[#8AB8FF]
                  bg-white/40
                  px-4
                  py-3
                  text-sm
                  text-[#2563EB]

                  sm:px-8
                  sm:py-5
                "
              >
                Soltar peça
              </div>
            </div>
          </div>

          {/* PLAYER HAND */}
          <footer className="border-t border-[#D7DCE2] bg-white px-4 py-5 sm:px-8">

            <div className="mb-4 flex items-center justify-between">

              <p className="text-[12px] font-black uppercase tracking-[0.25em] text-[#8A96A8]">
                Sua mão
              </p>

              <p className="bg-[#EEF3FF] px-3 py-1 text-xs font-bold text-[#2563EB]">
                {playerHand.length} peças
              </p>
            </div>

            {/* RESPONSIVO */}
            <div
              className="
                flex
                gap-4
                overflow-x-auto
                pb-2

                xl:justify-center
              "
            >
              {playerHand.map((piece) => (
                <div
                  key={piece.id}
                  onClick={() => handlePlayPiece(piece.id)}
                  className="shrink-0 transition hover:-translate-y-3"
                >
                  <DominoPiece
                    top={piece.top}
                    bottom={piece.bottom}
                    selected={selectedPieceId === piece.id}
                  />
                </div>
              ))}
            </div>
          </footer>
        </div>

        {/* RIGHT */}
        <aside
          className="
            flex
            flex-col
            gap-4

            md:grid
            md:grid-cols-2

            xl:flex
          "
        >
          <PlayerCard
            name={players[2].name}
            turn={players[2].turn}
            connected={players[2].connected}
          />

          <PlayerCard
            name={players[3].name}
            turn={players[3].turn}
            connected={players[3].connected}
          />

          <div className="border border-[#D7DCE2] bg-white p-5 shadow-sm xl:mt-auto">

            <div className="mb-4 flex items-center gap-3">
              <HelpCircle className="text-[#2563EB]" size={22} />

              <h3 className="font-black">
                Regras rápidas
              </h3>
            </div>

            <ul className="space-y-3 text-sm text-[#64748B]">
              <li>• Jogue uma peça compatível.</li>
              <li>• Aguarde seu turno.</li>
              <li>• Ganha quem acabar as peças.</li>
              <li>• Peças químicas precisam fazer sentido.</li>
            </ul>

          </div>
        </aside>
      </section>
    </main>
  )
}