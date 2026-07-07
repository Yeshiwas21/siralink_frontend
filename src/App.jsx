import React from "react";

import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

/* Layout */
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";

/* Routes */
import RoleRoute from "./routes/RoleRoute";
import AdminRoutes from "./routes/AdminRoutes";
import ClientRoutes from "./routes/ClientRoutes";
import WorkerRoutes from "./routes/WorkerRoutes";
import AppRoutes from "./routes/AppRoutes";
import UserRoutes from "./routes/UserRoutes";

/* Pages */
import HomePage from "./pages/home/HomePage";
import Login from "./pages/auth/Login";
import Logout from "./pages/auth/Logout";
import SelectUserType from "./pages/auth/SelectUserType";
import WorkerSignup from "./pages/auth/WorkerSignup";
import ClientSignup from "./pages/auth/ClientSignup";
import NotFound from "./pages/common/NotFound";

import ForgotPassword from "./pages/account/ForgotPassword";
import HowItWorks from "./pages/common/HowItWorks";
import ScrollToTop from "./utils/ScrollToTop";

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black dark:border-gray-700 dark:border-t-white rounded-full animate-spin"></div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  const isAuthPage =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/signup");

  const showSidebar =
    user?.isAuthenticated &&
    (location.pathname.startsWith("/admin") ||
      location.pathname.startsWith("/client") ||
      location.pathname.startsWith("/worker") ||
      location.pathname.startsWith("/account") ||
      location.pathname.startsWith("/") ||
      location.pathname.startsWith("/ca"));

  const isAuthenticatedRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/client") ||
    location.pathname.startsWith("/worker") ||
    location.pathname.startsWith("/account") ||
    location.pathname.startsWith("/ca") ||
    location.pathname.startsWith("/jobs");
  const hideFooter = user?.isAuthenticated && isAuthenticatedRoute;

  return (
    <div className="flex flex-col min-h-screen">
      {/* NAVBAR */}
      <Navbar />

      <div className="flex flex-1">
        {/* SIDEBAR */}
        {showSidebar && <Sidebar />}

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-gray-100 dark:bg-gray-900 p-4 overflow-x-hidden">
          <Toaster position="top-right" />

          {/* To make the links to scroll to the top when clikced */}
          <ScrollToTop />

          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/signup" element={<SelectUserType />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/signup/client" element={<ClientSignup />} />
            <Route path="/signup/worker" element={<WorkerSignup />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            {/* ADMIN */}
            <Route
              path="/admin/*"
              element={
                <RoleRoute allowedRoles={["admin"]}>
                  <AdminRoutes />
                </RoleRoute>
              }
            />
            {/* CLIENT */}
            <Route
              path="/client/*"
              element={
                <RoleRoute allowedRoles={["client"]}>
                  <ClientRoutes />
                </RoleRoute>
              }
            />
            {/* WORKER */}
            <Route
              path="/worker/*"
              element={
                <RoleRoute allowedRoles={["worker"]}>
                  <WorkerRoutes />
                </RoleRoute>
              }
            />
            <Route
              path="/ca/*"
              element={
                <RoleRoute allowedRoles={["admin", "client", "worker"]}>
                  <AppRoutes />
                </RoleRoute>
              }
            />

            <Route
              path="/account/*"
              element={
                <RoleRoute allowedRoles={["admin", "client", "worker"]}>
                  <UserRoutes />
                </RoleRoute>
              }
            />
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      {/* FOOTER (only for public pages) */}
      {!hideFooter && !isAuthPage && <Footer />}
    </div>
  );
}
