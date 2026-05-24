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
  const [cartItems, setCartItems] = useState([]);
  const [currentUser, setCurrentUser] = useState({ name: "", email: "" });
  const [firestoreProducts, setFirestoreProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

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

  const handleBuyNow = (product) => {
    setCartItems((prev) => {
      if (prev.includes(product.id)) return prev;
      return [...prev, product.id];
    });
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
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-orange-100">
      <nav className="sticky top-0 z-20 border-b border-orange-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-orange-900">
            Namma Mysuru
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative rounded-full bg-orange-100 px-3 py-1 text-lg text-orange-700">
              🛒
              <span className="absolute -right-2 -top-2 rounded-full bg-emerald-600 px-1.5 text-xs font-semibold text-white">
                {cartItems.length}
              </span>
            </div>
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
              className="overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src={product.image}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
              <div className="p-5">
                <h3 className="text-lg font-bold text-orange-950">{product.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{product.artisan}</p>
                <p className="mt-2 text-lg font-bold text-orange-700">₹{product.price}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-700">
                  {product.description}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
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
                    WhatsApp Artisan
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
