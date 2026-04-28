'use client'
import { useState } from 'react'

const TONES = ['Professional', 'Conversational', 'Inspirational', 'Educational', 'Storytelling', 'Bold & Direct']

const TODAY = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
const EDITION = `Vol. ${new Date().getFullYear()} · No. ${String(Math.floor((Date.now() / 86400000) % 999)).padStart(3, '0')}`

export default function Home() {
  const [formData, setFormData] = useState({ topic: '', tone: 'Professional', audience: '', context: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleGenerate = async () => {
    if (!formData.topic.trim()) { setError('Please enter a topic to continue.'); return }
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
    <div className="press">

      {/* ── Masthead ── */}
      <header className="masthead">
        <div className="masthead-meta">{TODAY}</div>
        <div className="masthead-mark">
          <span className="in-mark">in</span>
          The Post <em>Press</em>
        </div>
        <div className="masthead-meta right">{EDITION}</div>
      </header>
      <div className="rule-double" />

      {/* ── Hero ── */}
      <section className="hero">
        <div>
          <div className="hero-eyebrow">An Editorial Composer</div>
          <h1 className="hero-title">
            Posts that <em>read</em><br />
            like prose,<br />
            not pitches<sup>01</sup>
          </h1>
        </div>
        <div>
          <p className="hero-deck">
            A craft tool for the serious writer on LinkedIn — three considered drafts and a paired plate, set in editorial type and ready to publish.
          </p>
          <div className="hero-byline">
            <span>Three drafts</span>
            <span>Paired plate</span>
            <span>One quiet click</span>
          </div>
        </div>
      </section>

      {/* ── Compose ── */}
      <section className="compose">
        <aside className="compose-side">
          <div className="compose-side-num">No.<br/>01</div>
          <p className="compose-side-title">The Brief</p>
          <p className="compose-side-note">Begin with the subject. The rest gives the press its voice.</p>
        </aside>

        <div className="compose-main">
          <div className="field-grid">

            <div className="field field-wide">
              <label className="field-label">
                <span>Subject</span>
                <span className="req">*</span>
              </label>
              <input
                className="field-input"
                type="text"
                value={formData.topic}
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder="On the quiet rise of small teams shipping faster than giants…"
                autoFocus
              />
            </div>

            <div className="field">
              <label className="field-label"><span>Register</span></label>
              <select
                className="field-input"
                value={formData.tone}
                onChange={e => setFormData({ ...formData, tone: e.target.value })}
              >
                {TONES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="field">
              <label className="field-label"><span>Reader</span></label>
              <input
                className="field-input"
                type="text"
                value={formData.audience}
                onChange={e => setFormData({ ...formData, audience: e.target.value })}
                placeholder="CTOs, founders, designers…"
              />
            </div>

            <div className="field field-wide">
              <label className="field-label">
                <span>Marginalia</span>
                <span className="opt">— optional</span>
              </label>
              <textarea
                className="field-input"
                value={formData.context}
                onChange={e => setFormData({ ...formData, context: e.target.value })}
                placeholder="A figure, an anecdote, a sharp angle the press should keep in mind…"
                rows={3}
              />
            </div>
          </div>

          {error && <div className="notice">{error}</div>}

          <div className="compose-submit">
            <p className="compose-foot">
              <strong>Llama 3.3</strong> sets three drafts and pulls a paired plate, all in editorial type.
            </p>
            <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
              {loading ? 'Setting type' : 'Set the type'}
            </button>
          </div>
        </div>
      </section>

      {/* ── Results ── */}
      {result && (
        <>
          <section className="proof">
            <div className="section-head">
              <span className="section-head-num">02 ¶</span>
              <h2 className="section-head-title">Three drafts, freshly pulled</h2>
              <span className="section-head-rule" />
              <span className="section-head-meta">For your reading</span>
            </div>

            <div className="stagger">
              {result.posts?.map((post, i) => (
                <article className="variation" key={post.id || i}>
                  <div className="var-mark">
                    {String(i + 1).padStart(2, '0')}<sup>·{['I','II','III'][i] || ''}</sup>
                  </div>
                  <div className="var-body">{post.content}</div>
                  <div className="var-meta">
                    <span className="var-tag"><b>{post.content?.length || 0}</b> chars</span>
                    <span className="var-tag">Tone · <b>{formData.tone}</b></span>
                    <button
                      className={`btn-ghost${copied === (post.id || i) ? ' success' : ''}`}
                      onClick={() => handleCopy(post.content, post.id || i)}
                    >
                      {copied === (post.id || i) ? 'Copied ✓' : 'Copy →'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ── Plate (banner) ── */}
          {result.imageUrl && (
            <section className="plate">
              <aside>
                <div className="plate-meta-num">No.<br/>02</div>
                <p className="plate-meta-title">The Plate</p>
                <p className="plate-meta-note">A paired image, drawn to the brief. Save it for the post.</p>
                <button className="btn-ghost" onClick={handleDownload} disabled={downloading}>
                  {downloading ? 'Pulling…' : 'Download ↓'}
                </button>
              </aside>

              {imgError ? (
                <div className="plate-fallback">
                  <div className="plate-fallback-mark">in</div>
                  <h3 className="plate-fallback-title">{formData.topic}</h3>
                  <span className="plate-fallback-note">Download for full resolution</span>
                </div>
              ) : (
                <div className="plate-frame">
                  <img
                    src={result.imageUrl}
                    alt="AI-generated LinkedIn banner"
                    onError={() => setImgError(true)}
                  />
                  <span className="plate-cap">Plate · {formData.topic}</span>
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* ── Empty state ── */}
      {!result && !loading && (
        <section className="empty">
          <p className="empty-mark">A blank <em>page</em>,<br/>awaiting its subject.</p>
          <p className="empty-note">Enter a topic above. The press will set three drafts and pull a paired plate.</p>
        </section>
      )}

      {/* ── Colophon ── */}
      <footer className="colophon">
        <div>Set in <em>Fraunces</em> &amp; <em>Geist</em> · Printed by Llama 3.3</div>
        <div className="right">An editorial machine — not a content factory</div>
      </footer>
    </div>
  )
}
