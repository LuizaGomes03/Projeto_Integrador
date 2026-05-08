"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { AUTH_COLORS, validateSignup } from "../auth/authShared"

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="#C7C7C7" strokeWidth="1.7" />
      <path d="m6.5 8 5.5 4 5.5-4" stroke="#C7C7C7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <circle cx="12" cy="8" r="3.5" stroke="#C7C7C7" strokeWidth="1.7" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" stroke="#C7C7C7" strokeWidth="1.7" strokeLinecap="round" />
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

function SideArc({
  className,
  color,
  rotate,
}: {
  className: string
  color: string
  rotate: string
}) {
  return (
    <div
      aria-hidden="true"
      className={`absolute rounded-full border ${className}`}
      style={{
        borderColor: color,
        transform: `rotate(${rotate})`,
      }}
    />
  )
}

export default function SignupPage() {
  const router = useRouter()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleCreate = () => {
    const errors = validateSignup({ firstName, lastName, email, password, confirm })
    const firstError = Object.values(errors).find(Boolean)

    if (firstError) {
      alert(firstError)
      return
    }

    alert("Conta criada com sucesso (simulação)")
    router.push("/login")
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

      <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden sm:block">
        <SideArc className="right-[18px] top-[235px] h-[320px] w-[320px] border-[1px] border-l-transparent border-t-transparent opacity-30" color="#F0D7D7" rotate="22deg" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-[460px] items-center justify-center">
        <div className="mt-32 w-full rounded-[42px] border border-[#EDEDED] bg-white px-7 pb-8 pt-10 shadow-[0_25px_70px_rgba(0,0,0,0.08)] sm:mt-36 sm:px-9">
          <div className="mb-4 flex justify-start">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8B8B8B] transition hover:text-[#666666]"
            >
              <span className="text-[14px] leading-none">←</span>
              Voltar
            </button>
          </div>

          <div className="mb-8">
            <h1
              className="text-[34px] font-black leading-none tracking-[-0.05em] text-[#3A3A3A] sm:text-[40px]"
              style={{ fontFamily: 'Montserrat, "Poppins", "Inter", "Segoe UI", sans-serif' }}
            >
              Criar conta de cientista
            </h1>
            <p className="mt-3 text-[16px] font-normal leading-snug text-[#9B9B9B]">
              Já tem uma conta? {""} 
            
            </p>
          </div>

          <div className="mb-5">
            <label className="mb-3 block text-[12px] font-semibold uppercase tracking-[0.32em] text-[#8E8E8E]">
              Nome
            </label>
            <div className="flex h-[72px] items-center gap-3 rounded-[18px] bg-[#F8F8F8] px-4">
              <UserIcon />
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Seu nome"
                className="w-full bg-transparent text-[16px] font-medium text-[#666666] outline-none placeholder:text-[#C2C2C2]"
                style={{ fontFamily: '"Poppins", "Inter", "Segoe UI", sans-serif' }}
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-3 block text-[12px] font-semibold uppercase tracking-[0.32em] text-[#8E8E8E]">
              Sobrenome
            </label>
            <div className="flex h-[72px] items-center gap-3 rounded-[18px] bg-[#F8F8F8] px-4">
              <UserIcon />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Seu sobrenome"
                className="w-full bg-transparent text-[16px] font-medium text-[#666666] outline-none placeholder:text-[#C2C2C2]"
                style={{ fontFamily: '"Poppins", "Inter", "Segoe UI", sans-serif' }}
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-3 block text-[12px] font-semibold uppercase tracking-[0.32em] text-[#8E8E8E]">
              Email Acadêmico
            </label>
            <div className="flex h-[72px] items-center gap-3 rounded-[18px] bg-[#F8F8F8] px-4">
              <EmailIcon />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome.sobrenome@aluno.cps.sp.gov.br"
                className="w-full bg-transparent text-[16px] font-medium text-[#666666] outline-none placeholder:text-[#C2C2C2]"
                style={{ fontFamily: '"Poppins", "Inter", "Segoe UI", sans-serif' }}
              />
            </div>
          </div>

          <div className="mb-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="block text-[12px] font-semibold uppercase tracking-[0.32em] text-[#8E8E8E]">
                Senha
              </label>
            </div>

            <div className="flex h-[72px] items-center gap-3 rounded-[18px] bg-[#F8F8F8] px-4">
              <LockIcon />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-[16px] font-medium text-[#666666] outline-none placeholder:text-[#C2C2C2]"
                style={{ fontFamily: '"Poppins", "Inter", "Segoe UI", sans-serif', letterSpacing: "0.28em" }}
              />
              <button type="button" onClick={() => setShowPassword((current) => !current)} className="shrink-0">
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <div className="mb-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="block text-[12px] font-semibold uppercase tracking-[0.32em] text-[#8E8E8E]">
                Confirmar
              </label>
            </div>

            <div className="flex h-[72px] items-center gap-3 rounded-[18px] bg-[#F8F8F8] px-4">
              <LockIcon />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-[16px] font-medium text-[#666666] outline-none placeholder:text-[#C2C2C2]"
                style={{ fontFamily: '"Poppins", "Inter", "Segoe UI", sans-serif', letterSpacing: "0.28em" }}
              />
              <button type="button" onClick={() => setShowConfirm((current) => !current)} className="shrink-0">
                <EyeIcon open={showConfirm} />
              </button>
            </div>
          </div>

          <button
            onClick={handleCreate}
            className="mt-2 flex h-11 w-full items-center justify-center rounded-full text-[13px] font-extrabold uppercase tracking-[0.34em] text-white shadow-[0_14px_30px_rgba(255,59,48,0.24)] transition hover:brightness-105"
            style={{ backgroundColor: AUTH_COLORS.accent, fontFamily: '"Poppins", "Inter", "Segoe UI", sans-serif' }}
          >
            Criar Conta <span className="ml-3 text-[16px] leading-none">→</span>
          </button>

          <div className="my-6 border-t border-[#EFEFEF]" />

          <p className="text-center text-[13px] font-medium text-[#8D8D8D]">
            Já possui uma conta?{" "}
            <button className="font-bold" onClick={() => router.push("/login")} style={{ color: AUTH_COLORS.accent }}>
              Entar
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}