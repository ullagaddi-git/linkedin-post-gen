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
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">LinkedIn Post Generator</h1>
          <p className="text-gray-500 text-lg">AI-powered posts tailored to your audience</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Topic *</label>
              <input
                type="text"
                value={formData.topic}
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g. The future of AI in healthcare"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tone</label>
              <select
                value={formData.tone}
                onChange={e => setFormData({ ...formData, tone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Professional</option>
                <option>Conversational</option>
                <option>Inspirational</option>
                <option>Educational</option>
                <option>Storytelling</option>
                <option>Bold & Direct</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Target Audience</label>
              <input
                type="text"
                value={formData.audience}
                onChange={e => setFormData({ ...formData, audience: e.target.value })}
                placeholder="e.g. Startup founders, HR professionals"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Context</label>
              <textarea
                value={formData.context}
                onChange={e => setFormData({ ...formData, context: e.target.value })}
                placeholder="Any extra details, personal story, data points..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Generating...' : '✨ Generate LinkedIn Posts'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">

            {/* Posts */}
            {result.posts?.map((post, i) => (
              <div key={post.id || i} className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700">Variation {i + 1}</h3>
                  <button
                    onClick={() => handleCopy(post.content, post.id || i)}
                    className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-1.5 rounded-lg transition-colors"
                  >
                    {copied === (post.id || i) ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
              </div>
            ))}

            {/* Generated Image */}
            {result.imageUrl && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-700">Generated Image</h3>
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="text-sm bg-green-50 hover:bg-green-100 text-green-700 px-4 py-1.5 rounded-lg transition-colors"
                  >
                    {downloading ? 'Downloading...' : '⬇️ Download'}
                  </button>
                </div>

                {imgError ? (
                  <div className="w-full h-64 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-6xl font-black mb-2">in</div>
                      <div className="text-lg font-semibold">{formData.topic}</div>
                      <div className="text-sm opacity-75 mt-1">Download to get full banner</div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={result.imageUrl}
                    alt="Generated LinkedIn banner"
                    className="w-full rounded-xl object-cover max-h-80"
                    onError={() => setImgError(true)}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}