import { useNavigate } from "react-router-dom";

const roles = [
  {
    key: "tourist",
    icon: "🧳",
    title: "I'm a Tourist",
    subtitle: "Discover hidden gems, local food & experiences in Mysuru",
    cardClass:
      "border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 hover:border-orange-300",
    iconClass: "bg-orange-100 text-orange-700",
    titleClass: "text-orange-900",
    subtitleClass: "text-orange-800/90",
    ringClass: "hover:ring-orange-200/70",
  },
  {
    key: "customer",
    icon: "🛍️",
    title: "I'm a Customer",
    subtitle: "Shop authentic Mysuru crafts & products from local artisans",
    cardClass:
      "border-emerald-200 bg-gradient-to-br from-emerald-50 via-lime-50 to-emerald-100 hover:border-emerald-300",
    iconClass: "bg-emerald-100 text-emerald-700",
    titleClass: "text-emerald-950",
    subtitleClass: "text-emerald-900/85",
    ringClass: "hover:ring-emerald-200/70",
  },
  {
    key: "artisan",
    icon: "🎨",
    title: "I'm a Local Artisan",
    subtitle: "List your craft, gain visibility & connect with buyers",
    cardClass:
      "border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 hover:border-amber-300",
    iconClass: "bg-amber-100 text-amber-700",
    titleClass: "text-amber-950",
    subtitleClass: "text-amber-900/85",
    ringClass: "hover:ring-amber-200/70",
  },
];

function RoleSelect() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    localStorage.setItem("selectedRole", role);
    navigate("/auth");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-emerald-50 px-5 py-10 md:px-8 md:py-14">
      <div className="mx-auto flex min-h-[85vh] w-full max-w-7xl flex-col items-center justify-center">
        <header className="mb-10 text-center md:mb-14">
          <p className="mb-3 inline-flex items-center rounded-full border border-amber-200 bg-white/70 px-4 py-1 text-sm font-medium tracking-wide text-amber-800 shadow-sm backdrop-blur">
            Karnataka Heritage Travel & Craft
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-amber-950 md:text-6xl">
            Namma Mysuru
          </h1>
          <p className="mt-3 text-base font-medium text-emerald-900/90 md:text-xl">
            Discover the Real Mysuru
          </p>
        </header>

        <section className="grid w-full grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {roles.map((role) => (
            <button
              key={role.key}
              type="button"
              onClick={() => handleRoleSelect(role.key)}
              className={`group relative overflow-hidden rounded-3xl border p-7 text-left shadow-lg ring-1 ring-transparent transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${role.cardClass} ${role.ringClass}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.7),_transparent_50%)]" />
              <div className="relative">
                <div
                  className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-sm ${role.iconClass}`}
                >
                  {role.icon}
                </div>
                <h2 className={`text-2xl font-semibold ${role.titleClass}`}>
                  {role.title}
                </h2>
                <p className={`mt-3 text-sm leading-relaxed ${role.subtitleClass}`}>
                  {role.subtitle}
                </p>
                <div className="mt-6 text-sm font-semibold text-slate-800/80 transition group-hover:translate-x-1">
                  Continue →
                </div>
              </div>
            </button>
          ))}
        </section>
      </div>
    </main>
  );
}

export default RoleSelect;
