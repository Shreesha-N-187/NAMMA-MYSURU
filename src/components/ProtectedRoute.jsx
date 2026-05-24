import { useEffect, useState } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase"

function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setChecking(false)
    })
    return () => unsub()
  }, [])

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate to="/auth" state={{ from: location.pathname }} replace />
    )
  }

  return children
}

export default ProtectedRoute