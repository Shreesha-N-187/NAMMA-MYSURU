import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc, collection, deleteDoc, doc, getDoc,
  getDocs, query, serverTimestamp, updateDoc, where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase";

const craftOptions = ["Sandalwood", "Silk", "Inlay Art", "Food", "Jewellery", "Other"];

function ArtisanDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("Artisan");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState({
    displayName: "", craftType: "Other", location: "", bio: "", contactNumber: "",
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [products, setProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "", category: "Sandalwood", price: "", description: "", imageFile: null,
  });
  const [productMessage, setProductMessage] = useState("");
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");

  const profileLink = useMemo(
    () => (uid ? `${window.location.origin}/artisan/${uid}` : ""),
    [uid]
  );

  const loadProducts = async (currentUid) => {
    const q = query(collection(db, "products"), where("artisanId", "==", currentUid));
    const snap = await getDocs(q);
    const list = snap.docs.map((item) => ({ id: item.id, ...item.data() }));
    list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setProducts(list);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate("/auth"); return; }
      setUid(user.uid);
      setEmail(user.email || "");
      setLoading(true);
      const userSnap = await getDoc(doc(db, "users", user.uid));
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
        setProfile({ displayName: user.displayName || "", craftType: "Other", location: "", bio: "", contactNumber: "" });
      }
      await loadProducts(user.uid);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => { await signOut(auth); navigate("/"); };

  const handleSaveProfile = async () => {
    if (!uid) return;
    await updateDoc(doc(db, "users", uid), {
      name: profile.displayName, craftType: profile.craftType,
      location: profile.location, bio: profile.bio, contactNumber: profile.contactNumber,
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
      const imageRef = ref(storage, `products/${uid}/${Date.now()}_${safeFileName}`);
      await uploadBytes(imageRef, productForm.imageFile);
      const imageUrl = await getDownloadURL(imageRef);
      await addDoc(collection(db, "products"), {
        name: productForm.name, category: productForm.category,
        price: Number(productForm.price), description: productForm.description,
        imageUrl, artisanId: uid, artisanName: name,
        createdAt: serverTimestamp(), status: "active",
      });
      setProductForm({ name: "", category: "Sandalwood", price: "", description: "", imageFile: null });
      await loadProducts(uid);
      setProductMessage("Product added!");
    } catch {
      setProductMessage("Could not add product. Please try again.");
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="space-y-3 w-full max-w-3xl px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 h-16 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">Namma Mysuru</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Hi, {name}</span>
            <button onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* TABS */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-8 w-fit">
          {[["profile", "My Profile"], ["products", "My Products"], ["stats", "My Stats"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2 rounded-md text-sm cursor-pointer transition-all
                ${activeTab === key
                  ? "bg-white shadow-sm text-gray-900 font-semibold"
                  : "text-gray-500 hover:text-gray-700"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* TAB 1: MY PROFILE */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {!editingProfile ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700
                                  flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {name?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{name}</h2>
                    <span className="inline-block mt-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-md">
                      {profile.craftType || "Artisan"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Email", value: email },
                    { label: "Craft Type", value: profile.craftType },
                    { label: "Location", value: profile.location },
                    { label: "Contact", value: profile.contactNumber },
                  ].map(item => (
                    <div key={item.label}>
                      <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900">{item.value || "—"}</p>
                    </div>
                  ))}
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Bio</p>
                    <p className="text-sm text-gray-700">{profile.bio || "No bio yet."}</p>
                  </div>
                </div>
                <button onClick={() => setEditingProfile(true)}
                  className="mt-5 text-sm font-medium text-blue-600 hover:text-blue-700
                             border border-blue-200 rounded-md px-4 py-2 hover:bg-blue-50
                             transition-colors">
                  Edit Profile
                </button>
                {profileMessage && (
                  <p className="mt-3 text-sm text-green-600">{profileMessage}</p>
                )}
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold text-gray-900 mb-5">Edit Profile</h3>
                <div className="space-y-4">
                  {[
                    { label: "Display Name", key: "displayName", type: "input" },
                    { label: "Location in Mysuru", key: "location", type: "input" },
                    { label: "Contact Number", key: "contactNumber", type: "input" },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                      <input
                        value={profile[field.key]}
                        onChange={e => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                                   focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Craft Type</label>
                    <select
                      value={profile.craftType}
                      onChange={e => setProfile(prev => ({ ...prev, craftType: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                      {craftOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bio / About Me</label>
                    <textarea
                      rows={3}
                      maxLength={200}
                      value={profile.bio}
                      onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                                 outline-none resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">{profile.bio.length}/200</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-5">
                  <button onClick={handleSaveProfile}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-5 py-2
                               text-sm font-medium transition-colors">
                    Save Changes
                  </button>
                  <button onClick={() => setEditingProfile(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: MY PRODUCTS */}
        {activeTab === "products" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowAddProduct(prev => !prev)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2
                           text-sm font-medium transition-colors">
                {showAddProduct ? "Hide Form" : "+ Add New Product"}
              </button>
            </div>

            {showAddProduct && (
              <form onSubmit={handleAddProduct}
                className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">New Product</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Product Name</label>
                    <input required value={productForm.name}
                      onChange={e => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                    <select value={productForm.category}
                      onChange={e => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                      {craftOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input required type="number" min="1" value={productForm.price}
                      onChange={e => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea required rows={3} value={productForm.description}
                      onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                                 outline-none resize-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Product Image</label>
                    <input required type="file" accept="image/*"
                      onChange={e => setProductForm(prev => ({ ...prev, imageFile: e.target.files?.[0] || null }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                                 text-gray-700 file:mr-3 file:rounded-md file:border-0
                                 file:bg-blue-50 file:px-3 file:py-1 file:text-sm
                                 file:font-medium file:text-blue-700"
                    />
                  </div>
                </div>
                {productMessage && (
                  <p className="mt-3 text-sm text-green-600">{productMessage}</p>
                )}
                <button type="submit" disabled={submittingProduct}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                             text-white rounded-md px-6 py-2 text-sm font-medium transition-colors">
                  {submittingProduct ? "Uploading..." : "Add Product"}
                </button>
              </form>
            )}

            {products.length === 0 ? (
              <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-10 text-center">
                <p className="text-gray-500 text-sm">No products yet</p>
                <p className="text-xs text-gray-400 mt-1">Add your first product above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map(product => (
                  <div key={product.id}
                    className="flex items-center gap-4 p-4 bg-white rounded-lg
                               border border-gray-200 hover:shadow-sm transition-shadow">
                    <img src={product.imageUrl} alt={product.name}
                      className="w-32 h-32 rounded-md object-cover border border-gray-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                          {product.category}
                        </span>
                        <span className="text-sm font-semibold text-blue-600">₹{product.price}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product.description}</p>
                    </div>
                    <div className="flex flex-col gap-1 ml-auto">
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                      <button onClick={() => handleDeleteProduct(product.id)}
                        className="text-xs text-red-500 hover:text-red-600 font-medium">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY STATS */}
        {activeTab === "stats" && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: "Products Listed", value: products.length },
                { label: "Profile Views", value: 0 },
                { label: "Enquiries Received", value: 0 },
              ].map(stat => (
                <div key={stat.label}
                  className="bg-white rounded-lg border border-gray-200 p-5 text-center">
                  <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Public Profile</h3>
              <div className="bg-gray-50 rounded-md px-3 py-2.5 text-xs text-gray-600
                              font-mono truncate border border-gray-200">
                {profileLink}
              </div>
              <button onClick={handleCopyLink}
                className="mt-3 w-full border border-gray-300 rounded-md py-2 text-sm
                           text-gray-700 hover:bg-gray-50 transition-colors">
                {copyFeedback ? "✅ Copied!" : "📋 Copy Link"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ArtisanDashboard;