import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Performance Pregão | Inteligência em Licitações',
  description:
    'Monitore 19 portais públicos de licitação com IA generativa. Encontre, analise e gerencie editais automaticamente. Ganhe tempo e vença mais disputas.',
  keywords: [
    'licitação',
    'pregão eletrônico',
    'PNCP',
    'compras gov',
    'edital',
    'inteligência artificial',
    'IA licitação',
  ],
  openGraph: {
    title: 'Performance Pregão | Inteligência em Licitações',
    description:
      'Monitore 19 portais públicos de licitação com IA generativa. Encontre, analise e gerencie editais automaticamente.',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
