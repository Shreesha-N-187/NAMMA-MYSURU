import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { spotsData } from "../data/spots";
import { auth, db } from "../firebase";

const categoryStyles = {
  Food: "bg-orange-100 text-orange-800 border-orange-200",
  Homestay: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Experience: "bg-amber-100 text-amber-800 border-amber-200",
};

function TouristHome() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Guest");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) {
          setWishlist(parsed);
        }
      } catch {
        setWishlist([]);
      }
    }
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

  const filteredSpots = useMemo(() => {
    const query = search.trim().toLowerCase();
    return spotsData.filter((spot) => {
      const matchesCategory =
        activeCategory === "All" ? true : spot.category === activeCategory;
      const matchesSearch =
        query.length === 0 ||
        spot.name.toLowerCase().includes(query) ||
        spot.location.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const toggleWishlist = (spotId) => {
    const next = wishlist.includes(spotId)
      ? wishlist.filter((id) => id !== spotId)
      : [...wishlist, spotId];
    setWishlist(next);
    localStorage.setItem("wishlist", JSON.stringify(next));
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    navigate("/");
  };

  const renderStars = (rating) => {
    const fullStars = Math.round(rating);
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, idx) => (
          <span
            key={`${rating}-${idx}`}
            className={idx < fullStars ? "text-amber-500" : "text-amber-200"}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-emerald-50">
      <nav className="sticky top-0 z-20 border-b border-orange-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-orange-900">
            Namma Mysuru
          </h1>
          <div className="flex items-center gap-3 sm:gap-5">
            <p className="hidden text-sm font-medium text-emerald-900 sm:block">
              Hi, {username}
            </p>
            <button
              type="button"
              className="relative rounded-full bg-orange-100 px-3 py-1.5 text-lg text-orange-700"
              aria-label="Wishlist"
            >
              ❤️
              <span className="absolute -right-2 -top-2 rounded-full bg-emerald-600 px-1.5 text-xs font-semibold text-white">
                {wishlist.length}
              </span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-orange-200 bg-white/90 p-5 shadow-sm">
          <h2 className="text-2xl font-bold text-orange-950">
            Hidden Gems of Mysuru
          </h2>
          <p className="mt-1 text-sm text-orange-900/80">
            Discover curated local places verified by our team
          </p>

          <div className="mt-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by spot name or location..."
              className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm text-slate-900 outline-none ring-orange-200 transition placeholder:text-orange-700/60 focus:border-orange-400 focus:ring-2"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {["All", "Food", "Homestay", "Experience"].map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  activeCategory === category
                    ? "border-orange-700 bg-orange-600 text-white"
                    : "border-orange-200 bg-white text-orange-800 hover:bg-orange-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredSpots.map((spot) => (
            <article
              key={spot.id}
              className="overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative">
                <img
                  src={spot.image}
                  alt={spot.name}
                  className="h-48 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => toggleWishlist(spot.id)}
                  className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1.5 text-lg shadow"
                  aria-label="Toggle wishlist"
                >
                  {wishlist.includes(spot.id) ? "❤️" : "🤍"}
                </button>
              </div>

              <div className="p-5">
                {spot.teamVerified && (
                  <span className="mb-3 inline-block rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    ✓ Verified by our team
                  </span>
                )}

                <div className="mb-3">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      categoryStyles[spot.category]
                    }`}
                  >
                    {spot.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-orange-950">{spot.name}</h3>
                <p className="mt-1 text-sm text-orange-900/80">📍 {spot.location}</p>

                <div className="mt-2 flex items-center gap-2 text-sm">
                  {renderStars(spot.rating)}
                  <span className="font-semibold text-amber-700">{spot.rating}</span>
                  <span className="text-slate-500">({spot.reviewCount})</span>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-700">
                  {spot.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {spot.tags.map((tag) => (
                    <span
                      key={`${spot.id}-${tag}`}
                      className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/spot/${spot.id}`)}
                  className="mt-5 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                >
                  View Details →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default TouristHome;
