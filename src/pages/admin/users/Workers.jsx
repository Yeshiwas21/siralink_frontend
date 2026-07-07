import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import {
  Users,
  Search,
  Clock,
  RefreshCw,
  CircleCheck,
  HelpCircle,
  XCircle,
  Download,
  MoreHorizontal,
  Printer,
  X,
  Edit,
  Eye,
  Trash2,
} from "lucide-react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { listWorker, deleteWorker } from "../../../services/userServices";
import { StatCard } from "./AllUsers";
import { StatusFilter } from "./Clients";

/* ─── Status badge ─────────────────────────────────────────── */
const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  verified: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  unverified: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  rejected: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

function StatusBadge({ status, label }) {
  const cls = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${cls}`}
    >
      {label || status || "—"}
    </span>
  );
}

/* ─── Action-menu ─────────── */
function ActionMenu({ worker, onView, onEdit, onDelete, onPrint }) {
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
            onView(worker);
            setOpen(false);
          }}
          className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
        >
          <Eye size={13} />
          View
        </button>
        <button
          onClick={() => {
            onEdit(worker);
            setOpen(false);
          }}
          className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 dark:hover:bg-green-900/40 hover:text-green-700 dark:hover:text-green-400 transition-colors flex items-center gap-2"
        >
          <Edit size={13} />
          Edit
        </button>
        <button
          onClick={() => {
            onPrint(worker);
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
            onDelete(worker.id);
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

/* ─── Main component ────────────────────────────────────────── */
function Workers() {
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
  const [activeTab, setActiveTab] = useState("personal");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* fetch */
  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listWorker();
      setWorkers(data);
      setFilteredWorkers(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load Workers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  /* filter */
  useEffect(() => {
    let data = [...workers];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      data = data.filter(
        (w) =>
          w.email?.toLowerCase().includes(q) ||
          w.first_name?.toLowerCase().includes(q) ||
          w.last_name?.toLowerCase().includes(q) ||
          w.phone?.includes(searchTerm) ||
          w.location?.toLowerCase().includes(q) ||
          w.id.toString().includes(searchTerm),
      );
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
      verified: workers.filter((w) => w.verification_status === "verified")
        .length,
      unverified: workers.filter((w) => w.verification_status === "unverified")
        .length,
      rejected: workers.filter((w) => w.verification_status === "rejected")
        .length,
    }),
    [workers],
  );

  /* modal */
  const openViewModal = (worker) => {
    setSelectedWorker(worker);
    setActiveTab("personal");
    setIsViewModalOpen(true);
  };
  const closeModal = () => {
    setSelectedWorker(null);
    setIsViewModalOpen(false);
  };

  /* delete */
  const handleDeleteWorker = async (id) => {
    if (!window.confirm("Delete this worker?")) return;
    await deleteWorker(id);
    setWorkers((prev) => prev.filter((w) => w.id !== id));
    toast.success("Worker deleted");
  };

  /* selection */
  const toggleRow = (id) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const toggleAll = () =>
    setSelectedRows(
      selectedRows.length === filteredWorkers.length
        ? []
        : filteredWorkers.map((w) => w.id),
    );
  const allSelected =
    selectedRows.length === filteredWorkers.length &&
    filteredWorkers.length > 0;
  const someSelected =
    selectedRows.length > 0 && selectedRows.length < filteredWorkers.length;

  /* bulk delete */
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedRows.length} workers?`)) return;
    await Promise.all(selectedRows.map((id) => deleteWorker(id)));
    setWorkers((prev) => prev.filter((w) => !selectedRows.includes(w.id)));
    setSelectedRows([]);
    toast.success("Deleted selected workers");
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

  //pagintion
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
    "border-gray-300 dark:border-gray-600 " +
    "text-gray-700 dark:text-gray-200 " +
    "hover:bg-gray-100 dark:hover:bg-gray-700";

  const activeBtn =
    "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500";

  /* print */
  const handlePrint = (worker) => {
    const name =
      [worker.first_name, worker.last_name].filter(Boolean).join(" ") || "—";
    const win = window.open("", "_blank", "width=700,height=600");
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Worker — ${name}</title>
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
            <h1>Worker Profile</h1>
            <p>Generated ${new Date().toLocaleString()}</p>
          </div>
          <span class="badge">${worker.verification_status_display || worker.verification_status || "—"}</span>
        </div>
        <table>
          <tr><td>ID</td><td>#${worker.id}</td></tr>
          <tr><td>Full Name</td><td>${name}</td></tr>
          <tr><td>Email</td><td>${worker.email || "—"}</td></tr>
          <tr><td>Phone</td><td>${worker.phone || "—"}</td></tr>
          <tr><td>National ID</td><td>${worker.national_id || "—"}</td></tr>
          <tr><td>Location</td><td>${worker.location || "—"}</td></tr>
          <tr><td>Status</td><td>${worker.verification_status_display || worker.verification_status || "—"}</td></tr>
        </table>
        <div class="footer">Workers Management System</div>
        <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
      </body>
      </html>
    `);
    win.document.close();
  };

  // Lock the background scroll when the modal is open
  useEffect(() => {
    if (isViewModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isViewModalOpen]);

  /* loading */
  if (loading) {
    return (
      <div className="p-4 sm:p-8 bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="bg-white dark:bg-gray-900 p-8 text-center rounded-xl shadow flex flex-col items-center gap-3 border border-gray-200 dark:border-gray-800">
          <RefreshCw className="animate-spin text-blue-500" size={28} />
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            Loading workers…
          </span>
        </div>
      </div>
    );
  }

  /* error */
  if (error) {
    return (
      <div className="p-8 bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-red-600 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  /* ── RENDER ── */
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-950 min-h-screen transition-colors">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Workers Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Manage all registered workers
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={fetchWorkers}
            className="px-3 py-2 bg-yellow-300 dark:bg-yellow-500 hover:bg-yellow-400 dark:hover:bg-yellow-600 text-gray-900 dark:text-white rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <RefreshCw size={14} />
            <span className="hidden xs:inline">Refresh</span>
          </button>

          <button
            onClick={() => navigate("/admin/create/worker")}
            className="px-3 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Add Worker
          </button>
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatCard
          title="Total"
          value={stats.total}
          icon={<Users />}
          color="blue"
        />
        <StatCard
          title="Under Review"
          value={stats.pending}
          icon={<Clock />}
          color="yellow"
        />
        <StatCard
          title="Verified"
          value={stats.verified}
          icon={<CircleCheck />}
          color="green"
        />
        <StatCard
          title="Unverified"
          value={stats.unverified}
          icon={<HelpCircle />}
          color="gray"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={<XCircle />}
          color="red"
        />
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-xl shadow border border-gray-200 dark:border-gray-800 mb-4 flex flex-col sm:flex-row gap-4 sm:items-end">
        {/* SEARCH */}
        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={16}
          />
          <input
            className="bg-white dark:bg-gray-900 w-full pl-9 pr-4 py-2 rounded-lg text-sm text-gray-800 dark:text-white border border-gray-200 dark:border-gray-800
                       focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FILTER */}
        <StatusFilter
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>

      {/* BULK ACTION BAR */}
      {selectedRows.length > 0 && (
        <div className="flex flex-wrap justify-between items-center bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-3 rounded-xl mb-3 gap-2">
          <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">
            {selectedRows.length} worker{selectedRows.length > 1 ? "s" : ""}{" "}
            selected
          </span>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center gap-1.5 text-sm transition-colors"
            >
              <Download size={13} />
              Export
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 rounded-lg text-sm transition-colors"
            >
              Delete Selected
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
                  ID
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  Phone
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  Location
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-300 w-16">
                  Actions
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
                    No workers found
                  </td>
                </tr>
              ) : (
                filteredWorkers.map((w, index) => (
                  <tr
                    key={w.id}
                    onClick={() => openViewModal(w)}
                    className={`cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/20
                      ${index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/40"}
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
                      {[w.first_name, w.last_name].filter(Boolean).join(" ") ||
                        "—"}
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
                        worker={w}
                        onView={openViewModal}
                        onEdit={(worker) =>
                          navigate(`/admin/edit/worker/${worker.id}`)
                        }
                        onDelete={handleDeleteWorker}
                        onPrint={handlePrint}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Row count footer */}
        {workers.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-600 dark:text-gray-300">
            Showing {paginatedWorkers.length} of {workers.length} clients
          </div>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
        {/* Rows per page */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
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
      {isViewModalOpen && selectedWorker && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl border border-transparent dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Worker Details
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                onClick={() => setActiveTab("personal")}
                className={`px-4 py-2 text-sm font-medium ${activeTab === "personal"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400"
                  }`}
              >
                Personal
              </button>

              <button
                onClick={() => setActiveTab("contact")}
                className={`px-4 py-2 text-sm font-medium ${activeTab === "contact"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400"
                  }`}
              >
                Contact
              </button>

              <button
                onClick={() => setActiveTab("others")}
                className={`px-4 py-2 text-sm font-medium ${activeTab === "others"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400"
                  }`}
              >
                Others
              </button>
            </div>

            {/* Data rows */}
            <div className="space-y-3 text-sm text-gray-800 dark:text-gray-200">
              {activeTab === "personal" && (
                <>
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                      First Name
                    </span>
                    <span>{selectedWorker.first_name || "—"}</span>
                  </div>

                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                      Last Name
                    </span>
                    <span>{selectedWorker.last_name || "—"}</span>
                  </div>
                </>
              )}

              {activeTab === "contact" && (
                <>
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                      Email
                    </span>
                    <span className="truncate">{selectedWorker.email || "—"}</span>
                  </div>

                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                      Phone
                    </span>
                    <span>{selectedWorker.phone || "—"}</span>
                  </div>
                </>
              )}

              {activeTab === "others" && (
                <>
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">ID</span>
                    <span>#{selectedWorker.id}</span>
                  </div>

                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                      Location
                    </span>
                    <span>{selectedWorker.location || "—"}</span>
                  </div>

                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                      National ID
                    </span>
                    <span>{selectedWorker.national_id || "—"}</span>
                  </div>

                  <div className="flex gap-2 items-center">
                    <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                      Status
                    </span>
                    <StatusBadge
                      status={selectedWorker.verification_status}
                      label={selectedWorker.verification_status_display}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  navigate(`/admin/edit/worker/${selectedWorker.id}`);
                  closeModal();
                }}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Edit size={13} />
                Edit
              </button>
              <button
                onClick={() => handlePrint(selectedWorker)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Printer size={13} />
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Workers;