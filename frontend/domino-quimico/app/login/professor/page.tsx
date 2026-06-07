"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

function EyeIcon({ open }: { open: boolean }) {
  if (!open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <path d="M3.5 12s3.2-6 8.5-6 8.5 6 8.5 6-3.2 6-8.5 6-8.5-6-8.5-6Z"
          stroke="#C7C7C7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="2.5" stroke="#C7C7C7" strokeWidth="1.7" />
        <path d="m4 20 16-16" stroke="#C7C7C7" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M3.5 12s3.2-6 8.5-6 8.5 6 8.5 6-3.2 6-8.5 6-8.5-6-8.5-6Z"
        stroke="#C7C7C7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" stroke="#C7C7C7" strokeWidth="1.7" />
    </svg>
  )
}

export default function LoginProfessorPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState("")

  const handleLogin = async () => {
    setErro("")

    if (!email.trim()) { setErro("Informe seu email."); return }
    if (!senha)        { setErro("Informe sua senha."); return }

    setCarregando(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/professor/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), senha }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.erro ?? "Erro ao fazer login. Tente novamente.")
        return
      }

      // Salva token e dados do professor
      localStorage.setItem("dominoToken", data.token)
      localStorage.setItem("dominoUsuario", JSON.stringify(data.usuario))
      sessionStorage.setItem("dominoUserId", String(data.usuario.id))
      sessionStorage.setItem("dominoNome", data.usuario.nome)

      router.push("/professor")
    } catch {
      setErro("Não foi possível conectar ao servidor. Tente novamente.")
    } finally {
      setCarregando(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !carregando) handleLogin()
  }

  return (
    <main
      className="relative flex min-h-screen items-start justify-center overflow-hidden px-4 py-4 sm:items-center"
      style={{
        backgroundImage: "url('/ChatGPT Image 15 de mai. de 2026, 10_31_00.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        fontFamily: '"Poppins", sans-serif',
      }}
    >
      <div className="w-full max-w-[360px] pt-2 sm:pt-0">

        {/* LOGO ETEC */}
        <div className="flex justify-center pb-4 sm:pb-6 md:pb-8">
          <Image
            src="/etec_santo_andre.png"
            alt="ETEC Santo André"
            width={340}
            height={120}
            className="h-auto w-[170px] sm:w-[210px] md:w-[260px]"
            priority
          />
        </div>

        {/* CARD */}
        <div
          className="relative mt-2 rounded-[34px] border border-white/60 bg-white/88 px-5 pb-5 pt-10 shadow-[0_25px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:px-6 sm:pb-6 sm:pt-12"
          onKeyDown={handleKeyDown}
        >

          {/* LOGO CENTRAL */}
          <div className="absolute left-1/2 top-0 flex h-18 w-18 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#ECECEC] bg-white shadow-xl sm:h-22 sm:w-22">
            <Image
              src="/logo.png"
              alt="Dominó Químico"
              width={90}
              height={90}
              className="h-auto w-[42px] sm:w-[54px]"
              priority
            />
          </div>

          {/* TÍTULO */}
          <div className="text-center">
            <h1 className="text-[25px] font-black leading-none tracking-[-0.05em] text-[#2F2F2F] sm:text-[31px]">
              DOMINÓ
            </h1>
            <h2 className="mt-1 text-[20px] font-black leading-none tracking-[0.16em] text-[#D62828] sm:text-[25px]">
              QUÍMICO
            </h2>
            <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.32em] text-[#A0A0A0]">
              JOGO EDUCATIVO
            </p>

            <div className="mt-5">
              {/* Badge de professor */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f5b8b8] bg-[#FEF2F2] px-3 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-[#D62828]">
                🎓 Área do Professor
              </span>
              <h3 className="mt-3 text-[26px] font-black tracking-[-0.06em] text-[#343434] sm:text-[31px]">
                Bem-vindo
              </h3>
              <p className="mt-1.5 text-[13px] text-[#8B8B8B] sm:text-[14px]">
                Entre para acessar o painel do professor.
              </p>
            </div>
          </div>

          {/* FORMULÁRIO */}
          <div className="mt-5 space-y-3.5">

            {erro && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-center text-[12px] font-semibold text-red-600">
                {erro}
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[9px] font-bold uppercase tracking-[0.24em] text-[#8A8A8A]"
              >
                Email
              </label>
              <div className={`flex h-[48px] items-center rounded-[18px] border bg-[#FAFAFA] px-4 transition-colors focus-within:border-[#D62828] ${erro && !email ? "border-red-300" : "border-[#EEEEEE]"}`}>
                <input
                  id="email"
                  type="email"
                  placeholder="seu.email@professor.cps.sp.gov'.br"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErro("") }}
                  disabled={carregando}
                  autoComplete="email"
                  className="w-full bg-transparent text-[14px] font-medium text-[#666] outline-none placeholder:text-[#C7C7C7] disabled:opacity-50"
                />
              </div>
            </div>

            {/* SENHA */}
            <div>
              <label
                htmlFor="senha"
                className="mb-2 block text-[9px] font-bold uppercase tracking-[0.24em] text-[#8A8A8A]"
              >
                Senha
              </label>
              <div className={`flex h-[48px] items-center gap-3 rounded-[18px] border bg-[#FAFAFA] px-4 transition-colors focus-within:border-[#D62828] ${erro && !senha ? "border-red-300" : "border-[#EEEEEE]"}`}>
                <input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setErro("") }}
                  disabled={carregando}
                  autoComplete="current-password"
                  className="w-full bg-transparent text-[14px] tracking-[0.3em] text-[#666] outline-none placeholder:text-[#C7C7C7] disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="shrink-0"
                  tabIndex={-1}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* BOTÃO */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={carregando}
              className="mt-0.5 flex h-[48px] w-full items-center justify-center rounded-full bg-[#D62828] text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-[0_14px_30px_rgba(214,40,40,0.28)] transition hover:scale-[1.01] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </div>

          {/* DIVISOR */}
          <div className="my-4 border-t border-[#EFEFEF]" />

          {/* LINK PARA LOGIN DO ALUNO */}
          <p className="text-center text-[12px] text-[#8D8D8D]">
            É aluno?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-black text-[#D62828] transition hover:opacity-70"
            >
              Entrar aqui
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}