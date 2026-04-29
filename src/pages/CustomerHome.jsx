import { signOut } from "firebase/auth";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const products = [
  {
    id: "p1",
    name: "Mysore Silk Saree",
    category: "Silk",
    price: 3500,
    artisan: "Silk Weaver's Corner",
    artisanId: "a1",
    description: "Handwoven pure Mysore silk with traditional zari border",
    image: "/images/silk.jpeg",
    whatsapp: "919876543210",
  },
  {
    id: "p2",
    name: "Sandalwood Elephant Figurine",
    category: "Sandalwood",
    price: 850,
    artisan: "Ramu Crafts",
    artisanId: "a2",
    description: "Hand-carved aromatic sandalwood elephant, 6 inches",
    image: "/images/elephant.jpeg",
    whatsapp: "919876543211",
  },
  {
    id: "p3",
    name: "Inlay Art Jewellery Box",
    category: "Inlay Art",
    price: 1200,
    artisan: "Heritage Inlay Studio",
    artisanId: "a3",
    description: "Rosewood box with intricate ivory-style inlay work",
    image: "/images/inlay-box.jpg",
    whatsapp: "919876543212",
  },
  {
    id: "p4",
    name: "Rosewood Photo Frame",
    category: "Sandalwood",
    price: 650,
    artisan: "Ramu Crafts",
    artisanId: "a2",
    description: "Polished rosewood frame, 5x7 inch, hand-finished",
    image: "/images/rosewoodimage.jpg",
    whatsapp: "919876543211",
  },
  {
    id: "p5",
    name: "Original Mysore Pak Box",
    category: "Food Products",
    price: 280,
    artisan: "Loco Artisans Chocolates",
    artisanId: "a4",
    description: "Authentic Mysore Pak (500g) made with pure ghee",
    image: "/images/mysore-pak.jpg",
    whatsapp: "919876543213",
  },
  {
    id: "p6",
    name: "Artisan Dark Chocolate Box",
    category: "Food Products",
    price: 350,
    artisan: "Loco Artisans Chocolates",
    artisanId: "a4",
    description: "Sugar-free Indian dark chocolate with Pomelo bits (250g)",
    image: "/images/darra-confectionery-the-chocolate-boutique-vidyaranyapuram-mysore-gift-shops-i74tujlzjq.jpg",
    whatsapp: "919876543213",
  },
];

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

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  const openRazorpay = ({ amount, productName, artisanName, productId }) => {
    setCartItems((prev) => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId];
    });
    alert(
      `Razorpay will be connected soon\n\nProduct: ${productName}\nArtisan: ${artisanName}\nAmount: ₹${amount}`
    );
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
          {filteredProducts.map((product) => (
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
                    onClick={() =>
                      openRazorpay({
                        amount: product.price,
                        productName: product.name,
                        artisanName: product.artisan,
                        productId: product.id,
                      })
                    }
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
