const BASE_URL = 'https://api.spotify.com/v1'

async function fetchSpotify(url: string, token: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function getTopArtists(token: string, range: string = 'long_term') {
  return fetchSpotify(`${BASE_URL}/me/top/artists?limit=10&time_range=${range}`, token)
}

export async function getTopTracks(token: string, range: string = 'short_term') {
  return fetchSpotify(`${BASE_URL}/me/top/tracks?limit=50&time_range=${range}`, token)
}

export async function getRecentlyPlayed(token: string) {
  return fetchSpotify(`${BASE_URL}/me/player/recently-played?limit=50`, token)
}

export async function getFollowedArtists(token: string) {
  return fetchSpotify(`${BASE_URL}/me/following?type=artist&limit=50`, token)
}

export async function getSavedTracks(token: string) {
  return fetchSpotify(`${BASE_URL}/me/tracks?limit=50`, token)
}
