export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')
  const topic = searchParams.get('topic') || 'LinkedIn Post'

  if (!imageUrl) return Response.json({ error: 'No URL provided' }, { status: 400 })

  // Try fetching the real image first
  const delays = [0, 3000, 6000, 10000]
  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (delays[attempt] > 0) await new Promise(r => setTimeout(r, delays[attempt]))
    try {
      const response = await fetch(imageUrl, { headers: { Accept: 'image/*' } })
      const contentType = response.headers.get('content-type') || ''
      if (response.ok && contentType.includes('image')) {
        const buffer = await response.arrayBuffer()
        return new Response(buffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="linkedin-banner.png"`,
            'Cache-Control': 'no-cache',
          },
        })
      }
    } catch (err) {
      console.log(`Attempt ${attempt + 1} error:`, err.message)
    }
  }

  // ── FALLBACK: Professional topic-branded SVG ──

  // Split topic into up to 3 lines
  const words = topic.split(' ')
  const lines = []
  let current = ''
  for (const word of words) {
    if ((current + ' ' + word).trim().length > 20) {
      if (current) lines.push(current.trim())
      current = word
    } else {
      current = (current + ' ' + word).trim()
    }
  }
  if (current) lines.push(current.trim())
  const maxLines = lines.slice(0, 3)

  // Auto-generate hashtags from topic keywords
  const stopWords = new Set(['the','of','in','a','an','and','or','to','for','with','on','at','by','from','is','are','be','was','were','how','what','why','when'])
  const hashtags = topic.split(' ')
    .filter(w => w.length > 3 && !stopWords.has(w.toLowerCase()))
    .slice(0, 4)
    .map(w => '#' + w.replace(/[^a-zA-Z0-9]/g, ''))
    .join('   ')

  // Pick gradient colors based on topic keywords
  const topicLower = topic.toLowerCase()
  let grad1 = '#0f172a', grad2 = '#0077B5', grad3 = '#00A0DC'
  if (/ai|machine|neural|robot|tech|data|software|digital|cyber/.test(topicLower)) {
    grad1 = '#0f0c29'; grad2 = '#302b63'; grad3 = '#24243e'
  } else if (/health|medical|medicine|care|hospital|wellness/.test(topicLower)) {
    grad1 = '#0f2027'; grad2 = '#203a43'; grad3 = '#2c5364'
  } else if (/finance|money|invest|bank|econom|market|trading/.test(topicLower)) {
    grad1 = '#1a1a2e'; grad2 = '#16213e'; grad3 = '#0f3460'
  } else if (/market|brand|social|content|creativ|design/.test(topicLower)) {
    grad1 = '#200122'; grad2 = '#6f0000'; grad3 = '#200122'
  } else if (/leader|manage|strat|business|entrepr|startup/.test(topicLower)) {
    grad1 = '#0d0d0d'; grad2 = '#1a1a2e'; grad3 = '#0077B5'
  }

  // Font size based on longest line
  const longest = Math.max(...maxLines.map(l => l.length))
  const fontSize = longest > 18 ? 44 : longest > 14 ? 52 : 60

  // Line Y positions (vertically centered)
  const totalTextHeight = maxLines.length * (fontSize + 14)
  const startY = 512 - totalTextHeight / 2 + fontSize

  const textLines = maxLines.map((line, i) =>
    `<text x="512" y="${startY + i * (fontSize + 14)}" font-family="'Arial Black', Arial, sans-serif" font-size="${fontSize}" font-weight="900" fill="white" text-anchor="middle" opacity="0.97">${line}</text>`
  ).join('\n  ')

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${grad1}"/>
      <stop offset="50%" stop-color="${grad2}"/>
      <stop offset="100%" stop-color="${grad3}"/>
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(0,119,181,0.5)"/>
      <stop offset="100%" stop-color="rgba(0,119,181,0)"/>
    </linearGradient>
    <filter id="blur">
      <feGaussianBlur stdDeviation="40"/>
    </filter>
  </defs>

  <!-- Base background -->
  <rect width="1024" height="1024" fill="url(#bg)"/>

  <!-- Ambient glow blobs -->
  <circle cx="200" cy="200" r="300" fill="${grad2}" opacity="0.25" filter="url(#blur)"/>
  <circle cx="824" cy="824" r="280" fill="${grad3}" opacity="0.2" filter="url(#blur)"/>
  <circle cx="800" cy="200" r="200" fill="${grad3}" opacity="0.15" filter="url(#blur)"/>

  <!-- Grid lines -->
  <g stroke="rgba(255,255,255,0.04)" stroke-width="1">
    ${Array.from({length: 10}, (_, i) => `<line x1="${i*114}" y1="0" x2="${i*114}" y2="1024"/>`).join('')}
    ${Array.from({length: 10}, (_, i) => `<line x1="0" y1="${i*114}" x2="1024" y2="${i*114}"/>`).join('')}
  </g>

  <!-- Diagonal accent line -->
  <line x1="0" y1="800" x2="1024" y2="200" stroke="rgba(0,160,220,0.15)" stroke-width="1.5"/>
  <line x1="0" y1="820" x2="1024" y2="220" stroke="rgba(0,160,220,0.08)" stroke-width="1"/>

  <!-- Top bar accent -->
  <rect x="0" y="0" width="1024" height="4" fill="${grad3}" opacity="0.8"/>

  <!-- Center glow panel -->
  <rect x="60" y="340" width="904" height="${maxLines.length * (fontSize + 14) + 80}" rx="20" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  <!-- Topic text -->
  ${textLines}

  <!-- Divider lines -->
  <rect x="160" y="${startY - 50}" width="704" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
  <rect x="160" y="${startY + maxLines.length * (fontSize + 14) + 10}" width="704" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>

  <!-- Hashtags -->
  <text x="512" y="${startY + maxLines.length * (fontSize + 14) + 60}" font-family="Arial, sans-serif" font-size="22" fill="rgba(0,160,220,0.9)" text-anchor="middle" font-weight="600">${hashtags || '#LinkedIn #Professional #Content'}</text>

  <!-- LinkedIn "in" badge — top left, small and tasteful -->
  <rect x="48" y="48" width="56" height="56" rx="10" fill="#0077B5"/>
  <text x="76" y="86" font-family="'Arial Black', Arial, sans-serif" font-size="36" font-weight="900" fill="white" text-anchor="middle">in</text>

  <!-- Corner dots decoration -->
  <circle cx="940" cy="940" r="5" fill="rgba(0,160,220,0.6)"/>
  <circle cx="960" cy="940" r="3" fill="rgba(0,160,220,0.3)"/>
  <circle cx="940" cy="960" r="3" fill="rgba(0,160,220,0.3)"/>

  <!-- Bottom bar accent -->
  <rect x="0" y="1020" width="1024" height="4" fill="${grad3}" opacity="0.8"/>
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Content-Disposition': `attachment; filename="linkedin-banner-${topic.replace(/\s+/g, '-').toLowerCase()}.svg"`,
      'Cache-Control': 'no-cache',
    },
  })
}