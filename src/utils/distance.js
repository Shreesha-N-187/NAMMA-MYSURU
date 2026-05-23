export function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  export function formatDistance(km) {
    if (km < 1) return Math.round(km * 1000) + " m away";
    return km.toFixed(1) + " km away";
  }
  
  export function getDistanceBadgeColor(km) {
    if (km < 1) return "bg-green-100 text-green-800";
    if (km <= 5) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-600";
  }