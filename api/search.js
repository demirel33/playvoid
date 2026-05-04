export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const term = searchParams.get('term');
  const country = searchParams.get('country') || 'us';
  const mode = searchParams.get('mode') || 'random';

  if (!term) {
    return new Response(JSON.stringify({ error: 'term required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    let url;
    if (mode === 'party') {
      const partyGenres = ['7', '18', '17', '15'];
      const randomGenre = partyGenres[Math.floor(Math.random() * partyGenres.length)];
      url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=50&explicit=Yes&country=${country}&genreId=${randomGenre}`;
    } else {
      url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=50&explicit=Yes&country=${country}`;
    }

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
      cf: { cacheEverything: true, cacheTtl: 300 }
    });

    if (!response.ok) throw new Error('iTunes error: ' + response.status);

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
