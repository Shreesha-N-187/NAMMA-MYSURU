import { useState, useEffect } from "react"

const THRESHOLD_METRES = 15

const SPOTS = [
  { id: "hasiru-mane", lat: 12.337047, lng: 76.624924 },
  { id: "loco-chocolates", lat: 12.337153, lng: 76.627698 },
  { id: "jin-min-cat", lat: 12.292958, lng: 76.659584 },
  { id: "uchiha-cafe", lat: 12.291892, lng: 76.628016 },
  { id: "mr-co-cane", lat: 12.337500, lng: 76.626000 },
]

function getDistanceMetres(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function useNearbySpot() {
  const [nearbySpot, setNearbySpot] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser")
      setLoading(false)
      return
    }

    const handleSuccess = (position) => {
      const { latitude, longitude } = position.coords
      let foundSpot = null

      for (const spot of SPOTS) {
        const distance = getDistanceMetres(latitude, longitude, spot.lat, spot.lng)
        if (distance <= THRESHOLD_METRES) {
          foundSpot = spot.id
          break
        }
      }
      setNearbySpot(foundSpot)
      setLoading(false)
    }

    const handleError = (err) => {
      setError(err.message)
      setLoading(false)
    }

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return { nearbySpot, error, loading }
}