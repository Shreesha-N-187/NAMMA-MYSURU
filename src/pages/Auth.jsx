import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Map, ShoppingBag, Palette, ChevronRight, Eye, EyeOff } from "lucide-react"

const roleMeta = {
  tourist: { label: "Tourist", emoji: "🧳" },
  customer: { label: "Customer", emoji: "🛍️" },
  artisan: { label: "Artisan", emoji: "🎨" },
};

function getRedirectPath(role) {
  if (role === "tourist") return "/tourist-home";
  if (role === "customer") return "/customer-home";
  if (role === "artisan") return "/artisan-dashboard";
  return "/";
}

function getFriendlyError(code) {
  if (code === "auth/email-already-in-use") return "This email is already registered. Try logging in.";
  if (code === "auth/wrong-password" || code === "auth/invalid-credential") return "Incorrect password. Please try again.";
  if (code === "auth/user-not-found") return "No account found. Please sign up.";
  if (code === "auth/weak-password") return "Password must be at least 6 characters.";
  return "Something went wrong. Please try again.";
}

function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [isSignup, setIsSignup] = useState(false);
  const [selectedRole, setSelectedRole] = useState("tourist");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const savedRole = localStorage.getItem("selectedRole");
    if (savedRole && roleMeta[savedRole]) setSelectedRole(savedRole);
  }, []);

  const roleLabel = useMemo(() => {
    return roleMeta[selectedRole]?.label || "Tourist";
  }, [selectedRole]);

  const handleSignup = async () => {
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", credential.user.uid), {
      name, email, role: selectedRole, createdAt: serverTimestamp(),
    });
    navigate(from && from !== "/auth" ? from : getRedirectPath(selectedRole), { replace: true });
  };

  const handleLogin = async () => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const userSnap = await getDoc(doc(db, "users", credential.user.uid));
    const roleFromDb = userSnap.exists() ? userSnap.data().role : null;
    navigate(from && from !== "/auth" ? from : getRedirectPath(roleFromDb), { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isSignup) await handleSignup();
      else await handleLogin();
    } catch (firebaseError) {
      setError(getFriendlyError(firebaseError.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">

          {/* TOP */}
          <div className="text-center mb-6">
            <p className="text-xl font-bold text-blue-600">Namma Mysuru</p>
            <span className="inline-block mt-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
              {roleLabel} Account
            </span>
          </div>

          {/* TAB TOGGLE */}
          <div className="grid grid-cols-2 bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => { setIsSignup(false); setError(""); }}
              className={`py-2 text-sm rounded-md transition-all ${
                !isSignup ? "bg-white shadow-sm font-semibold text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setIsSignup(true); setError(""); }}
              className={`py-2 text-sm rounded-md transition-all ${
                isSignup ? "bg-white shadow-sm font-semibold text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none
                             bg-white text-gray-900 placeholder-gray-400"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none
                           bg-white text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 pr-10 text-sm
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none
                             bg-white text-gray-900 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 px-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {isSignup && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none
                             bg-white text-gray-900 placeholder-gray-400"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2.5
                         text-sm font-semibold transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed active:scale-95"
            >
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Login"}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            {isSignup ? "Already have an account?" : "New to Namma Mysuru?"}{" "}
            <button
              type="button"
              onClick={() => { setIsSignup(prev => !prev); setError(""); }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignup ? "Login" : "Sign up"}
            </button>
          </p>

        </div>
      </div>
    </main>
  );
}

export default Auth;