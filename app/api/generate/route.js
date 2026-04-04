export async function POST(request) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return Response.json({ error: 'GROQ_API_KEY not found' }, { status: 500 })

  try {
    const { topic, tone, audience, context } = await request.json()

    const prompt = `You are a LinkedIn content expert. Generate 3 professional LinkedIn posts about:
Topic: ${topic}
Tone: ${tone}
Target Audience: ${audience || 'General professionals'}
Context: ${context || 'None'}

Each post must have: strong hook, 150-300 words, emojis, call to action, 3-5 hashtags.

Respond ONLY with this JSON, no markdown, no extra text:
{"posts":[{"id":1,"content":"post 1 here"},{"id":2,"content":"post 2 here"},{"id":3,"content":"post 3 here"}]}`

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    const data = await res.json()
    if (!res.ok) return Response.json({ error: `Groq: ${data?.error?.message}` }, { status: 500 })

    const text = data.choices?.[0]?.message?.content
    if (!text) return Response.json({ error: 'Empty response' }, { status: 500 })

    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)
    if (!match) return Response.json({ error: 'Parse error: ' + text.substring(0, 150) }, { status: 500 })

    const parsed = JSON.parse(match[0])

    // 1. Try Lexica.art — free AI image search, no key needed
    let imageUrl = null
    try {
      const lexicaQuery = encodeURIComponent(`${topic} professional corporate`)
      const lexicaRes = await fetch(`https://lexica.art/api/v1/search?q=${lexicaQuery}`, {
        headers: { Accept: 'application/json' }
      })
      if (lexicaRes.ok) {
        const lexicaData = await lexicaRes.json()
        if (lexicaData.images?.length > 0) {
          const idx = Math.floor(Math.random() * Math.min(8, lexicaData.images.length))
          imageUrl = lexicaData.images[idx].src
        }
      }
    } catch (e) {
      console.log('Lexica.art failed:', e.message)
    }

    // 2. Fallback to Pollinations (browser loads it directly)
    if (!imageUrl) {
      const imagePrompt = encodeURIComponent(
        `Photorealistic professional LinkedIn banner about ${topic}, cinematic lighting, no text, corporate aesthetic`
      )
      imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=1024&height=1024&nologo=true&seed=${Date.now()}`
    }

    return Response.json({ posts: parsed.posts, imageUrl, topic })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}