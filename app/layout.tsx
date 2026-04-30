import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prontuário Social | CEPEDI · Hub Saúde Salvador',
  description:
    'Plataforma de Atenção Primária que unifica prontuário clínico, IA analítica e determinantes sociais da saúde.',
  keywords: 'prontuário social, saúde, CEPEDI, HL7 FHIR, LGPD, Salvador',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geist.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
