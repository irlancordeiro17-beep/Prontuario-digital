'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, HeadphonesIcon, BriefcaseMedicalIcon, ShieldIcon, Mail, Lock, ShieldCheck } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().min(1, 'Campo obrigatório'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

type ProfileType = 'agente' | 'profissional' | 'gestor'

const profiles: { id: ProfileType; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'agente', label: 'Agente', Icon: HeadphonesIcon },
  { id: 'profissional', label: 'Profissional', Icon: BriefcaseMedicalIcon },
  { id: 'gestor', label: 'Gestor', Icon: ShieldIcon },
]

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>('agente')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginForm) {
    setError('')
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (res?.error) {
      setError('E-mail ou senha incorretos. Verifique suas credenciais.')
      return
    }

    router.push('/search')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between py-8 px-4">
      {/* Logo */}
      <div className="w-full flex justify-center pt-8">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#1e3a5f] tracking-tight">
            Prontuário Social
          </h1>
          <div className="w-12 h-0.5 bg-[#1e3a5f] mx-auto mt-2 rounded-full" />
        </div>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-sm fade-in">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#0f172a]">Acesse sua conta</h2>
          <p className="text-sm text-slate-500 mt-1">
            Selecione seu perfil e informe suas credenciais.
          </p>
        </div>

        {/* Profile selector */}
        <div className="mb-6">
          <p className="text-xs font-700 uppercase tracking-widest text-slate-400 mb-3"
             style={{ fontWeight: 700, letterSpacing: '0.1em' }}>
            PERFIL DE ACESSO
          </p>
          <div className="grid grid-cols-3 gap-2">
            {profiles.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedProfile(id)}
                className={`profile-card flex flex-col items-center justify-center gap-2 py-4 transition-all ${
                  selectedProfile === id ? 'active' : ''
                }`}
              >
                <Icon className={`w-6 h-6 ${selectedProfile === id ? 'text-[#1e3a5f]' : 'text-slate-400'}`} />
                <span className={`text-sm font-medium ${selectedProfile === id ? 'text-[#1e3a5f]' : 'text-slate-500'}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-700 uppercase tracking-widest text-slate-400 mb-2"
                   style={{ fontWeight: 700, letterSpacing: '0.1em' }}>
              E-MAIL OU CPF
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="email"
                type="text"
                placeholder="nome@exemplo.com.br"
                autoComplete="email"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/15 transition-all"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-700 uppercase tracking-widest text-slate-400"
                     style={{ fontWeight: 700, letterSpacing: '0.1em' }}>
                SENHA
              </label>
              <button
                type="button"
                className="text-[#1e3a5f] text-sm font-medium hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/15 transition-all"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>
            )}
          </div>

          {/* Error alert */}
          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1e3a5f] hover:bg-[#163059] text-white font-semibold py-4 rounded-xl text-base shadow-lg shadow-[#1e3a5f]/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                Acessar Sistema
                <span className="ml-1">→</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center space-y-2 pb-4">
        <div className="flex items-center justify-center gap-6 text-slate-400 text-sm">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Conexão SSL/TLS
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            LGPD Compliance
          </span>
        </div>
        <p className="text-xs text-slate-300 tracking-widest uppercase">
          Governo do Estado · Sistema de Gestão Social · V4.2.0
        </p>
      </div>
    </div>
  )
}
