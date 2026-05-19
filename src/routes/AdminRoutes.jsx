import React from "react";
import { Routes, Route } from "react-router-dom";

/* Admin Pages */
import AllUsers from "../pages/admin/users/AllUsers";
import Clients from "../pages/admin/users/Clients";
import Workers from "../pages/admin/users/Workers";

import Jobs from "../pages/admin/Jobs";
import Applications from "../pages/admin/Applications";
import Payments from "../pages/admin/Payments";
import Reviews from "../pages/admin/Reviews";
import Reports from "../pages/admin/Reports";
import AdminOverview from "../pages/admin/AdminOverview";
import NotFound from "../pages/common/NotFound";
import CreateUser from "../pages/admin/users/CreateUser";
import CreateClient from "../pages/admin/users/CreateClient";
import CreateWorker from "../pages/admin/users/CreateWorker";

function AdminRoutes() {
  return (
    <Routes>
      {/* USERS */}
      <Route path="users" element={<AllUsers />} />
      <Route path="create/user" element={<CreateUser />} />
      <Route path="clients" element={<Clients />} />
      <Route path="workers" element={<Workers />} />
      <Route path="create/client" element={<CreateClient />} />
      <Route path="create/worker" element={<CreateWorker />} />

      {/* SYSTEM */}
      <Route path="jobs" element={<Jobs />} />
      <Route path="applications" element={<Applications />} />
      <Route path="payments" element={<Payments />} />
      <Route path="reviews" element={<Reviews />} />
      <Route path="reports" element={<Reports />} />
      <Route path="overview" element={<AdminOverview />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AdminRoutes;
