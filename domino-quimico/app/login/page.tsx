//cd Projeto_Integrador
//PS C:\Users\luiza\PI\Projeto_Integrador> cd domino-quimico
//PS C:\Users\luiza\PI\Projeto_Integrador\domino-quimico> npm run dev


"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")

  const handleLogin = () => {
    if (email === "aluno@teste.com" && senha === "123") {
      router.push("/aluno")
    } else {
      alert("Email ou senha inválidos!")
    }
  }

  return (
    <div className="flex h-screen bg-[#f3eef2] items-center justify-center">

      <div className="bg-white p-10 rounded-2xl shadow-xl w-[350px] text-center">

        {/* LOGO */}
        <img
          src="/logo2.png"
          alt="Domino Químico"
          className="w-[200px] mx-auto mb-4"
        />

        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Entrar
        </h1>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Senha */}
        <input
          type="password"
          placeholder="Senha"
          className="w-full mb-6 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {/* Botão */}
        <button
          onClick={handleLogin}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition"
        >
          Entrar
        </button>

      </div>

    </div>
  )
}