"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { useState } from "react"

export default function SignupPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  

  const handleCreate = () => {
    if (!name || !email || !password) {
      alert("Preencha todos os campos")
      return
    }
    // Validação: somente emails de aluno permitidos
    if (!email.toLowerCase().endsWith('@aluno.cps')) {
      alert('Use um email terminando em @aluno.cps')
      return
    }
    if (password !== confirm) {
      alert("Senhas não conferem")
      return
    }
    // Placeholder: enviar para API do backend
    alert("Conta criada com sucesso (simulação)")
    router.push("/login")
  }

  // keep signup creation flow; existing users are redirected to /login

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fffefe] to-[#fbf7f8] px-4">
      {/* Botão voltar */}
      <button onClick={() => router.back()} className="absolute top-6 left-4 bg-white/80 hover:bg-white text-gray-700 px-3 py-1 rounded-full shadow-sm">← Voltar</button>

      <div className="w-full max-w-md pt-12">
        <div className="flex flex-col items-center mb-6">
            <div className="rounded-full bg-white p-8 shadow-md mb-6 w-36 h-36 flex items-center justify-center">
              <Image src="/logo.png" alt="logo" width={80} height={80} className="w-20 h-20" />
            </div>
          <h2 className="text-2xl font-bold text-gray-700">CRIAR CONTA</h2>
          <h3 className="text-2xl font-extrabold text-red-600">CIENTISTA</h3>
          <p className="text-gray-500 text-sm mt-2 text-center">Junte-se à maior rede de experiments moleculares</p>

          {/* orientação removida conforme solicitado */}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <label className="block text-xs text-gray-400 uppercase mb-1">Nome completo</label>
          <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 mb-4">
            <div className="mr-3 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 14a4 4 0 1 0-8 0v2h8v-2zM12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/></svg>
            </div>
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Seu nome" className="bg-transparent outline-none flex-1 text-sm" />
          </div>

          <label className="block text-xs text-gray-400 uppercase mb-1">Email acadêmico</label>
          <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 mb-4">
            <div className="mr-3 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H8m0 0l4-4m-4 4l4 4"/></svg>
            </div>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="nome@universidade.edu" className="bg-transparent outline-none flex-1 text-sm" />
          </div>

          <label className="block text-xs text-gray-400 uppercase mb-1">Senha</label>
          <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 mb-4">
            <div className="mr-3 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
            </div>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="digite sua senha" className="bg-transparent outline-none flex-1 text-sm placeholder-gray-400" />
          </div>

          <label className="block text-xs text-gray-400 uppercase mb-1">Confirmar</label>
          <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 mb-6">
            <div className="mr-3 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
            </div>
            <input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="confirme sua senha" className="bg-transparent outline-none flex-1 text-sm placeholder-gray-400" />
          </div>

          <button onClick={handleCreate} className="w-full bg-red-600 text-white py-3 rounded-full font-bold shadow-md hover:bg-red-700 transition mb-4">CRIAR CONTA</button>

          <p className="text-center text-sm text-gray-500 mt-4">Já possui uma conta de cientista? <button className="text-red-600 font-medium" onClick={()=>router.push('/login')}>Entrar agora</button></p>
        </div>

        <div className="text-center mt-8 text-xs text-gray-400">
          <p>MOLECULAR PRECISION FRAMEWORK</p>
          <p className="mt-1">© 2024 ChemDomino · Lab Protocol v4.2.0</p>
        </div>
      </div>
    </div>
  )
}
