import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase";

const craftOptions = [
  "Sandalwood",
  "Silk",
  "Inlay Art",
  "Food",
  "Jewellery",
  "Other",
];

function ArtisanDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("Artisan");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState({
    displayName: "",
    craftType: "Other",
    location: "",
    bio: "",
    contactNumber: "",
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [products, setProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Sandalwood",
    price: "",
    description: "",
    imageFile: null,
  });
  const [productMessage, setProductMessage] = useState("");
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");

  const profileLink = useMemo(
    () => (uid ? `namma-mysuru.vercel.app/artisan/${uid}` : ""),
    [uid]
  );

  const loadProducts = async (currentUid) => {
    const q = query(collection(db, "products"), where("artisanId", "==", currentUid));
    const snap = await getDocs(q);
    const list = snap.docs.map((item) => ({ id: item.id, ...item.data() }));
    list.sort((a, b) => {
      const aSec = a.createdAt?.seconds || 0;
      const bSec = b.createdAt?.seconds || 0;
      return bSec - aSec;
    });
    setProducts(list);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/auth");
        return;
      }

      setUid(user.uid);
      setEmail(user.email || "");
      setLoading(true);

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const resolvedName = data.name || user.displayName || "Artisan";
        setName(resolvedName);
        setProfile({
          displayName: resolvedName,
          craftType: data.craftType || "Other",
          location: data.location || "",
          bio: data.bio || "",
          contactNumber: data.contactNumber || "",
        });
      } else {
        setName(user.displayName || "Artisan");
        setProfile({
          displayName: user.displayName || "",
          craftType: "Other",
          location: "",
          bio: "",
          contactNumber: "",
        });
      }

      await loadProducts(user.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleSaveProfile = async () => {
    if (!uid) return;
    await updateDoc(doc(db, "users", uid), {
      name: profile.displayName,
      craftType: profile.craftType,
      location: profile.location,
      bio: profile.bio,
      contactNumber: profile.contactNumber,
    });
    setName(profile.displayName || "Artisan");
    setProfileMessage("Profile updated!");
    setEditingProfile(false);
    setTimeout(() => setProfileMessage(""), 2200);
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();
    if (!uid || !productForm.imageFile) {
      setProductMessage("Please fill all fields and upload an image.");
      return;
    }

    setSubmittingProduct(true);
    setProductMessage("");
    try {
      const safeFileName = productForm.imageFile.name.replace(/\s+/g, "_");
      const filePath = `products/${uid}/${Date.now()}_${safeFileName}`;
      const imageRef = ref(storage, filePath);
      await uploadBytes(imageRef, productForm.imageFile);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, "products"), {
        name: productForm.name,
        category: productForm.category,
        price: Number(productForm.price),
        description: productForm.description,
        imageUrl,
        artisanId: uid,
        artisanName: name,
        createdAt: serverTimestamp(),
        status: "active",
      });

      setProductForm({
        name: "",
        category: "Sandalwood",
        price: "",
        description: "",
        imageFile: null,
      });
      await loadProducts(uid);
      setProductMessage("Product added!");
    } catch {
      setProductMessage("Could not add product. Please try again.");
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;
    await deleteDoc(doc(db, "products", productId));
    await loadProducts(uid);
  };

  const handleCopyLink = async () => {
    if (!profileLink) return;
    await navigator.clipboard.writeText(profileLink);
    setCopyFeedback("Copied!");
    setTimeout(() => setCopyFeedback(""), 1500);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-orange-100">
      <nav className="sticky top-0 z-20 border-b border-orange-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-orange-900">Namma Mysuru</h1>
          <div className="flex items-center gap-3">
            <p className="hidden text-sm font-medium text-orange-900 sm:block">Hi, {name}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === "profile"
                ? "bg-orange-600 text-white"
                : "bg-white text-orange-800 ring-1 ring-orange-200"
            }`}
          >
            My Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === "products"
                ? "bg-orange-600 text-white"
                : "bg-white text-orange-800 ring-1 ring-orange-200"
            }`}
          >
            My Products
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("stats")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === "stats"
                ? "bg-orange-600 text-white"
                : "bg-white text-orange-800 ring-1 ring-orange-200"
            }`}
          >
            My Stats
          </button>
        </div>

        {activeTab === "profile" && (
          <div className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-orange-950">My Profile</h2>
              <button
                type="button"
                onClick={() => setEditingProfile((prev) => !prev)}
                className="rounded-xl bg-orange-100 px-3 py-1.5 text-sm font-semibold text-orange-800"
              >
                {editingProfile ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {!editingProfile ? (
              <div className="grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-2">
                <p>
                  <span className="font-semibold text-orange-900">Name: </span>
                  {profile.displayName || "-"}
                </p>
                <p>
                  <span className="font-semibold text-orange-900">Email: </span>
                  {email || "-"}
                </p>
                <p>
                  <span className="font-semibold text-orange-900">Craft Type: </span>
                  {profile.craftType || "-"}
                </p>
                <p>
                  <span className="font-semibold text-orange-900">Location: </span>
                  {profile.location || "-"}
                </p>
                <p className="md:col-span-2">
                  <span className="font-semibold text-orange-900">Bio: </span>
                  {profile.bio || "-"}
                </p>
                <p>
                  <span className="font-semibold text-orange-900">Contact Number: </span>
                  {profile.contactNumber || "-"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-orange-900">
                    Display Name
                  </label>
                  <input
                    value={profile.displayName}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, displayName: e.target.value }))
                    }
                    className="w-full rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-orange-900">
                    Craft Type
                  </label>
                  <select
                    value={profile.craftType}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, craftType: e.target.value }))
                    }
                    className="w-full rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  >
                    {craftOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-orange-900">
                    Location in Mysuru
                  </label>
                  <input
                    value={profile.location}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, location: e.target.value }))
                    }
                    className="w-full rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-orange-900">
                    Bio / About Me
                  </label>
                  <textarea
                    rows={3}
                    maxLength={200}
                    value={profile.bio}
                    onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                    className="w-full rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  />
                  <p className="mt-1 text-xs text-slate-500">{profile.bio.length}/200</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-orange-900">
                    Contact Number
                  </label>
                  <input
                    value={profile.contactNumber}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, contactNumber: e.target.value }))
                    }
                    className="w-full rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                >
                  Save
                </button>
              </div>
            )}
            {profileMessage && (
              <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {profileMessage}
              </p>
            )}
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-5">
            <div className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-orange-950">My Products</h2>
                <button
                  type="button"
                  onClick={() => setShowAddProduct((prev) => !prev)}
                  className="rounded-xl bg-orange-100 px-3 py-1.5 text-sm font-semibold text-orange-800"
                >
                  {showAddProduct ? "Hide Form" : "Add New Product"}
                </button>
              </div>

              {showAddProduct && (
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-orange-900">
                      Product Name
                    </label>
                    <input
                      required
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-orange-900">
                      Category
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    >
                      {craftOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-orange-900">
                      Price (₹)
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, price: e.target.value }))
                      }
                      className="w-full rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-orange-900">
                      Upload Image
                    </label>
                    <input
                      required
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          imageFile: e.target.files?.[0] || null,
                        }))
                      }
                      className="w-full rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-200 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-orange-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-orange-900">
                      Description
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingProduct}
                    className="md:col-span-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                  >
                    {submittingProduct ? "Submitting..." : "Submit"}
                  </button>
                </form>
              )}
              {productMessage && (
                <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {productMessage}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {products.length === 0 ? (
                <p className="rounded-2xl border border-orange-200 bg-white p-4 text-sm text-slate-600">
                  No products listed yet.
                </p>
              ) : (
                products.map((product) => (
                  <article
                    key={product.id}
                    className="overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-44 w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-orange-950">{product.name}</h3>
                      <p className="mt-1 text-sm font-semibold text-orange-700">
                        ₹{product.price}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          className="rounded-lg bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-orange-700">Products Listed</p>
                <p className="mt-2 text-3xl font-bold text-orange-950">{products.length}</p>
              </div>
              <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-orange-700">Profile Views</p>
                <p className="mt-2 text-3xl font-bold text-orange-950">0</p>
                <p className="text-xs text-slate-500">Coming soon</p>
              </div>
              <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-orange-700">Enquiries Received</p>
                <p className="mt-2 text-3xl font-bold text-orange-950">0</p>
                <p className="text-xs text-slate-500">Coming soon</p>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-orange-950">Shareable Profile Link</h3>
              <p className="mt-2 break-all rounded-xl bg-orange-50 px-3 py-2 text-sm text-slate-700">
                {profileLink}
              </p>
              <button
                type="button"
                onClick={handleCopyLink}
                className="mt-3 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Copy Link
              </button>
              {copyFeedback && (
                <span className="ml-3 text-sm font-semibold text-emerald-700">{copyFeedback}</span>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default ArtisanDashboard;
