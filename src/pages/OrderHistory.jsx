import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import BackButton from "../components/BackButton";

function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/auth");
      } else {
        fetchUserOrders(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchUserOrders = async (userId) => {
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const fetchedOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(fetchedOrders);
    } catch (err) {
      console.error("Error fetching order records:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-8">

      {/* Back Button Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center">
        <BackButton to="/customer-home" label="Back to shop" />
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
          Your Order History
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          Track and view your authentic Mysuru craft purchases.
        </p>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200 shadow-sm">
            <span className="text-4xl block mb-3">📦</span>
            <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate("/customer-home")}
              className="mt-4 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-md transition active:scale-95"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <section
                key={order.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</p>
                    <p className="text-xs font-mono text-gray-700">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Placed</p>
                    <p className="text-sm font-medium text-gray-700">
                      {order.createdAt?.seconds
                        ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Recent"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</p>
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded-md mt-0.5">
                      {order.status || "Paid"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Total Amount</p>
                    <p className="text-base font-extrabold text-blue-600">₹{order.total}</p>
                  </div>
                </div>

                <div className="divide-y divide-gray-100 px-6">
                  {order.items?.map((item, index) => (
                    <div key={item.id || index} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-md border border-gray-200 flex-shrink-0"
                          />
                        )}
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base">{item.name}</h4>
                          <p className="text-xs text-gray-500">by {item.artisan || "Local Artisan"}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Qty: <span className="font-semibold text-gray-700">{item.quantity}</span>
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-800 text-sm">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default OrderHistory;
