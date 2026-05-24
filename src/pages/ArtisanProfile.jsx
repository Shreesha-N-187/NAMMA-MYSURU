import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

function ArtisanProfile() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch artisan user document
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || userSnap.data().role !== "artisan") {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setArtisan({ id: userSnap.id, ...userSnap.data() });

        // Fetch artisan's products
        const q = query(
          collection(db, "products"),
          where("artisanId", "==", uid)
        );
        const productsSnap = await getDocs(q);
        const fetched = productsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setProducts(fetched);
      } catch (err) {
        console.error("Error fetching artisan profile:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-2xl font-bold text-gray-700">Artisan not found</p>
        <button
          onClick={() => navigate("/")}
          className="bg-orange-600 text-white px-6 py-2 rounded-xl"
        >
          Go Home
        </button>
      </div>
    );
  }

  const whatsappNumber = artisan.whatsapp || artisan.contactNumber || "";
  const whatsappLink = whatsappNumber
    ? `https://wa.me/91${whatsappNumber.replace(/\D/g, "")}?text=Hi ${artisan.name}, I found your profile on Namma Mysuru!`
    : null;

  return (
    <main className="min-h-screen bg-orange-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-orange-100 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-orange-600 font-medium text-sm hover:text-orange-700"
        >
          ← Back
        </button>
        <span className="font-bold text-orange-700 text-lg">Namma Mysuru</span>
        <div />
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Artisan Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-3xl font-bold text-orange-600 flex-shrink-0">
              {artisan.name?.charAt(0).toUpperCase() || "A"}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{artisan.name}</h1>

              {artisan.craftType && (
                <span className="inline-block mt-1 bg-orange-100 text-orange-700 text-xs font-medium px-3 py-1 rounded-full">
                  {artisan.craftType}
                </span>
              )}

              {artisan.location && (
                <p className="text-gray-500 text-sm mt-2 flex items-center gap-1">
                  📍 {artisan.location}, Mysuru
                </p>
              )}

              {artisan.bio && (
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                  {artisan.bio}
                </p>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-4 mt-5 pt-4 border-t border-orange-50">
            <div className="text-center flex-1">
              <p className="text-xl font-bold text-orange-600">{products.length}</p>
              <p className="text-xs text-gray-400">Products</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-xl font-bold text-orange-600">✓</p>
              <p className="text-xs text-gray-400">Verified</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-xl font-bold text-orange-600">Mysuru</p>
              <p className="text-xs text-gray-400">Location</p>
            </div>
          </div>

          {/* Contact Button */}
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-xl transition-colors"
            >
              💬 WhatsApp {artisan.name?.split(" ")[0]}
            </a>
          )}
        </div>

        {/* Products Section */}
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          Products by {artisan.name?.split(" ")[0]} ({products.length})
        </h2>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-orange-100">
            <p className="text-gray-400 text-sm">No products listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <img
                  src={product.imageUrl || `https://picsum.photos/seed/${product.id}/400/300`}
                  alt={product.name}
                  className="w-full h-44 object-cover"
                />

                <div className="p-4">
                  {/* Category */}
                  <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                    {product.category}
                  </span>

                  {/* Name + Price */}
                  <h3 className="font-semibold text-gray-800 mt-2">{product.name}</h3>
                  <p className="text-orange-600 font-bold text-lg mt-0.5">
                    ₹{product.price?.toLocaleString()}
                  </p>

                  {/* Description */}
                  {product.description && (
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* WhatsApp button */}
                  {whatsappLink && (
                    <a
                      href={`https://wa.me/91${whatsappNumber.replace(/\D/g, "")}?text=Hi ${artisan.name}, I'm interested in your product: ${product.name} (₹${product.price}) on Namma Mysuru!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-1 w-full border border-green-500 text-green-600 hover:bg-green-50 text-sm font-medium py-2 rounded-xl transition-colors"
                    >
                      💬 Enquire via WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-8">
          This artisan profile is verified by the Namma Mysuru team ✓
        </p>
      </div>
    </main>
  );
}

export default ArtisanProfile;
