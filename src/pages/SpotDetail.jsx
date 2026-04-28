import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { spotsData } from "../data/spots";
import { auth, db } from "../firebase";

const categoryStyles = {
  Food: "bg-orange-100 text-orange-800 border-orange-200",
  Homestay: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Experience: "bg-amber-100 text-amber-800 border-amber-200",
};

function SpotDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const mapsEmbedApiKey = import.meta.env.VITE_GOOGLE_MAPS_EMBED_API_KEY;

  const spot = useMemo(() => spotsData.find((item) => item.id === id), [id]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) setWishlist(parsed);
      } catch {
        setWishlist([]);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setUserName("");
        return;
      }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setUserName(snap.data().name || user.displayName || "Traveler");
      } else {
        setUserName(user.displayName || user.email || "Traveler");
      }
    });
    return () => unsubscribe();
  }, []);

  const loadReviews = async () => {
    if (!id) return;
    setLoadingReviews(true);
    const q = query(collection(db, "reviews"), where("spotId", "==", id));
    const snap = await getDocs(q);
    const mapped = snap.docs.map((reviewDoc) => ({
      id: reviewDoc.id,
      ...reviewDoc.data(),
    }));
    mapped.sort((a, b) => {
      const aSec = a.createdAt?.seconds || 0;
      const bSec = b.createdAt?.seconds || 0;
      return bSec - aSec;
    });
    setReviews(mapped);
    setLoadingReviews(false);
  };

  useEffect(() => {
    loadReviews();
  }, [id]);

  const toggleWishlist = () => {
    if (!spot) return;
    const next = wishlist.includes(spot.id)
      ? wishlist.filter((item) => item !== spot.id)
      : [...wishlist, spot.id];
    setWishlist(next);
    localStorage.setItem("wishlist", JSON.stringify(next));
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    setReviewError("");
    if (!currentUser) return;
    if (!rating) {
      setReviewError("Please select a rating.");
      return;
    }
    if (!comment.trim()) {
      setReviewError("Please write a short comment.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        spotId: id,
        userId: currentUser.uid,
        userName: userName || "Traveler",
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });
      setRating(0);
      setComment("");
      await loadReviews();
    } catch {
      setReviewError("Could not submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!spot) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50 p-6">
        <div className="rounded-2xl border border-orange-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-orange-950">Spot not found</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  const mapEmbedSrc = mapsEmbedApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsEmbedApiKey}&q=${spot.lat},${spot.lng}&zoom=16`
    : `https://maps.google.com/maps?hl=en&q=${spot.lat},${spot.lng}&z=16&output=embed`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-emerald-50 pb-20">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-800 shadow-sm transition hover:bg-orange-50"
        >
          ← Back
        </button>

        <img
          src={spot.image}
          alt={spot.name}
          className="h-[280px] w-full rounded-3xl object-cover shadow-md"
        />

        <section className="mt-5 rounded-3xl border border-orange-200 bg-white p-5 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight text-orange-950">{spot.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              ✓ Verified by our team
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                categoryStyles[spot.category]
              }`}
            >
              {spot.category}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-amber-500">{"★".repeat(Math.round(spot.rating))}</span>
            <span className="text-amber-200">
              {"★".repeat(5 - Math.round(spot.rating))}
            </span>
            <span className="font-semibold text-amber-700">{spot.rating}</span>
            <span className="text-slate-500">({spot.reviewCount} reviews)</span>
          </div>
          <p className="mt-2 text-sm text-orange-900/85">📍 {spot.location}</p>
          <p className="mt-1 text-sm text-orange-900/85">Contact: {spot.contact}</p>
        </section>

        <section className="mt-5 flex gap-3 overflow-x-auto pb-2">
          {spot.openTime && (
            <div className="min-w-[220px] rounded-2xl border border-orange-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                Opening Time
              </p>
              <p className="mt-1 text-sm text-slate-700">{spot.openTime}</p>
            </div>
          )}
          {spot.price && (
            <div className="min-w-[220px] rounded-2xl border border-orange-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                Price
              </p>
              <p className="mt-1 text-sm text-slate-700">{spot.price}</p>
            </div>
          )}
          {spot.bestTime && (
            <div className="min-w-[220px] rounded-2xl border border-orange-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                Best Time to Visit
              </p>
              <p className="mt-1 text-sm text-slate-700">{spot.bestTime}</p>
            </div>
          )}
          {spot.peakSeason && (
            <div className="min-w-[220px] rounded-2xl border border-orange-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                Peak Season
              </p>
              <p className="mt-1 text-sm text-slate-700">{spot.peakSeason}</p>
            </div>
          )}
          {spot.parking && (
            <div className="min-w-[220px] rounded-2xl border border-orange-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                Parking
              </p>
              <p className="mt-1 text-sm text-slate-700">Parking Available ✓</p>
            </div>
          )}
        </section>

        <section className="mt-5 rounded-3xl border border-orange-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-orange-950">About this place</h2>
          <p className="mt-2 leading-relaxed text-slate-700">{spot.description}</p>
        </section>

        <section className="mt-5 rounded-3xl border border-orange-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-orange-950">Tags</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {spot.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-orange-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-orange-950">Find Us Here</h2>
          <iframe
            title={`Map for ${spot.name}`}
            src={mapEmbedSrc}
            className="mt-3 h-[300px] w-full rounded-2xl border border-orange-200"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Open in Google Maps →
          </a>
        </section>

        <section className="mt-5 rounded-3xl border border-orange-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-orange-950">Reviews</h2>
          {loadingReviews ? (
            <p className="mt-3 text-sm text-slate-600">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No reviews yet. Be the first!</p>
          ) : (
            <div className="mt-4 space-y-3">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-orange-950">{review.userName}</p>
                    <p className="text-xs text-slate-500">
                      {review.createdAt?.toDate
                        ? review.createdAt.toDate().toLocaleDateString()
                        : "Just now"}
                    </p>
                  </div>
                  <p className="mt-1 text-amber-500">{"★".repeat(review.rating)}</p>
                  <p className="mt-1 text-sm text-slate-700">{review.comment}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        {currentUser && (
          <section className="mt-5 rounded-3xl border border-orange-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-orange-950">Add Review</h2>
            <form onSubmit={handleSubmitReview} className="mt-3 space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-orange-900">Your Rating</p>
                <div className="flex items-center gap-1 text-2xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={star <= rating ? "text-amber-500" : "text-amber-200"}
                      aria-label={`Rate ${star} stars`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-orange-900">
                  Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  placeholder="Share your experience..."
                />
              </div>
              {reviewError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {reviewError}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </section>
        )}
      </div>

      <button
        type="button"
        onClick={toggleWishlist}
        className="fixed bottom-5 right-5 rounded-full bg-white p-4 text-2xl shadow-lg ring-1 ring-orange-200 transition hover:-translate-y-0.5"
        aria-label="Toggle wishlist for this spot"
      >
        {wishlist.includes(spot.id) ? "❤️" : "🤍"}
      </button>
    </main>
  );
}

export default SpotDetail;
