"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"

export default function Home() {
  const router = useRouter()

  return (
    <div className="flex h-screen bg-[#f3eef2]">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">

          <Image
            src="/logo2.png"
            alt="Domino Químico"
            width={400}
            height={160}
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