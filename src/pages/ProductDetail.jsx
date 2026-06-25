import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { openRazorpay } from "../utils/razorpay";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState({ name: "", email: "" });
  const [toastMessage, setToastMessage] = useState("");

  // Monitor auth state for Razorpay checkouts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          name: user.displayName || user.email?.split("@")[0] || "Customer",
          email: user.email || "",
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch product dataset directly from Firestore using the URL parameter ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({
            id: docSnap.id,
            ...data,
            artisan: data.artisanName || "Local Artisan",
            image: data.imageUrl || `https://picsum.photos/seed/${docSnap.id}/600/600`,
            whatsapp: data.whatsapp || "",
          });
        } else {
          console.error("No such product document exists in Firestore!");
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    try {
      const currentCart = JSON.parse(localStorage.getItem("namma_cart") || "[]");
      const existingItem = currentCart.find((item) => item.id === product.id);
      
      let updatedCart;
      if (existingItem) {
        updatedCart = currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedCart = [...currentCart, { ...product, quantity: 1 }];
      }

      localStorage.setItem("namma_cart", JSON.stringify(updatedCart));
      setToastMessage(`🛒 Added "${product.name}" to cart!`);
      setTimeout(() => setToastMessage(""), 2000);
    } catch (err) {
      console.error("Cart synchronization error:", err);
    }
  };

  const handleBuyNow = () => {
    if (!product || !auth.currentUser) return;
    
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
      onSuccess: () => {
        navigate("/orders");
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <span className="text-5xl mb-2">🔍</span>
        <h2 className="text-xl font-bold text-gray-900">Product Not Found</h2>
        <button
          onClick={() => navigate("/customer-home")}
          className="mt-4 bg-blue-600 text-white font-semibold px-5 py-2 rounded-md text-sm shadow hover:bg-blue-700 transition active:scale-95"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* Ephemeral Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-green-600 text-white font-semibold text-sm px-5 py-3 rounded-md shadow-xl">
          {toastMessage}
        </div>
      )}

      {/* Navigation Top Header Bar */}
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/customer-home")}
            className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition flex items-center gap-1"
          >
            ← Back to Marketplace
          </button>
          <button
            onClick={() => navigate("/cart")}
            className="rounded-md bg-gray-50 p-2 text-xl text-blue-600 hover:bg-gray-100 transition active:scale-95"
          >
            🛒
          </button>
        </div>
      </nav>

      {/* Two-Column Specification Product Matrix */}
      <section className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Left Block: Image Showcase */}
          <div className="w-full aspect-square bg-gray-50 rounded-md overflow-hidden border border-gray-200">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition transform duration-300 hover:scale-105 will-change-transform"
            />
          </div>

          {/* Right Block: Product Details Meta Info */}
          <div className="flex flex-col justify-between h-full">
            <div>
              <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-md mb-3 uppercase tracking-wider">
                {product.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Crafted by: <span className="text-gray-700">{product.artisan}</span>
              </p>

              <div className="text-3xl font-extrabold text-blue-600 mt-4 mb-6">
                ₹{product.price}
              </div>

              <hr className="border-gray-200 my-4" />

              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                About this craft item
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Bottom Actions Row Matrix Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 rounded-md transition text-sm flex items-center justify-center gap-2 active:scale-95"
                >
                  🛒 Add to Cart
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition text-sm shadow-md active:scale-95"
                >
                  Buy Now
                </button>
              </div>

              {product.whatsapp && (
                <a
                  href={`https://wa.me/${product.whatsapp}?text=${encodeURIComponent(
                    `Hi! I'm interested in buying your product: "${product.name}" that I found listed on Namma Mysuru.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition text-sm flex items-center justify-center gap-2 shadow-sm text-center active:scale-95"
                >
                  💬 Chat with Artisan on WhatsApp
                </a>
              )}
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}

export default ProductDetail;
