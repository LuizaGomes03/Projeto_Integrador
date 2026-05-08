"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AUTH_COLORS, AUTH_COPY, type AuthFieldErrors, validateLogin } from "../auth/authShared"

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="#C7C7C7" strokeWidth="1.7" />
      <path d="m6.5 8 5.5 4 5.5-4" stroke="#C7C7C7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M8 11V8.5A4 4 0 0 1 12 4.5a4 4 0 0 1 4 4V11" stroke="#C7C7C7" strokeWidth="1.7" strokeLinecap="round" />
      <rect x="5" y="11" width="14" height="9" rx="2.5" stroke="#C7C7C7" strokeWidth="1.7" />
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  if (!open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <path d="M3.5 12s3.2-6 8.5-6 8.5 6 8.5 6-3.2 6-8.5 6-8.5-6-8.5-6Z" stroke="#C7C7C7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="2.5" stroke="#C7C7C7" strokeWidth="1.7" />
        <path d="m4 20 16-16" stroke="#C7C7C7" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M3.5 12s3.2-6 8.5-6 8.5 6 8.5 6-3.2 6-8.5 6-8.5-6-8.5-6Z" stroke="#C7C7C7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" stroke="#C7C7C7" strokeWidth="1.7" />
    </svg>
  )
}

function PeriodicTile({ symbol, number, accent = false, dark = false }: { symbol: string; number: string; accent?: boolean; dark?: boolean }) {
  return (
    <div
      className="flex h-28 w-20 flex-col items-center justify-between rounded-2xl border bg-white px-2 py-3 shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
      style={{
        transform: accent ? "rotate(6deg)" : dark ? "rotate(-4deg)" : "rotate(0deg)",
        backgroundColor: dark ? "#8E8E8E" : accent ? AUTH_COLORS.accent : AUTH_COLORS.white,
        borderColor: dark ? "transparent" : "#EAEAEA",
        color: dark || accent ? AUTH_COLORS.white : "#7B7B7B",
      }}
    >
      <span className="text-xs font-medium opacity-90">{symbol}</span>
      <span className="text-[10px] opacity-75">{number}</span>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [errors, setErrors] = useState<AuthFieldErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState("")
  const [recoveryError, setRecoveryError] = useState("")

  const submitLogin = () => {
    const nextErrors: AuthFieldErrors = validateLogin(email, senha)

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }
    router.push("/aluno")
  }

  const openRecoveryModal = () => {
    setRecoveryError("")
    setRecoveryEmail(email)
    setShowRecoveryModal(true)
  }

  const closeRecoveryModal = () => {
    setShowRecoveryModal(false)
    setRecoveryError("")
  }

  const submitRecoveryRequest = () => {
    const normalizedEmail = recoveryEmail.trim().toLowerCase()

    if (!normalizedEmail) {
      setRecoveryError("Digite seu email institucional.")
      return
    }

    if (!normalizedEmail.endsWith("@aluno.cps.sp.gov.br")) {
      setRecoveryError("Use seu email da faculdade, com @aluno.cps.sp.gov.br.")
      return
    }

    setShowRecoveryModal(false)
    setRecoveryError("")
    alert(`Se o email ${normalizedEmail} estiver cadastrado, enviaremos as instruções de recuperação.`)
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden px-4 py-10"
      style={{
        background: "radial-gradient(circle at top left, rgba(255,255,255,0.92) 0%, rgba(245,244,244,1) 55%, rgba(241,239,238,1) 100%)",
        fontFamily: '"Poppins", "Inter", "Segoe UI", sans-serif',
      }}
    >
      <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center justify-center rounded-full border border-[#EDEDED] bg-white/90 px-4 py-2 shadow-sm backdrop-blur-sm sm:top-7 sm:px-5 sm:py-3">
        <img src="/logo.png" alt="Dominó Químico" className="h-20 w-auto object-contain sm:h-30" />
      </div>

      <div className="absolute right-0 top-[58%] hidden h-[1px] w-[18vw] origin-left rotate-[-35deg] bg-[#F0D7D7] opacity-70 sm:block" />

      <div className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 items-end gap-4 sm:flex">
        <PeriodicTile symbol="H" number="1.008" />
        <PeriodicTile symbol="O" number="15.999" accent />
        <PeriodicTile symbol="C" number="12.011" dark />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-[460px] items-center justify-center">
        <div className="w-full rounded-[42px] border border-[#EDEDED] bg-white px-7 pb-8 pt-10 shadow-[0_25px_70px_rgba(0,0,0,0.08)] sm:px-9">
          <div className="mb-8">
            <h1
              className="text-[34px] font-black leading-none tracking-[-0.05em] text-[#3A3A3A] sm:text-[40px]"
              style={{ fontFamily: 'Montserrat, "Poppins", "Inter", "Segoe UI", sans-serif' }}
            >
              Bem-vindo
            </h1>
            <p className="mt-3 text-[16px] font-normal leading-snug text-[#9B9B9B]">
              Entre para continuar sua pesquisa.
            </p>
          </div>

          <div className="mb-5">
            <label className="mb-3 block text-[12px] font-semibold uppercase tracking-[0.32em] text-[#8E8E8E]">
              Email Acadêmico
            </label>
            <div className="flex h-[72px] items-center gap-3 rounded-[18px] bg-[#F8F8F8] px-4">
              <EmailIcon />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome.sobrenome@aluno.cps.sp.gov.br"
                className="w-full bg-transparent text-[16px] font-medium text-[#666666] outline-none placeholder:text-[#C2C2C2]"
                style={{ fontFamily: '"Poppins", "Inter", "Segoe UI", sans-serif' }}
              />
            </div>
            {errors.email ? <p className="mt-2 text-xs text-red-600">{errors.email}</p> : null}
          </div>

          <div className="mb-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="block text-[12px] font-semibold uppercase tracking-[0.32em] text-[#8E8E8E]">
                Senha de Acesso
              </label>
              <button
                type="button"
                onClick={openRecoveryModal}
                className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF3B30]"
              >
                Esqueci a senha
              </button>
            </div>

            <div className="flex h-[72px] items-center gap-3 rounded-[18px] bg-[#F8F8F8] px-4">
              <LockIcon />
              <input
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-[16px] font-medium text-[#666666] outline-none placeholder:text-[#C2C2C2]"
                style={{ fontFamily: '"Poppins", "Inter", "Segoe UI", sans-serif', letterSpacing: "0.28em" }}
              />
              <button type="button" onClick={() => setShowPassword((current) => !current)} className="shrink-0">
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.senha ? <p className="mt-2 text-xs text-red-600">{errors.senha}</p> : null}
          </div>

          <button
            onClick={submitLogin}
            className="mt-2 flex h-11 w-full items-center justify-center rounded-full text-[13px] font-extrabold uppercase tracking-[0.34em] text-white shadow-[0_14px_30px_rgba(255,59,48,0.24)] transition hover:brightness-105"
            style={{ backgroundColor: AUTH_COLORS.accent, fontFamily: '"Poppins", "Inter", "Segoe UI", sans-serif' }}
          >
            Entrar <span className="ml-3 text-[16px] leading-none">→</span>
          </button>

          <div className="my-6 border-t border-[#EFEFEF]" />

          <p className="text-center text-[13px] font-medium text-[#8D8D8D]">
            Não tem conta?{" "}
            <button
              className="font-bold"
              onClick={() => router.push("/signup")}
              style={{ color: AUTH_COLORS.accent }}
            >
              Criar
            </button>
          </p>
        </div>
      </div>

      {showRecoveryModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:p-7">
            <h2 className="text-[22px] font-extrabold tracking-[-0.03em] text-[#3A3A3A]" style={{ fontFamily: 'Montserrat, "Poppins", "Inter", "Segoe UI", sans-serif' }}>
              Recuperar senha
            </h2>
            <p className="mt-2 text-[14px] leading-snug text-[#8B8B8B]">
              Digite o email institucional da faculdade para receber as instruções.
            </p>

            <label className="mt-5 block text-[12px] font-semibold uppercase tracking-[0.28em] text-[#8E8E8E]">
              Email da faculdade
            </label>
            <div className="mt-3 flex h-[62px] items-center gap-3 rounded-[18px] bg-[#F8F8F8] px-4">
              <EmailIcon />
              <input
                type="email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                placeholder="nome.sobrenome@aluno.cps.sp.gov.br"
                className="w-full bg-transparent text-[15px] font-medium text-[#666666] outline-none placeholder:text-[#C2C2C2]"
                style={{ fontFamily: '"Poppins", "Inter", "Segoe UI", sans-serif' }}
              />
            </div>
            {recoveryError ? <p className="mt-2 text-xs text-red-600">{recoveryError}</p> : null}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeRecoveryModal}
                className="h-11 flex-1 rounded-full border border-[#E7E7E7] text-[13px] font-bold uppercase tracking-[0.2em] text-[#666666] transition hover:bg-[#FAFAFA]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={submitRecoveryRequest}
                className="h-11 flex-1 rounded-full text-[13px] font-extrabold uppercase tracking-[0.2em] text-white transition hover:brightness-105"
                style={{ backgroundColor: AUTH_COLORS.accent }}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}