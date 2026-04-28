import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ArtisanDashboard from "./pages/ArtisanDashboard";
import ArtisanProfile from "./pages/ArtisanProfile";
import Auth from "./pages/Auth";
import CustomerHome from "./pages/CustomerHome";
import RoleSelect from "./pages/RoleSelect";
import SpotDetail from "./pages/SpotDetail";
import TouristHome from "./pages/TouristHome";

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
          path="/artisan-dashboard"
          element={
            <ProtectedRoute>
              <ArtisanDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artisan/:uid"
          element={
            <ProtectedRoute>
              <ArtisanProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
