import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Providers from "./pages/Providers";
import Book from "./pages/Book";
import MyBookings from "./pages/MyBookings";
import ProviderDashboard from "./pages/ProviderDashboard";
import AddService from "./pages/AddService";
import Game from "./pages/Game";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Sab logged-in users ke liye */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Sirf customer */}
      <Route
        path="/providers"
        element={
          <ProtectedRoute roles={["customer"]}>
            <Providers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book/:providerId"
        element={
          <ProtectedRoute roles={["customer"]}>
            <Book />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute roles={["customer"]}>
            <MyBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/game"
        element={
          <ProtectedRoute roles={["customer"]}>
            <Game />
          </ProtectedRoute>
        }
      />

      {/* Sirf provider */}
      <Route
        path="/provider"
        element={
          <ProtectedRoute roles={["provider"]}>
            <ProviderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-service"
        element={
          <ProtectedRoute roles={["provider"]}>
            <AddService />
          </ProtectedRoute>
        }
      />

      {/* Sirf admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}