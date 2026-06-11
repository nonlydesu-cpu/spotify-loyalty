'use client'

import { useState } from 'react'

const tracks = [
  { init: 'TS', color: '#1a4731', name: 'Anti-Hero', artist: 'Taylor Swift', time: '3分前' },
  { init: 'AD', color: '#3d1a4a', name: '唱', artist: 'Ado', time: '15分前' },
  { init: 'YO', color: '#1a3a4a', name: '夜に駆ける', artist: 'YOASOBI', time: '32分前' },
  { init: 'BT', color: '#1a2a4a', name: 'Dynamite', artist: 'BTS', time: '1時間前' },
  { init: 'OR', color: '#4a1a1a', name: 'vampire', artist: 'Olivia Rodrigo', time: '2時間前' },
]

const rankLong = [
  { init: 'TS', color: '#1a4731', name: 'Taylor Swift', genre: 'ポップ', score: 94.2 },
  { init: 'AD', color: '#3d1a4a', name: 'Ado', genre: 'J-POP', score: 87.6 },
  { init: 'YO', color: '#1a3a4a', name: 'YOASOBI', genre: 'J-POP', score: 73.1 },
  { init: 'BT', color: '#1a2a4a', name: 'BTS', genre: 'K-POP', score: 61.8 },
  { init: 'OR', color: '#4a1a1a', name: 'Olivia Rodrigo', genre: 'ポップ', score: 54.3 },
]

const ranks = [
  { min: 0, label: 'にわか', bg: '#e0e0e0', col: '#555' },
  { min: 21, label: 'ライトファン', bg: '#b3e5fc', col: '#0277bd' },
  { min: 41, label: 'コアファン', bg: '#c8e6c9', col: '#2e7d32' },
  { min: 61, label: 'ガチ勢', bg: '#fff9c4', col: '#f57f17' },
  { min: 81, label: '信者', bg: '#f8bbd0', col: '#c62828' },
  { min: 96, label: '狂信者', bg: '#1DB954', col: '#000' },
]

function seededRand(seed: number, min: number, max: number) {
  const x = Math.sin(seed) * 10000
  const r = x - Math.floor(x)
  return Math.floor(r * (max - min + 1)) + min
}
function strSeed(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return Math.abs(h)
}
function genArtist(name: string) {
  const s = strSeed(name)
  return {
    name, init: name.slice(0, 2).toUpperCase(),
    period: seededRand(s+1, 2, 20), top50_s: seededRand(s+2, 3, 32),
    top50_m: seededRand(s+3, 2, 28), top50_l: seededRand(s+4, 1, 25),
    saved: seededRand(s+5, 5, 48), playlists: seededRand(s+6, 0, 6),
    followScore: seededRand(s+7, 0, 1), recentHits: seededRand(s+8, 1, 18),
  }
}
function calcScore(a: ReturnType<typeof genArtist>) {
  const s1 = Math.min(a.period / 18, 1) * 20
  const s2 = ((a.top50_s/50)*0.5 + (a.top50_m/50)*0.3 + (a.top50_l/50)*0.2) * 22
  const s3 = Math.min(a.saved / 50, 1) * 15
  const s4 = Math.min(a.playlists / 5, 1) * 10
  const s5 = a.followScore * 8
  const s6 = (a.recentHits / 50) * 12
  const s7 = (a.top50_s / 50) * 13
  return { s1, s2, s3, s4, s5, s6, s7, total: s1+s2+s3+s4+s5+s6+s7 }
}
function getRank(score: number) {
  let r = ranks[0]
  for (const ri of ranks) if (score >= ri.min) r = ri
  return r
}
function fmtPeriod(m: number) {
  const y = Math.floor(m/12), mo = m%12
  return y > 0 ? `${y}年${mo}ヶ月` : `${mo}ヶ月`
}

export default function Home() {
  const [tab, setTab] = useState<'home'|'ranking'|'loyalty'>('home')
  const [loggedIn, setLoggedIn] = useState(false)
  const [artists, setArtists] = useState(['Taylor Swift','Ado','YOASOBI'].map(genArtist))
  const [cur, setCur] = useState(0)
  const [input, setInput] = useState('')

  const addArtist = () => {
    if (!input.trim() || artists.find(a => a.name === input.trim())) return
    setArtists([...artists, genArtist(input.trim())])
    setCur(artists.length)
    setInput('')
  }

  if (!loggedIn) return (
    <div style={{ background: '#121212', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ color: '#1DB954', fontSize: 13, fontWeight: 500, letterSpacing: '0.1em' }}>SPOTIFY</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 500, color: '#fff' }}>忠誠値チェッカー</div>
        <div style={{ fontSize: 13, color: '#b3b3b3', marginTop: 6 }}>あなたの推しへの本気度を数値化</div>
      </div>
      <button onClick={() => setLoggedIn(true)} style={{ background: '#1DB954', color: '#000', border: 'none', borderRadius: 999, padding: '14px 0', width: '100%', maxWidth: 320, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
        Spotifyでログイン
      </button>
      <div style={{ fontSize: 11, color: '#555', textAlign: 'center', lineHeight: 1.6 }}>※ このデモはダミーデータで動作しています</div>
    </div>
  )

  const s = cur < artists.length ? calcScore(artists[cur]) : null
  const rank = s ? getRank(s.total) : null

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 390, margin: '0 auto', background: '#0a0a0a', minHeight: '100vh', color: '#fff', paddingBottom: 130 }}>

      {/* ホーム */}
      {tab === 'home' && (
        <div>
          <div style={{ padding: '1rem 1rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 500 }}>こんにちは</div>
              <div style={{ fontSize: 12, color: '#888' }}>今日もお気に入りの音楽を</div>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: 12, fontWeight: 500 }}>YOU</div>
          </div>
          <div style={{ padding: '0 1re
