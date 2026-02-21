import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Financial Planning Hub - Retirement & Investment Calculators',
  description: 'Comprehensive financial planning tools including retirement calculators, Monte Carlo simulation, investment projection, and strategy analysis. Plan your financial future with precision.',
  keywords: 'retirement calculator, investment calculator, financial planning, Monte Carlo simulation, retirement planning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-background text-gray-900">
        {children}
      </body>
    </html>
  )
}
