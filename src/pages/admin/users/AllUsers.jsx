import {
  Search, Download, Users, Shield, Briefcase, UserCheck, RefreshCw, X, Ban,
  UserLock, Clock,
} from "lucide-react";
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { fetchUsers, deleteUser } from "../../../services/userServices";
import { useAuth } from "../../../contexts/AuthContext";
import EditUserModal from "./EditUserModal";
import ActionMenu from "../../../components/common/ActionMenu";
import { handleUserPrint } from "../../../utils/userPrint";

function AllUsers() {
  const { t } = useTranslation();
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
  const [errors, setErrors] = useState({});
  const { full_name } = useAuth();

  const navigate = useNavigate();

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

  // Pagination resetting
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        t("all_users.messages.load_failed")
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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
    if (!window.confirm(t("all_users.messages.confirm_delete_selected")))
      return;

    try {
      await Promise.all(selectedRows.map((id) => deleteUser(id)));
      setUsers((prev) => prev.filter((u) => !selectedRows.includes(u.id)));
      setSelectedRows([]);
      toast.success(t("all_users.messages.selected_deleted"));
    } catch {
      toast.error(t("all_users.messages.delete_failed"));
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
    setErrors({});
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm(t("all_users.messages.confirm_delete_user"))) return;

    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      closeModal();
      toast.success(t("all_users.messages.user_deleted"));
      navigate("/admin/users");
    } catch (err) {
      console.error(err);
      toast.error(t("all_users.messages.delete_failed"));
    }
  };

  const handleUpdateSuccess = (updatedData) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedData.id ? { ...u, ...updatedData } : u)),
    );
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    toast.success(t("all_users.messages.user_updated"));
  };

  const stats = useMemo(() => {
    return {
      total: users.length,
      clients: users.filter((u) => u.user_type === "client").length,
      workers: users.filter((u) => u.user_type === "worker").length,
      admins: users.filter((u) => u.user_type === "admin").length,
      activeUsers: users.filter((u) => u.account_status === "active").length,
      pendingUsers: users.filter((u) => u.account_status === "pending").length,
      rejectedUsers: users.filter((u) => u.account_status === "rejected").length,
      suspendedUsers: users.filter((u) => u.account_status === "suspended").length,
    };
  }, [users]);

  const statusLabels = {
    active: t("all_users.status_labels.active"),
    pending: t("all_users.status_labels.pending"),
    rejected: t("all_users.status_labels.rejected"),
    suspended: t("all_users.status_labels.suspended"),
  };

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
    "border-white dark:border-black " +
    "text-black dark:text-white " +
    "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black";

  const activeBtn =
    "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white";

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
          <RefreshCw className="animate-spin mx-auto mb-3 text-amber-500 dark:text-amber-400" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            {t("all_users.messages.loading")}
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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t("all_users.title")}
          </h1>
          <p className="text-sm mt-0.5 text-gray-500 dark:text-gray-400">
            {t("all_users.subtitle")}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={loadUsers}
            className="px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors
                 bg-yellow-300 hover:bg-yellow-400
                 dark:bg-yellow-500 dark:hover:bg-yellow-400 dark:text-gray-900"
          >
            <RefreshCw size={14} />
            <span className="hidden xs:inline">{t("all_users.refresh")}</span>
          </button>

          <button
            onClick={() => navigate("/admin/create/user")}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors
                 bg-blue-600 hover:bg-blue-700 text-white
                 dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-white"
          >
            {t("all_users.add_user")}
          </button>
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <StatCard
          title={t("all_users.stats.total")}
          value={stats.total}
          icon={<Users />}
          color="gray"
        />
        <StatCard
          title={t("all_users.stats.clients")}
          value={stats.clients}
          icon={<UserCheck />}
          color="blue"
        />
        <StatCard
          title={t("all_users.stats.workers")}
          value={stats.workers}
          icon={<Briefcase />}
          color="purple"
        />
        <StatCard
          title={t("all_users.stats.admins")}
          value={stats.admins}
          icon={<Shield />}
          color="purple"
        />
        <StatCard
          title={t("all_users.stats.active")}
          value={stats.activeUsers}
          icon={<UserCheck />}
          color="green"
        />
        <StatCard
          title={t("all_users.stats.pending")}
          value={stats.pendingUsers}
          icon={<Clock />}
          color="amber"
        />
        <StatCard
          title={t("all_users.stats.rejected")}
          value={stats.rejectedUsers}
          icon={<Ban />}
          color="red"
        />
        <StatCard
          title={t("all_users.stats.suspended")}
          value={stats.suspendedUsers}
          icon={<UserLock />}
          color="gray"
        />
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 mb-4 flex flex-col sm:flex-row gap-4 sm:items-end transition-colors">
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
            placeholder={t("all_users.search_placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <RoleFilter roleFilter={roleFilter} setRoleFilter={setRoleFilter} />
          <StatusFilter
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors
               border border-gray-200 dark:border-gray-600
               bg-white dark:bg-gray-900
               text-gray-800 dark:text-gray-200
               hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Download size={18} />
          {t("all_users.export")}
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
          <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
            {selectedRows.length} {t("all_users.selected")}
          </span>

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
              {t("all_users.export")}
            </button>

            <button
              onClick={handleBulkDelete}
              className="px-3 py-2 rounded-lg text-sm font-medium
                   bg-red-500 hover:bg-red-600
                   dark:bg-red-600 dark:hover:bg-red-500
                   text-white transition-colors"
            >
              {t("all_users.delete_selected")}
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <section className="rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225">
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
                <th className="px-4 py-3 text-left">{t("all_users.table.id")}</th>
                <th className="px-4 py-3 text-left">{t("all_users.table.email")}</th>
                <th className="px-4 py-3 text-left">{t("all_users.table.phone")}</th>
                <th className="px-4 py-3 text-left">{t("all_users.table.role")}</th>
                <th className="px-4 py-3 text-left">{t("all_users.table.status")}</th>
                <th className="px-4 py-3 text-left">{t("all_users.table.linked_profile")}</th>
                <th className="px-4 py-3 text-left">{t("all_users.table.actions")}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paginatedUsers.filter(Boolean).map((user, index) => (
                <tr
                  key={user?.id}
                  onClick={() => openViewModal(user)}
                  className={`cursor-pointer transition hover:bg-gray-100 dark:hover:bg-gray-700
                    ${index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900/40"}
                  `}
                >
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

                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {user?.id || "—"}
                  </td>

                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 break-all">
                    {user?.email || "—"}
                  </td>

                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {user?.phone || "—"}
                  </td>

                  <td className="px-4 py-3 capitalize text-gray-700 dark:text-gray-300">
                    {user.user_type === "client"
                      ? t("all_users.view_modal.labels.role_client")
                      : user.user_type === "worker"
                        ? t("all_users.view_modal.labels.role_worker")
                        : t("all_users.view_modal.labels.admin")
                    }
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium
                      bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                    >
                      {statusLabels[user.account_status] ||
                        t("all_users.status_labels.unknown")}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-gray-600 dark:text-gray-300">
                    {user.user_type === "admin"
                      ? t("all_users.view_modal.labels.system_admin")
                      : user?.client
                        ? `${t("all_users.view_modal.labels.client")} #${user.client.id}`
                        : user?.worker
                          ? `${t("all_users.view_modal.labels.worker")} #${user.worker.id}`
                          : t("all_users.view_modal.labels.not_linked")}
                  </td>

                  <td
                    className="px-4 py-3 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionMenu
                      item={user}
                      onView={openViewModal}
                      onEdit={(user) => handleEditUser(user)}
                      onDelete={handleDeleteUser}
                      onPrint={(user) => handleUserPrint(user, t)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 text-xs text-gray-600 dark:text-gray-300">
            {t("all_users.showing", {
              count: paginatedUsers.length,
              total: users.length,
            })}
          </div>
        )}
      </section>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-200">
          <span>{t("all_users.rows")}</span>
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

        <div className="flex justify-center flex-1">
          <div className="flex items-center gap-1">
            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage(1)}
                className={`${baseBtn} ${themeBtn}`}
              >
                {t("all_users.pagination.first")}
              </button>
            )}

            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                className={`${baseBtn} ${themeBtn}`}
              >
                {t("all_users.pagination.prev")}
              </button>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(0, currentPage - 3),
                Math.min(totalPages, currentPage + 2),
              )
              .map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`${baseBtn} ${currentPage === page ? activeBtn : themeBtn}`}
                >
                  {page}
                </button>
              ))}

            {currentPage < totalPages && (
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                className={`${baseBtn} ${themeBtn}`}
              >
                {t("all_users.pagination.next")}
              </button>
            )}

            {currentPage < totalPages && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`${baseBtn} ${themeBtn}`}
              >
                {t("all_users.pagination.last")}
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
          <div
            className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl bg-white dark:bg-gray-800 
            rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700
            max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 
              border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                {t("all_users.view_modal.title")}
              </h2>

              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
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
                    {t(`all_users.view_modal.tabs.${tab}`)}
                  </button>
                ))}
              </div>

              {/* INFO TAB */}
              {activeTab === "info" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-800 dark:text-white">
                      {t("all_users.view_modal.labels.email")}
                    </p>
                    <p className="break-all text-gray-900 dark:text-white">
                      {selectedUser.email}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-800 dark:text-white">
                      {t("all_users.view_modal.labels.user_type")}
                    </p>
                    <p className="capitalize text-gray-900 dark:text-white">
                      {selectedUser.user_type}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-800 dark:text-white">
                      {t("all_users.view_modal.labels.phone")}
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedUser.phone ||
                        t("all_users.view_modal.labels.no_phone")}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-800 dark:text-white">
                      {t("all_users.view_modal.labels.status")}
                    </p>
                    <p
                      className={
                        selectedUser.is_active
                          ? "text-green-500 font-semibold"
                          : "text-red-500 font-semibold"
                      }
                    >
                      {selectedUser.is_active
                        ? t("all_users.view_modal.labels.active")
                        : t("all_users.view_modal.labels.inactive")}
                    </p>
                  </div>
                </div>
              )}

              {/* SYSTEM TAB */}
              {activeTab === "system" && (
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-800 dark:text-white">
                      {t("all_users.view_modal.labels.user_id")}
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      #{selectedUser.id}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-800 dark:text-white">
                      {t("all_users.view_modal.labels.superuser")}
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedUser.is_superuser
                        ? t("all_users.view_modal.labels.yes")
                        : t("all_users.view_modal.labels.no")}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-800 dark:text-white">
                      {t("all_users.view_modal.labels.staff")}
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedUser.is_staff
                        ? t("all_users.view_modal.labels.yes")
                        : t("all_users.view_modal.labels.no")}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-800 dark:text-white">
                      {t("all_users.view_modal.labels.registered")}
                    </p>
                    <p className="text-xs text-gray-900 dark:text-white">
                      {selectedUser.registered_date
                        ? new Date(
                          selectedUser.registered_date,
                        ).toLocaleString()
                        : "-"}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs text-gray-800 dark:text-white">
                      {t("all_users.view_modal.labels.last_update")}
                    </p>
                    <p className="text-xs text-gray-900 dark:text-white">
                      {selectedUser.last_update
                        ? new Date(selectedUser.last_update).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </div>
              )}

              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div className="space-y-4">
                  {selectedUser?.client && (
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900">
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-blue-600">
                          {`${t("all_users.view_modal.labels.client")} (${selectedUser.client.client_type === "company"
                            ? t("all_users.view_modal.labels.company")
                            : t("all_users.view_modal.labels.individual")
                            })`}
                        </span>
                        <span className="text-xs text-blue-600">
                          {t("all_users.table.id")} #{selectedUser.client.id}
                        </span>
                      </div>

                      <p className="mt-2 font-semibold text-blue-900 dark:text-blue-200">
                        {selectedUser.client.client_type === "company"
                          ? `${t("all_users.view_modal.labels.company")}: ${selectedUser.client.company_name || "N/A"}`
                          : `${t("all_users.view_modal.labels.name")}: ${full_name || "N/A"}`
                        }
                      </p>
                    </div>
                  )}

                  {selectedUser?.worker && (
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900">
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-green-600">
                          {t("all_users.view_modal.labels.worker")}
                        </span>
                        <span className="text-xs text-green-600">
                          {t("all_users.table.id")} #{selectedUser.worker.id}
                        </span>
                      </div>

                      <p className="mt-2 font-semibold text-green-900 dark:text-green-200">
                        {selectedUser.worker.first_name}{" "}
                        {selectedUser.worker.last_name}
                      </p>
                    </div>
                  )}

                  {selectedUser.user_type === "admin" && (
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900">
                      <span className="text-xs font-bold text-purple-600">
                        {t("all_users.view_modal.labels.admin")}
                      </span>
                      <p className="mt-2 text-purple-900 dark:text-purple-200 font-semibold">
                        {t("all_users.view_modal.labels.system_admin")}
                      </p>
                    </div>
                  )}

                  {!selectedUser.client &&
                    !selectedUser.worker &&
                    selectedUser.user_type !== "admin" && (
                      <div className="p-4 text-center rounded-xl bg-gray-50 dark:bg-gray-900">
                        <p className="text-gray-500">
                          {t("all_users.view_modal.labels.no_linked_profile")}
                        </p>
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
                  {t("all_users.view_modal.buttons.edit")}
                </button>

                <button
                  onClick={() => handleUserPrint(selectedUser, t)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white font-medium"
                >
                  {t("all_users.view_modal.buttons.print")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      <EditUserModal
        isOpen={isEditModalOpen}
        editForm={editForm}
        setEditForm={setEditForm}
        errors={errors}
        setErrors={setErrors}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleUpdateSuccess}
      />
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
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </h2>
      </div>

      <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.amber}`}>
        {icon}
      </div>
    </div>
  );
}

/* Role Filter */
export function RoleFilter({ roleFilter, setRoleFilter }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const options = [
    { label: t("all_users.filter_role.all"), value: "all" },
    { label: t("all_users.filter_role.admin"), value: "admin" },
    { label: t("all_users.filter_role.client"), value: "client" },
    { label: t("all_users.filter_role.worker"), value: "worker" },
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
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
        {t("all_users.filter_role.label")}
      </label>

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

/* Status Filter */
export function StatusFilter({ statusFilter, setStatusFilter }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const options = [
    { label: t("all_users.filter_status.all"), value: "all" },
    { label: t("all_users.filter_status.pending"), value: "pending" },
    { label: t("all_users.filter_status.active"), value: "active" },
    { label: t("all_users.filter_status.rejected"), value: "rejected" },
    { label: t("all_users.filter_status.suspended"), value: "suspended" },
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
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
        {t("all_users.filter_status.label")}
      </label>

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

export default AllUsers;