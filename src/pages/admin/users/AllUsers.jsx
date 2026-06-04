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

  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

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

  // ================= VIEW USER =================
  const openViewModal = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsViewModalOpen(false);
  };

  // ================= ACTIONS =================
  const handleEditUser = (user) => {
    setEditForm({
      id: user.id,
      email: user.email || "",
      phone: user.phone || "",
      user_type: user.user_type || "",
      is_active: user.is_active,
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

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateUser = async () => {
    try {
      await updateUser(editForm.id, editForm);

      setUsers((prev) =>
        prev.map((u) => (u.id === editForm.id ? { ...u, ...editForm } : u)),
      );

      setIsEditModalOpen(false);
      setIsViewModalOpen(false);
      toast.success("User updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    }
  };
  const stats = useMemo(() => {
    return {
      total: users.length,
      clients: users.filter((u) => u.user_type === "client").length,
      workers: users.filter((u) => u.user_type === "worker").length,
      admins: users.filter((u) => u.user_type === "admin").length,
      activeUsers: users.filter((u) => u.is_active == true).length,
      inactiveUsers: users.filter((u) => u.is_active == false).length,
    };
  }, [users]);

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
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Users Management
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage all registered clients
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={fetchUsers}
            className="px-3 py-2 bg-yellow-300 hover:bg-yellow-400 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <RefreshCw size={14} />
            <span className="hidden xs:inline">Refresh</span>
          </button>

          <button
            onClick={() => navigate("/admin/create/user")}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Add User
          </button>
        </div>
      </header>
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <StatCard title="Total Users" value={stats.total} icon={<Users />} />
        <StatCard title="Clients" value={stats.clients} icon={<UserCheck />} />
        <StatCard title="Workers" value={stats.workers} icon={<Briefcase />} />
        <StatCard title="Admins" value={stats.admins} icon={<Shield />} />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<UserCheck />}
        />
        <StatCard
          title="Inctive Users"
          value={stats.inactiveUsers}
          icon={<UserX />}
        />
      </div>
      {/* SEARCH + FILTER */}
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow border border-gray-200 mb-4 flex flex-col sm:flex-row gap-4 sm:items-end">
        {/* SEARCH */}
        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border border-gray-200 
                       focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FILTER */}
        <div className="flex gap-3 flex-wrap">
          <RoleFilter roleFilter={roleFilter} setRoleFilter={setRoleFilter} />

          <StatusFilter
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <Download size={18} />
          Export
        </button>
      </div>

      {/* ACTION BAR */}
      {selectedRows.length > 0 && (
        <div className="flex justify-between items-center bg-white p-3 rounded-xl mb-4 shadow">
          <span className="font-medium text-sm">
            {selectedRows.length} selected
          </span>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-gray-200 rounded-lg flex items-center gap-2"
            >
              <Download size={14} />
              Export
            </button>

            <button
              onClick={handleBulkDelete}
              className="px-3 py-2 bg-red-500 text-white rounded-lg"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}
      {/* TABLE */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225">
            {/* HEADER */}
            <thead>
              <tr className="bg-linear-to-r text-xs uppercase tracking-wider">
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-6 py-4 text-left">ID</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Phone</th>
                <th className="px-6 py-4 text-left">Role</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Linked Profile</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.filter(Boolean).map((user, index) => (
                <tr
                  key={user?.id}
                  onClick={() => openViewModal(user)}
                  className={`cursor-pointer transition
              hover:bg-blue-50
              ${index % 2 === 0 ? "bg-white" : "bg-gray-50/40"}
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
                      className="w-4 h-4"
                    />
                  </td>

                  {/* ID */}
                  <td className="px-6 py-4 text-gray-700">{user?.id || "—"}</td>

                  {/* EMAIL */}
                  <td className="px-6 py-4 text-gray-700">
                    {user?.email || "—"}
                  </td>

                  {/* PHONE */}
                  <td className="px-6 py-4 text-gray-700">
                    {user?.phone || "—"}
                  </td>

                  {/* ROLE */}
                  <td className="px-6 py-4 capitalize text-gray-700">
                    {user.user_type}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.account_status === "verified"
                          ? "bg-green-100 text-green-700"
                          : user.account_status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : user.account_status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.account_status || "N/A"}
                    </span>
                  </td>

                  {/* LINKED PROFILE */}
                  <td className="px-6 py-4 text-gray-600">
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
                    className="px-6 py-4 text-center"
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
      </section>
      {/* VIEW MODAL */}
      {isViewModalOpen && selectedUser && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-[95%] sm:max-w-md bg-white rounded-xl shadow-xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto mt-16 md:mt-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4">
              <h2 className="font-bold text-lg">User Details</h2>
            </div>

            <div className="p-6 space-y-4">
              {/* BASIC USER INFO */}
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  {selectedUser.email}
                </div>

                <div className="flex items-center gap-2">
                  <Users size={16} />
                  User Type: {selectedUser.user_type}
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  ID: {selectedUser.id}
                </div>

                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  {selectedUser.phone || "No phone"}
                </div>
                <div className="flex items-center gap-2">
                  <CircleCheck size={16} />
                  Status: {selectedUser.is_active ? "Active" : "Inactive"}
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={16} />
                  Is Super User: {selectedUser.is_superuser ? "Yes" : "No"}
                </div>

                <div className="flex items-center gap-2">
                  <Briefcase size={16} />
                  Is Staff: {selectedUser.is_staff ? "Yes" : "No"}
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  Registered:{" "}
                  {selectedUser.registered_date
                    ? new Date(selectedUser.registered_date).toLocaleString()
                    : "-"}
                </div>

                <div className="flex items-center gap-2">
                  <RefreshCw size={16} />
                  Last Update:{" "}
                  {selectedUser?.last_update
                    ? new Date(selectedUser.last_update).toLocaleString()
                    : "-"}
                </div>
              </div>

              {/* LINKED PROFILE */}
              <div className="border-t pt-5 space-y-3 text-sm">
                <p className="text-gray-500 font-semibold tracking-wide uppercase text-xs">
                  Linked Profile
                </p>

                {selectedUser?.client ? (
                  <div className="bg-linear-to-r from-blue-50 to-white border border-blue-100 p-4 rounded-xl shadow-sm hover:shadow transition">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        CLIENT
                      </span>

                      <a
                        href="#"
                        className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
                      >
                        ID #{selectedUser?.client?.id}
                      </a>
                    </div>
                    {selectedUser?.client?.company_name ? (
                      <p className="text-blue-800 font-semibold text-base">
                        Company Name: {selectedUser.client.company_name}
                      </p>
                    ) : (
                      <p className="text-red-800 font-semibold text-base">
                        No Company Name
                      </p>
                    )}
                  </div>
                ) : selectedUser?.worker ? (
                  <div className="bg-linear-to-r from-green-50 to-white border border-green-100 p-4 rounded-xl shadow-sm hover:shadow transition">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        WORKER
                      </span>

                      <a
                        href="#"
                        className="text-xs text-green-500 hover:text-green-700 hover:underline"
                      >
                        ID #{selectedUser?.worker?.id}
                      </a>
                    </div>
                    {selectedUser?.worker?.first_name ? (
                      <p className="text-green-800 font-semibold text-base">
                        Full Name: {selectedUser?.worker?.first_name}{" "}
                        {selectedUser?.worker?.last_name}
                      </p>
                    ) : (
                      <p className="text-green-800 font-semibold text-base">
                        No Name
                      </p>
                    )}
                  </div>
                ) : selectedUser.user_type === "admin" ? (
                  <div className="bg-linear-to-r from-purple-50 to-white border border-purple-100 p-4 rounded-xl shadow-sm">
                    <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                      ADMIN
                    </span>

                    <p className="text-purple-700 font-semibold mt-2">
                      System Administrator Account
                    </p>

                    <p className="text-gray-500 text-xs mt-1">
                      Full system access privileges
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-center">
                    <p className="text-gray-500 font-medium">
                      No linked profile
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      This account is not connected to any client or worker
                      profile
                    </p>
                  </div>
                )}
              </div>
              {/* ACTIONS */}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    handleEditUser(selectedUser);
                    closeModal();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Edit size={13} />
                  Edit
                </button>
                <button
                  onClick={() => handlePrint(selectedUser)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Printer size={13} />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isEditModalOpen && editForm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Edit User</h2>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                className="w-full border p-2 rounded"
                placeholder="Email"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                name="phone"
                value={editForm.phone || ""}
                onChange={handleEditChange}
                className="w-full border p-2 rounded"
                placeholder="Phone"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Type
              </label>
              <select
                name="user_type"
                value={editForm.user_type}
                onChange={handleEditChange}
                className="w-full border p-2 rounded"
              >
                <option value="admin">Admin</option>
                <option value="client">Client</option>
                <option value="worker">Worker</option>
              </select>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="is_active"
                value={editForm.is_active}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    is_active: e.target.value === "true",
                  }))
                }
                className="w-full border p-2 rounded"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function StatCard({ title, value, icon, color = "amber" }) {
  return (
    <div className="w-full bg-white rounded-xl shadow p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-2xl font-bold text-gray-800">{value}</h2>
      </div>

      <div className={`p-3 rounded-xl bg-${color}-100 text-${color}-700`}>
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
          className="w-44 bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden"
        >
          <button
            onClick={() => {
              onView(user);
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-center gap-2"
          >
            <Eye size={13} />
            View
          </button>

          <button
            onClick={() => {
              onEdit(user);
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 flex items-center gap-2"
          >
            <Edit size={13} />
            Edit
          </button>

          <button
            onClick={() => {
              onPrint(user);
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 flex items-center gap-2"
          >
            <Printer size={13} />
            Print
          </button>

          <hr className="border-gray-100" />

          <button
            onClick={() => {
              onDelete(user.id);
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
        className="p-1.5 rounded-lg hover:bg-gray-100"
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
      <label className="text-xs font-medium text-gray-600 mb-1 block">
        Filter By Role
      </label>

      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm 
                   border border-gray-200 bg-white rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        <span className="text-gray-800 flex items-center gap-2">
          {selected?.label}

          {roleFilter !== "all" && (
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          )}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg overflow-hidden">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                setRoleFilter(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100
                ${roleFilter === opt.value ? "bg-gray-50 font-medium" : ""}`}
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
    { label: "Verified", value: "verified" },
    { label: "Unverified", value: "unverified" },
    { label: "Rejected", value: "rejected" },
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
      <label className="text-xs font-medium text-gray-600 mb-1 block">
        Filter By Status
      </label>

      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 bg-white rounded-lg"
      >
        <span className="flex items-center gap-2">
          {selected?.label}

          {statusFilter !== "all" && (
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg overflow-hidden">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                setStatusFilter(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                statusFilter === opt.value ? "bg-gray-50 font-medium" : ""
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
