'use client'
import { useState } from 'react'

export default function Home() {
  const [formData, setFormData] = useState({
    topic: '',
    tone: 'Professional',
    audience: '',
    context: ''
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a topic')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    setImgError(false)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text, id) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDownload = async () => {
    if (!result) return
    setDownloading(true)
    try {
      const topicParam = encodeURIComponent(formData.topic || 'LinkedIn Post')
      const proxyUrl = `/api/download-image?url=${encodeURIComponent(result.imageUrl)}&topic=${topicParam}`
      const response = await fetch(proxyUrl)
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const ext = blob.type.includes('svg') ? 'svg' : 'png'
      a.download = `linkedin-banner-${formData.topic.replace(/\s+/g, '-').toLowerCase()}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Download failed: ' + err.message)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f0f7ff 100%)', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0077B5 0%, #005885 60%, #003f6b 100%)', padding: '48px 24px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 40%)', pointerEvents: 'none' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: 'white', borderRadius: '10px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#0077B5', fontSize: '24px', fontWeight: '900', lineHeight: 1 }}>in</span>
          </div>
          <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>LinkedIn Post Generator</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '17px', margin: 0, fontWeight: '400' }}>
          Generate AI-powered posts tailored to your audience in seconds
        </p>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 20px 60px' }}>

        {/* Form Card */}
        <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '40px', marginTop: '-28px', position: 'relative', zIndex: 10 }}>

          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>✍️</span> Craft Your Post
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* Topic - full width */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Topic <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g. The future of AI in healthcare"
                style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '12px', padding: '14px 16px', fontSize: '15px', color: '#111827', background: '#fafafa', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#0077B5'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Tone */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tone
              </label>
              <select
                value={formData.tone}
                onChange={e => setFormData({ ...formData, tone: e.target.value })}
                style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '12px', padding: '14px 16px', fontSize: '15px', color: '#111827', background: '#fafafa', outline: 'none', boxSizing: 'border-box', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                onFocus={e => e.target.style.borderColor = '#0077B5'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Target Audience
              </label>
              <input
                type="text"
                value={formData.audience}
                onChange={e => setFormData({ ...formData, audience: e.target.value })}
                placeholder="e.g. Startup founders, HR leaders"
                style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '12px', padding: '14px 16px', fontSize: '15px', color: '#111827', background: '#fafafa', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#0077B5'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Context - full width */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Additional Context
              </label>
              <textarea
                value={formData.context}
                onChange={e => setFormData({ ...formData, context: e.target.value })}
                placeholder="Any personal story, key data points, or specific angle you want to highlight..."
                rows={3}
                style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '12px', padding: '14px 16px', fontSize: '15px', color: '#111827', background: '#fafafa', outline: 'none', boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = '#0077B5'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          {error && (
            <div style={{ marginTop: '16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px', padding: '12px 16px', fontSize: '14px' }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              marginTop: '24px', width: '100%',
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #0077B5 0%, #005885 100%)',
              color: 'white', border: 'none', borderRadius: '12px',
              padding: '16px', fontSize: '16px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.3px', transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(0,119,181,0.35)'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Generating your posts...
              </span>
            ) : '✨ Generate LinkedIn Posts'}
          </button>

          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @media (max-width: 600px) {
              .form-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>

        {/* Results */}
        {result && (
          <div style={{ marginTop: '32px' }}>

            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Generated Posts</span>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            </div>

            {/* Post variations */}
            {result.posts?.map((post, i) => (
              <div key={post.id || i} style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '28px', marginBottom: '16px', border: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #0077B5, #005885)', color: 'white', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700' }}>
                      {i + 1}
                    </div>
                    <span style={{ fontWeight: '600', color: '#374151', fontSize: '15px' }}>Variation {i + 1}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(post.content, post.id || i)}
                    style={{
                      background: copied === (post.id || i) ? '#dcfce7' : '#f0f9ff',
                      color: copied === (post.id || i) ? '#16a34a' : '#0077B5',
                      border: `1px solid ${copied === (post.id || i) ? '#86efac' : '#bae6fd'}`,
                      borderRadius: '8px', padding: '7px 16px', fontSize: '13px',
                      fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {copied === (post.id || i) ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <p style={{ color: '#374151', lineHeight: '1.75', fontSize: '15px', margin: 0, whiteSpace: 'pre-wrap' }}>{post.content}</p>
              </div>
            ))}

            {/* Generated Image */}
            {result.imageUrl && (
              <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '28px', border: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>🖼️</span>
                    <span style={{ fontWeight: '600', color: '#374151', fontSize: '15px' }}>AI-Generated Banner</span>
                    <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: '600' }}>Topic-matched</span>
                  </div>
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    style={{
                      background: downloading ? '#f9fafb' : '#f0fdf4',
                      color: downloading ? '#9ca3af' : '#16a34a',
                      border: `1px solid ${downloading ? '#e5e7eb' : '#86efac'}`,
                      borderRadius: '8px', padding: '7px 16px', fontSize: '13px',
                      fontWeight: '600', cursor: downloading ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {downloading ? 'Downloading...' : '⬇️ Download'}
                  </button>
                </div>

                {imgError ? (
                  <div style={{ background: 'linear-gradient(135deg, #0f172a, #0077B5, #00A0DC)', borderRadius: '12px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '56px', fontWeight: '900', color: 'white' }}>in</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: 'white', textAlign: 'center', padding: '0 24px' }}>{formData.topic}</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>Download to get your full banner</div>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={result.imageUrl}
                      alt="Generated LinkedIn banner"
                      style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', maxHeight: '340px', display: 'block' }}
                      onError={() => setImgError(true)}
                    />
                    <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', color: 'white', borderRadius: '8px', padding: '4px 10px', fontSize: '12px' }}>
                      AI Generated · Topic: {formData.topic}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💼</div>
            <p style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 4px' }}>Ready to create your next viral post?</p>
            <p style={{ fontSize: '14px', margin: 0 }}>Fill in your topic above and hit Generate</p>
          </div>
        )}
      </div>
    </main>
  )
}
