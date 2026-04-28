"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"

export default function Home() {
  const router = useRouter()

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#faf8f9] to-[#f3eef2]">
      {/* Container Principal */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/logo.png"
              alt="Domino Químico"
              width={280}
              height={120}
              priority
              className="w-[280px] h-auto mx-auto"
            />
          </div>

          {/* Título */}
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gray-600">Domino</span>
            <br />
            <span className="text-red-600">Químico</span>
          </h1>

          {/* Divisor */}
          <div className="h-1 w-20 bg-red-300 mx-auto my-4"></div>

          {/* Subtítulo */}
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            A ciência das ligações em um<br />
            tabuleiro estratégico.
          </p>

          {/* Botão Principal */}
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-full shadow-lg transition transform hover:scale-105 mb-6 text-lg"
          >
            ENTRAR →
          </button>

          {/* Link Criar Conta */}
          <button
            onClick={() => router.push("/signup")}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium transition"
          >
            👤 CRIAR CONTA DE CIENTISTA
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-gray-500 text-xs">
        <p>— LAB PROTOCOL V4.2.0 —</p>
        <p className="text-gray-400 text-[10px]">MOLECULAR PRECISION FRAMEWORK</p>
      </div>
    </div>
  )
}