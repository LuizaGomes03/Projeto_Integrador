"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { FlaskConical, Key, Gamepad2, Trophy, LogOut } from "lucide-react"

export default function AlunoHome() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-[#e5e7eb]">

      {/* FUNDO */}
      <Image
        src="/fundo1.png"
        alt="fundo"
        fill
        className="absolute inset-0 object-cover blur-sm opacity-60"
      />

      {/* CARD */}
      <div className="relative bg-[#f5f5f5] p-10 rounded-2xl shadow-2xl w-full max-w-md text-center border border-gray-300">

        {/* TOPO (BOTÃO SAIR) */}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 text-sm px-3 py-1 rounded-md bg-gray-200 hover:bg-red-100 text-gray-700 hover:text-red-600 transition"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>

        {/* LOGO */}
        <Image
          src="/logo2.png"
          alt="Domino Químico"
          width={200}
          height={80}
          className="w-[200px] mx-auto mb-6"
        />

        {/* TÍTULO */}
        <h1 className="text-2xl font-semibold mb-6 text-gray-700">
          Menu do Aluno
        </h1>

        {/* BOTÕES */}
        <div className="flex flex-col gap-5">

          {/* Criar Sala */}
          <button className="flex items-center justify-between px-5 py-4 rounded-xl text-white
          bg-gradient-to-b from-red-500 to-red-700
          shadow-[inset_0_2px_6px_rgba(255,255,255,0.3),0_6px_12px_rgba(0,0,0,0.3)]
          border border-red-800
          hover:brightness-110 active:scale-95 transition">

            <span className="flex items-center gap-2">
              <FlaskConical size={18} />
              Criar Sala
            </span>
          </button>

          {/* Entrar em Sala */}
          <button className="flex items-center justify-between px-5 py-4 rounded-xl text-white
          bg-gradient-to-b from-gray-600 to-gray-800
          shadow-[inset_0_2px_6px_rgba(255,255,255,0.2),0_6px_12px_rgba(0,0,0,0.4)]
          border border-gray-900
          hover:brightness-110 active:scale-95 transition">

            <span className="flex items-center gap-2">
              <Key size={18} />
              Entrar em Sala
            </span>
          </button>

          {/* Jogar */}
          <button
            onClick={() => router.push("/jogo")}
            className="flex items-center justify-between px-5 py-4 rounded-xl text-white
            bg-gradient-to-b from-blue-500 to-blue-700
            shadow-[inset_0_2px_6px_rgba(255,255,255,0.3),0_6px_12px_rgba(0,0,0,0.3)]
            border border-blue-800
            hover:brightness-110 active:scale-95 transition">

            <span className="flex items-center gap-2">
              <Gamepad2 size={18} />
              Jogar Sozinho
            </span>
          </button>

          {/* Pontuação */}
          <button className="flex items-center justify-between px-5 py-4 rounded-xl text-white
          bg-gradient-to-b from-green-500 to-green-700
          shadow-[inset_0_2px_6px_rgba(255,255,255,0.3),0_6px_12px_rgba(0,0,0,0.3)]
          border border-green-800
          hover:brightness-110 active:scale-95 transition">

            <span className="flex items-center gap-2">
              <Trophy size={18} />
              Ver Pontuação
            </span>
          </button>

        </div>
      </div>
    </div>
  )
}