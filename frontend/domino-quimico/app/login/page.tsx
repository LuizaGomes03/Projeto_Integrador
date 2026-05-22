"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

// ─── ÍCONE OLHO ───────────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  if (!open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <path
          d="M3.5 12s3.2-6 8.5-6 8.5 6 8.5 6-3.2 6-8.5 6-8.5-6-8.5-6Z"
          stroke="#C7C7C7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2.5" stroke="#C7C7C7" strokeWidth="1.7" />
        <path d="m4 20 16-16" stroke="#C7C7C7" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M3.5 12s3.2-6 8.5-6 8.5 6 8.5 6-3.2 6-8.5 6-8.5-6-8.5-6Z"
        stroke="#C7C7C7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" stroke="#C7C7C7" strokeWidth="1.7" />
    </svg>
  )
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()

  // Campos
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Estado da requisição
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState("")

  // Modal recuperação de senha
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  const [emailRecovery, setEmailRecovery] = useState("")

  // ─── SUBMIT LOGIN ──────────────────────────────────────────────────────────

  const handleLogin = async () => {
    setErro("")

    if (!email.trim()) {
      setErro("Informe seu email.")
      return
    }
    if (!senha) {
      setErro("Informe sua senha.")
      return
    }

    setCarregando(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), senha }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.erro ?? "Erro ao fazer login. Tente novamente.")
        return
      }

      // Salvar token e dados do usuário
      localStorage.setItem("dominoToken", data.token)
      localStorage.setItem("dominoUsuario", JSON.stringify(data.usuario))

      sessionStorage.setItem("dominoUserId", String(data.usuario.id))
      sessionStorage.setItem("dominoNome", data.usuario.nome)

      // Redirecionar conforme o tipo do usuário
      if (data.usuario.tipo === "professor") {
        router.push("/professor")
      } else {
        router.push("/aluno")
      }
    } catch {
      setErro("Não foi possível conectar ao servidor. Tente novamente.")
    } finally {
      setCarregando(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !carregando) handleLogin()
  }

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6"
      style={{
        backgroundImage: "url('/ChatGPT Image 15 de mai. de 2026, 10_31_00.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        fontFamily: '"Poppins", sans-serif',
      }}
    >
      <div className="w-full max-w-[540px]">

        {/* LOGO ETEC */}
        <div className="flex justify-center pb-10 sm:pb-12 md:pb-14">
          <Image
            src="/etec_santo_andre.png"
            alt="ETEC Santo André"
            width={340}
            height={120}
            className="h-auto w-[190px] sm:w-[240px] md:w-[300px]"
            priority
          />
        </div>

        {/* CARD */}
        <div
          className="relative mt-4 rounded-[34px] border border-white/60 bg-white/88 px-6 pb-7 pt-16 shadow-[0_25px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:px-8 sm:pb-8 sm:pt-20"
          onKeyDown={handleKeyDown}
        >

          {/* LOGO CENTRAL */}
          <div className="absolute left-1/2 top-0 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#ECECEC] bg-white shadow-xl sm:h-28 sm:w-28">
            <Image
              src="/logo.png"
              alt="Dominó Químico"
              width={90}
              height={90}
              className="h-auto w-[58px] sm:w-[72px]"
              priority
            />
          </div>

          {/* TÍTULO */}
          <div className="text-center">
            <h1 className="text-[30px] font-black leading-none tracking-[-0.05em] text-[#2F2F2F] sm:text-[38px]">
              DOMINÓ
            </h1>
            <h2 className="mt-1 text-[26px] font-black leading-none tracking-[0.16em] text-[#D62828] sm:text-[32px]">
              QUÍMICO
            </h2>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.42em] text-[#A0A0A0]">
              JOGO EDUCATIVO
            </p>

            <div className="mt-9">
              <h3 className="text-[32px] font-black tracking-[-0.06em] text-[#343434] sm:text-[42px]">
                Bem-vindo
              </h3>
              <p className="mt-2 text-[15px] text-[#8B8B8B] sm:text-[17px]">
                Entre para continuar sua jornada.
              </p>
            </div>
          </div>

          {/* FORMULÁRIO */}
          <div className="mt-8 space-y-5">

            {/* MENSAGEM DE ERRO */}
            {erro && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-[13px] font-semibold text-red-600">
                {erro}
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-[#8A8A8A]"
              >
                Email Acadêmico
              </label>

              <div className={`flex h-[58px] items-center rounded-[18px] border bg-[#FAFAFA] px-4 transition-colors focus-within:border-[#D62828] ${erro && !email ? "border-red-300" : "border-[#EEEEEE]"}`}>
                <input
                  id="email"
                  type="email"
                  placeholder="seu.nome@aluno.cps.sp.gov.br"
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
              <div className="mb-3 flex items-center justify-between">
                <label
                  htmlFor="senha"
                  className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#8A8A8A]"
                >
                  Senha de acesso
                </label>
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(true)}
                  className="text-[10px] font-black uppercase tracking-[0.18em] text-[#E12727] transition hover:opacity-70"
                >
                  Esqueci a senha
                </button>
              </div>

              <div className={`flex h-[58px] items-center gap-3 rounded-[18px] border bg-[#FAFAFA] px-4 transition-colors focus-within:border-[#D62828] ${erro && !senha ? "border-red-300" : "border-[#EEEEEE]"}`}>
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
              className="mt-2 flex h-[58px] w-full items-center justify-center rounded-full bg-[#D62828] text-[13px] font-black uppercase tracking-[0.28em] text-white shadow-[0_14px_30px_rgba(214,40,40,0.28)] transition hover:scale-[1.01] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
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
          <div className="my-7 border-t border-[#EFEFEF]" />

          {/* CRIAR CONTA */}
          <p className="text-center text-[14px] text-[#8D8D8D]">
            Não tem conta?{" "}
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="font-black text-[#D62828] transition hover:opacity-70"
            >
              Criar
            </button>
          </p>
        </div>
      </div>

      {/* MODAL RECUPERAÇÃO DE SENHA */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-[6px]">
          <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)] sm:p-8">

            <h2 className="text-[28px] font-black tracking-[-0.04em] text-[#2F2F2F]">
              Recuperar senha
            </h2>

            <p className="mt-3 text-[15px] leading-relaxed text-[#8B8B8B]">
              Digite seu email acadêmico para receber as instruções de recuperação.
            </p>

            <div className="mt-6">
              <label
                htmlFor="emailRecovery"
                className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-[#8A8A8A]"
              >
                Email acadêmico
              </label>

              <div className="flex h-[58px] items-center rounded-[18px] border border-[#EEEEEE] bg-[#FAFAFA] px-4 focus-within:border-[#D62828] transition-colors">
                <input
                  id="emailRecovery"
                  type="email"
                  placeholder="seu.nome@aluno.cps.sp.gov.br"
                  value={emailRecovery}
                  onChange={(e) => setEmailRecovery(e.target.value)}
                  className="w-full bg-transparent text-[14px] font-medium text-[#666] outline-none placeholder:text-[#C7C7C7]"
                />
              </div>
            </div>

            {/* TODO (Arthur): chamar POST /api/auth/reset-request com { email: emailRecovery } */}

            <div className="mt-7 flex gap-3">
              <button
                onClick={() => { setShowRecoveryModal(false); setEmailRecovery("") }}
                className="flex-1 rounded-full border border-[#E5E5E5] py-3 text-[12px] font-black uppercase tracking-[0.18em] text-[#666] transition hover:bg-[#F8F8F8]"
              >
                Cancelar
              </button>

              <button
                onClick={() => { setShowRecoveryModal(false); setEmailRecovery("") }}
                className="flex-1 rounded-full bg-[#D62828] py-3 text-[12px] font-black uppercase tracking-[0.18em] text-white shadow-[0_10px_25px_rgba(214,40,40,0.25)] transition hover:brightness-105"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}