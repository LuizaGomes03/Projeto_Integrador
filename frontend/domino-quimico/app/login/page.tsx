"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { useState } from "react"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotInput, setForgotInput] = useState("")

  const handleLogin = () => {
    // TODO: integrar com backend. Aqui simulamos um login simples.
    if (!email || !senha) {
      alert('Preencha email e senha')
      return
    }
    // Simulação: qualquer credencial permite acesso para fins de demo
    router.push('/aluno')
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{backgroundImage: `url('/background.png')`, backgroundPosition: 'center top', backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}>
      <div className="w-full max-w-md px-4">
        <div className="flex flex-col items-center pt-20 mb-6">
          <div className="rounded-full bg-white p-5 shadow-md mb-6 flex items-center justify-center">
            <Image src="/logo.png" alt="Domino Químico" width={96} height={96} className="w-24 h-24" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-800">Bem-vindo</h1>
          <p className="text-gray-500 mt-2 text-center">Seu aprendizado começa aqui.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <label className="block text-[10px] text-gray-400 uppercase mb-2">Email Acadêmico</label>
          <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 mb-4">
            <div className="mr-3 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H8m0 0l4-4m-4 4l4 4"/></svg>
            </div>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="nome@aluno.cps" className="bg-transparent outline-none flex-1 text-sm placeholder-gray-400" />
          </div>

          <div className="mb-2">
            <label className="block text-[10px] text-gray-400 uppercase">Senha de Acesso</label>
          </div>

          <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 mb-6">
            <div className="mr-3 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
            </div>
            <input type={showPassword ? 'text' : 'password'} value={senha} onChange={(e)=>setSenha(e.target.value)} placeholder="digite sua senha" className="bg-transparent outline-none flex-1 text-sm placeholder-gray-400" />
            <button type="button" onClick={() => setShowPassword(s => !s)} className="ml-3 text-gray-500 p-1 rounded" aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}>
              {/* Mostrar olho fechado quando a senha estiver oculta (padrão) e olho aberto quando visível */}
              {!showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5 0-9.27-3.11-11-7 1.02-2.03 2.49-3.78 4.25-4.99" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/><path d="M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1.42 12.42C2.7 16.56 6.5 19 12 19c5.5 0 9.3-2.44 10.58-6.58A13.94 13.94 0 0 0 12 5c-2.13 0-4.12.43-5.88 1.2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
              )}
            </button>
          </div>

          <div className="flex justify-end mb-3">
            <button onClick={() => setShowForgotModal(true)} className="text-[11px] text-gray-600 font-medium">ESQUECI A SENHA</button>
          </div>

          <button onClick={handleLogin} className="w-full bg-red-600 text-white py-3 rounded-full font-bold shadow-lg hover:bg-red-700 transition flex items-center justify-center gap-3">ENTRAR <span className="text-white">→</span></button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">Não tem conta? <button className="text-red-600 font-medium" onClick={()=>router.push('/signup')}>Criar</button></p>
          </div>
        </div>

        {/* Forgot-password modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowForgotModal(false)} />
            <div className="bg-white rounded-lg p-6 z-10 w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-2">Recuperar senha</h2>
              <p className="text-sm text-gray-600 mb-4">Informe seu usuário ou email. Você receberá um email para redefinir sua senha.</p>
              <input value={forgotInput} onChange={(e)=>setForgotInput(e.target.value)} placeholder="Usuário ou email" className="w-full border rounded px-3 py-2 mb-3" />
              <div className="flex justify-end gap-2">
                <button onClick={() => { setShowForgotModal(false); setForgotInput(""); }} className="px-4 py-2 rounded bg-gray-100">Cancelar</button>
                <button onClick={() => {
                  if (!forgotInput) { alert('Preencha usuário ou email'); return }
                  // Simulação de envio de email
                  alert('Um e-mail de redefinição foi enviado para ' + forgotInput + '.')
                  setShowForgotModal(false)
                  setForgotInput("")
                }} className="px-4 py-2 rounded bg-red-600 text-white">Enviar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}