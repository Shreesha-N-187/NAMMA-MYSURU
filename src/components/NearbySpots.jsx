import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  calculateDistance,
  formatDistance,
  getDistanceBadgeColor,
} from "../utils/distance";

function NearbySpots({ spots }) {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationLoading(false);
      },
      () => {
        setLocationError(true);
        setLocationLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  if (locationLoading) {
    return (
      <p className="text-sm text-gray-400 mb-4">📍 Finding your location...</p>
    );
  }

  if (locationError) return null;

  if (userLocation) {
    const spotsWithDistance = spots.map((s) => ({
      ...s,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        s.lat,
        s.lng
      ),
    }));

    const top3 = [...spotsWithDistance]
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          📍 Near You
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {top3.map((spot) => (
            <div
              key={spot.id}
              onClick={() => navigate(`/spot/${spot.id}`)}
              className="flex-shrink-0 w-56 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
            >
              <img
                src={spot.image}
                alt={spot.name}
                className="w-full h-32 object-cover"
              />
              <div className="p-3">
                <p className="font-semibold text-sm text-gray-800 truncate">
                  {spot.name}
                </p>
                <span
                  className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${getDistanceBadgeColor(spot.distance)}`}
                >
                  {formatDistance(spot.distance)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export default NearbySpots;