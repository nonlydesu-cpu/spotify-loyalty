import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import SessionProvider from './SessionProvider'

export const metadata: Metadata = {
  title: 'Spotify忠誠値チェッカー',
  description: '推しへの本気度を数値化',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()
  return (
    <html lang="ja">
      <body style={{ margin: 0, background: '#0a0a0a' }}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
