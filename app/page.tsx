'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'

const ranks = [
  { min: 0, label: 'にわか', bg: '#e0e0e0', col: '#555' },
  { min: 21, label: 'ライトファン', bg: '#b3e5fc', col: '#0277bd' },
  { min: 41, label: 'コアファン', bg: '#c8e6c9', col: '#2e7d32' },
  { min: 61, label: 'ガチ勢', bg: '#fff9c4', col: '#f57f17' },
  { min: 81, label: '信者', bg: '#f8bbd0', col: '#c62828' },
  { min: 96, label: '狂信者', bg: '#1DB954', col: '#000' },
]

function getRank(score: number) {
  let r = ranks[0]
  for (const ri of ranks) if (score >= ri.min) r = ri
  return r
}
function fmtPeriod(m: number) {
  const y = Math.floor(m / 12), mo = m % 12
  return y > 0 ? `${y}年${mo}ヶ月` : `${mo}ヶ月`
}

function calcLoyalty(artistName: string, data: any) {
  if (!data) return null
  const topS = data.topArtistsShort?.items ?? []
  const topL = data.topArtistsLong?.items ?? []
  const topTracks = data.topTracks?.items ?? []
  const recent = data.recentlyPlayed?.items ?? []
  const saved = data.savedTracks?.items ?? []

  const rankS = topS.findIndex((a: any) => a.name === artistName)
  const rankL = topL.findIndex((a: any) => a.name === artistName)
  const top50s = topTracks.filter((t: any) => t.artists?.some((a: any) => a.name === artistName)).length
  const top50l = topTracks.filter((t: any) => t.artists?.some((a: any) => a.name === artistName)).length
  const recentHits = recent.filter((t: any) => t.track?.artists?.some((a: any) => a.name === artistName)).length
  const savedCount = saved.filter((t: any) => t.track?.artists?.some((a: any) => a.name === artistName)).length

  const s1 = rankL >= 0 ? Math.min((10 - Math.min(rankL, 9)) / 10, 1) * 20 : 0
  const s2 = ((top50s / 50) * 0.5 + (top50l / 50) * 0.5) * 22
  const s3 = Math.min(savedCount / 10, 1) * 15
  const s4 = rankS >= 0 ? Math.min((10 - Math.min(rankS, 9)) / 10, 1) * 10 : 0
  const s5 = 8
  const s6 = (recentHits / 50) * 12
  const s7 = (top50s / 50) * 13
  return { s1, s2, s3, s4, s5, s6, s7, total: s1+s2+s3+s4+s5+s6+s7 }
}

export default function Home() {
  const { data: session, status } = useSession()
  const [tab, setTab] = useState<'home'|'ranking'|'loyalty'>('home')
  const [spotifyData, setSpotifyData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [curArtist, setCurArtist] = useState(0)

  useEffect(() => {
    if (session?.accessToken) {
      setLoading(true)
      fetch('/api/spotify')
        .then(r => r.json())
        .then(d => { setSpotifyData(d); setLoading(false) })
    }
  }, [session])

  if (status === 'loading') return (
    <div style={{ background: '#121212', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'sans-serif' }}>読み込み中...</div>
  )

  if (!session) return (
    <div style={{ background: '#121212', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ color: '#1DB954', fontSize: 13, fontWeight: 500, letterSpacing: '0.1em' }}>SPOTIFY</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 500, color: '#fff' }}>忠誠値チェッカー</div>
        <div style={{ fontSize: 13, color: '#b3b3b3', marginTop: 6 }}>あなたの推しへの本気度を数値化</div>
      </div>
      <button onClick={() => signIn('spotify')} style={{ background: '#1DB954', color: '#000', border: 'none', borderRadius: 999, padding: '14px 0', width: '100%', maxWidth: 320, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
        Spotifyでログイン
      </button>
    </div>
  )

  const topArtists = spotifyData?.topArtistsLong?.items ?? []
  const recentTracks = spotifyData?.recentlyPlayed?.items?.slice(0, 5) ?? []
  const topTracks = spotifyData?.topTracks?.items?.slice(0, 5) ?? []
  const loyalty = topArtists[curArtist] ? calcLoyalty(topArtists[curArtist].name, spotifyData) : null
  const rank = loyalty ? getRank(loyalty.total) : null

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 390, margin: '0 auto', background: '#0a0a0a', minHeight: '100vh', color: '#fff', paddingBottom: 130 }}>

      {tab === 'home' && (
        <div>
          <div style={{ padding: '1rem 1rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 500 }}>こんにちは、{session.user?.name?.split(' ')[0]}さん</div>
              <div style={{ fontSize: 12, color: '#888' }}>今日もお気に入りの音楽を</div>
            </div>
            <div onClick={() => signOut()} style={{ width: 32, height: 32, borderRadius: '50%', background: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: 10, fontWeight: 500, cursor: 'pointer' }}>OUT</div>
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>データ取得中...</div> : (
            <div style={{ padding: '0 1rem' }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>最近再生した曲</div>
              {recentTracks.map((t: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '0.5px solid #222' }}>
                  <div style={{ fontSize: 12, color: '#555', width: 16, textAlign: 'center' }}>{i+1}</div>
                  {t.track?.album?.images?.[0]?.url
                    ? <img src={t.track.album.images[0].url} style={{ width: 40, height: 40, borderRadius: 6, flexShrink: 0 }} />
                    : <div style={{ width: 40, height: 40, borderRadius: 6, background: '#333', flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.track?.name}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{t.track?.artists?.[0]?.name}</div>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 13, fontWeight: 500, margin: '12px 0 8px' }}>よく聴く曲（短期）</div>
              {topTracks.map((t: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '0.5px solid #222' }}>
                  <div style={{ fontSize: 12, color: '#555', width: 16, textAlign: 'center' }}>{i+1}</div>
                  {t.album?.images?.[0]?.url
                    ? <img src={t.album.images[0].url} style={{ width: 40, height: 40, borderRadius: 6, flexShrink: 0 }} />
                    : <div style={{ width: 40, height: 40, borderRadius: 6, background: '#333', flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{t.artists?.[0]?.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'ranking' && (
        <div>
          <div style={{ padding: '1rem 1rem 0.5rem', fontSize: 20, fontWeight: 500 }}>アーティストランキング</div>
          {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>データ取得中...</div> : (
            <div style={{ padding: '0 1rem' }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>長期（全期間）</div>
              {topArtists.map((a: any, i: number) => {
                const s = calcLoyalty(a.name, spotifyData)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid #222' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: i < 3 ? '#1DB954' : '#555', width: 20, textAlign: 'center' }}>{i+1}</div>
                    {a.images?.[0]?.url
                      ? <img src={a.images[0].url} style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
                      : <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#333', flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{a.genres?.[0] ?? ''}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 500, color: '#1DB954' }}>{s ? s.total.toFixed(1) : '-'}</div>
                      <div style={{ fontSize: 10, color: '#555' }}>忠誠値</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'loyalty' && (
        <div>
          <div style={{ padding: '1rem 1rem 0.5rem', fontSize: 20, fontWeight: 500 }}>忠誠値チェッカー</div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '0 1rem 0.75rem' }}>
            {topArtists.map((a: any, i: number) => (
              <button key={i} onClick={() => setCurArtist(i)} style={{ flexShrink: 0, padding: '5px 10px', borderRadius: 999, border: '0.5px solid #333', background: i === curArtist ? '#1DB954' : '#1a1a1a', color: i === curArtist ? '#000' : '#888', fontSize: 12, cursor: 'pointer', fontWeight: i === curArtist ? 500 : 400 }}>
                {a.name}
              </button>
            ))}
          </div>
          {loyalty && rank && (
            <div style={{ margin: '0 1rem', background: '#1a1a1a', border: '0.5px solid #222', borderRadius: 12, padding: '1.25rem' }}>
              <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>忠誠値</div>
                <div style={{ fontSize: 52, fontWeight: 500, color: '#1DB954', lineHeight: 1 }}>{loyalty.total.toFixed(1)}</div>
                <div style={{ height: 8, background: '#333', borderRadius: 999, margin: '10px 0', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#1DB954', borderRadius: 999, width: `${loyalty.total}%`, transition: 'width 0.7s ease' }} />
                </div>
                <div style={{ display: 'inline-block', padding: '3px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500, background: rank.bg, color: rank.col }}>{rank.label}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '10px 0' }}>
                {[['Top順位(長期)', `${topArtists.findIndex((a:any) => a.name === topArtists[curArtist].name)+1}位`], ['Top50曲数', `${spotifyData?.topTracks?.items?.filter((t:any) => t.artists?.some((a:any) => a.name === topArtists[curArtist].name)).length ?? 0}曲`], ['保存曲数', `${spotifyData?.savedTracks?.items?.filter((t:any) => t.track?.artists?.some((a:any) => a.name === topArtists[curArtist].name)).length ?? 0}曲`], ['最近の再生', `${spotifyData?.recentlyPlayed?.items?.filter((t:any) => t.track?.artists?.some((a:any) => a.name === topArtists[curArtist].name)).length ?? 0}曲/50`]].map(([l, v]) => (
                  <div key={l} style={{ background: '#222', borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Now Playing */}
      {recentTracks[0] && (
        <div style={{ position: 'fixed', bottom: 60, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: '#1a1a1a', borderTop: '0.5px solid #222', padding: '8px 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          {recentTracks[0].track?.album?.images?.[0]?.url
            ? <img src={recentTracks[0].track.album.images[0].url} style={{ width: 44, height: 44, borderRadius: 6, flexShrink: 0 }} />
            : <div style={{ width: 44, height: 44, borderRadius: 6, background: '#333', flexShrink: 0 }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{recentTracks[0].track?.name}</div>
            <div style={{ fontSize: 11, color: '#888' }}>{recentTracks[0].track?.artists?.[0]?.name}</div>
          </div>
          <div style={{ fontSize: 22, color: '#1DB954' }}>▶</div>
        </div>
      )}

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
