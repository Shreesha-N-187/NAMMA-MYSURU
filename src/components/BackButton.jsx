import { useNavigate } from "react-router-dom"

export default function BackButton({ to, label = "Back" }) {
  const navigate = useNavigate()
  const handleBack = () => {
    if (to) navigate(to)
    else if (window.history.length > 1) navigate(-1)
    else navigate("/")
  }
  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors py-1 group"
    >
      <span className="text-base leading-none group-hover:-translate-x-0.5 transition-transform">←</span>
      <span>{label}</span>
    </button>
  )
}