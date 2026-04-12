"use client"

import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <div className="flex h-screen bg-[#f3eef2]">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">

          <img
            src="/logo2.png"
            alt="Domino Químico"
            className="w-[400px] mx-auto mb-6"
          />

          <button
            onClick={() => router.push("/login")}
            className="bg-red-600 hover:bg-red-700 text-white px-12 py-4 rounded-xl shadow-xl transition transform hover:scale-105"
          >
            ENTRAR
          </button>

        </div>
      </div>
    </div>
  )
}