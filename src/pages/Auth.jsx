import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

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
  if (code === "auth/email-already-in-use") {
    return "This email is already registered. Try logging in.";
  }
  if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
    return "Incorrect password. Please try again.";
  }
  if (code === "auth/user-not-found") {
    return "No account found. Please sign up.";
  }
  if (code === "auth/weak-password") {
    return "Password must be at least 6 characters.";
  }
  return "Something went wrong. Please try again.";
}

function Auth() {
  const navigate = useNavigate();
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
    if (savedRole && roleMeta[savedRole]) {
      setSelectedRole(savedRole);
    }
  }, []);

  const badgeText = useMemo(() => {
    const meta = roleMeta[selectedRole] || roleMeta.tourist;
    return `Signing up as ${meta.emoji} ${meta.label}`;
  }, [selectedRole]);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", credential.user.uid), {
      name,
      email,
      role: selectedRole,
      createdAt: serverTimestamp(),
    });
    navigate(getRedirectPath(selectedRole));
  };

  const handleLogin = async () => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const userRef = doc(db, "users", credential.user.uid);
    const userSnap = await getDoc(userRef);
    const roleFromDb = userSnap.exists() ? userSnap.data().role : null;
    navigate(getRedirectPath(roleFromDb));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isSignup) {
        await handleSignup();
      } else {
        await handleLogin();
      }
    } catch (firebaseError) {
      setError(getFriendlyError(firebaseError.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-orange-50 via-amber-50 to-orange-100 px-4 py-8">
      <div className="w-full max-w-[420px] rounded-3xl border border-orange-200 bg-cream-50 bg-white/90 p-6 shadow-xl backdrop-blur sm:p-7">
        <div className="mb-5 text-center">
          <p className="inline-flex items-center rounded-full border border-orange-200 bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
            {badgeText}
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-orange-950">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-orange-900/80">
            {isSignup ? "Start your journey with Namma Mysuru" : "Login to continue exploring Mysuru"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="mb-1 block text-sm font-medium text-orange-950">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-orange-950">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-orange-950">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2.5 pr-12 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-lg"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {isSignup && (
            <div>
              <label className="mb-1 block text-sm font-medium text-orange-950">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                placeholder="Confirm your password"
              />
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {loading ? "Please wait..." : isSignup ? "Create Account" : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-orange-900/90">
          {isSignup ? "Already have an account?" : "New to Namma Mysuru?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignup((prev) => !prev);
              setError("");
            }}
            className="font-semibold text-orange-700 underline decoration-orange-300 underline-offset-2"
          >
            {isSignup ? "Login" : "Sign up"}
          </button>
        </p>
      </div>
    </main>
  );
}

export default Auth;
