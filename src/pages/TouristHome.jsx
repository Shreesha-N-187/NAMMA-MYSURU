import EventsBanner from "../components/EventsBanner";
import NearbySpots from "../components/NearbySpots";
import { signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

// NEW ADVENT ADVENTURES — SEAMLESS GAMIFICATION INTEGRATIONS
import { useNearbySpot } from "../hooks/useNearbySpot";
import SpotCharacter from "../components/SpotCharacter";

function TouristHome() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Guest");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [spotsData, setSpotsData] = useState([]);
  const [loadingSpots, setLoadingSpots] = useState(true);

  // NEW GAMIFICATION STATES — REAL-TIME TRACKING VS MANUAL PRESENTATION OVERRIDES
  const { nearbySpot } = useNearbySpot();
  const [demoSpot, setDemoSpot] = useState(null);
  const [showDemo, setShowDemo] = useState(false);

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("namma_wishlist") || "[]");
    } catch { return []; }
  });

  const [scrolled, setScrolled] = useState(false);

  const toggleWishlist = (spotId) => {
    setWishlist(prev => {
      const updated = prev.includes(spotId)
        ? prev.filter(id => id !== spotId)
        : [...prev, spotId];
      localStorage.setItem("namma_wishlist", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const userSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUsername(data.name || "Traveler");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchSpots() {
      try {
        const snapshot = await getDocs(collection(db, "spots"));
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setSpotsData(data);
      } catch (error) {
        const { spotsData: fallback } = await import("../data/spots");
        setSpotsData(fallback);
      } finally {
        setLoadingSpots(false);
      }
    }
    fetchSpots();
  }, []);

  const filteredSpots = useMemo(() => {
    const query = search.trim().toLowerCase();
    return spotsData.filter((spot) => {
      const matchesCategory = activeCategory === "All" ? true : spot.category === activeCategory;
      const matchesSearch =
        query.length === 0 ||
        spot.name.toLowerCase().includes(query) ||
        spot.location.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory, spotsData]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className={`bg-white sticky top-0 z-40 transition-shadow duration-200
                      ${scrolled ? "shadow-md border-b border-gray-200" : "border-b border-gray-100"}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600 tracking-tight">Namma Mysuru</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/itinerary")}
              className="hidden sm:block text-xs text-gray-600 hover:text-blue-600
                         border border-gray-200 rounded-md px-3 py-1.5 transition-colors">
              Plan My Day
            </button>
            <div className="relative">
              <button className="text-gray-600 hover:text-blue-600 text-xl transition-colors">
                {wishlist.length > 0 ? "❤️" : "🤍"}
              </button>
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white
                                 text-xs w-4 h-4 rounded-full flex items-center justify-center
                                 font-semibold leading-none">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span className="hidden sm:block text-xs text-gray-500">Hi, {username}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="bg-blue-600 py-12 px-6 text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Discover Hidden Mysuru
        </h1>
        <p className="text-blue-200 text-sm mt-2 max-w-sm mx-auto">
           Team-verified spots away from the tourist crowds
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="max-w-6xl mx-auto px-4 -mt-5 relative z-10">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search spots or locations..."
          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3
                     text-sm text-gray-900 placeholder-gray-400 shadow-md outline-none
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* NEARBY SPOTS */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <NearbySpots spots={spotsData} />
      </div>

      {/* EVENTS BANNER */}
      <div className="max-w-6xl mx-auto px-4">
        <EventsBanner />
      </div>

      {/* FILTER BUTTONS */}
      <div className="max-w-6xl mx-auto px-4 mt-5 flex flex-wrap gap-2">
        {["All", "Food", "Homestay", "Experience"].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveCategory(filter)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors
              ${activeCategory === filter
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* PRESENTATION OVERRIDE MANAGEMENT PANEL — BATCH 5 PITCH COMPONENT */}
      <div className="max-w-6xl mx-auto px-4 mt-3">
        <button
          onClick={() => setShowDemo(prev => !prev)}
          className="w-full border border-blue-200 text-blue-600 rounded-md py-2
                     text-sm font-medium hover:bg-blue-50 transition-colors active:scale-95"
        >
          {showDemo ? "🔒 Hide Pitch Controls" : "🎮 Open Live Presentation Matrix"}
        </button>
      </div>

      {showDemo && (
        <div className="max-w-6xl mx-auto px-4 mt-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                Live Demo Overrides (Batch 5 Pitch Menu)
              </p>
              <button
                onClick={() => { setShowDemo(false); setDemoSpot(null); }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕ Close Panel
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "hasiru-mane", label: "🏠 Hasiru (Homestay)" },
                { id: "loco-chocolates", label: "🍫 Cocoa (Food)" },
                { id: "jin-min-cat", label: "🐱 Jin (Experience)" },
                { id: "uchiha-cafe", label: "⚔️ Kai (Food)" },
                { id: "mr-co-cane", label: "🎩 Mr. Cane (Food)" },
              ].map(char => (
                <button
                  key={char.id}
                  onClick={() => setDemoSpot(demoSpot === char.id ? null : char.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all active:scale-95
                    ${demoSpot === char.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                    }`}
                >
                  {char.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-2.5 italic">
              *Bypassing geographic fences. Selecting a destination above immediately summons its specific 3D companion asset within the UI layout container.
            </p>
          </div>
        </div>
      )}

      {/* SPOTS GRID */}
      {loadingSpots ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 mt-6 max-w-6xl mx-auto">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredSpots.map(spot => (
            <div
              key={spot.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden
                         hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
                         will-change-transform cursor-pointer"
              onClick={() => navigate("/spot/" + spot.id)}
            >
              <div className="relative">
                <img
                  src={spot.image}
                  alt={spot.name}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={e => { e.stopPropagation(); toggleWishlist(spot.id); }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full
                             flex items-center justify-center shadow-sm
                             hover:bg-white transition-colors active:scale-95"
                >
                  {wishlist.includes(spot.id) ? "❤️" : "🤍"}
                </button>
                {spot.teamVerified && (
                  <span className="absolute top-3 left-3 bg-white text-green-600 text-xs
                                   font-semibold px-2 py-0.5 rounded-md border border-green-200">
                    ✓ Verified
                  </span>
                )}
              </div>

              <div className="p-4">
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                  {spot.category}
                </span>
                <h3 className="text-base font-semibold text-gray-900 mt-2">{spot.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">📍 {spot.location}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-amber-500 text-sm">★</span>
                  <span className="text-sm font-medium text-gray-900">{spot.rating}</span>
                  <span className="text-xs text-gray-400">({spot.reviewCount || "12"} reviews)</span>
                </div>
                {spot.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {spot.tags.slice(0, 3).map(tag => (
                      <span key={tag}
                        className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={e => { e.stopPropagation(); navigate("/spot/" + spot.id); }}
                  className="mt-3 w-full text-center text-xs font-semibold text-blue-600
                             hover:text-blue-700 py-2 border border-blue-200 rounded-md
                             hover:bg-blue-50 transition-colors"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FIXED FLOATING 3D VIEWPORT RENDERER LAYER */}
      {(nearbySpot || demoSpot) && <SpotCharacter spotId={demoSpot || nearbySpot} />}

    </div>
  );
}

export default TouristHome;