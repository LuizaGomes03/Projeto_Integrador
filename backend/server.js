import express from "express"
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json())

const FUNCOES = ["Ácido", "Base", "Óxido", "Sal", "Hidreto"]

function gerarPedra() {
  return {
    id: crypto.randomUUID(), // 🔥 ID único
    left: FUNCOES[Math.floor(Math.random() * FUNCOES.length)],
    right: FUNCOES[Math.floor(Math.random() * FUNCOES.length)],
  }
}


function gerarMao(qtd) {
  return Array.from({ length: qtd }, () => gerarPedra())
}

function podeJogar(pedra, mesa) {
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
🎮 START
========================= */
app.post("/start", (req, res) => {
  res.json({
    maoJogador: gerarMao(7),
    maoIA: gerarMao(7),
    mesa: [{ id: crypto.randomUUID(), left: "Ácido", right: "Hidreto" }],
    turno: "player",
  })
})

/* =========================
🤖 IA
========================= */
app.post("/ia", (req, res) => {
  const { maoIA, mesa } = req.body

  const jogada = maoIA.find((p) => podeJogar(p, mesa))

  if (jogada) {
    return res.json({
      mesa: [...mesa, jogada],
      maoIA: maoIA.filter((p) => p.id !== jogada.id),
    })
  }

  res.json({ mesa, maoIA })
})

app.listen(3001, () => {
  console.log("API rodando em http://localhost:3001")
})