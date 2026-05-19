import React, { useEffect, useState, useMemo } from "react";
import { fetchUsers } from "../../services/userServices";
import {
  Users,
  UserCheck,
  Briefcase,
  Shield,
  ClipboardList,
  FileText,
  CreditCard,
  Star,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

function AdminOverview() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const userStats = useMemo(() => {
    return {
      total: users.length,
      clients: users.filter((u) => u.user_type === "client").length,
      workers: users.filter((u) => u.user_type === "worker").length,
      admins: users.filter((u) => u.user_type === "admin").length,
    };
  }, [users]);

  const stats = [
    {
      title: "All Users",
      value: userStats.total,
      icon: <Users />,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Clients",
      value: userStats.clients,
      icon: <UserCheck />,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Workers",
      value: userStats.workers,
      icon: <Briefcase />,
      color: "bg-amber-100 text-amber-700",
    },
    {
      title: "Admins",
      value: userStats.admins,
      icon: <Shield />,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Jobs",
      value: 32,
      icon: <ClipboardList />,
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      title: "Applications",
      value: 88,
      icon: <FileText />,
      color: "bg-pink-100 text-pink-700",
    },
    {
      title: "Payments",
      value: 14,
      icon: <CreditCard />,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Reviews",
      value: 27,
      icon: <Star />,
      color: "bg-yellow-100 text-yellow-700",
    },
  ];

  const quickLinks = [
    "Manage Users",
    "Approve Workers",
    "Post Jobs",
    "View Applications",
    "Process Payments",
    "Moderate Reviews",
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow border p-8 text-center">
          <RefreshCw className="animate-spin mx-auto mb-3 text-amber-500" />
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600">
          {error}
        </div>
      </div>
    );
  }
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* LEFT SIDE */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Overview</h1>
          <p className="text-gray-500 mt-1">
            Overview of platform activity and management tools
          </p>
        </div>

        {/* RIGHT SIDE */}
        <button
          onClick={loadUsers}
          className="bg-amber-300 text-black font-semibold px-4 py-2 rounded-lg hover:bg-amber-400 transition flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow border p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-500">{item.title}</p>
              <h2 className="text-2xl font-bold text-gray-800">{item.value}</h2>
            </div>

            <div className={`p-3 rounded-xl ${item.color}`}>{item.icon}</div>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: QUICK LINKS */}
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} />
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((item, i) => (
              <button
                key={i}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: ACTIVITY PANEL (placeholder) */}
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

          <ul className="space-y-3 text-sm text-gray-600">
            <li>• New user registered: client@example.com</li>
            <li>• Worker approved: John Doe</li>
            <li>• Job posted: Frontend Developer</li>
            <li>• Payment completed: Invoice #1023</li>
            <li>• Review submitted: 5 stars</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
