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
          <div style={{ padding: '0 1rem' }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>最近再生した曲</div>
            {tracks.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '0.5px solid #222' }}>
                <div style={{ fontSize: 12, color: '#555', width: 16, textAlign: 'center' }}>{i+1}</div>
                <div style={{ width: 40, height: 40, borderRadius: 6, background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, flexShrink: 0 }}>{t.init}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{t.artist}</div>
                </div>
                <div style={{ fontSize: 11, color: '#555' }}>{t.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ランキング */}
      {tab === 'ranking' && (
        <div>
          <div style={{ padding: '1rem 1rem 0.5rem', fontSize: 20, fontWeight: 500 }}>アーティストランキング</div>
          <div style={{ padding: '0 1rem' }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>長期（全期間）</div>
            {rankLong.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid #222' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: i < 3 ? '#1DB954' : '#555', width: 20, textAlign: 'center' }}>{i+1}</div>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, flexShrink: 0 }}>{a.init}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{a.genre}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: '#1DB954' }}>{a.score}</div>
                  <div style={{ fontSize: 10, color: '#555' }}>忠誠値</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 忠誠値 */}
      {tab === 'loyalty' && (
        <div>
          <div style={{ padding: '1rem 1rem 0.5rem', fontSize: 20, fontWeight: 500 }}>忠誠値チェッカー</div>
          <div style={{ display: 'flex', gap: 8, margin: '0 1rem 0.75rem' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addArtist()} placeholder="アーティスト名を入力..." style={{ flex: 1, padding: '8px 12px', border: '0.5px solid #333', borderRadius: 8, background: '#1a1a1a', color: '#fff', fontSize: 13, outline: 'none' }} />
            <button onClick={addArtist} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#1DB954', color: '#000', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>追加</button>
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '0 1rem 0.75rem' }}>
            {artists.map((a, i) => (
              <button key={i} onClick={() => setCur(i)} style={{ flexShrink: 0, padding: '5px 10px', borderRadius: 999, border: '0.5px solid #333', background: i === cur ? '#1DB954' : '#1a1a1a', color: i === cur ? '#000' : '#888', fontSize: 12, cursor: 'pointer', fontWeight: i === cur ? 500 : 400 }}>
                {a.name}
              </button>
            ))}
          </div>
          {s && rank && (
            <div style={{ margin: '0 1rem', background: '#1a1a1a', border: '0.5px solid #222', borderRadius: 12, padding: '1.25rem' }}>
              <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>忠誠値</div>
                <div style={{ fontSize: 52, fontWeight: 500, color: '#1DB954', lineHeight: 1 }}>{s.total.toFixed(1)}</div>
                <div style={{ height: 8, background: '#333', borderRadius: 999, margin: '10px 0', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#1DB954', borderRadius: 999, width: `${s.total}%`, transition: 'width 0.7s ease' }} />
                </div>
                <div style={{ display: 'inline-block', padding: '3px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500, background: rank.bg, color: rank.col }}>{rank.label}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '10px 0' }}>
                {[['ファン歴', fmtPeriod(artists[cur].period)], ['Top50曲数', `${artists[cur].top50_s}曲/50`], ['保存済み曲', `${artists[cur].saved}曲`], ['最近の再生', `${artists[cur].recentHits}曲/50`]].map(([l, v]) => (
                  <div key={l} style={{ background: '#222', borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#555', background: '#222', borderRadius: 8, padding: '8px 10px', marginTop: 10, lineHeight: 1.5 }}>※ デモのため名前からスコアを自動生成しています</div>
            </div>
          )}
        </div>
      )}

      {/* Now Playing */}
      <div style={{ position: 'fixed', bottom: 60, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: '#1a1a1a', borderTop: '0.5px solid #222', padding: '8px 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: 6, background: tracks[0].color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, flexShrink: 0 }}>{tracks[0].init}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tracks[0].name}</div>
          <div style={{ fontSize: 11, color: '#888' }}>{tracks[0].artist}</div>
        </div>
        <div style={{ fontSize: 22, color: '#1DB954', cursor: 'pointer' }}>▶</div>
      </div>

      {/* ボトムナビ */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: '#111', borderTop: '0.5px solid #222', display: 'flex', height: 60 }}>
        {(['home','ranking','loyalty'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, border: 'none', background: 'none', cursor: 'pointer', color: tab === t ? '#1DB954' : '#555', fontSize: 10 }}>
            <span style={{ fontSize: 22 }}>{t === 'home' ? '🏠' : t === 'ranking' ? '📊' : '⭐'}</span>
            {t === 'home' ? 'ホーム' : t === 'ranking' ? 'ランキング' : '忠誠値'}
          </button>
        ))}
      </div>
    </div>
  )
}
