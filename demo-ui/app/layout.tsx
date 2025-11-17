import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const cairo = Cairo({ subsets: ['latin', 'arabic'] })

export const metadata: Metadata = {
  title: 'AI Drive-Thru Demo',
  description: 'Voice-powered drive-thru ordering system with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cairo.className}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
