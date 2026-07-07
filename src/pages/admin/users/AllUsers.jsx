import {
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Users,
  Mail,
  Phone,
  Calendar,
  Shield,
  Briefcase,
  UserCheck,
  UserX,
  RefreshCw,
  CircleCheck,
  MoreHorizontal,
  Printer,
  X,
  ShieldAlert,
  Ban,
  UserLock,
  UserRoundCheck,
  Clock,
} from "lucide-react";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ReactDOM from "react-dom";

import {
  fetchUsers,
  deleteUser,
  updateUser,
} from "../../../services/userServices";
function AllUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const [selectedRows, setSelectedRows] = useState([]);

  const [activeTab, setActiveTab] = useState("info");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [errors, setErrors] = useState({})

  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter
  useEffect(() => {
    let data = [...users];

    if (searchTerm.trim()) {
      data = data.filter(
        (u) =>
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(u.id).includes(searchTerm) ||
          String(u.phone).includes(searchTerm),
      );
    }

    if (roleFilter !== "all") {
      data = data.filter((u) => u.user_type === roleFilter);
    }
    if (statusFilter !== "all") {
      data = data.filter((u) => u.account_status === statusFilter);
    }

    setFilteredUsers(data);
  }, [users, searchTerm, roleFilter, statusFilter]);

  //pagintion
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedRows.length === filteredUsers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredUsers.map((u) => u.id));
    }
  };

  const allSelected =
    selectedRows.length === filteredUsers.length && filteredUsers.length > 0;

  const someSelected =
    selectedRows.length > 0 && selectedRows.length < filteredUsers.length;

  const handleBulkDelete = async () => {
    if (!window.confirm("Delete selected users?")) return;

    try {
      await Promise.all(selectedRows.map((id) => deleteUser(id)));

      setUsers((prev) => prev.filter((u) => !selectedRows.includes(u.id)));

      setSelectedRows([]);

      toast.success("Selected users deleted");
    } catch {
      toast.error("Failed to delete selected users");
    }
  };

  const handleExport = () => {
    const data = users.filter((u) => selectedRows.includes(u.id));

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "users-export.json";
    a.click();
  };

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

  // ================= VIEW USER =================
  const openViewModal = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsViewModalOpen(false);
  };

  const validate = () => {
    let newErrors = {};

    if (!editForm.first_name?.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!editForm.last_name?.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!editForm.email || !/^\S+@\S+\.\S+$/.test(editForm.email)) {
      newErrors.email = "Enter a valid email";
    }

    const phone = editForm.phone?.trim();
    if (!/^\+2519\d{8}$/.test(phone) && !/^\d{10}$/.test(phone)) {
      newErrors.phone = "Use +2519XXXXXXXX or 10 digit local number";
    }

    if (!editForm.user_type) {
      newErrors.user_type = "Select user type";
    }

    return newErrors;
  };

  const parseErrors = (errData) => {
    const newErrors = {};

    if (!errData || typeof errData !== "object") {
      return { general: "Something went wrong" };
    }

    if (errData.detail) {
      newErrors.general = errData.detail;
      return newErrors;
    }

    Object.entries(errData).forEach(([key, value]) => {
      if (key === "non_field_errors") {
        newErrors.general = Array.isArray(value) ? value.join(", ") : value;
        return;
      }

      newErrors[key] = Array.isArray(value) ? value.join(", ") : value;
    });

    return newErrors;
  };


  // ================= ACTIONS =================
  const handleEditUser = (user) => {
    setEditForm({
      id: user.id,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      user_type: user.user_type || "",
      account_status: user.account_status,
    });
    setIsEditModalOpen(true);

  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(id);

      // remove from state
      setUsers((prev) => prev.filter((u) => u.id !== id));

      // close modal
      closeModal();

      // redirect to All Users page
      toast.success("User deleted");
      navigate("/admin/users");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete a user");
    }
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({ ...prev, [name]: value, }));
    setErrors({ ...errors, [e.target.name]: "" });

  };

  const handleUpdateUser = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      await updateUser(editForm.id, editForm);

      setUsers((prev) =>
        prev.map((u) => (u.id === editForm.id ? { ...u, ...editForm } : u)),
      );
      setIsEditModalOpen(false);
      setIsViewModalOpen(false);
      toast.success("User updated");
    } catch (err) {
      const backendErrors = parseErrors(err?.response?.data);
      setErrors(backendErrors);

      toast.error("Failed to update user");
    }
  };
  const stats = useMemo(() => {
    return {
      total: users.length,
      clients: users.filter((u) => u.user_type === "client").length,
      workers: users.filter((u) => u.user_type === "worker").length,
      admins: users.filter((u) => u.user_type === "admin").length,
      activeUsers: users.filter((u) => u.account_status == "active").length,
      pendingUsers: users.filter((u) => u.account_status == "pending").length,
      rejectedUsers: users.filter((u) => u.account_status == "rejected").length,
      suspendedUsers: users.filter((u) => u.account_status == "suspended")
        .length,
    };
  }, [users]);

  const statusLabels = {
    active: "Active",
    pending: "Pending",
    rejected: "Rejected",
    suspended: "Suspended",
  };

  // Lock the background scroll when the modal is open
  useEffect(() => {
    if (isViewModalOpen || isEditModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isViewModalOpen, isEditModalOpen]);

  const baseBtn = "px-3 py-1 rounded-full border cursor-pointer transition";

  const themeBtn =
    "border-gray-300 dark:border-gray-600 " +
    "text-gray-700 dark:text-gray-200 " +
    "hover:bg-gray-100 dark:hover:bg-gray-700";

  const activeBtn =
    "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500";

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
          <RefreshCw className="animate-spin mx-auto mb-3 text-amber-500 dark:text-amber-400" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-red-700 dark:text-red-300">
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* TITLE */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Users Management
          </h1>

          <p className="text-sm mt-0.5 text-gray-500 dark:text-gray-400">
            Manage all registered clients
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 flex-wrap">
          {/* REFRESH */}
          <button
            onClick={loadUsers}
            className="px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors
                 bg-yellow-300 hover:bg-yellow-400
                 dark:bg-yellow-500 dark:hover:bg-yellow-400 dark:text-gray-900"
          >
            <RefreshCw size={14} />
            <span className="hidden xs:inline">Refresh</span>
          </button>

          {/* ADD USER */}
          <button
            onClick={() => navigate("/admin/create/user")}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors
                 bg-blue-600 hover:bg-blue-700 text-white
                 dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-white"
          >
            + Add User
          </button>
        </div>
      </header>
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <StatCard
          title="Total Users"
          value={stats.total}
          icon={<Users />}
          color="gray"
        />
        <StatCard
          title="Clients"
          value={stats.clients}
          icon={<UserCheck />}
          color="blue"
        />
        <StatCard
          title="Workers"
          value={stats.workers}
          icon={<Briefcase />}
          color="green"
        />
        <StatCard
          title="Admins"
          value={stats.admins}
          icon={<Shield />}
          color="purple"
        />

        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<UserCheck />}
          color="green"
        />
        <StatCard
          title="Under Review"
          value={stats.pendingUsers}
          icon={<Clock />}
          color="amber"
        />
        <StatCard
          title="Rejected Users"
          value={stats.rejectedUsers}
          icon={<Ban />}
          color="red"
        />
        <StatCard
          title="Suspended Users"
          value={stats.suspendedUsers}
          icon={<UserLock />}
          color="gray"
        />
      </div>
      {/* SEARCH + FILTER */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 mb-4 flex flex-col sm:flex-row gap-4 sm:items-end transition-colors">
        {/* SEARCH */}
        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={16}
          />

          <input
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm
                 border border-gray-200 dark:border-gray-600
                 bg-white dark:bg-gray-900
                 text-gray-900 dark:text-white
                 placeholder-gray-400 dark:placeholder-gray-500
                 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FILTERS */}
        <div className="flex gap-3 flex-wrap">
          <RoleFilter roleFilter={roleFilter} setRoleFilter={setRoleFilter} />

          <StatusFilter
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </div>

        {/* EXPORT */}
        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors
               border border-gray-200 dark:border-gray-600
               bg-white dark:bg-gray-900
               text-gray-800 dark:text-gray-200
               hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Download size={18} />
          Export
        </button>
      </div>
      {/* ACTION BAR */}
      {selectedRows.length > 0 && (
        <div
          className="flex justify-between items-center
                  bg-white dark:bg-gray-800
                  p-3 rounded-xl mb-4 shadow
                  border border-gray-200 dark:border-gray-700
                  transition-colors"
        >
          {/* LEFT */}
          <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
            {selectedRows.length} selected
          </span>

          {/* ACTIONS */}
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-2 rounded-lg flex items-center gap-2 text-sm
                   bg-gray-200 dark:bg-gray-700
                   text-gray-800 dark:text-gray-200
                   hover:bg-gray-300 dark:hover:bg-gray-600
                   transition-colors"
            >
              <Download size={14} />
              Export
            </button>

            <button
              onClick={handleBulkDelete}
              className="px-3 py-2 rounded-lg text-sm font-medium
                   bg-red-500 hover:bg-red-600
                   dark:bg-red-600 dark:hover:bg-red-500
                   text-white transition-colors"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}
      {/* TABLE */}
      <section className="rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225">
            {/* HEADER */}
            <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    className="w-4 h-4 cursor-pointer"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                  />
                </th>

                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Linked Profile</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paginatedUsers.filter(Boolean).map((user, index) => (
                <tr
                  key={user?.id}
                  onClick={() => openViewModal(user)}
                  className={`
              cursor-pointer transition
              hover:bg-gray-100 dark:hover:bg-gray-700
              ${index % 2 === 0
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-900/40"
                    }
            `}
                >
                  {/* checkbox */}
                  <td
                    className="px-4 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(user.id)}
                      onChange={() => toggleRow(user.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>

                  {/* ID */}
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {user?.id || "—"}
                  </td>

                  {/* EMAIL */}
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 break-all">
                    {user?.email || "—"}
                  </td>

                  {/* PHONE */}
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {user?.phone || "—"}
                  </td>

                  {/* ROLE */}
                  <td className="px-4 py-3 capitalize text-gray-700 dark:text-gray-300">
                    {user.user_type}
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium
                bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                    >
                      {statusLabels[user.account_status] || "Unknown"}
                    </span>
                  </td>

                  {/* LINKED PROFILE */}
                  <td className="px-3 py-3 text-gray-600 dark:text-gray-300">
                    {user.user_type === "admin"
                      ? "System Admin"
                      : user?.client
                        ? `Client #${user.client.id}`
                        : user?.worker
                          ? `Worker #${user.worker.id}`
                          : "Not linked"}
                  </td>

                  {/* ACTIONS */}
                  <td
                    className="px-4 py-3 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionMenu
                      user={user}
                      onView={openViewModal}
                      onEdit={(user) => handleEditUser(user)}
                      onDelete={handleDeleteUser}
                      onPrint={handlePrint}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Row count footer */}
        {users.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 text-xs text-gray-600 dark:text-gray-300">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </section>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
        {/* Rows per page */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-200">
          <span>Rows:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 
                 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Pagination (CENTER) */}
        <div className="flex justify-center flex-1">
          <div className="flex items-center gap-1">
            {/* FIRST */}
            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage(1)}
                className={`${baseBtn} ${themeBtn}`}
              >
                « First
              </button>
            )}

            {/* PREV */}
            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                className={`${baseBtn} ${themeBtn}`}
              >
                ‹ Prev
              </button>
            )}

            {/* PAGE NUMBERS */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(0, currentPage - 3),
                Math.min(totalPages, currentPage + 2),
              )
              .map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`${baseBtn} ${currentPage === page ? activeBtn : themeBtn
                    }`}
                >
                  {page}
                </button>
              ))}

            {/* NEXT */}
            {currentPage < totalPages && (
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                className={`${baseBtn} ${themeBtn}`}
              >
                Next ›
              </button>
            )}

            {/* LAST */}
            {currentPage < totalPages && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`${baseBtn} ${themeBtn}`}
              >
                Last »
              </button>
            )}
          </div>
        </div>
      </div>
      {/* VIEW MODAL */}
      {isViewModalOpen && selectedUser && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={closeModal}
        >
          {/* MODAL */}
          <div
            className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl bg-white dark:bg-gray-800 
            rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700
            max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 
              border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                User Details
              </h2>

              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* BODY */}
            <div className="p-5 space-y-5">
              {/* TABS */}
              <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                {["info", "system", "profile"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-sm rounded-lg capitalize transition ${activeTab === tab
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* ================= INFO TAB ================= */}
              {activeTab === "info" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="break-all text-gray-900 dark:text-white">
                      {selectedUser.email}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-500">User Type</p>
                    <p className="capitalize text-gray-900 dark:text-white">
                      {selectedUser.user_type}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedUser.phone || "No phone"}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-500">Status</p>
                    <p
                      className={
                        selectedUser.is_active
                          ? "text-green-500 font-semibold"
                          : "text-red-500 font-semibold"
                      }
                    >
                      {selectedUser.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              )}

              {/* ================= SYSTEM TAB ================= */}
              {activeTab === "system" && (
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="text-gray-900 dark:text-white">
                      #{selectedUser.id}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-500">Superuser</p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedUser.is_superuser ? "Yes" : "No"}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-500">Staff</p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedUser.is_staff ? "Yes" : "No"}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-500">Registered</p>
                    <p className="text-xs text-gray-900 dark:text-white">
                      {selectedUser.registered_date
                        ? new Date(
                          selectedUser.registered_date,
                        ).toLocaleString()
                        : "-"}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-500">Last Update</p>
                    <p className="text-xs text-gray-900 dark:text-white">
                      {selectedUser.last_update
                        ? new Date(selectedUser.last_update).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </div>
              )}

              {/* ================= PROFILE TAB (LAST) ================= */}
              {activeTab === "profile" && (
                <div className="space-y-4">
                  {/* CLIENT */}
                  {selectedUser?.client && (
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900">
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-blue-600">
                          CLIENT
                        </span>
                        <span className="text-xs text-blue-600">
                          ID #{selectedUser.client.id}
                        </span>
                      </div>

                      <p className="mt-2 font-semibold text-blue-900 dark:text-blue-200">
                        Company: {selectedUser.client.company_name || "N/A"}
                      </p>
                    </div>
                  )}

                  {/* WORKER */}
                  {selectedUser?.worker && (
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900">
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-green-600">
                          WORKER
                        </span>
                        <span className="text-xs text-green-600">
                          ID #{selectedUser.worker.id}
                        </span>
                      </div>

                      <p className="mt-2 font-semibold text-green-900 dark:text-green-200">
                        {selectedUser.worker.first_name}{" "}
                        {selectedUser.worker.last_name}
                      </p>
                    </div>
                  )}

                  {/* ADMIN */}
                  {selectedUser.user_type === "admin" && (
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900">
                      <span className="text-xs font-bold text-purple-600">
                        ADMIN
                      </span>
                      <p className="mt-2 text-purple-900 dark:text-purple-200 font-semibold">
                        System Administrator
                      </p>
                    </div>
                  )}

                  {/* EMPTY */}
                  {!selectedUser.client &&
                    !selectedUser.worker &&
                    selectedUser.user_type !== "admin" && (
                      <div className="p-4 text-center rounded-xl bg-gray-50 dark:bg-gray-900">
                        <p className="text-gray-500">No linked profile</p>
                      </div>
                    )}
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row gap-2 pt-3">
                <button
                  onClick={() => {
                    handleEditUser(selectedUser);
                    closeModal();
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium"
                >
                  Edit
                </button>

                <button
                  onClick={() => handlePrint(selectedUser)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white font-medium"
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isEditModalOpen && editForm && (
        <div
          className="fixed inset-0 bg-black/30  backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
          onClick={() => setIsEditModalOpen(false)}
        >
          {/* MODAL CARD */}
          <div
            className="w-full max-w-md rounded-2xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Edit User
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update user details below
              </p>
            </div>

            {/* FORM BODY */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* FIRST NAME */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  name="first_name"
                  value={editForm.first_name}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none"
                  placeholder="First Name"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                )}
              </div>

              {/* LAST NAME */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  name="last_name"
                  value={editForm.last_name}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none"
                  placeholder="Last Name"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none"
                  placeholder="Email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* PHONE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  name="phone"
                  value={editForm.phone || ""}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none"
                  placeholder="Phone"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* USER TYPE + STATUS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    User Type
                  </label>
                  <select
                    name="user_type"
                    value={editForm.user_type}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="client">Client</option>
                    <option value="worker">Worker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    name="account_status"
                    value={editForm.account_status}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        account_status: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              {errors.user_type && (
                <p className="text-red-500 text-sm mt-1">{errors.user_type}</p>
              )}
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-80 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition font-medium cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function StatCard({ title, value, icon, color = "amber" }) {
  const colorMap = {
    amber:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    green:
      "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
    red: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    purple:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-5 flex items-center justify-between transition-colors">
      {/* TEXT */}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </h2>
      </div>

      {/* ICON */}
      <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.amber}`}>
        {icon}
      </div>
    </div>
  );
}

export default AllUsers;

/* ─── Action-menu (portal-style fixed positioning) ─────────── */
function ActionMenu({ user, onView, onEdit, onDelete, onPrint }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const openMenu = (e) => {
    e.stopPropagation();

    if (open) {
      setOpen(false);
      return;
    }

    const rect = btnRef.current.getBoundingClientRect();

    const menuWidth = 176;
    const menuHeight = 173;

    const spaceBelow = window.innerHeight - rect.bottom;

    const top =
      spaceBelow >= menuHeight
        ? rect.bottom + 4
        : Math.max(8, rect.top - menuHeight - 4);

    const left = Math.min(
      rect.right - menuWidth,
      window.innerWidth - menuWidth - 8,
    );

    setPos({
      top,
      left: Math.max(8, left),
    });

    setOpen(true);
  };
  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        !menuRef.current?.contains(e.target) &&
        !btnRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on scroll
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [open]);

  const dropdown = open
    ? ReactDOM.createPortal(
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          top: pos.top,
          left: pos.left,
          zIndex: 9999,
        }}
        className="w-44 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden text-gray-700 dark:text-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            onView(user);
            setOpen(false);
          }}
          className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
        >
          <Eye size={13} />
          View
        </button>
        <button
          onClick={() => {
            onEdit(user);
            setOpen(false);
          }}
          className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 dark:hover:bg-green-900/40 hover:text-green-700 dark:hover:text-green-400 transition-colors flex items-center gap-2"
        >
          <Edit size={13} />
          Edit
        </button>
        <button
          onClick={() => {
            onPrint(user);
            setOpen(false);
          }}
          className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 dark:hover:bg-purple-900/40 hover:text-purple-700 dark:hover:text-purple-400 transition-colors flex items-center gap-2"
        >
          <Printer size={13} />
          Print
        </button>
        <hr className="border-gray-100 dark:border-gray-700" />
        <button
          onClick={() => {
            onDelete(user.id);
            setOpen(false);
          }}
          className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors flex items-center gap-2"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>,
      document.body,
    )
    : null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={openMenu}
        className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        aria-label="Actions"
      >
        <MoreHorizontal size={18} />
      </button>
      {dropdown}
    </>
  );
}

const handlePrint = (user) => {
  const name = user.first_name || "—";
  const win = window.open("", "_blank", "width=700,height=600");
  win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>User — ${name}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', sans-serif; color: #1a1a2e; padding: 40px; }
          .header { border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          .header h1 { font-size: 22px; font-weight: 700; }
          .header p  { font-size: 12px; color: #6b7280; margin-top: 4px; }
          .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600;
            background: #f3f4f6; color: #374151; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          tr { border-bottom: 1px solid #e5e7eb; }
          td { padding: 10px 8px; font-size: 14px; }
          td:first-child { width: 160px; font-weight: 600; color: #6b7280; }
          .footer { margin-top: 32px; font-size: 11px; color: #9ca3af; text-align: center; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>User Profile</h1>
            <p>Generated ${new Date().toLocaleString()}</p>
          </div>
          <span class="badge">${user.account_status || "—"}</span>
        </div>
        <table>
          <tr><td>ID</td><td>#${user.id}</td></tr>
          <tr><td>Company Name</td><td>${name}</td></tr>
          <tr><td>Email</td><td>${user.email || "—"}</td></tr>
          <tr><td>Phone</td><td>${user.phone || "—"}</td></tr>
          <tr><td>User Type</td><td>${user.user_type || "—"}</td></tr>
          <tr><td>Status</td><td>${user.account_status || "—"}</td></tr>
        </table>
        <div class="footer">Users Management System</div>
        <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
      </body>
      </html>
    `);
  win.document.close();
};

/* Role Filter*/
export function RoleFilter({ roleFilter, setRoleFilter }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const options = [
    { label: "All Roles", value: "all" },
    { label: "Admin", value: "admin" },
    { label: "Client", value: "client" },
    { label: "Worker", value: "worker" },
  ];

  const selected = options.find((o) => o.value === roleFilter);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full sm:w-44">
      {/* LABEL */}
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
        Filter By Role
      </label>

      {/* BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm
                   border border-gray-200 dark:border-gray-600
                   bg-white dark:bg-gray-900
                   text-gray-800 dark:text-gray-200
                   rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   dark:focus:ring-blue-400
                   transition-colors"
      >
        <span className="flex items-center gap-2">
          {selected?.label}

          {roleFilter !== "all" && (
            <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full" />
          )}
        </span>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          className="absolute z-50 mt-1 w-full
                        bg-white dark:bg-gray-800
                        border border-gray-200 dark:border-gray-700
                        rounded-lg shadow-lg overflow-hidden
                        transition-colors"
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                setRoleFilter(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors
                hover:bg-gray-100 dark:hover:bg-gray-700
                text-gray-800 dark:text-gray-200
                ${roleFilter === opt.value
                  ? "bg-gray-50 dark:bg-gray-700 font-medium"
                  : ""
                }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StatusFilter({ statusFilter, setStatusFilter }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const options = [
    { label: "All Statuses", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Active", value: "active" },
    { label: "Rejected", value: "rejected" },
    { label: "Suspended", value: "suspended" },
  ];

  const selected = options.find((o) => o.value === statusFilter);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full sm:w-48">
      {/* LABEL */}
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
        Filter By Status
      </label>

      {/* BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm
                   border border-gray-200 dark:border-gray-600
                   bg-white dark:bg-gray-900
                   text-gray-800 dark:text-gray-200
                   rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   dark:focus:ring-blue-400
                   transition-colors"
      >
        <span className="flex items-center gap-2">
          {selected?.label}

          {statusFilter !== "all" && (
            <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full" />
          )}
        </span>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          className="absolute z-50 mt-1 w-full
                        bg-white dark:bg-gray-800
                        border border-gray-200 dark:border-gray-700
                        rounded-lg shadow-lg overflow-hidden
                        transition-colors"
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                setStatusFilter(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors
                text-gray-800 dark:text-gray-200
                hover:bg-gray-100 dark:hover:bg-gray-700
                ${statusFilter === opt.value
                  ? "bg-gray-50 dark:bg-gray-700 font-medium"
                  : ""
                }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
