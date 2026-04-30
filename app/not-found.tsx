import Link from 'next/link'
import { Search, Home, FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <FileQuestion className="w-10 h-10 text-cyan-400" />
          </div>
        </div>

        {/* Code */}
        <p className="text-7xl font-black text-slate-800 mb-2 select-none">404</p>

        {/* Message */}
        <h1 className="text-xl font-bold text-white mb-2">
          Página não encontrada
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          O recurso que você está procurando não existe ou foi movido.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/search"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
          >
            <Search className="w-4 h-4" />
            Buscar Cidadão
          </Link>
          <Link
            href="/search"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            Início
          </Link>
        </div>
      </div>
    </div>
  )
}
