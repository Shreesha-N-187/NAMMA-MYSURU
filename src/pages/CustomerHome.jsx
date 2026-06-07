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
  const [toastMessage, setToastMessage] = useState("");
  const [scrolled, setScrolled] = useState(false);

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
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    setToastMessage(`🛒 Added "${product.name}" to cart!`);
    setTimeout(() => setToastMessage(""), 2000);
  };

  const handleBuyNow = (product) => {
    if (!auth.currentUser) {
      navigate("/auth");
      return;
    }
    openRazorpay({
      amount: product.price,
      userId: auth.currentUser.uid,
      userName: currentUser.name,
      userEmail: currentUser.email,
      items: [
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
          artisan: product.artisan,
        },
      ],
      onSuccess: () => navigate("/orders"),
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-green-600 text-white
                        font-semibold text-sm px-5 py-3 rounded-lg shadow-xl
                        transition-all duration-300">
          {toastMessage}
        </div>
      )}

      {/* Navbar */}
      <nav className={`bg-white sticky top-0 z-40 transition-shadow duration-200
                      ${scrolled ? "shadow-md border-b border-gray-200" : "border-b border-gray-100"}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span
            className="text-lg font-bold text-blue-600 tracking-tight cursor-pointer"
            onClick={() => navigate("/customer-home")}
          >
            Namma Mysuru
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/orders")}
              className="hidden sm:block text-xs text-gray-600 hover:text-blue-600
                         transition-colors active:scale-95"
            >
              📦 My Orders
            </button>
            <div className="relative">
              <button
                onClick={() => navigate("/cart")}
                className="text-gray-600 hover:text-blue-600 text-xl transition-colors active:scale-95"
              >
                🛒
              </button>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white
                                 text-xs w-4 h-4 rounded-full flex items-center
                                 justify-center font-semibold leading-none">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:block text-xs text-gray-500">
              Hi, {currentUser.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-blue-600 py-12 px-6 text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Shop Authentic Mysuru Crafts
        </h1>
        <p className="text-blue-200 text-sm mt-2">
          Direct from verified local artisans — no middlemen
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto px-4 mt-4 pb-1 max-w-6xl mx-auto">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`flex-shrink-0 text-xs px-4 py-1.5 rounded-md font-medium
                        transition-colors active:scale-95
              ${activeCategory === category
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Products */}
      {loadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 mt-6 max-w-6xl mx-auto">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200
                                    overflow-hidden animate-pulse">
              <div className="w-full aspect-square bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-5 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 mt-6
                        max-w-6xl mx-auto pb-10">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm
                         hover:shadow-md hover:-translate-y-0.5 transition-all
                         duration-200 overflow-hidden will-change-transform"
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full aspect-square object-cover cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                />
                <span className="absolute top-2 right-2 bg-green-500 text-white
                                 text-xs px-2 py-0.5 rounded-md">
                  🟢 Live
                </span>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-500 mb-1">by {product.artisan}</p>
                <p
                  className="text-sm font-semibold text-gray-900 cursor-pointer
                             hover:text-blue-600 transition-colors"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {product.name}
                </p>
                <p className="text-xl font-bold text-blue-600 mt-1">₹{product.price}</p>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                  {product.description}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                    className="text-xs border border-gray-300 rounded-md px-3 py-1.5
                               text-gray-700 hover:bg-gray-50 transition-colors active:scale-95"
                  >
                    🛒 Cart
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleBuyNow(product); }}
                    className="text-xs bg-blue-600 text-white rounded-md px-3 py-1.5
                               font-medium hover:bg-blue-700 transition-colors active:scale-95"
                  >
                    Buy Now
                  </button>
                  <a
                    href={`https://wa.me/${product.whatsapp}?text=${encodeURIComponent(
                      `Hi, I found your product on Namma Mysuru! I'm interested in ${product.name}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs bg-green-500 text-white rounded-md px-3 py-1.5
                               active:scale-95 flex items-center"
                  >
                    💬
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerHome;
