import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { auth, db, storage } from "../firebase"
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

// Updated category styles — blue system, no orange
const categoryStyles = {
  Food: "bg-blue-50 text-blue-700 border-blue-200",
  Homestay: "bg-green-50 text-green-700 border-green-200",
  Experience: "bg-amber-50 text-amber-700 border-amber-200",
};

function SpotDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [reviewPhoto, setReviewPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [copied, setCopied] = useState(false);
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
    if (!rating) { setReviewError("Please select a rating."); return; }
    if (!comment.trim()) { setReviewError("Please write a short comment."); return; }

    setSubmitting(true);
    let photoUrl = null;

    try {
      if (reviewPhoto) {
        setUploading(true);
        const storageRef = ref(storage, `reviews/${spot.id}/${Date.now()}_${reviewPhoto.name}`);
        const uploadResult = await uploadBytes(storageRef, reviewPhoto);
        photoUrl = await getDownloadURL(uploadResult.ref);
        setUploading(false);
      }

      await addDoc(collection(db, "reviews"), {
        spotId: id,
        userId: currentUser.uid,
        userName: userName || "Traveler",
        rating,
        comment: comment.trim(),
        photoUrl: photoUrl || null,
        createdAt: serverTimestamp(),
      });

      setRating(0);
      setComment("");
      setReviewPhoto(null);
      await loadReviews();
    } catch {
      setReviewError("Could not submit review. Please try again.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  // Spot not found state
  if (!spot) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Spot not found</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold
                       text-white hover:bg-blue-700 transition-colors active:scale-95"
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
    <main className="min-h-screen bg-gray-50 pb-20">

      {/* Back Button Bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500
                     hover:text-blue-600 transition-colors group active:scale-95"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          <span>Back to spots</span>
        </button>
      </div>

      {/* Full-Width Hero Image */}
      <div className="relative">
        <img
          src={spot.image}
          alt={spot.name}
          className="w-full h-72 object-cover"
        />
      </div>

      {/* Info Header */}
      <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">{spot.name}</h1>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="bg-white text-green-600 text-xs font-semibold px-2 py-0.5
                           rounded-md border border-green-200">
            ✓ Verified
          </span>
          <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold
                           ${categoryStyles[spot.category]}`}>
            {spot.category}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="text-amber-500">{"★".repeat(Math.round(spot.rating))}</span>
            <span className="font-medium text-gray-700">{spot.rating}</span>
            <span className="text-gray-400">({spot.reviewCount} reviews)</span>
          </span>
          <span>📍 {spot.location}</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">Contact: {spot.contact}</p>
      </div>

      <div className="max-w-3xl mx-auto px-4">

        {/* Info Cards Section */}
        <section className="mt-5 bg-white rounded-lg border border-gray-200 p-5 shadow-sm">

          {/* Jin Min Cat World special banner */}
          {spot.id === "3" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4
                            flex items-start gap-3">
              <span className="text-2xl">🐱</span>
              <p className="text-blue-800 text-sm font-medium">
                Best visited after 4 PM — the cats wake up from their afternoon nap
                and become playful and interactive!
              </p>
            </div>
          )}

          {/* Row 1 — Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">🕐 Open Hours</p>
              <p className="text-sm font-medium text-gray-900">{spot.openHours}</p>
            </div>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">📅 Open Days</p>
              <p className="text-sm font-medium text-gray-900">{spot.openDays}</p>
            </div>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                ⭐ Best Time
                {spot.id === "3" && (
                  <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5
                                   rounded-md border border-amber-200">
                    Important ⚠️
                  </span>
                )}
              </p>
              <p className="text-sm font-medium text-gray-900">{spot.bestTimeToVisit}</p>
            </div>
          </div>

          {/* Row 2 — Practical */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">🅿️ Parking</p>
              <p className={`text-sm font-medium
                ${spot.parkingAvailable ? "text-green-600" : "text-red-500"}`}>
                {spot.parkingAvailable ? "Available ✓" : "Not Available"}
              </p>
              <p className="text-xs text-gray-400 mt-1">{spot.parkingNote}</p>
            </div>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">👥 Crowd Level</p>
              <p className={`text-sm font-medium
                ${spot.crowdLevel === "low" ? "text-green-600" :
                  spot.crowdLevel === "medium" ? "text-amber-500" : "text-red-500"}`}>
                {spot.crowdLevel}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">💰 Price Range</p>
              <p className="text-sm font-medium text-gray-900">{spot.priceRange}</p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="mt-4 bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">About this place</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{spot.description}</p>
        </section>

        {/* Tags */}
        <section className="mt-4 bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {spot.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* Map */}
        <section className="mt-4 bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Find Us Here</h2>
          <iframe
            title={`Map for ${spot.name}`}
            src={mapEmbedSrc}
            className="mt-3 h-[300px] w-full rounded-lg border border-gray-200"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm font-semibold text-blue-600
                       hover:text-blue-700 transition-colors"
          >
            Open in Google Maps →
          </a>
        </section>

        {/* Share This Spot */}
        <section className="mt-4 bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Share This Spot 📤</h2>
          <div className="flex flex-wrap gap-3">
            <button
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600
                         text-white px-4 py-2 rounded-md text-sm font-medium
                         transition-colors active:scale-95"
              onClick={() => {
                const text = encodeURIComponent(
                  `Check out ${spot.name} in Mysuru! 📍 ${spot.address}\nDiscover more hidden gems on Namma Mysuru: https://namma-mysuru.vercel.app/spot/${spot.id}`
                );
                window.open(`https://wa.me/?text=${text}`, "_blank");
              }}
            >
              💬 Share on WhatsApp
            </button>
            <button
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200
                         text-gray-700 px-4 py-2 rounded-md text-sm font-medium
                         transition-colors active:scale-95"
              onClick={() => {
                navigator.clipboard.writeText(
                  `https://namma-mysuru.vercel.app/spot/${spot.id}`
                );
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "✅ Copied!" : "📋 Copy Link"}
            </button>
            <button
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600
                         text-white px-4 py-2 rounded-md text-sm font-medium
                         transition-colors active:scale-95"
              onClick={() => alert("Screenshot this page and share with #NammaMysuru #HiddenMysuru")}
            >
              📸 Instagram
            </button>
          </div>
        </section>

        {/* Reviews */}
        <section className="mt-4 bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
          {loadingReviews ? (
            <div className="mt-4 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse bg-gray-50 rounded-lg p-4">
                  <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">
              No reviews yet. Be the first!
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-900 text-sm">
                      {review.userName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {review.createdAt?.toDate
                        ? review.createdAt.toDate().toLocaleDateString()
                        : "Just now"}
                    </p>
                  </div>
                  <p className="mt-1 text-amber-500">{"★".repeat(review.rating)}</p>
                  <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
                  {review.photoUrl && (
                    <img
                      src={review.photoUrl}
                      alt="Review photo"
                      className="mt-2 rounded-lg w-full max-h-48 object-cover cursor-pointer"
                      onClick={() => window.open(review.photoUrl, "_blank")}
                    />
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Add Review */}
        {currentUser && (
          <section className="mt-4 bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Add Review</h2>
            <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Your Rating</p>
                <div className="flex items-center gap-1 text-2xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={star <= rating ? "text-amber-500" : "text-gray-200"}
                      aria-label={`Rate ${star} stars`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2
                             text-sm outline-none focus:border-blue-500
                             focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Share your experience..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add a Photo (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReviewPhoto(e.target.files[0])}
                  className="block w-full text-sm text-gray-500
                             file:mr-4 file:py-2 file:px-4 file:rounded-md
                             file:border-0 file:text-sm file:font-medium
                             file:bg-blue-50 file:text-blue-700
                             hover:file:bg-blue-100"
                />
                {reviewPhoto && (
                  <p className="text-xs text-gray-400 mt-1">
                    Selected: {reviewPhoto.name}
                  </p>
                )}
              </div>
              {reviewError && (
                <div className="rounded-md border border-red-200 bg-red-50
                                px-3 py-2 text-sm text-red-700">
                  {reviewError}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting || uploading}
                className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold
                           text-white hover:bg-blue-700 transition-colors
                           active:scale-95 disabled:opacity-60"
              >
                {uploading
                  ? "Uploading photo..."
                  : submitting
                  ? "Submitting..."
                  : "Submit Review"}
              </button>
            </form>
          </section>
        )}
      </div>

      {/* Floating Wishlist Button */}
      <button
        type="button"
        onClick={toggleWishlist}
        className="fixed bottom-5 right-5 rounded-full bg-white p-4 text-2xl
                   shadow-lg ring-1 ring-gray-200 transition
                   hover:-translate-y-0.5 active:scale-95"
        aria-label="Toggle wishlist for this spot"
      >
        {wishlist.includes(spot.id) ? "❤️" : "🤍"}
      </button>
    </main>
  );
}

export default SpotDetail;
