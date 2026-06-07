import { useNavigate } from "react-router-dom";
import { Map, ShoppingBag, Palette, ChevronRight, Eye, EyeOff } from "lucide-react"

function RoleSelect() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    localStorage.setItem("selectedRole", role);
    navigate("/auth");
  };

  return (
    <div className="flex min-h-screen">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-5/12 bg-blue-600 text-white flex-col justify-between p-10 h-screen fixed">
        <div>
          <p className="text-2xl font-bold text-white">Namma Mysuru</p>
          <p className="text-blue-200 text-sm mt-1">Discover the Real Mysuru</p>
        </div>

        <div className="flex-1 flex items-center">
          <p className="text-white/90 text-xl font-medium leading-relaxed max-w-xs">
            5 hidden gems personally verified by our team. Real people. Real places. Real Mysuru.
          </p>
        </div>

        <div>
          <p className="text-blue-200/60 text-2xl font-light mb-4">ನಮ್ಮ ಮೈಸೂರು</p>
          <div className="flex gap-2 flex-wrap">
            {["Verified Spots", "3 User Types", "100% Authentic"].map(pill => (
              <span key={pill}
                className="bg-blue-500/40 text-white/90 text-xs px-3 py-1 rounded-full">
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:ml-[41.666%] lg:w-7/12 bg-white flex flex-col justify-center px-8 lg:px-14 min-h-screen py-12">
        <h1 className="text-2xl font-bold text-gray-900">What brings you to Mysuru?</h1>
        <p className="text-sm text-gray-500 mt-1 mb-8">Choose your experience to continue</p>

        <div className="flex flex-col gap-3">
          {[
            { key: "tourist", icon: <Map size={20} className="text-blue-600" />, iconBg: "bg-blue-50", title: "I'm a Tourist", desc: "Discover hidden gems in Mysuru" },
{ key: "customer", icon: <ShoppingBag size={20} className="text-emerald-600" />, iconBg: "bg-emerald-50", title: "I'm a Customer", desc: "Shop authentic Mysuru crafts" },
{ key: "artisan", icon: <Palette size={20} className="text-amber-600" />, iconBg: "bg-amber-50", title: "I'm a Local Artisan", desc: "Showcase your art and reach customers" },
          ].map(role => (
            <button
              key={role.key}
              type="button"
              onClick={() => handleRoleSelect(role.key)}
              className="cursor-pointer bg-white border border-gray-200 rounded-lg p-5
                         flex items-center gap-4 hover:border-blue-500 hover:shadow-md
                         transition-all duration-150 text-left active:scale-95"
            >
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${role.iconBg}`}>
                {role.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{role.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{role.desc}</p>
              </div>
              <span className="text-gray-400 text-sm">→</span>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          Already have an account? Sign in
        </p>
      </div>

    </div>
  );
}

export default RoleSelect;