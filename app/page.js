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

      {/* ── Hero Header ── */}
      <header className="hero-header">
        {/* Decorative dots */}
        <div className="hero-dot" style={{ width: 180, height: 180, top: -60, left: -40 }} />
        <div className="hero-dot" style={{ width: 120, height: 120, top: 20, right: 60, opacity: 0.06 }} />
        <div className="hero-dot" style={{ width: 80,  height: 80,  bottom: 30, left: '30%', opacity: 0.08 }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Logo pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 50, padding: '6px 18px 6px 8px', marginBottom: 24 }}>
            <div style={{ background: 'white', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#0077B5', fontSize: 18, fontWeight: 900, lineHeight: 1 }}>in</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600, letterSpacing: 0.3 }}>AI-Powered Content</span>
          </div>

          <h1 style={{ color: 'white', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, margin: '0 0 14px', letterSpacing: -1, lineHeight: 1.1 }}>
            LinkedIn Post Generator
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 17, margin: 0, fontWeight: 400, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
            Create scroll-stopping posts tailored to your audience — powered by AI
          </p>

          {/* Stats strip */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 28, flexWrap: 'wrap' }}>
            {[['3', 'Post Variations'], ['AI', 'Image Included'], ['1-Click', 'Copy & Share']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ color: 'white', fontSize: 20, fontWeight: 800 }}>{val}</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 500, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px 80px' }}>

        {/* ── Form Card ── */}
        <div className="card" style={{ marginTop: -32, position: 'relative', zIndex: 10, padding: '36px 40px 40px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{ width: 4, height: 22, background: 'linear-gradient(180deg,#0077B5,#005885)', borderRadius: 4 }} />
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: 0 }}>Create Your Post</h2>
          </div>

          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Topic */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="field-label">Topic <span style={{ color: '#ef4444', fontSize: 13 }}>*</span></label>
              <input
                className="field-input"
                type="text"
                value={formData.topic}
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g. The future of AI in healthcare, Leadership lessons from 10 years..."
              />
            </div>

            {/* Tone */}
            <div>
              <label className="field-label">Tone</label>
              <select className="field-input" value={formData.tone} onChange={e => setFormData({ ...formData, tone: e.target.value })}>
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
                placeholder="e.g. Startup founders, HR leaders"
              />
            </div>

            {/* Context */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="field-label">Additional Context <span style={{ color: '#9ca3af', fontSize: 11, textTransform: 'none', letterSpacing: 0, fontWeight: 500 }}> — optional</span></label>
              <textarea
                className="field-input"
                value={formData.context}
                onChange={e => setFormData({ ...formData, context: e.target.value })}
                placeholder="Any personal story, statistics, or specific angle you want to highlight..."
                rows={3}
                style={{ resize: 'none' }}
              />
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 10, padding: '12px 16px', fontSize: 14 }}>
              <span style={{ fontSize: 18 }}>⚠️</span> {error}
            </div>
          )}

          <button className="btn-primary" onClick={handleGenerate} disabled={loading} style={{ marginTop: 24 }}>
            {loading
              ? <><span className="spinner" />Generating your posts…</>
              : '✨  Generate LinkedIn Posts'
            }
          </button>

          {/* Helper text */}
          <p style={{ textAlign: 'center', fontSize: 12.5, color: '#9ca3af', margin: '12px 0 0', fontWeight: 500 }}>
            Powered by Llama 3.3 · Generates 3 unique variations + a banner image
          </p>
        </div>

        {/* ── Results ── */}
        {result && (
          <div className="fade-up">

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">✦ Generated Results</span>
              <div className="divider-line" />
            </div>

            {/* Post cards */}
            {result.posts?.map((post, i) => (
              <div className="card card-hover" key={post.id || i} style={{ padding: '26px 28px', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="var-badge">{i + 1}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: 15, lineHeight: 1 }}>Variation {i + 1}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>{post.content?.length || 0} characters</div>
                    </div>
                  </div>
                  <button
                    className={`btn-copy${copied === (post.id || i) ? ' copied' : ''}`}
                    onClick={() => handleCopy(post.content, post.id || i)}
                  >
                    {copied === (post.id || i) ? '✅ Copied!' : '📋 Copy Post'}
                  </button>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#f3f4f6', margin: '0 0 18px' }} />

                <p className="post-text">{post.content}</p>
              </div>
            ))}

            {/* Banner Image card */}
            {result.imageUrl && (
              <div className="card" style={{ padding: '26px 28px', marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: '#f0f9ff', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🖼️</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: 15, lineHeight: 1 }}>AI Banner Image</div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>Generated from your topic</div>
                    </div>
                    <span className="badge">✦ Topic-matched</span>
                  </div>
                  <button className="btn-download" onClick={handleDownload} disabled={downloading}>
                    {downloading ? 'Downloading…' : '⬇️ Download'}
                  </button>
                </div>

                <div style={{ height: 1, background: '#f3f4f6', margin: '0 0 18px' }} />

                {imgError ? (
                  <div style={{ background: 'linear-gradient(135deg, #003f6b, #0077B5, #00a0dc)', borderRadius: 12, minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <span style={{ fontSize: 52, fontWeight: 900, color: 'white' }}>in</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'white', textAlign: 'center', padding: '0 24px' }}>{formData.topic}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Download to get full resolution</span>
                  </div>
                ) : (
                  <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
                    <img
                      src={result.imageUrl}
                      alt="Generated LinkedIn banner"
                      style={{ width: '100%', display: 'block', maxHeight: 360, objectFit: 'cover', borderRadius: 12 }}
                      onError={() => setImgError(true)}
                    />
                    <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', color: 'white', borderRadius: 7, padding: '4px 11px', fontSize: 12, fontWeight: 500 }}>
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
          <div style={{ textAlign: 'center', padding: '56px 24px 40px' }}>
            <div style={{ width: 72, height: 72, background: 'white', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>💼</div>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#374151', margin: '0 0 6px' }}>Ready to craft your next post?</p>
            <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Fill in your topic above and let AI do the heavy lifting</p>
          </div>
        )}
      </main>
    </div>
  )
}
