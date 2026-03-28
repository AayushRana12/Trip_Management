import { Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoutes";

// Pages
import Home from "../pages/Home";
import Packages from "../pages/Packages";
import Login from "../pages/Login";
import Signup from "../pages/SignUp";
import Destination from "../pages/Destination";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import Booking from "../pages/Booking"; 
import PackageDetails from "../pages/PackageDetails";

// Admin Pages
import AdminDashboard from "../admin/AdminDashboard";
import ManagePackages from "../admin/ManagePackages";
import ManageUsers from "../admin/ManageUsers";
import Bookings from "../admin/Bookings";

export default function AppRoutes() {
  return (
    <Routes>
      {/* 🌐 Public Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="packages" element={<Packages />} />
        <Route path="package/:id" element={<PackageDetails />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="destinations" element={<Destination />} />
        <Route path="booking" element={<Booking />} />

        {/* 👤 User Dashboard */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute role="user">
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 🔐 ADMIN ROUTES */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/packages"
        element={
          <ProtectedRoute role="admin">
            <ManagePackages />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute role="admin">
            <ManageUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute role="admin">
            <Bookings />
          </ProtectedRoute>
        }
      />

      {/* ❌ 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}