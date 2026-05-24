import OrderHistory from "./pages/OrderHistory";
import ProductDetail from "./pages/ProductDetail";
import ChatBot from "./components/ChatBot";
import ItineraryBuilder from "./pages/ItineraryBuilder";
import AdminPanel from "./pages/AdminPanel";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ArtisanDashboard from "./pages/ArtisanDashboard";
import ArtisanProfile from "./pages/ArtisanProfile";
import Auth from "./pages/Auth";
import CustomerHome from "./pages/CustomerHome";
import CartPage from "./pages/CartPage"; 
import RoleSelect from "./pages/RoleSelect";
import SpotDetail from "./pages/SpotDetail";
import TouristHome from "./pages/TouristHome";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        <Route path="/itinerary" element={<ProtectedRoute><ItineraryBuilder /></ProtectedRoute>} />
        <Route path="/" element={<RoleSelect />} />
        <Route path="/auth" element={<Auth />} />

        <Route
          path="/tourist-home"
          element={
            <ProtectedRoute>
              <TouristHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/spot/:id"
          element={
            <ProtectedRoute>
              <SpotDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-home"
          element={
            <ProtectedRoute>
              <CustomerHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artisan-dashboard"
          element={
            <ProtectedRoute>
              <ArtisanDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/artisan/:uid" element={<ArtisanProfile />} />
      </Routes>
      <ChatBot />
    </BrowserRouter>
  );
}

export default App;