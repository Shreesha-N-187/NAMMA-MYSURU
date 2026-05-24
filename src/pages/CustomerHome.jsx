import { signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { openRazorpay } from "../utils/razorpay";

const categories = [
  "All",
  "Sandalwood",
  "Silk",
  "Inlay Art",
  "Food Products",
  "Jewellery",
  "Other",
];

function CustomerHome() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentUser, setCurrentUser] = useState({ name: "", email: "" });
  const [firestoreProducts, setFirestoreProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Custom Toast state
  const [toastMessage, setToastMessage] = useState("");

  // Persistent LocalStorage Cart Initialization
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("namma_cart") || "[]");
    } catch {
      return [];
    }
  });

  // Sync Cart state to LocalStorage
  useEffect(() => {
    localStorage.setItem("namma_cart", JSON.stringify(cart));
  }, [cart]);

  // Total distinct quantity counting for Badge
  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return firestoreProducts;
    return firestoreProducts.filter((product) => product.category === activeCategory);
  }, [activeCategory, firestoreProducts]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          artisan: doc.data().artisanName || "Local Artisan",
          image: doc.data().imageUrl || "https://picsum.photos/seed/" + doc.id + "/400/400",
          whatsapp: doc.data().whatsapp || "",
        }));
        setFirestoreProducts(fetched);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCurrentUser({ name: "", email: "" });
        return;
      }
      setCurrentUser({
        name: user.displayName || user.email?.split("@")[0] || "Customer",
        email: user.email || "",
      });
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    // Fire ephemeral state notification toast
    setToastMessage(`🛒 Added "${product.name}" to cart!`);
    setTimeout(() => setToastMessage(""), 2000);
  };

  const handleBuyNow = (product) => {
    openRazorpay({
      amount: product.price,
      productName: product.name,
      artisanName: product.artisan,
      userName: currentUser.name,
      userEmail: currentUser.email,
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-orange-100 relative">
      
      {/* Toast Notification Element */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-xl animate-fade-in-up">
          {toastMessage}
        </div>
      )}

      <nav className="sticky top-0 z-20 border-b border-orange-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-orange-900 cursor-pointer" onClick={() => navigate("/customer-home")}>
            Namma Mysuru
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/cart")}
              className="relative rounded-full bg-orange-100 p-2 text-xl text-orange-700 hover:bg-orange-200 transition"
              type="button"
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-orange-600 px-1.5 py-0.5 text-xs font-semibold text-white min-w-5 text-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-orange-200 via-amber-100 to-orange-50 p-6 shadow-sm ring-1 ring-orange-200">
          <h2 className="text-3xl font-bold tracking-tight text-orange-950">
            Shop Authentic Mysuru Crafts
          </h2>
          <p className="mt-2 text-sm text-orange-900/90 sm:text-base">
            Buy directly from verified local artisans — no middlemen
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                activeCategory === category
                  ? "border-orange-700 bg-orange-600 text-white"
                  : "border-orange-200 bg-white text-orange-800 hover:bg-orange-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loadingProducts && (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
            </div>
          )}

          {!loadingProducts && filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">
              No products found.
            </div>
          )}

          {!loadingProducts && filteredProducts.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="aspect-square w-full object-cover"
                />
                <div className="p-5 pb-0">
                  <h3 className="text-lg font-bold text-orange-950">{product.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">by {product.artisan}</p>
                  <p className="mt-2 text-lg font-bold text-orange-700">₹{product.price}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-700">
                    {product.description}
                  </p>
                </div>
              </div>
              
              <div className="p-5 pt-4">
                <div className="grid grid-cols-1 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="w-full border border-orange-600 text-orange-600 hover:bg-orange-50 text-sm py-2 rounded-xl font-semibold transition"
                  >
                    🛒 Add to Cart
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleBuyNow(product)}
                    className="rounded-xl bg-orange-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
                  >
                    Buy Now
                  </button>

                  <a
                    href={`https://wa.me/${product.whatsapp}?text=${encodeURIComponent(
                      `Hi, I found your product on Namma Mysuru! I'm interested in ${product.name}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default CustomerHome;