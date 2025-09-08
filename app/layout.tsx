import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QuestChat - Streaks & Rewards for Whop Chat',
  description: 'Turn daily participation into momentum. Post a prompt. Count streaks. Auto-drop rewards.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
