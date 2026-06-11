import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Spotify忠誠値チェッカー',
  description: '推しへの本気度を数値化',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, background: '#0a0a0a' }}>
        {children}
      </body>
    </html>
  )
}
