import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Users, Search, Clock, RefreshCw, CircleCheck, HelpCircle, XCircle, Download,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { listWorker, deleteWorker } from "../../../services/userServices";
import StatCard from "../../../components/common/StatCard";
import StatusFilter from "../../../components/common/StatusFilter";
import StatusBadge from "../../../components/common/StatusBadge";
import ActionMenu from "../../../components/common/ActionMenu";
import { handlePrintWorker } from "../../../utils/workerPrint";
import WorkerViewModal from "./WorkerViewModal";
import EditWorkerModal from "./EditWorkerModal";

function Workers() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorker, setSelectedWorker] = useState(null);
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
  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listWorker();
      setWorkers(data);
      setFilteredWorkers(data);
    } catch (err) {
      setError(err?.response?.data?.detail || t("workers.errors.failedToLoad"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  /* filter */
  useEffect(() => {
    let data = [...workers];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      data = data.filter((w) => {
        const firstName = w.first_name?.toLowerCase() || "";
        const lastName = w.last_name?.toLowerCase() || "";
        const fullName = `${firstName} ${lastName}`.trim();

        return (
          firstName.includes(q) ||
          lastName.includes(q) ||
          fullName.includes(q) ||
          w.email?.toLowerCase().includes(q) ||
          w.company_name?.toLowerCase().includes(q) ||
          w.phone?.includes(searchTerm) ||
          w.location?.toLowerCase().includes(q) ||
          String(w.id).includes(searchTerm)
        );
      });
    }
    if (statusFilter !== "all") {
      data = data.filter((w) => w.verification_status === statusFilter);
    }
    setFilteredWorkers(data);
  }, [searchTerm, workers, statusFilter]);

  /* stats */
  const stats = useMemo(
    () => ({
      total: workers.length,
      pending: workers.filter((w) => w.verification_status === "pending").length,
      verified: workers.filter((w) => w.verification_status === "verified").length,
      unverified: workers.filter((w) => w.verification_status === "unverified").length,
      rejected: workers.filter((w) => w.verification_status === "rejected").length,
    }),
    [workers]
  );

  /* modal controllers */
  const openViewModal = (worker) => {
    setSelectedWorker(worker);
    setIsViewModalOpen(true);
  };
  const closeModal = () => {
    setSelectedWorker(null);
    setIsViewModalOpen(false);
  };

  // Event Handler to open the modal
  const handleEditWorker = (worker) => {
    setEditFormData({
      id: worker.id,
      email: worker.email,
      category: worker.category?.id || "",
      national_id: worker.national_id || "",
      skills: worker.skills || "",
      bio: worker.bio || "",
      profile_image: null,
      experience_years: worker.experience_years ?? 0,
      portfolio_link: worker.portfolio_link || "",
      location: worker.location || "",
      verification_status: worker.verification_status
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
    setWorkers((prev) =>
      prev.map((w) => (w.id === updatedData.id ? { ...w, ...updatedData } : w)),
    );
    setIsEditOpen(false);
    setIsViewModalOpen(false);
    toast.success(t("workers.toasts.workerUpdated"));
  };

  /* delete */
  const handleDeleteWorker = async (id) => {
    if (!window.confirm(t("workers.confirmations.deleteSingle"))) return;
    await deleteWorker(id);
    setWorkers((prev) => prev.filter((w) => w.id !== id));
    toast.success(t("workers.toasts.deleted"));
  };

  /* selection */
  const toggleRow = (id) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  const toggleAll = () =>
    setSelectedRows(
      selectedRows.length === filteredWorkers.length
        ? []
        : filteredWorkers.map((w) => w.id)
    );
  const allSelected =
    selectedRows.length === filteredWorkers.length && filteredWorkers.length > 0;
  const someSelected =
    selectedRows.length > 0 && selectedRows.length < filteredWorkers.length;

  /* bulk delete */
  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        t("workers.confirmations.deleteMultiple", { count: selectedRows.length })
      )
    )
      return;
    await Promise.all(selectedRows.map((id) => deleteWorker(id)));
    setWorkers((prev) => prev.filter((w) => !selectedRows.includes(w.id)));
    setSelectedRows([]);
    toast.success(t("workers.toasts.deletedSelected"));
  };

  /* export */
  const handleExport = () => {
    const data = workers.filter((w) => selectedRows.includes(w.id));
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workers-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* pagination */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredWorkers.length / rowsPerPage);

  const paginatedWorkers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredWorkers.slice(start, start + rowsPerPage);
  }, [filteredWorkers, currentPage, rowsPerPage]);

  const baseBtn = "px-3 py-1 rounded-full border cursor-pointer transition";

  const themeBtn =
    "border-white dark:border-black text-black dark:text-white " +
    "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black";

  const activeBtn =
    "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white";

  /* loading state */
  if (loading) {
    return (
      <div className="p-4 sm:p-8 bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="bg-white dark:bg-gray-900 p-8 text-center rounded-xl shadow flex flex-col items-center gap-3 border border-gray-200 dark:border-gray-800">
          <RefreshCw className="animate-spin text-blue-500" size={28} />
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {t("workers.loading")}
          </span>
        </div>
      </div>
    );
  }

  /* error state */
  if (error) {
    return (
      <div className="p-8 bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-red-600 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-950 min-h-screen transition-colors">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t("workers.header.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {t("workers.header.subtitle")}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={fetchWorkers}
            className="px-3 py-2 bg-yellow-300 dark:bg-yellow-500 hover:bg-yellow-400 dark:hover:bg-yellow-600 text-gray-900 dark:text-white rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            <span className="hidden xs:inline">{t("workers.buttons.refresh")}</span>
          </button>

          <button
            onClick={() => navigate("/admin/create/worker")}
            className="px-3 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            {t("workers.buttons.addWorker")}
          </button>
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatCard
          title={t("workers.stats.total")}
          value={stats.total}
          icon={<Users />}
          color="blue"
        />
        <StatCard
          title={t("workers.stats.underReview")}
          value={stats.pending}
          icon={<Clock />}
          color="yellow"
        />
        <StatCard
          title={t("workers.stats.verified")}
          value={stats.verified}
          icon={<CircleCheck />}
          color="green"
        />
        <StatCard
          title={t("workers.stats.unverified")}
          value={stats.unverified}
          icon={<HelpCircle />}
          color="gray"
        />
        <StatCard
          title={t("workers.stats.rejected")}
          value={stats.rejected}
          icon={<XCircle />}
          color="red"
        />
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-xl shadow border border-gray-200 dark:border-gray-800 mb-4 flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={16}
          />
          <input
            className="bg-white dark:bg-gray-900 w-full pl-9 pr-4 py-2 rounded-lg text-sm text-gray-800 dark:text-white border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500"
            placeholder={t("workers.searchPlaceholder")}
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
        <div className="flex flex-wrap justify-between items-center bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-3 rounded-xl mb-3 gap-2">
          <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">
            {t("workers.selectedCount", { count: selectedRows.length })}
          </span>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center gap-1.5 text-sm transition-colors cursor-pointer"
            >
              <Download size={13} />
              {t("workers.buttons.export")}
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 rounded-lg text-sm transition-colors cursor-pointer"
            >
              {t("workers.buttons.deleteSelected")}
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-160">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
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
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {t("workers.table.id")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {t("workers.table.name")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {t("workers.table.email")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {t("workers.table.phone")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {t("workers.table.location")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {t("workers.table.status")}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-300 w-16">
                  {t("workers.table.actions")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm"
                  >
                    {t("workers.noWorkersFound")}
                  </td>
                </tr>
              ) : (
                paginatedWorkers.map((w, index) => (
                  <tr
                    key={w.id}
                    onClick={() => openViewModal(w)}
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
                        checked={selectedRows.includes(w.id)}
                        onChange={() => toggleRow(w.id)}
                      />
                    </td>

                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">
                      #{w.id}
                    </td>

                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {[w.first_name, w.last_name].filter(Boolean).join(" ") || "—"}
                    </td>

                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-45 truncate">
                      {w.email}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {w.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {w.location || "—"}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        status={w.verification_status}
                        label={w.verification_status_display}
                      />
                    </td>

                    <td
                      className="px-4 py-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ActionMenu
                        item={w}
                        onView={openViewModal}
                        onEdit={(w) => handleEditWorker(w)
                        }
                        onDelete={handleDeleteWorker}
                        onPrint={handlePrintWorker}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {workers.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-600 dark:text-gray-300">
            {t("workers.showingCount", {
              shown: paginatedWorkers.length,
              total: workers.length,
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
            {/* Hide First & Prev if on the first page */}
            {currentPage > 1 && (
              <>
                <button
                  onClick={() => setCurrentPage(1)}
                  aria-label={t("clients.first")}
                  className={`${baseBtn} ${themeBtn} p-1.5`}
                >
                  <ChevronsLeft size={16} />
                </button>

                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  aria-label={t("clients.prev")}
                  className={`${baseBtn} ${themeBtn} p-1.5`}
                >
                  <ChevronLeft size={16} />
                </button>
              </>
            )}

            {/* Page Numbers */}
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

            {/* Hide Next & Last if on the last page or no total pages */}
            {currentPage < totalPages && totalPages > 0 && (
              <>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  aria-label={t("clients.next")}
                  className={`${baseBtn} ${themeBtn} p-1.5`}
                >
                  <ChevronRight size={16} />
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  aria-label={t("clients.last")}
                  className={`${baseBtn} ${themeBtn} p-1.5`}
                >
                  <ChevronsRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* VIEW MODAL (EXTRACTED COMPONENT) */}
      <WorkerViewModal
        isOpen={isViewModalOpen}
        worker={selectedWorker}
        onEdit={handleEditWorker}
        onClose={closeModal}
      />

      <EditWorkerModal
        isEditOpen={isEditOpen}
        formData={editFormData}
        setFormData={setEditFormData}
        editErrors={editErrors}
        setEditErrors={setEditErrors}
        onEditClose={handleCloseEditModal}
        onEditSuccess={handleEditSuccess}
      />
    </div>
  );
}

export default Workers;