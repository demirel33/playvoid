export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { term, country, mode } = req.query;
  
  if (!term) {
    return res.status(400).json({ error: 'term required' });
  }

  try {
    let url;
    
    if (mode === 'party') {
      // Party mode: filter by energetic genres only
      // genreId: 7=Electronic, 18=Hip-Hop/Rap, 17=Dance, 15=R&B/Soul
      const partyGenres = ['7', '18', '17', '15'];
      const randomGenre = partyGenres[Math.floor(Math.random() * partyGenres.length)];
      url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=50&explicit=Yes&country=${country || 'us'}&genreId=${randomGenre}`;
    } else {
      url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=50&explicit=Yes&country=${country || 'us'}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('iTunes API error: ' + response.status);
    }
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
