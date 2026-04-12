"use client"

import { useRouter } from "next/navigation"
import { FlaskConical, Key, Gamepad2, Trophy } from "lucide-react"

export default function AlunoHome() {
    const router = useRouter()

    return (
        <div className="flex h-screen bg-[#f3eef2] items-center justify-center">

            <div className="bg-white p-10 rounded-2xl shadow-xl w-[90%] max-w-[400px] text-center">

                {/* Logo */}
                <img
                    src="/logo2.png"
                    alt="Domino Químico"
                    className="w-[200px] mx-auto mb-6"
                />

                <h1 className="text-2xl font-bold mb-6">
                    Menu do Aluno
                </h1>

                <div className="flex flex-col gap-4">

                    <div className="flex flex-col gap-4">

                        {/* Criar Sala */}
                        <button className="flex items-center justify-between bg-red-600 hover:bg-red-700 text-white py-4 px-4 rounded-xl shadow-md transition transform hover:scale-105">
                            <span className="flex items-center gap-2">
                                <FlaskConical size={20} />
                                Criar Sala
                            </span>
                        </button>

                        {/* Entrar Sala */}
                        <button className="flex items-center justify-between bg-gray-700 hover:bg-gray-800 text-white py-4 px-4 rounded-xl shadow-md transition transform hover:scale-105">
                            <span className="flex items-center gap-2">
                                <Key size={20} />
                                Entrar em Sala
                            </span>
                        </button>

                        {/* Jogar */}
                        <button
                            onClick={() => router.push("/jogo")}
                            className="flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white py-4 px-4 rounded-xl shadow-md transition transform hover:scale-105"
                        >
                            <span className="flex items-center gap-2">
                                <Gamepad2 size={20} />
                                Jogar Sozinho
                            </span>
                        </button>

                        {/* Pontuação */}
                        <button className="flex items-center justify-between bg-green-600 hover:bg-green-700 text-white py-4 px-4 rounded-xl shadow-md transition transform hover:scale-105">
                            <span className="flex items-center gap-2">
                                <Trophy size={20} />
                                Ver Pontuação
                            </span>
                        </button>

                    </div>

                </div>

            </div>

        </div>
    )
}