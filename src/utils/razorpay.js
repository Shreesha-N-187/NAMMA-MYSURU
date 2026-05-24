import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const RAZORPAY_SCRIPT_ID = "razorpay-checkout-js";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById(RAZORPAY_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpay({
  amount,
  items,
  userId,
  userEmail,
  userName,
  onSuccess,
}) {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded || !window.Razorpay) {
    alert("Payment script failed to load. Please try again.");
    return;
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: Math.round(Number(amount) * 100), // Razorpay handles amounts in paise (paise = INR * 100)
    currency: "INR",
    name: "Namma Mysuru",
    description: `Payment for ${items.length} item(s)`,
    prefill: {
      name: userName || "",
      email: userEmail || "",
    },
    theme: {
      color: "#F97316",
    },
    handler: async function (response) {
      try {
        // Safe database write execution directly into the Firestore orders collection
        await addDoc(collection(db, "orders"), {
          userId: userId,
          userEmail: userEmail,
          userName: userName,
          items: items,
          total: Number(amount),
          status: "Paid",
          paymentId: response.razorpay_payment_id,
          createdAt: serverTimestamp(),
        });

        alert("Payment Successful! 🎉 Your order has been registered.");
        
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("Firestore order registration error:", error);
        alert("Payment succeeded, but your order tracking failed to save. Please check your Firestore rules.");
      }
    },
    modal: {
      ondismiss: () => {
        alert("Payment cancelled or failed. Please try again.");
      },
    },
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.on("payment.failed", () => {
    alert("Payment cancelled or failed. Please try again.");
  });
  paymentObject.open();
}