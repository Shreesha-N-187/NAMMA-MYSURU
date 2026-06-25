import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { openRazorpay } from "../utils/razorpay";
import BackButton from "../components/BackButton";

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
        artisanId: item.userId || "unknown",
        artisanName: item.artisanName || "Local Artisan",
      })),
      onSuccess: () => {
        localStorage.removeItem("namma_cart");
        setCart([]);
        navigate("/orders");
      },
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900/90 backdrop-blur-sm text-white px-5 py-2.5 rounded-md text-sm font-semibold shadow-lg transition-all duration-300">
          {toastMessage}
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <BackButton to="/customer-home" label="Continue shopping" />
          <h1 className="text-lg font-bold text-blue-600">My Shopping Cart</h1>
          <div className="w-20" />
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        {cart.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm flex flex-col items-center justify-center">
            <span className="text-6xl mb-4">🛒</span>
            <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mt-1 max-w-xs">
              Explore unique handmade artifacts from verified creators in Mysuru!
            </p>
            <button
              onClick={() => navigate("/customer-home")}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-md text-sm transition active:scale-95 shadow"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4 items-center shadow-sm"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-md object-cover border border-gray-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base truncate">{item.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">by {item.artisanName || "Local Artisan"}</p>
                    <div className="text-blue-600 font-extrabold text-sm mt-2">₹{item.price}</div>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 ml-auto">
                    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-2 py-1 text-gray-700 hover:bg-gray-100 font-bold text-sm transition active:scale-95"
                      >
                        -
                      </button>
                      <span className="px-2 text-sm font-bold text-gray-900 min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-2 py-1 text-gray-700 hover:bg-gray-100 font-bold text-sm transition active:scale-95"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-red-500 hover:text-red-700 transition font-semibold active:scale-95"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm sticky top-24">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-3">
                Order Estimation Summary
              </h2>
              <div className="flex flex-col gap-2.5 text-sm mt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹{gstAmount}</span>
                </div>
                <hr className="border-gray-200 my-2" />
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-xl text-blue-600">₹{grandTotal}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md shadow-md transition active:scale-95 mt-6 text-center text-sm"
              >
                Pay Now ₹{grandTotal}
              </button>
              <p
                onClick={() => navigate("/customer-home")}
                className="text-center text-xs text-blue-600 hover:underline mt-4 cursor-pointer"
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
