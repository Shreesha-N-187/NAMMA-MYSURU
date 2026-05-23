
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { spotsData } from "../data/spots";

const ADMIN_EMAIL = "shreeshan979@gmail.com";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMigrationState() {
  try {
    return JSON.parse(localStorage.getItem("adminMigration") || "null");
  } catch {
    return null;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Navbar({ navigate }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
          <span className="font-semibold text-gray-900 tracking-tight text-sm">
            Namma Mysuru{" "}
            <span className="text-amber-500 font-bold">Admin</span>
          </span>
        </div>
        <button
          onClick={() => navigate("/tourist-home")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to App
        </button>
      </div>
    </header>
  );
}

function SectionHeader({ step, title, subtitle }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          {step}
        </span>
      </div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ─── Migration Card ────────────────────────────────────────────────────────────

function MigrationCard({ onMigrationComplete }) {
  const [status, setStatus] = useState("idle"); // idle | running | done
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const migration = getMigrationState();

  async function handleMigrate() {
    setStatus("running");
    setError("");
    try {
      for (let i = 0; i < spotsData.length; i++) {
        const spot = spotsData[i];
        setProgress(`Migrating spot ${i + 1} / ${spotsData.length}…`);
        await setDoc(doc(db, "spots", String(spot.id)), { ...spot });
      }
      const record = { migrated: true, date: new Date().toISOString() };
      localStorage.setItem("adminMigration", JSON.stringify(record));
      setStatus("done");
      setProgress("");
      onMigrationComplete();
    } catch (err) {
      setError(`Migration failed: ${err.message}`);
      setStatus("idle");
    }
  }

  if (migration?.migrated) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
        <span className="text-green-500 text-xl mt-0.5">✅</span>
        <div>
          <p className="font-semibold text-green-800 text-sm">
            Migration already completed
          </p>
          <p className="text-green-600 text-xs mt-0.5">
            Spots are live in Firestore. Ran on{" "}
            {new Date(migration.date).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <SectionHeader
        step="Step 1"
        title="Migrate Spots to Firestore"
        subtitle="Run this once to seed your Firestore 'spots' collection from the local data file."
      />

      {status === "idle" && (
        <button
          onClick={handleMigrate}
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Migrate Now
        </button>
      )}

      {status === "running" && (
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <svg
            className="w-4 h-4 animate-spin text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span>{progress}</span>
        </div>
      )}

      {status === "done" && (
        <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
          ✅ All {spotsData.length} spots migrated to Firestore!
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}

      <p className="mt-4 text-xs text-gray-400">
        ⚠️ This will overwrite any existing Firestore documents with the same
        IDs.
      </p>
    </div>
  );
}

// ─── Spot Edit Form ────────────────────────────────────────────────────────────

function SpotEditForm({ spot, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: spot.name ?? "",
    description: spot.description ?? "",
    openDays: spot.openDays ?? "",
    openTime: spot.openTime ?? "",
    bestTime: spot.bestTime ?? spot.peakSeason ?? "",
    price: spot.price ?? "",
    contactName: spot.contactName ?? (spot.contact?.name ?? ""),
    phone: spot.phone ?? (spot.contact?.phone ?? ""),
    parking: spot.parking ?? false,
    parkingNote: spot.parkingNote ?? "",
    crowdLevel: spot.crowdLevel ?? "medium",
    rating: spot.rating ?? 4.0,
    image: spot.image ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setErr("");
    try {
      await updateDoc(doc(db, "spots", String(spot.id)), {
        name: form.name,
        description: form.description,
        openDays: form.openDays,
        openTime: form.openTime,
        bestTime: form.bestTime,
        price: form.price,
        contactName: form.contactName,
        phone: form.phone,
        parking: form.parking,
        parkingNote: form.parkingNote,
        crowdLevel: form.crowdLevel,
        rating: parseFloat(form.rating),
        image: form.image,
      });
      setSaved(true);
      onSave({
        ...spot,
        ...form,
        rating: parseFloat(form.rating),
      });
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setErr(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";
  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition";

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className={labelCls}>Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className={labelCls}>Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Open Days */}
        <div>
          <label className={labelCls}>Open Days</label>
          <input
            type="text"
            placeholder="e.g. Monday to Saturday"
            value={form.openDays}
            onChange={(e) => set("openDays", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Open Hours */}
        <div>
          <label className={labelCls}>Open Hours</label>
          <input
            type="text"
            placeholder="e.g. 9 AM – 9 PM"
            value={form.openTime}
            onChange={(e) => set("openTime", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Best Time */}
        <div>
          <label className={labelCls}>Best Time to Visit</label>
          <input
            type="text"
            placeholder="e.g. October to March"
            value={form.bestTime}
            onChange={(e) => set("bestTime", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Price */}
        <div>
          <label className={labelCls}>Price Range</label>
          <input
            type="text"
            placeholder="e.g. ₹50 – ₹200"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Contact Name */}
        <div>
          <label className={labelCls}>Contact Name</label>
          <input
            type="text"
            value={form.contactName}
            onChange={(e) => set("contactName", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Phone */}
        <div>
          <label className={labelCls}>Phone Number</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Rating */}
        <div>
          <label className={labelCls}>Rating (1–5)</label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="5"
            value={form.rating}
            onChange={(e) => set("rating", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Crowd Level */}
        <div>
          <label className={labelCls}>Crowd Level</label>
          <select
            value={form.crowdLevel}
            onChange={(e) => set("crowdLevel", e.target.value)}
            className={inputCls}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high on weekends">High on Weekends</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Image URL */}
        <div className="sm:col-span-2">
          <label className={labelCls}>Image URL</label>
          <input
            type="text"
            placeholder="https://..."
            value={form.image}
            onChange={(e) => set("image", e.target.value)}
            className={inputCls}
          />
          {form.image && (
            <img
              src={form.image}
              alt="preview"
              className="mt-2 h-24 w-full object-cover rounded-lg border border-gray-200"
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
        </div>

        {/* Parking */}
        <div>
          <label className={labelCls}>Parking Available</label>
          <label className="flex items-center gap-2 cursor-pointer mt-1.5">
            <input
              type="checkbox"
              checked={form.parking}
              onChange={(e) => set("parking", e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-sm text-gray-700">
              {form.parking ? "Yes" : "No"}
            </span>
          </label>
        </div>

        {/* Parking Note */}
        <div>
          <label className={labelCls}>Parking Note</label>
          <input
            type="text"
            placeholder="e.g. Free parking on site"
            value={form.parkingNote}
            onChange={(e) => set("parkingNote", e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {saving ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Saving…
            </>
          ) : (
            "Save Changes"
          )}
        </button>
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        {saved && (
          <span className="text-sm font-medium text-green-600 animate-pulse">
            Saved! ✅
          </span>
        )}
        {err && <span className="text-sm text-red-500">{err}</span>}
      </div>
    </div>
  );
}

// ─── Spot Card ─────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  heritage: "bg-purple-100 text-purple-700 border-purple-200",
  nature: "bg-green-100 text-green-700 border-green-200",
  food: "bg-orange-100 text-orange-700 border-orange-200",
  culture: "bg-blue-100 text-blue-700 border-blue-200",
  adventure: "bg-red-100 text-red-700 border-red-200",
};

function SpotCard({ spot: initialSpot }) {
  const [spot, setSpot] = useState(initialSpot);
  const [editing, setEditing] = useState(false);
  const colorCls =
    CATEGORY_COLORS[spot.category?.toLowerCase()] ??
    "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          {spot.image && (
            <img
              src={spot.image}
              alt={spot.name}
              className="w-14 h-14 rounded-lg object-cover border border-gray-100 flex-shrink-0"
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {spot.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${colorCls}`}
              >
                {spot.category}
              </span>
              <span className="text-xs text-gray-400">
                ★ {spot.rating ?? "–"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">
              {spot.location}
            </p>
          </div>
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
            editing
              ? "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200"
              : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
          }`}
        >
          {editing ? "Close" : "Edit"}
        </button>
      </div>

      {/* Inline Edit Form */}
      {editing && (
        <div className="px-5 pb-5">
          <SpotEditForm
            spot={spot}
            onSave={(updated) => setSpot(updated)}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}
    </div>
  );
}

// ─── Spot Editor Section ───────────────────────────────────────────────────────

function SpotEditorSection() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState("");

  useEffect(() => {
    async function fetchSpots() {
      try {
        const snapshot = await getDocs(collection(db, "spots"));
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSpots(data);
      } catch (e) {
        setFetchErr(`Failed to load spots: ${e.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchSpots();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <SectionHeader
        step="Step 2"
        title="Edit Spot Details"
        subtitle="Click Edit on any spot to update its content in Firestore."
      />

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
          <svg
            className="w-4 h-4 animate-spin text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          Loading spots from Firestore…
        </div>
      )}

      {fetchErr && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {fetchErr}
        </p>
      )}

      {!loading && !fetchErr && spots.length === 0 && (
        <p className="text-sm text-gray-400 py-4">
          No spots found. Complete Step 1 first.
        </p>
      )}

      {!loading && spots.length > 0 && (
        <>
          <p className="text-xs text-gray-400 mb-4">
            {spots.length} spot{spots.length !== 1 ? "s" : ""} loaded
          </p>
          <div className="grid grid-cols-1 gap-4">
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EventsSection() {
  const [events, setEvents] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Festival");
  const [isFeatured, setIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      const snapshot = await getDocs(collection(db, "events"));
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (a.date > b.date ? 1 : -1));
      setEvents(data);
    }
    fetchEvents();
  }, []);

  async function handleAddEvent() {
    if (!name || !date) return;
    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, "events"), {
        name, description, date, location,
        category, featured: isFeatured,
        createdAt: serverTimestamp(),
      });
      setEvents((prev) => [...prev, { id: docRef.id, name, description, date, location, category, featured: isFeatured }]);
      setName(""); setDescription(""); setDate("");
      setLocation(""); setCategory("Festival"); setIsFeatured(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this event?")) return;
    await deleteDoc(doc(db, "events", id));
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 transition";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <SectionHeader
        step="Step 3"
        title="Upcoming Events & Festivals"
        subtitle="Add events that appear on the tourist home page."
      />

      {/* Add Event Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="sm:col-span-2">
          <label className={labelCls}>Event Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. Dasara Festival" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Description</label>
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} placeholder="Brief description..." />
        </div>
        <div>
          <label className={labelCls}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Location in Mysuru</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} placeholder="e.g. Mysuru Palace" />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            <option value="Festival">Festival</option>
            <option value="Cultural">Cultural</option>
            <option value="Food">Food</option>
            <option value="Market">Market</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="flex items-center gap-2 mt-5">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-amber-500" />
          <label className="text-sm text-gray-700 font-medium">⭐ Featured Event</label>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleAddEvent}
          disabled={saving}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {saving ? "Adding..." : "Add Event"}
        </button>
        {saved && <span className="text-sm text-green-600 font-medium">Added! ✅</span>}
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <p className="text-sm text-gray-400">No events yet.</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {event.name} {event.featured && <span className="text-xs text-amber-500">⭐</span>}
                </p>
                <p className="text-xs text-gray-400">{event.date} · {event.location} · {event.category}</p>
              </div>
              <button
                onClick={() => handleDelete(event.id)}
                className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ─── Main AdminPanel ───────────────────────────────────────────────────────────

export default function AdminPanel() {
  const navigate = useNavigate();
  const [migrationDone, setMigrationDone] = useState(
    () => getMigrationState()?.migrated === true
  );

  // ── Access Control ──────────────────────────────────────────────────────────
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Access Denied
        </h1>
        <p className="text-gray-500 text-sm mb-6">Admins only.</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-5 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Go Back
        </button>
      </div>
    );
  }

  // ── Authenticated Admin View ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar navigate={navigate} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Page Title */}
        <div className="pb-2 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Content Management
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Signed in as{" "}
            <span className="font-medium text-gray-600">{user.email}</span>
          </p>
        </div>

        {/* Step 1 — Migration */}
        <MigrationCard onMigrationComplete={() => setMigrationDone(true)} />

        {/* Step 2 — Spot Editor (only after migration) */}
        {migrationDone && <SpotEditorSection />}
        {migrationDone && <EventsSection />}
      </main>
    </div>
  );
}
