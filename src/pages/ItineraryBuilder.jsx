import { useState } from "react"
import { useNavigate } from "react-router-dom"

const SPOT_IMAGES = {
  "hasiru-mane": "/images/hasirumane.jpg",
  "loco-chocolates": "/images/loco-artisan-chocolates.jpg",
  "jin-min-cat": "/images/jin-min-catworld.jpeg",
  "uchiha-cafe": "/images/uchiha-cafe.jpeg",
  "mr-co-cane": "/images/cococaine.jpg",
}

export default function ItineraryBuilder() {
  const navigate = useNavigate()
  const [timeAvailable, setTimeAvailable] = useState("")
  const [interests, setInterests] = useState("")
  const [budget, setBudget] = useState("moderate")
  const [mobility, setMobility] = useState("walking fine")
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState([])
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeAvailable, interests, budget, mobility }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setItinerary(data.itinerary)
    } catch {
      setError("Nova couldn't plan right now. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const buildShareText = () =>
    "My Mysuru Day Plan 🗺️\n" +
    itinerary.map(i => `${i.arrivalTime} – ${i.name}`).join("\n") +
    "\n\nDiscover Mysuru: https://namma-mysuru.vercel.app"

  const handleWhatsApp = () => {
    window.open("https://wa.me/?text=" + encodeURIComponent(buildShareText()), "_blank")
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(buildShareText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
            ← Back
          </button>
          <span className="text-lg font-bold text-blue-600">Plan My Day</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">

        <h1 className="text-2xl font-bold text-gray-900">AI Itinerary Planner</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Tell Nova what you're in the mood for — she'll plan your perfect Mysuru day.
        </p>

        {/* INPUT CARD */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">

          {/* Time Available */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⏱ How much time do you have?
            </label>
            <div className="flex flex-wrap gap-2">
              {["1-2 hours", "Half day", "Full day"].map(opt => (
                <button key={opt} onClick={() => setTimeAvailable(opt)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors
                    ${timeAvailable === opt
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ✨ What are you into?
            </label>
            <textarea
              value={interests}
              onChange={e => setInterests(e.target.value)}
              rows={2}
              maxLength={200}
              placeholder="e.g. cats, healthy food, anime, nature, art..."
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm
                         text-gray-900 placeholder-gray-400 outline-none resize-none
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Budget */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💰 Budget preference
            </label>
            <div className="flex flex-wrap gap-2">
              {["Budget", "Moderate", "Splurge"].map(opt => (
                <button key={opt} onClick={() => setBudget(opt.toLowerCase())}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors
                    ${budget === opt.toLowerCase()
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Mobility */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🚶 Mobility
            </label>
            <div className="flex flex-wrap gap-2">
              {["Walking fine", "Prefer less walking"].map(opt => (
                <button key={opt} onClick={() => setMobility(opt.toLowerCase())}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors
                    ${mobility === opt.toLowerCase()
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700
                            text-xs rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !timeAvailable || !interests.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                       disabled:cursor-not-allowed text-white rounded-md py-2.5
                       text-sm font-semibold transition-colors active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent
                                 rounded-full animate-spin" />
                Nova is thinking...
              </span>
            ) : "✨ Generate My Itinerary"}
          </button>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 flex gap-3">
                <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ITINERARY RESULTS */}
        {!loading && itinerary.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Your Mysuru Day Plan ✨
            </h2>

            <div className="space-y-3 mb-6">
              {itinerary.map(item => (
                <div key={item.spotId}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm
                             overflow-hidden flex">
                  <img
                    src={SPOT_IMAGES[item.spotId] || "/images/hasirumane.jpg"}
                    alt={item.name}
                    className="w-24 h-24 object-cover flex-shrink-0"
                  />
                  <div className="p-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50
                                       px-2 py-0.5 rounded-md">
                        {item.arrivalTime}
                      </span>
                      <span className="text-xs text-gray-400">~{item.duration} min</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* SHARE */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">Share Your Plan</p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleWhatsApp}
                  className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600
                             text-white text-xs font-medium px-4 py-2 rounded-md
                             transition-colors active:scale-95">
                  💬 Share on WhatsApp
                </button>
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 border border-gray-300 text-gray-700
                             hover:bg-gray-50 text-xs font-medium px-4 py-2 rounded-md
                             transition-colors active:scale-95">
                  {copied ? "✅ Copied!" : "📋 Copy Plan"}
                </button>
                <button
                  onClick={() => { setItinerary([]); setTimeAvailable(""); setInterests("") }}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-2 transition-colors">
                  Start over
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}