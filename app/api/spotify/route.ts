import { getServerSession } from 'next-auth'
import { getTopArtists, getTopTracks, getRecentlyPlayed, getSavedTracks } from '@/lib/spotify'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession()
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = session.accessToken
  const [topArtistsLong, topArtistsShort, topTracks, recentlyPlayed, savedTracks] = await Promise.all([
    getTopArtists(token, 'long_term'),
    getTopArtists(token, 'short_term'),
    getTopTracks(token, 'short_term'),
    getRecentlyPlayed(token),
    getSavedTracks(token),
  ])
  return NextResponse.json({ topArtistsLong, topArtistsShort, topTracks, recentlyPlayed, savedTracks })
}
