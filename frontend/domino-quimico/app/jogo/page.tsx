"use client"

import { useEffect, useState } from "react"

type Pedra = {
id: number
left: string
right: string
}

export default function JogoPage() {
const [mao, setMao] = useState<Pedra[]>([])
const [maoIA, setMaoIA] = useState<Pedra[]>([])
const [mesa, setMesa] = useState<Pedra[]>([])
const [turno, setTurno] = useState("player")

/* =========================
 INICIAR JOGO
========================= */
useEffect(() => {
fetch("http://localhost:3001/start", {
method: "POST",
})
.then((res) => res.json())
.then((data) => {
setMao(data.maoJogador)
setMaoIA(data.maoIA)
setMesa(data.mesa)
setTurno(data.turno)
})
}, [])

/* =========================
 VALIDA JOGADA
========================= */
function podeJogar(pedra: Pedra) {
const esquerda = mesa[0]
const direita = mesa[mesa.length - 1]


return (
  pedra.left === esquerda.left ||
  pedra.right === esquerda.left ||
  pedra.left === direita.right ||
  pedra.right === direita.right
)


}

/* =========================
 JOGADOR JOGA
========================= */
function jogar(pedra: Pedra) {
if (!podeJogar(pedra)) return

const novaMesa = [...mesa, pedra]
const novaMao = mao.filter((p) => p.id !== pedra.id)

setMesa(novaMesa)
setMao(novaMao)
setTurno("ia")

jogarIA(novaMesa)


}

/* =========================
 IA JOGA
========================= */
function jogarIA(mesaAtual: Pedra[]) {
setTimeout(() => {
fetch("http://localhost:3001/ia", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
maoIA,
mesa: mesaAtual,
}),
})
.then((res) => res.json())
.then((data) => {
setMesa(data.mesa)
setMaoIA(data.maoIA)
setTurno("player")
})
}, 1000)
}

return ( <div className="min-h-screen bg-[#e9edf2] p-6">

  {/* MESA */}
  <div className="bg-white p-6 rounded-2xl shadow mb-6">
    <h2 className="font-bold mb-4">Mesa</h2>

    <div className="flex gap-2 flex-wrap">
      {mesa.map((p) => (
        <div key={p.id} className="px-4 py-2 bg-rose-100 rounded border">
          {p.left} | {p.right}
        </div>
      ))}
    </div>
  </div>

  {/* IA */}
  <div className="mb-6 text-center">
    <p className="text-sm text-gray-500">
      IA possui {maoIA.length} peças
    </p>
  </div>

  {/* SUA MÃO */}
  <div className="bg-white p-6 rounded-2xl shadow">
    <h2 className="font-bold mb-4">Sua mão</h2>

    <div className="flex gap-3 flex-wrap justify-center">
      {mao.map((p) => (
        <button
          key={p.id}
          onClick={() => jogar(p)}
          className={`px-4 py-2 rounded border ${
            podeJogar(p)
              ? "bg-white hover:bg-rose-200"
              : "bg-gray-200 cursor-not-allowed"
          }`}
        >
          {p.left} | {p.right}
        </button>
      ))}
    </div>
  </div>

  <p className="text-center mt-6 font-bold text-rose-500">
    Turno: {turno === "player" ? "Você" : "IA"}
  </p>

</div>


)
}
