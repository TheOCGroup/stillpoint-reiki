import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stillpoint Reiki | OCG Labs',
  description: 'A calm guided Reiki practice, reflection, and practitioner experience from OCG Labs.'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}