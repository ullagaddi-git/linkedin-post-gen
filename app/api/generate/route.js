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

    // Generate a highly topic-specific image using Pollinations AI
    const imagePrompt = encodeURIComponent(
      `Professional LinkedIn banner illustration about "${topic}", ${audience ? `targeting ${audience},` : ''} modern flat design, clean corporate aesthetic, bold typography concept, blue and white color scheme, abstract business concept art, no people, no faces, minimalist icons, professional background`
    )
    const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=1200&height=630&nologo=true&enhance=true&seed=${Date.now()}`

    return Response.json({ posts: parsed.posts, imageUrl, topic })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
