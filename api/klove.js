export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    const response = await fetch('https://www.klove.com/api/music/nowPlaying?channelId=18&streamId=1291', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.klove.com/',
        'Origin': 'https://www.klove.com'
      }
    });
    
    if (!response.ok) {
      throw new Error(`K-LOVE API returned ${response.status}`);
    }
    
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Error fetching K-LOVE data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch K-LOVE data', 
      message: error.message 
    });
  }
}