import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";

const categoryEmoji = {
  Festival: "🎆",
  Cultural: "🎭",
  Food: "🍽️",
  Market: "🛍️",
  Other: "📅",
};

function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

export default function EventsBanner() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const q = query(
          collection(db, "events"),
          where("date", ">=", today),
          orderBy("date", "asc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setEvents(data.slice(0, 5));
      } catch (e) {
        console.error(e);
      }
    }
    fetchEvents();
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">🎉 Upcoming in Mysuru</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex-shrink-0 w-64 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl">{categoryEmoji[event.category] || "📅"}</span>
              {event.featured && (
                <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-medium">
                  ⭐ Featured
                </span>
              )}
            </div>
            <p className="font-semibold text-sm text-gray-800 mt-1">{event.name}</p>
            <p className="text-xs text-gray-500 mt-1">🗓️ {formatDate(event.date)}</p>
            <p className="text-xs text-gray-500 mt-0.5">📍 {event.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}