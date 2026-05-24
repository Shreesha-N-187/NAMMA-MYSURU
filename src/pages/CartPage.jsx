import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
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
            const nextQty = item.quantity + delta;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    if (!currentUser) return;

    openRazorpay({
      amount: grandTotal,
      productName: cart.map((i) => i.name).join(", "),
      artisanName: "Multiple Artisans",
      userName: currentUser.displayName || "Customer",
      userEmail: currentUser.email,
      onSuccess: async (response) => {
        try {
          // Push transaction structure safely to Firestore collections
          await addDoc(collection(db, "orders"), {
            items: cart,
            total: grandTotal,
            userId: currentUser.uid,
            userEmail: currentUser.email,
            status: "paid",
            createdAt: serverTimestamp(),
          });

          // Flush current local tracking records
          localStorage.removeItem("namma_cart");
          setCart([]);

          setToastMessage("🎉 Order placed successfully!");
          setTimeout(() => {
            setToastMessage("");
            navigate("/customer-home");
          }, 3000);
        } catch (error) {
          console.error("Error creating record order history:", error);
        }
      },
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-orange-100 pb-12">
      {toastMessage && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 text-white font-bold text-base px-8 py-4 rounded-full shadow-2xl transition animate-bounce">
          {toastMessage}
        </div>
      )}

      <nav className="border-b border-orange-200/80 bg-white/90 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/customer-home")}
            className="text-sm font-semibold text-orange-700 hover:text-orange-900 transition flex items-center gap-1"
          >
            ← Continue Shopping
          </button>
          <h1 className="text-xl font-bold text-orange-950 flex items-center gap-2">
            🛒 My Cart
            {cart.length > 0 && (
              <span className="bg-orange-600 text-white rounded-full text-xs px-2 py-0.5">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </h1>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-orange-200 shadow-sm p-8">
            <span className="text-6xl mb-4">🛒</span>
            <h2 className="text-xl font-bold text-orange-950">Your cart is empty</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">Looks like you haven't added any products yet.</p>
            <button
              onClick={() => navigate("/customer-home")}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow transition"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Items */}
            <div className="w-full lg:w-2/3 flex flex-col gap-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-orange-200 p-4 flex items-center gap-4 shadow-sm relative hover:shadow-md transition"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover border border-orange-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-orange-950 text-base truncate">{item.name}</h3>
                    <p className="text-xs text-slate-500">by {item.artisan}</p>
                    <span className="inline-block bg-orange-50 text-orange-800 text-xs px-2 py-0.5 rounded-md font-medium mt-1">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex flex-col items-end justify-between h-20 gap-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition text-sm p-1"
                      title="Remove item"
                    >
                      🗑️
                    </button>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-orange-200 rounded-lg bg-orange-50 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2 py-1 text-orange-700 hover:bg-orange-200 transition font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 text-sm font-semibold text-orange-950">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2 py-1 text-orange-700 hover:bg-orange-200 transition font-bold"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-bold text-orange-950 text-right w-20">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Calculations Breakdown Summary Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-2xl border border-orange-200 p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-orange-950 mb-4">Order Summary</h2>
                
                <div className="max-h-40 overflow-y-auto flex flex-col gap-2 mb-4 pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-slate-600">
                      <span className="truncate max-w-[200px]">{item.name} (x{item.quantity})</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <hr className="border-orange-100 my-4" />

                <div className="flex flex-col gap-2.5 text-sm">
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
          </div>
        )}
      </section>
    </main>
  );
}

export default CartPage;