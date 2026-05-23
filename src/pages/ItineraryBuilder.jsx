import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const spotOptions = [
  { id: "1", name: "Hasiru Mane", category: "Homestay", emoji: "🌿", duration: 120, image: "/images/hasirumane.jpg" },
  { id: "2", name: "Loco Artisans Chocolates", category: "Food", emoji: "🍫", duration: 45, image: "/images/loco-artisan-chocolates.jpg" },
  { id: "3", name: "Jin Min Cat World", category: "Experience", emoji: "🐱", duration: 90, bestAfter: "16:00", image: "/images/jin-min-catworld.jpeg" },
  { id: "4", name: "Uchiha Cafe", category: "Food", emoji: "🍜", duration: 60, image: "/images/uchiha-cafe.jpeg" },
  { id: "5", name: "Mr. Co-Cane", category: "Food", emoji: "🥤", duration: 30, image: "/images/cococaine.jpeg" },
];

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m.toString().padStart(2, "0");
  return `${displayH}:${displayM} ${ampm}`;
}

function formatTotalDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export default function ItineraryBuilder() {
  const navigate = useNavigate();
  const [selectedSpots, setSelectedSpots] = useState([]);
  const [startTime, setStartTime] = useState("09:00");
  const [travelMinutes, setTravelMinutes] = useState(15);
  const [itinerary, setItinerary] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [copied, setCopied] = useState(false);

  // Toggle spot selection
  function toggleSpot(id) {
    setSelectedSpots((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  // Recalculate itinerary whenever inputs change
  useEffect(() => {
    if (selectedSpots.length === 0) {
      setItinerary([]);
      setTotalDuration(0);
      return;
    }

    const selected = selectedSpots
      .map((id) => spotOptions.find((s) => s.id === id))
      .filter(Boolean);

    let currentMinutes = timeToMinutes(startTime);
    const result = [];

    for (let i = 0; i < selected.length; i++) {
      const spot = selected[i];
      const arrivalMinutes = currentMinutes;
      const departureMinutes = arrivalMinutes + spot.duration;
      const warning = spot.bestAfter
        ? arrivalMinutes < timeToMinutes(spot.bestAfter)
        : false;

      result.push({
        spot,
        arrivalTime: minutesToTime(arrivalMinutes),
        departureTime: minutesToTime(departureMinutes),
        warning,
      });

      currentMinutes = departureMinutes + Number(travelMinutes);
    }

    const total =
      selected.reduce((sum, s) => sum + s.duration, 0) +
      (selected.length - 1) * Number(travelMinutes);

    setItinerary(result);
    setTotalDuration(total);
  }, [selectedSpots, startTime, travelMinutes]);

  // Share text
  function buildShareText() {
    return (
      "My Mysuru Day Plan 🗺️\n" +
      itinerary.map((i) => `${i.arrivalTime} - ${i.spot.name}`).join("\n") +
      "\n\nDiscover Mysuru: https://namma-mysuru.vercel.app"
    );
  }

  function handleWhatsApp() {
    window.open("https://wa.me/?text=" + encodeURIComponent(buildShareText()), "_blank");
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const categoryColors = {
    Homestay: "bg-emerald-100 text-emerald-700",
    Food: "bg-orange-100 text-orange-700",
    Experience: "bg-amber-100 text-amber-700",
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-emerald-50 pb-20">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">

        {/* SECTION 1 — Header */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-800 shadow-sm transition hover:bg-orange-50"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-orange-950 mb-1">
          Plan Your Mysuru Day 🗓️
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Pick your spots, set your time, share your plan
        </p>

        {/* SECTION 2 — Spot Picker */}
        <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm mb-5">
          <p className="text-sm font-semibold text-orange-900 mb-3">
            Choose your spots (tap to select):
          </p>
          <div className="grid grid-cols-2 gap-3">
            {spotOptions.map((spot) => {
              const isSelected = selectedSpots.includes(spot.id);
              return (
                <div
                  key={spot.id}
                  onClick={() => toggleSpot(spot.id)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    isSelected
                      ? "border-orange-500 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Checkmark */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                  <img
                    src={spot.image}
                    alt={spot.name}
                    className="w-full h-24 object-cover"
                  />
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-gray-800 leading-tight">
                      {spot.emoji} {spot.name}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${categoryColors[spot.category] || "bg-gray-100 text-gray-600"}`}>
                        {spot.category}
                      </span>
                      <span className="text-xs text-gray-400">~{spot.duration} min</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3 — Time Settings */}
        {selectedSpots.length > 0 && (
          <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm mb-5">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-orange-900 mb-1.5">
                What time do you start?
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border border-orange-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-orange-900 mb-1.5">
                Travel time between spots:
              </label>
              <select
                value={travelMinutes}
                onChange={(e) => setTravelMinutes(e.target.value)}
                className="border border-orange-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes (recommended)</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>
          </div>
        )}

        {/* SECTION 4 — Generated Itinerary */}
        {itinerary.length > 0 && (
          <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm mb-5">
            <h2 className="text-lg font-bold text-orange-950 mb-4">
              Your Itinerary
            </h2>
            {itinerary.map((item, idx) => (
              <div key={item.spot.id} className="flex gap-4 items-start mb-4">
                {/* Time column */}
                <div className="min-w-[72px] text-sm text-gray-500 pt-1">
                  {item.arrivalTime}
                </div>
                {/* Content card */}
                <div className="flex-1 bg-orange-50 rounded-xl p-3 border border-orange-100">
                  <p className="font-semibold text-gray-800 text-sm">
                    {item.spot.emoji} {item.spot.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    ~{item.spot.duration} min
                  </p>
                  {item.warning && (
                    <div className="mt-2 bg-orange-100 border border-orange-200 rounded-lg px-3 py-1.5">
                      <p className="text-xs text-orange-700 font-medium">
                        ⚠️ {item.spot.name} is best visited after 4 PM!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* Total */}
            <div className="mt-2 pt-3 border-t border-orange-100 text-sm font-semibold text-orange-800">
              🏁 Done! Total trip: ~{formatTotalDuration(totalDuration)}
            </div>
          </div>
        )}

        {/* SECTION 5 — Share */}
        {itinerary.length > 0 && (
          <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
            <h2 className="text-base font-bold text-orange-950 mb-3">
              Share Your Plan
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                💬 Share on WhatsApp
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                {copied ? "✅ Copied!" : "📋 Copy Plan"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
