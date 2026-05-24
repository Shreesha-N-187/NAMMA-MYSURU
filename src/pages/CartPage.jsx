import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { openRazorpay } from "../utils/razorpay";

function CartPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("namma_cart") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("namma_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        navigate("/auth");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstAmount = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gstAmount;

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // 🔒 WIRED UP RE-USABLE HANDLER FUNCTION FOR EXTRACTING PERSISTENT PAYLOADS
  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!currentUser) {
      navigate("/auth");
      return;
    }

    openRazorpay({
      amount: grandTotal,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userName: currentUser.displayName || currentUser.email.split("@")[0] || "Customer",
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        image: item.image || "",
        artisanId: item.userId || "unknown", // Tracks unique artisan profiles
        artisanName: item.artisanName || "Local Artisan",
      })),
      onSuccess: () => {
        // Purge client storage only after verified gateway response signals success
        localStorage.removeItem("namma_cart");
        setCart([]);
        navigate("/orders");
      },
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-orange-100 pb-12">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300">
          {toastMessage}
        </div>
      )}

      {/* Navbar Title Banner */}
      <nav className="sticky top-0 z-20 border-b border-orange-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/customer-home")}
            className="text-sm font-semibold text-orange-700 hover:text-orange-900 transition flex items-center gap-1"
          >
            ← Back to Marketplace
          </button>
          <h1 className="text-lg font-bold text-orange-950">My Shopping Cart</h1>
          <div className="w-20" />
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        {cart.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-orange-200 p-12 text-center shadow-sm flex flex-col items-center justify-center">
            <span className="text-6xl mb-4">🛒</span>
            <h2 className="text-xl font-bold text-orange-950">Your cart is empty</h2>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">
              Explore unique handmade artifacts from verified creators in Mysuru!
            </p>
            <button
              onClick={() => navigate("/customer-home")}
              className="mt-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Basket Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <article
                  key={item.id}
                  className="bg-white/80 backdrop-blur-md rounded-2xl border border-orange-200 p-4 flex gap-4 items-center shadow-sm"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover border border-orange-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-orange-950 text-base truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">by {item.artisanName || "Local Artisan"}</p>
                    <div className="text-orange-700 font-extrabold text-sm mt-2">
                      ₹{item.price}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 ml-auto">
                    <div className="flex items-center border border-orange-200 rounded-lg overflow-hidden bg-orange-50/50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-2 py-1 text-orange-800 hover:bg-orange-100 font-bold text-sm transition"
                      >
                        -
                      </button>
                      <span className="px-2 text-sm font-bold text-orange-950 min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-2 py-1 text-orange-800 hover:bg-orange-100 font-bold text-sm transition"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-rose-500 hover:text-rose-700 transition font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Calculations Breakdown Summary Sheet */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-orange-200 p-6 shadow-sm sticky top-24">
              <h2 className="text-base font-bold text-orange-950 border-b border-orange-100 pb-3">
                Order Estimation Summary
              </h2>

              <div className="flex flex-col gap-2.5 text-sm mt-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18%)</span>
                  <span>₹{gstAmount}</span>
                </div>
                <hr className="border-orange-100 my-2" />
                <div className="flex justify-between text-base font-bold text-orange-950">
                  <span>Total Amount</span>
                  <span className="text-xl text-orange-700">₹{grandTotal}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-md transition mt-6 text-center text-sm"
              >
                Pay Now ₹{grandTotal}
              </button>

              <p
                onClick={() => navigate("/customer-home")}
                className="text-center text-xs text-orange-700 hover:underline mt-4 cursor-pointer"
              >
                Continue Shopping
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default CartPage;