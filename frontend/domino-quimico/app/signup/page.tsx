"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

function EyeIcon({ open }: { open: boolean }) {
  if (!open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M3.5 12s3.2-6 8.5-6 8.5 6 8.5 6-3.2 6-8.5 6-8.5-6-8.5-6Z"
          stroke="#C7C7C7"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2.5" stroke="#C7C7C7" strokeWidth="1.7" />
        <path
          d="m4 20 16-16"
          stroke="#C7C7C7"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M3.5 12s3.2-6 8.5-6 8.5 6 8.5 6-3.2 6-8.5 6-8.5-6-8.5-6Z"
        stroke="#C7C7C7"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" stroke="#C7C7C7" strokeWidth="1.7" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle cx="12" cy="8" r="3.5" stroke="#C7C7C7" strokeWidth="1.7" />
      <path
        d="M5.5 19a6.5 6.5 0 0 1 13 0"
        stroke="#C7C7C7"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M8 11V8.5A4 4 0 0 1 12 4.5a4 4 0 0 1 4 4V11"
        stroke="#C7C7C7"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <rect
        x="5"
        y="11"
        width="14"
        height="9"
        rx="2.5"
        stroke="#C7C7C7"
        strokeWidth="1.7"
      />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="#C7C7C7"
        strokeWidth="1.7"
      />
      <path
        d="m6.5 8 5.5 4 5.5-4"
        stroke="#C7C7C7"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function SignupPage() {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6"
      style={{
        backgroundImage:
          "url('/ChatGPT Image 15 de mai. de 2026, 10_31_00.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: 'fixed',
        backgroundRepeat: "no-repeat",
        fontFamily: '"Poppins", sans-serif',
      }}
    >
     

      {/* CONTAINER */}
      <div className="relative z-10 flex w-full items-center justify-center">

        <div className="w-full max-w-[430px]">

          {/* LOGO ETEC */}
          <div className="flex justify-center pb-12 sm:pb-14 md:pb-16">
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
          <div className="relative mt-4 rounded-[34px] border border-white/60 bg-white/88 px-6 pb-7 pt-16 shadow-[0_25px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:px-8 sm:pb-8 sm:pt-20">

            {/* LOGO */}
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

            {/* VOLTAR */}
            <div className="absolute left-6 top-6">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9A9A9A] transition hover:text-[#666]"
              >
                ← Voltar
              </button>
            </div>

            {/* TITULO */}
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
                  Criar conta
                </h3>

                <p className="mt-2 text-[15px] text-[#8B8B8B] sm:text-[17px]">
                  Crie sua conta para começar sua jornada.
                </p>
              </div>
            </div>

            {/* FORM */}
            <div className="mt-8 space-y-5">

              {/* NOME */}
              <div>
                <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-[#8A8A8A]">
                  Nome
                </label>

                <div className="flex h-[64px] items-center gap-3 rounded-[22px] border border-[#EEEEEE] bg-[#FAFAFA] px-4">
                  <UserIcon />

                  <input
                    type="text"
                    placeholder="Seu nome"
                    className="w-full bg-transparent text-[14px] font-medium text-[#666] outline-none placeholder:text-[#C7C7C7]"
                  />
                </div>
              </div>

              {/* SOBRENOME */}
              <div>
                <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-[#8A8A8A]">
                  Sobrenome
                </label>

                <div className="flex h-[64px] items-center gap-3 rounded-[22px] border border-[#EEEEEE] bg-[#FAFAFA] px-4">
                  <UserIcon />

                  <input
                    type="text"
                    placeholder="Seu sobrenome"
                    className="w-full bg-transparent text-[14px] font-medium text-[#666] outline-none placeholder:text-[#C7C7C7]"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-[#8A8A8A]">
                  Email Acadêmico
                </label>

                <div className="flex h-[64px] items-center gap-3 rounded-[22px] border border-[#EEEEEE] bg-[#FAFAFA] px-4">
                  <EmailIcon />

                  <input
                    type="email"
                    placeholder="nome.sobrenome@aluno.cps.sp.gov.br"
                    className="w-full bg-transparent text-[14px] font-medium text-[#666] outline-none placeholder:text-[#C7C7C7]"
                  />
                </div>
              </div>

              {/* SENHA */}
              <div>
                <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-[#8A8A8A]">
                  Senha
                </label>

                <div className="flex h-[64px] items-center gap-3 rounded-[22px] border border-[#EEEEEE] bg-[#FAFAFA] px-4">

                  <LockIcon />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-[14px] tracking-[0.3em] text-[#666] outline-none placeholder:text-[#C7C7C7]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="shrink-0"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {/* CONFIRMAR */}
              <div>
                <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-[#8A8A8A]">
                  Confirmar senha
                </label>

                <div className="flex h-[64px] items-center gap-3 rounded-[22px] border border-[#EEEEEE] bg-[#FAFAFA] px-4">

                  <LockIcon />

                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-[14px] tracking-[0.3em] text-[#666] outline-none placeholder:text-[#C7C7C7]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm((current) => !current)}
                    className="shrink-0"
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
              </div>

              {/* BOTÃO */}
              <button className="mt-3 flex h-[64px] w-full items-center justify-center rounded-full bg-[#D62828] text-[13px] font-black uppercase tracking-[0.28em] text-white shadow-[0_14px_30px_rgba(214,40,40,0.28)] transition hover:scale-[1.01] hover:brightness-105">

                Criar conta

                <span className="ml-3 text-lg">
                  →
                </span>
              </button>
            </div>

            {/* DIVISOR */}
            <div className="my-7 border-t border-[#EFEFEF]" />

            {/* LOGIN */}
            <p className="text-center text-[14px] text-[#8D8D8D]">
              Já possui uma conta?

              <button
                onClick={() => router.push("/login")}
                className="ml-1 font-black text-[#D62828]"
              >
                Entrar
              </button>
            </p>

          </div>
        </div>
      </div>
    </main>
  )
}