"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

// ─── ÍCONES ───────────────────────────────────────────────────────────────────

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

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="#C7C7C7" strokeWidth="1.7" />
      <path d="m6.5 8 5.5 4 5.5-4" stroke="#C7C7C7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SchoolIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M12 3 2 8l10 5 10-5-10-5Z" stroke="#C7C7C7" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M6 10.5v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" stroke="#C7C7C7" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M22 8v5" stroke="#C7C7C7" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type FieldErrors = {
  nome?: string
  sobrenome?: string
  email?: string
  senha?: string
  confirmar?: string
  ano?: string
  sala?: string
}

// ─── VALIDAÇÃO ────────────────────────────────────────────────────────────────

function validar(
  nome: string,
  sobrenome: string,
  email: string,
  senha: string,
  confirmar: string,
  ano: string,
  sala: string
): FieldErrors {
  const erros: FieldErrors = {}

  if (!nome.trim()) erros.nome = "Informe o nome."
  if (!sobrenome.trim()) erros.sobrenome = "Informe o sobrenome."

  if (!email.trim()) {
    erros.email = "Informe o email acadêmico."
  } else if (!email.trim().toLowerCase().endsWith("@aluno.cps.sp.gov.br")) {
    erros.email = "Use um email @aluno.cps.sp.gov.br."
  }

  if (!senha) {
    erros.senha = "Informe a senha."
  } else if (senha.length < 6) {
    erros.senha = "A senha deve ter no mínimo 6 caracteres."
  }

  if (!confirmar) {
    erros.confirmar = "Confirme a senha."
  } else if (senha !== confirmar) {
    erros.confirmar = "As senhas não conferem."
  }

  if (!ano) erros.ano = "Selecione o ano."
  if (!sala) erros.sala = "Selecione a sala."

  return erros
}

// ─── COMPONENTE DE INPUT ──────────────────────────────────────────────────────

function InputField({
  label,
  icon,
  error,
  children,
}: {
  label: string
  icon?: React.ReactNode
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.32em] text-[#8A8A8A]">
        {label}
      </label>
      <div
        className={`flex h-[58px] items-center gap-3 rounded-[18px] border bg-[#FAFAFA] px-4 transition-colors focus-within:border-[#D62828] ${
          error ? "border-red-300 bg-red-50/40" : "border-[#EEEEEE]"
        }`}
      >
        {icon}
        {children}
      </div>
      {error && (
        <p className="mt-1.5 text-[11px] font-semibold text-red-500">{error}</p>
      )}
    </div>
  )
}

// ─── COMPONENTE DE SELECT ─────────────────────────────────────────────────────

function SelectField({
  label,
  icon,
  error,
  children,
}: {
  label: string
  icon?: React.ReactNode
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.32em] text-[#8A8A8A]">
        {label}
      </label>
      <div
        className={`flex h-[58px] items-center gap-3 rounded-[18px] border bg-[#FAFAFA] px-4 transition-colors focus-within:border-[#D62828] ${
          error ? "border-red-300 bg-red-50/40" : "border-[#EEEEEE]"
        }`}
      >
        {icon}
        {children}
      </div>
      {error && (
        <p className="mt-1.5 text-[11px] font-semibold text-red-500">{error}</p>
      )}
    </div>
  )
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter()

  const [nome, setNome] = useState("")
  const [sobrenome, setSobrenome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [ano, setAno] = useState("")
  const [sala, setSala] = useState("")
  const [showSenha, setShowSenha] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)

  const [errosField, setErrosField] = useState<FieldErrors>({})
  const [erroGeral, setErroGeral] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  // ─── SUBMIT ─────────────────────────────────────────────────────────────────

  const handleCadastro = async () => {
    setErroGeral("")

    const erros = validar(nome, sobrenome, email, senha, confirmar, ano, sala)
    setErrosField(erros)
    if (Object.keys(erros).length > 0) return

    setCarregando(true)

    try {
      const nomeCompleto = `${nome.trim()} ${sobrenome.trim()}`

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nomeCompleto,
          email: email.trim().toLowerCase(),
          senha,
          tipo: "aluno",
          ano: Number(ano),
          sala,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.erro?.toLowerCase().includes("email")) {
          setErrosField({ email: data.erro })
        } else {
          setErroGeral(data.erro ?? "Erro ao criar conta. Tente novamente.")
        }
        return
      }

      localStorage.setItem("dominoToken", data.token)
      localStorage.setItem("dominoUsuario", JSON.stringify(data.usuario))
      sessionStorage.setItem("dominoUserId", String(data.usuario.id))
      sessionStorage.setItem("dominoNome", data.usuario.nome)

      setSucesso(true)
      setTimeout(() => router.push("/aluno"), 1200)
    } catch {
      setErroGeral("Não foi possível conectar ao servidor. Tente novamente.")
    } finally {
      setCarregando(false)
    }
  }

  const limparErro = (campo: keyof FieldErrors) => {
    setErrosField((prev) => ({ ...prev, [campo]: undefined }))
    setErroGeral("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !carregando) handleCadastro()
  }

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8"
      style={{
        backgroundImage: "url('/ChatGPT Image 15 de mai. de 2026, 10_31_00.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        fontFamily: '"Poppins", sans-serif',
      }}
    >
      <div className="w-full max-w-[430px]">

        {/* LOGO ETEC */}
        <div className="flex justify-center pb-10 sm:pb-12">
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

          {/* CABEÇALHO */}
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

          {/* FORMULÁRIO */}
          <div className="mt-8 space-y-4" onKeyDown={handleKeyDown}>

            {erroGeral && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-[13px] font-semibold text-red-600">
                {erroGeral}
              </div>
            )}

            {sucesso && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center text-[13px] font-semibold text-green-700">
                ✓ Conta criada! Redirecionando...
              </div>
            )}

            {/* NOME */}
            <InputField label="Nome" icon={<UserIcon />} error={errosField.nome}>
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => { setNome(e.target.value); limparErro("nome") }}
                disabled={carregando || sucesso}
                className="w-full bg-transparent text-[14px] font-medium text-[#666] outline-none placeholder:text-[#C7C7C7] disabled:opacity-50"
              />
            </InputField>

            {/* SOBRENOME */}
            <InputField label="Sobrenome" icon={<UserIcon />} error={errosField.sobrenome}>
              <input
                type="text"
                placeholder="Seu sobrenome"
                value={sobrenome}
                onChange={(e) => { setSobrenome(e.target.value); limparErro("sobrenome") }}
                disabled={carregando || sucesso}
                className="w-full bg-transparent text-[14px] font-medium text-[#666] outline-none placeholder:text-[#C7C7C7] disabled:opacity-50"
              />
            </InputField>

            {/* EMAIL */}
            <InputField label="Email Acadêmico" icon={<EmailIcon />} error={errosField.email}>
              <input
                type="email"
                placeholder="nome@aluno.cps.sp.gov.br"
                value={email}
                onChange={(e) => { setEmail(e.target.value); limparErro("email") }}
                disabled={carregando || sucesso}
                className="w-full bg-transparent text-[14px] font-medium text-[#666] outline-none placeholder:text-[#C7C7C7] disabled:opacity-50"
              />
            </InputField>

            {/* ANO E SALA — lado a lado */}
            <div className="grid grid-cols-2 gap-3">

              {/* ANO */}
              <SelectField label="Ano" icon={<SchoolIcon />} error={errosField.ano}>
                <select
                  value={ano}
                  onChange={(e) => { setAno(e.target.value); limparErro("ano") }}
                  disabled={carregando || sucesso}
                  className="w-full bg-transparent text-[14px] font-medium text-[#666] outline-none disabled:opacity-50 cursor-pointer"
                >
                  <option value="">Selecione</option>
                  <option value="1">1º Ano</option>
                  <option value="2">2º Ano</option>
                  <option value="3">3º Ano</option>
                </select>
              </SelectField>

              {/* SALA */}
              <SelectField label="Sala" icon={<SchoolIcon />} error={errosField.sala}>
                <select
                  value={sala}
                  onChange={(e) => { setSala(e.target.value); limparErro("sala") }}
                  disabled={carregando || sucesso}
                  className="w-full bg-transparent text-[14px] font-medium text-[#666] outline-none disabled:opacity-50 cursor-pointer"
                >
                  <option value="">Selecione</option>
                  <option value="A">Sala A</option>
                  <option value="B">Sala B</option>
                  <option value="C">Sala C</option>
                  <option value="D">Sala D</option>
                </select>
              </SelectField>

            </div>

            {/* SENHA */}
            <InputField label="Senha" icon={<LockIcon />} error={errosField.senha}>
              <input
                type={showSenha ? "text" : "password"}
                placeholder="••••••••"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); limparErro("senha") }}
                disabled={carregando || sucesso}
                className="w-full bg-transparent text-[14px] tracking-[0.3em] text-[#666] outline-none placeholder:text-[#C7C7C7] disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowSenha((v) => !v)}
                tabIndex={-1}
                className="shrink-0"
              >
                <EyeIcon open={showSenha} />
              </button>
            </InputField>

            {/* CONFIRMAR SENHA */}
            <InputField label="Confirmar senha" icon={<LockIcon />} error={errosField.confirmar}>
              <input
                type={showConfirmar ? "text" : "password"}
                placeholder="••••••••"
                value={confirmar}
                onChange={(e) => { setConfirmar(e.target.value); limparErro("confirmar") }}
                disabled={carregando || sucesso}
                className="w-full bg-transparent text-[14px] tracking-[0.3em] text-[#666] outline-none placeholder:text-[#C7C7C7] disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmar((v) => !v)}
                tabIndex={-1}
                className="shrink-0"
              >
                <EyeIcon open={showConfirmar} />
              </button>
            </InputField>

          </div>

          {/* BOTÃO CRIAR CONTA */}
          <button
            type="button"
            onClick={handleCadastro}
            disabled={carregando || sucesso}
            className="mt-6 flex h-[58px] w-full items-center justify-center rounded-full bg-[#D62828] text-[13px] font-black uppercase tracking-[0.28em] text-white shadow-[0_14px_30px_rgba(214,40,40,0.28)] transition hover:scale-[1.01] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Criando conta...
              </span>
            ) : sucesso ? (
              "✓ Conta criada!"
            ) : (
              "Criar conta"
            )}
          </button>

          {/* DIVISOR */}
          <div className="my-7 border-t border-[#EFEFEF]" />

          {/* LOGIN */}
          <p className="text-center text-[14px] text-[#8D8D8D]">
            Já possui uma conta?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-black text-[#D62828] transition hover:opacity-70"
            >
              Entrar
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}