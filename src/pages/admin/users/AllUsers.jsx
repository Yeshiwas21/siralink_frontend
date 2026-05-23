import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  fetchUsers,
  deleteUser,
  updateUser,
} from "../../../services/userServices";
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
} from "lucide-react";

function AllUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const [selectedRows, setSelectedRows] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

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

    setFilteredUsers(data);
  }, [users, searchTerm, roleFilter]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".action-menu")) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 mt-1">
            Manage all users registered on this platform
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="bg-amber-300 text-black font-semibold px-4 py-2 rounded-lg hover:bg-amber-400 transition flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
        <button
          onClick={() => navigate("/admin/create/user")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          + Add User
        </button>
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
      {/* FILTER */}
      <div className="bg-white p-4 rounded-xl shadow border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />

            <input
              type="text"
              placeholder="Search by ID, email, phone..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border rounded-lg"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="client">Clients</option>
            <option value="worker">Workers</option>
            <option value="admin">Admins</option>
          </select>

          <button
            onClick={handleExport}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download size={18} />
            Export
          </button>
        </div>
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
                <th className="px-6 py-4 text-left">Actions</th>{" "}
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

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    {user.is_active ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
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
                    className="px-6 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-start relative">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === user.id ? null : user.id)
                        }
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <MoreHorizontal />
                      </button>

                      {openMenu === user.id && (
                        <div
                          className="action-menu absolute left-0 top-full mt-2 w-44 bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              openViewModal(user);
                              setOpenMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-all duration-150"
                          >
                            View
                          </button>

                          <button
                            onClick={() => {
                              handleEditUser(user);
                              setOpenMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition-all duration-150"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => {
                              handleDeleteUser(user.id);
                              setOpenMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-150"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
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
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => handleEditUser(selectedUser)}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  <Edit size={16} className="inline mr-1" />
                </button>

                <button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  <Trash2 size={16} className="inline mr-1" />
                </button>

                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 rounded-lg cursor-pointer"
                >
                  Close
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

export function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-xl shadow border p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-2xl font-bold text-gray-800">{value}</h2>
      </div>
      <div className="bg-amber-100 text-amber-700 p-3 rounded-xl">{icon}</div>
    </div>
  );
}

export default AllUsers;
