import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Users,
  Search,
  Clock,
  RefreshCw,
  CircleCheck,
  HelpCircle,
  XCircle,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { listClient, deleteClient } from "../../../services/userServices";
import StatCard from "../../../components/common/StatCard";
import StatusBadge from "../../../components/common/StatusBadge";
import StatusFilter from "../../../components/common/StatusFilter";
import ActionMenu from "../../../components/common/ActionMenu";
import ClientViewModal from "./ClientViewModal";
import EditClientModal from "./EditClientModal";

import { handlePrintClient } from "../../../utils/clientPrint";

function Clients() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRows, setSelectedRows] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editErrors, setEditErrors] = useState({});

  /* fetch */
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listClient();
      setClients(data);
      setFilteredClients(data);
    } catch (err) {
      setError(err?.response?.data?.detail || t("clients.error_fetch"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  /* filter */
  useEffect(() => {
    let data = [...clients];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      data = data.filter((c) => {
        const firstName = c.first_name?.toLowerCase() || "";
        const lastName = c.last_name?.toLowerCase() || "";
        const fullName = `${firstName} ${lastName}`.trim();
        return (
          firstName.includes(q) ||
          lastName.includes(q) ||
          fullName.includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.company_name?.toLowerCase().includes(q) ||
          c.phone?.includes(searchTerm) ||
          c.location?.toLowerCase().includes(q) ||
          String(c.id).includes(searchTerm)
        );
      });
    }
    if (statusFilter !== "all") {
      data = data.filter((c) => c.verification_status === statusFilter);
    }
    setFilteredClients(data);
  }, [searchTerm, clients, statusFilter]);

  // pagination reset
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredClients.length / rowsPerPage);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredClients.slice(start, start + rowsPerPage);
  }, [filteredClients, currentPage, rowsPerPage]);

  /* stats */
  const stats = useMemo(
    () => ({
      total: clients.length,
      pending: clients.filter((c) => c.verification_status === "pending")
        .length,
      verified: clients.filter((c) => c.verification_status === "verified")
        .length,
      unverified: clients.filter((c) => c.verification_status === "unverified")
        .length,
      rejected: clients.filter((c) => c.verification_status === "rejected")
        .length,
    }),
    [clients],
  );

  /* modal */
  const openViewModal = (client) => {
    setSelectedClient(client);
    setIsViewModalOpen(true);
  };
  const closeModal = () => {
    setSelectedClient(null);
    setIsViewModalOpen(false);
  };

  // Event Handler to open the modal
  const handleEditClient = (client) => {
    setEditFormData({
      id: client.id,
      client_type: client.client_type || "individual",
      national_id: client.national_id || "",
      company_name: client.company_name || "",
      location: client.location || "",
      verification_status: client.verification_status || "pending",
    });
    setEditErrors({});
    setIsEditOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditOpen(false);
    setEditFormData(null);
    setEditErrors({});
  };

  const handleEditSuccess = (updatedData) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedData.id ? { ...c, ...updatedData } : c)),
    );
    setIsEditOpen(false);
    setIsViewModalOpen(false);
    toast.success(t("clients.messages.client_updated"));
  };

  /* delete */
  const handleDeleteClient = async (id) => {
    if (!window.confirm(t("clients.confirm_delete"))) return;
    await deleteClient(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    toast.success(t("clients.toast_deleted"));
  };

  /* selection */
  const toggleRow = (id) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const toggleAll = () =>
    setSelectedRows(
      selectedRows.length === filteredClients.length
        ? []
        : filteredClients.map((c) => c.id),
    );
  const allSelected =
    selectedRows.length === filteredClients.length &&
    filteredClients.length > 0;
  const someSelected =
    selectedRows.length > 0 && selectedRows.length < filteredClients.length;

  /* bulk delete */
  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        t("clients.confirm_bulk_delete", { count: selectedRows.length }),
      )
    )
      return;
    await Promise.all(selectedRows.map((id) => deleteClient(id)));
    setClients((prev) => prev.filter((c) => !selectedRows.includes(c.id)));
    setSelectedRows([]);
    toast.success(t("clients.toast_bulk_deleted"));
  };

  /* export */
  const handleExport = () => {
    const data = clients.filter((c) => selectedRows.includes(c.id));
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const baseBtn = "px-3 py-1 rounded-full border cursor-pointer transition";
  const themeBtn =
    "border-white dark:border-black " +
    "text-black dark:text-white " +
    "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black";
  const activeBtn =
    "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white";

  /* loading */
  if (loading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="bg-white p-8 text-center rounded-xl shadow flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-blue-500" size={28} />
          <span className="text-gray-500 text-sm">{t("clients.loading")}</span>
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
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t("clients.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {t("clients.subtitle")}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={fetchClients}
            className="px-3 py-2 bg-yellow-300 hover:bg-yellow-400 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:text-gray-900 
            rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            <span className="hidden xs:inline">{t("clients.refresh")}</span>
          </button>

          <button
            onClick={() => navigate("/admin/create/client")}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            {t("clients.add_client")}
          </button>
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatCard
          title={t("clients.stats.total")}
          value={stats.total}
          icon={<Users />}
          color="blue"
        />
        <StatCard
          title={t("clients.stats.under_review")}
          value={stats.pending}
          icon={<Clock />}
          color="yellow"
        />
        <StatCard
          title={t("clients.stats.verified")}
          value={stats.verified}
          icon={<CircleCheck />}
          color="green"
        />
        <StatCard
          title={t("clients.stats.unverified")}
          value={stats.unverified}
          icon={<HelpCircle />}
          color="gray"
        />
        <StatCard
          title={t("clients.stats.rejected")}
          value={stats.rejected}
          icon={<XCircle />}
          color="red"
        />
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 mb-4 flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={16}
          />
          <input
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 
                 bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800"
            placeholder={t("clients.search_placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <StatusFilter
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>

      {/* BULK ACTION BAR */}
      {selectedRows.length > 0 && (
        <div className="flex flex-wrap justify-between items-center bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 p-3 rounded-xl mb-3 gap-2">
          <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">
            {t("clients.selected_count", { count: selectedRows.length })}
          </span>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg flex items-center gap-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download size={13} />
              {t("clients.export")}
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
            >
              {t("clients.delete_selected")}
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-160">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {t("clients.id")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {t("clients.name")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {t("clients.email")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {t("clients.phone")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {t("clients.location")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {t("clients.client_type")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {t("clients.status")}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-400 w-16">
                  {t("clients.actions")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm"
                  >
                    {t("clients.no_clients_found")}
                  </td>
                </tr>
              ) : (
                paginatedClients.map((c, index) => (
                  <tr
                    key={c.id}
                    onClick={() => openViewModal(c)}
                    className={`cursor-pointer transition hover:bg-gray-100 dark:hover:bg-gray-700
                      ${index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900/40"}
                    `}
                  >
                    <td
                      className="p-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                        checked={selectedRows.includes(c.id)}
                        onChange={() => toggleRow(c.id)}
                      />
                    </td>

                    <td className="px-4 py-3 text-gray-500 dark:text-gray-300 font-mono text-xs">
                      #{c.id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {[c.first_name, c.last_name].filter(Boolean).join(" ") ||
                        "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-45 truncate">
                      {c.email}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {c.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {c.location || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {c.client_type && c.client_type === "individual"
                        ? t("clients.type_individual")
                        : t("clients.type_company")}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        status={c.verification_status}
                        label={c.verification_status_display}
                      />
                    </td>

                    <td
                      className="px-4 py-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ActionMenu
                        item={c}
                        onView={openViewModal}
                        onEdit={(c) => handleEditClient(c)}
                        onDelete={handleDeleteClient}
                        onPrint={handlePrintClient}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {clients.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 text-xs text-gray-600 dark:text-gray-300">
            {t("clients.showing_count", {
              count: paginatedClients.length,
              total: clients.length,
            })}
          </div>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span>{t("clients.rows")}</span>
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
                {t("clients.first")}
              </button>
            )}

            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                className={`${baseBtn} ${themeBtn}`}
              >
                {t("clients.prev")}
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
                  className={`${baseBtn} ${currentPage === page ? activeBtn : themeBtn
                    }`}
                >
                  {page}
                </button>
              ))}

            {currentPage < totalPages && (
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                className={`${baseBtn} ${themeBtn}`}
              >
                {t("clients.next")}
              </button>
            )}

            {currentPage < totalPages && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`${baseBtn} ${themeBtn}`}
              >
                {t("clients.last")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SEPARATED VIEW MODAL */}
      <ClientViewModal
        isOpen={isViewModalOpen}
        client={selectedClient}
        onEdit={handleEditClient}
        onClose={closeModal}
      />

      {/* Render the modal component cleanly in JSX */}
      <EditClientModal
        isOpen={isEditOpen}
        formData={editFormData}
        setFormData={setEditFormData}
        errors={editErrors}
        setErrors={setEditErrors}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}

export default Clients;