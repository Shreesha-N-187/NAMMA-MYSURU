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
  productName,
  artisanName,
  userName,
  userEmail,
}) {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded || !window.Razorpay) {
    alert("Payment cancelled or failed. Please try again.");
    return;
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: Math.round(Number(amount) * 100),
    currency: "INR",
    name: "Namma Mysuru",
    description: `${productName} by ${artisanName}`,
    prefill: {
      name: userName || "",
      email: userEmail || "",
    },
    theme: {
      color: "#F97316",
    },
    handler: () => {
      alert(`Payment Successful! 🎉 Order placed for ${productName}`);
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
