'use client'
import { useState } from 'react'

export default function Home() {
  const [formData, setFormData] = useState({ topic: '', tone: 'Professional', audience: '', context: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleGenerate = async () => {
    if (!formData.topic.trim()) { setError('Please enter a topic to continue'); return }
    setLoading(true); setError(null); setResult(null); setImgError(false)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleCopy = async (text, id) => {
    await navigator.clipboard.writeText(text)
    setCopied(id); setTimeout(() => setCopied(null), 2200)
  }

  const handleDownload = async () => {
    if (!result) return
    setDownloading(true)
    try {
      const topicParam = encodeURIComponent(formData.topic || 'LinkedIn Post')
      const res = await fetch(`/api/download-image?url=${encodeURIComponent(result.imageUrl)}&topic=${topicParam}`)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `linkedin-banner-${formData.topic.replace(/\s+/g, '-').toLowerCase()}.${blob.type.includes('svg') ? 'svg' : 'png'}`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) { alert('Download failed: ' + err.message) }
    finally { setDownloading(false) }
  }

  return (
    <div className="app-bg">

      {/* ══════════════════════════════
          HERO HEADER — Deep Navy + LinkedIn Sky Blue
      ══════════════════════════════ */}
      <header className="hero-header">

        {/* Glow orbs */}
        <div className="hero-glow-orb" style={{ width: 500, height: 300, background: 'rgba(10,102,194,0.35)', top: -80, left: '50%', transform: 'translateX(-50%)' }} />
        <div className="hero-glow-orb" style={{ width: 260, height: 260, background: 'rgba(0,160,220,0.15)', top: 40, left: '10%' }} />
        <div className="hero-glow-orb" style={{ width: 200, height: 200, background: 'rgba(112,181,249,0.10)', top: 20, right: '8%' }} />

        <div style={{ position: 'relative', zIndex: 3, maxWidth: 700, margin: '0 auto' }}>

          {/* Top pill badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(112,181,249,0.12)', border: '1px solid rgba(112,181,249,0.25)', borderRadius: 50, padding: '7px 20px 7px 10px', marginBottom: 32 }}>
            <div style={{ background: '#0A66C2', borderRadius: 7, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'white', fontSize: 15, fontWeight: 900, lineHeight: 1 }}>in</span>
            </div>
            <span style={{ color: '#70B5F9', fontSize: 13, fontWeight: 600, letterSpacing: 0.4 }}>AI-Powered LinkedIn Content</span>
          </div>

          {/* Main headline — LinkedIn sky blue */}
          <h1 style={{
            color: '#70B5F9',
            fontSize: 'clamp(36px, 6vw, 58px)',
            fontWeight: 900,
            margin: '0 0 18px',
            letterSpacing: -1.5,
            lineHeight: 1.08,
            textShadow: '0 0 60px rgba(112,181,249,0.4), 0 2px 4px rgba(0,0,0,0.3)'
          }}>
            LinkedIn Post<br />Generator
          </h1>

          {/* Subtitle */}
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, margin: '0 auto 44px', fontWeight: 400, maxWidth: 480, lineHeight: 1.6 }}>
            Transform your ideas into scroll-stopping LinkedIn posts — powered by AI, tailored to your audience
          </p>

          {/* Stat pills row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {[
              { icon: '✦', label: '3 Unique Variations' },
              { icon: '🖼️', label: 'AI Banner Included' },
              { icon: '⚡', label: 'Instant Results' },
              { icon: '📋', label: '1-Click Copy' },
            ].map(s => (
              <div key={s.label} className="stat-pill">
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════
          CONTENT AREA — Light slate background
      ══════════════════════════════ */}
      <div className="content-area">
        <div style={{ maxWidth: 780, margin: '0 auto' }}>

          {/* ── Form Card ── */}
          <div className="card" style={{ padding: '40px 44px 44px' }}>

            {/* Card title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <div style={{ width: 4, height: 26, background: 'linear-gradient(180deg,#0A66C2,#004182)', borderRadius: 4, flexShrink: 0 }} />
              <div>
                <h2 style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>Craft Your Post</h2>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0', fontWeight: 400 }}>Fill in the details below to generate AI-powered LinkedIn content</p>
              </div>
            </div>

            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>

              {/* Topic — full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="field-label">
                  Topic <span style={{ color: '#ef4444', fontWeight: 800 }}>*</span>
                </label>
                <input
                  className="field-input"
                  type="text"
                  value={formData.topic}
                  onChange={e => setFormData({ ...formData, topic: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                  placeholder="e.g. How AI is reshaping project management in 2025..."
                  style={{ fontSize: 16, padding: '15px 18px' }}
                />
              </div>

              {/* Tone */}
              <div>
                <label className="field-label">Writing Tone</label>
                <select
                  className="field-input"
                  value={formData.tone}
                  onChange={e => setFormData({ ...formData, tone: e.target.value })}
                >
                  <option>Professional</option>
                  <option>Conversational</option>
                  <option>Inspirational</option>
                  <option>Educational</option>
                  <option>Storytelling</option>
                  <option>Bold & Direct</option>
                </select>
              </div>

              {/* Audience */}
              <div>
                <label className="field-label">Target Audience</label>
                <input
                  className="field-input"
                  type="text"
                  value={formData.audience}
                  onChange={e => setFormData({ ...formData, audience: e.target.value })}
                  placeholder="e.g. CTOs, HR Managers, Startup Founders..."
                />
              </div>

              {/* Context — full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="field-label">
                  Additional Context
                  <span style={{ color: '#94a3b8', fontSize: 11, textTransform: 'none', letterSpacing: 0, fontWeight: 500, marginLeft: 6 }}>— optional</span>
                </label>
                <textarea
                  className="field-input"
                  value={formData.context}
                  onChange={e => setFormData({ ...formData, context: e.target.value })}
                  placeholder="Share a personal story, key data points, or a specific angle you want the post to highlight..."
                  rows={4}
                  style={{ resize: 'none', lineHeight: 1.65 }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 11, padding: '13px 18px', fontSize: 14 }}>
                <span style={{ fontSize: 18 }}>⚠️</span> {error}
              </div>
            )}

            {/* Generate button */}
            <button className="btn-primary" onClick={handleGenerate} disabled={loading} style={{ marginTop: 28 }}>
              {loading
                ? <><span className="spinner" />Generating your posts…</>
                : <>✨&nbsp;&nbsp;Generate LinkedIn Posts</>
              }
            </button>

            {/* Footnote */}
            <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', margin: '14px 0 0', fontWeight: 500, letterSpacing: 0.2 }}>
              Powered by Llama 3.3 · Generates 3 unique variations + an AI-matched banner image
            </p>
          </div>

          {/* ── Results ── */}
          {result && (
            <div className="fade-up" style={{ marginTop: 36 }}>

              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">✦ Your Generated Posts</span>
                <div className="divider-line" />
              </div>

              {/* Post variation cards */}
              {result.posts?.map((post, i) => (
                <div className="card card-hover" key={post.id || i} style={{ padding: '28px 32px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="var-badge">{i + 1}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>Variation {i + 1}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{post.content?.length || 0} characters</div>
                      </div>
                    </div>
                    <button
                      className={`btn-copy${copied === (post.id || i) ? ' copied' : ''}`}
                      onClick={() => handleCopy(post.content, post.id || i)}
                    >
                      {copied === (post.id || i) ? '✅ Copied!' : '📋 Copy Post'}
                    </button>
                  </div>
                  <div style={{ height: 1, background: '#f1f5f9', margin: '0 0 18px' }} />
                  <p className="post-text">{post.content}</p>
                </div>
              ))}

              {/* Image card */}
              {result.imageUrl && (
                <div className="card" style={{ padding: '28px 32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 38, height: 38, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🖼️</div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>AI Banner Image</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Generated to match your topic</div>
                      </div>
                      <span className="badge-sky">✦ Topic-matched</span>
                    </div>
                    <button className="btn-download" onClick={handleDownload} disabled={downloading}>
                      {downloading ? 'Downloading…' : '⬇️ Download'}
                    </button>
                  </div>
                  <div style={{ height: 1, background: '#f1f5f9', margin: '0 0 18px' }} />
                  {imgError ? (
                    <div style={{ background: 'linear-gradient(135deg, #001B41, #0A66C2, #00A0DC)', borderRadius: 14, minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <span style={{ fontSize: 54, fontWeight: 900, color: 'white' }}>in</span>
                      <span style={{ fontSize: 22, fontWeight: 700, color: 'white', textAlign: 'center', padding: '0 24px' }}>{formData.topic}</span>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Download to get full resolution banner</span>
                    </div>
                  ) : (
                    <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden' }}>
                      <img
                        src={result.imageUrl}
                        alt="AI-generated LinkedIn banner"
                        style={{ width: '100%', display: 'block', maxHeight: 380, objectFit: 'cover', borderRadius: 14 }}
                        onError={() => setImgError(true)}
                      />
                      <div style={{ position: 'absolute', bottom: 14, left: 14, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', color: 'white', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 500 }}>
                        Topic: {formData.topic}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!result && !loading && (
            <div style={{ textAlign: 'center', padding: '64px 24px 40px' }}>
              <div style={{ width: 76, height: 76, background: 'white', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, margin: '0 auto 18px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>💼</div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#334155', margin: '0 0 8px' }}>Ready to craft your next viral post?</p>
              <p style={{ fontSize: 14, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>Enter your topic above and let AI generate<br />professional LinkedIn content in seconds</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
