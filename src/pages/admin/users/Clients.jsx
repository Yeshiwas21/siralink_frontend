import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { listClient, deleteClient } from "../../../services/userServices";
import { StatCard } from "./AllUsers";
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
  SquareX,
  ChevronDown,
} from "lucide-react";

/* ─── Status badge ─────────────────────────────────────────── */
const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  verified: "bg-green-100  text-green-700",
  unverified: "bg-gray-100   text-gray-600",
  rejected: "bg-red-100    text-red-600",
};

function StatusBadge({ status, label }) {
  const cls = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500";
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${cls}`}
    >
      {label || status || "—"}
    </span>
  );
}

/* ─── Action-menu (portal-style fixed positioning) ─────────── */
function ActionMenu({ client, onView, onEdit, onDelete, onPrint }) {
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
          className="w-44 bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              onView(client);
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
          >
            <Eye size={13} />
            View
          </button>
          <button
            onClick={() => {
              onEdit(client);
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 hover:text-green-700 transition-colors flex items-center gap-2"
          >
            <Edit size={13} />
            Edit
          </button>
          <button
            onClick={() => {
              onPrint(client);
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2"
          >
            <Printer size={13} />
            Print
          </button>
          <hr className="border-gray-100" />
          <button
            onClick={() => {
              onDelete(client.id);
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
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
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Actions"
      >
        <MoreHorizontal size={18} />
      </button>
      {dropdown}
    </>
  );
}

/* ─── Main component ────────────────────────────────────────── */
function Clients() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRows, setSelectedRows] = useState([]);
  const [activeTab, setActiveTab] = useState("personal");
  /* fetch */
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listClient();
      setClients(data);
      setFilteredClients(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  /* filter */
  useEffect(() => {
    let data = [...clients];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      data = data.filter(
        (c) =>
          c.email?.toLowerCase().includes(q) ||
          c.company_name?.toLowerCase().includes(q) ||
          c.phone?.includes(searchTerm) ||
          c.location?.toLowerCase().includes(q) ||
          String(c.id).includes(searchTerm),
      );
    }
    if (statusFilter !== "all") {
      data = data.filter((c) => c.verification_status === statusFilter);
    }
    setFilteredClients(data);
  }, [searchTerm, clients, statusFilter]);

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
    setActiveTab(client.client_type === "company" ? "company" : "personal");
    setIsViewModalOpen(true);
  };
  const closeModal = () => {
    setSelectedClient(null);
    setIsViewModalOpen(false);
  };

  /* delete */
  const handleDeleteClient = async (id) => {
    if (!window.confirm("Delete this client?")) return;
    await deleteClient(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    toast.success("Client deleted");
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
    if (!window.confirm(`Delete ${selectedRows.length} clients?`)) return;
    await Promise.all(selectedRows.map((id) => deleteClient(id)));
    setClients((prev) => prev.filter((c) => !selectedRows.includes(c.id)));
    setSelectedRows([]);
    toast.success("Deleted selected clients");
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

  /* print */
  const handlePrint = (client) => {
    const name = client.company_name || "—";
    const win = window.open("", "_blank", "width=700,height=600");
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Client — ${name}</title>
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
            <h1>Client Profile</h1>
            <p>Generated ${new Date().toLocaleString()}</p>
          </div>
          <span class="badge">${client.verification_status_display || client.verification_status || "—"}</span>
        </div>
        <table>
          <tr><td>ID</td><td>#${client.id}</td></tr>
          <tr><td>Company Name</td><td>${name}</td></tr>
          <tr><td>Email</td><td>${client.email || "—"}</td></tr>
          <tr><td>Phone</td><td>${client.phone || "—"}</td></tr>
          <tr><td>Location</td><td>${client.location || "—"}</td></tr>
          <tr><td>Status</td><td>${client.verification_status_display || client.verification_status || "—"}</td></tr>
        </table>
        <div class="footer">Clients Management System</div>
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
      <div className="p-4 sm:p-8">
        <div className="bg-white p-8 text-center rounded-xl shadow flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-blue-500" size={28} />
          <span className="text-gray-500 text-sm">Loading clients…</span>
        </div>
      </div>
    );
  }

  /* ── RENDER ── */
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Clients Management
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage all registered clients
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={fetchClients}
            className="px-3 py-2 bg-yellow-300 hover:bg-yellow-400 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <RefreshCw size={14} />
            <span className="hidden xs:inline">Refresh</span>
          </button>

          <button
            onClick={() => navigate("/admin/create/client")}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Add Client
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
        <StatusFilter
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>
      {/* BULK ACTION BAR */}
      {selectedRows.length > 0 && (
        <div className="flex flex-wrap justify-between items-center bg-blue-50 border border-blue-200 p-3 rounded-xl mb-3 gap-2">
          <span className="text-sm text-blue-700 font-medium">
            {selectedRows.length} client{selectedRows.length > 1 ? "s" : ""}{" "}
            selected
          </span>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg flex items-center gap-1.5 text-sm hover:bg-gray-50 transition-colors"
            >
              <Download size={13} />
              Export
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-160">
            <thead className="bg-gray-50 border-b border-gray-200">
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
                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
                  ID
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
                  Phone
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
                  Location
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
                  Client Type
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600 w-16">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-gray-400 text-sm"
                  >
                    No clients found
                  </td>
                </tr>
              ) : (
                filteredClients.map((c, index) => (
                  <tr
                    key={c.id}
                    onClick={() => openViewModal(c)}
                    className={`cursor-pointer transition-colors hover:bg-blue-50
                      ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
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

                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      #{c.id}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-45 truncate">
                      {c.email}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {c.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {c.location || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {c.client_type && c.client_type === "individual"
                        ? "Individual"
                        : "Company"}
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
                        client={c}
                        className="w-44 max-h-[80vh] overflow-y-auto bg-white rounded-xl border border-gray-200 shadow-2xl"
                        onView={openViewModal}
                        onEdit={(client) =>
                          navigate(`/admin/edit/client/${client.id}`)
                        }
                        onDelete={handleDeleteClient}
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
        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
          Showing {filteredClients.length} of {clients.length} clients
        </div>
      </div>

      {/* VIEW MODAL */}
      {isViewModalOpen && selectedClient && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Client Details
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex border-b border-gray-200 mb-4">
              {selectedClient.client_type === "individual" ? (
                <>
                  <button
                    onClick={() => setActiveTab("personal")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "personal"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    Personal
                  </button>

                  <button
                    onClick={() => setActiveTab("contact")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "contact"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    Contact
                  </button>

                  <button
                    onClick={() => setActiveTab("others")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "others"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    Others
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab("company")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "company"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    Company
                  </button>

                  <button
                    onClick={() => setActiveTab("contact")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "contact"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    Contact
                  </button>

                  <button
                    onClick={() => setActiveTab("others")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "others"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    Others
                  </button>
                </>
              )}
            </div>

            <div className="space-y-3 text-sm">
              {activeTab === "personal" &&
                selectedClient.client_type === "individual" && (
                  <>
                    <div className="flex gap-2">
                      <span className="font-semibold text-gray-500 w-32">
                        First Name
                      </span>
                      <span>{selectedClient.first_name || "—"}</span>
                    </div>

                    <div className="flex gap-2">
                      <span className="font-semibold text-gray-500 w-32">
                        Last Name
                      </span>
                      <span>{selectedClient.last_name || "—"}</span>
                    </div>
                  </>
                )}

              {activeTab === "company" &&
                selectedClient.client_type === "company" && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-500 w-32">
                      Company Name
                    </span>
                    <span>{selectedClient.company_name || "—"}</span>
                  </div>
                )}

              {activeTab === "contact" && (
                <>
                  {selectedClient.client_type === "company" && (
                    <>
                      <div className="flex gap-2">
                        <span className="font-semibold text-gray-500 w-32">
                          Contact First Name
                        </span>
                        <span>{selectedClient.first_name || "—"}</span>
                      </div>

                      <div className="flex gap-2">
                        <span className="font-semibold text-gray-500 w-32">
                          Contact Last Name
                        </span>
                        <span>{selectedClient.last_name || "—"}</span>
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-500 w-32">
                      Email
                    </span>
                    <span>{selectedClient.email || "—"}</span>
                  </div>

                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-500 w-32">
                      Phone
                    </span>
                    <span>{selectedClient.phone || "—"}</span>
                  </div>
                </>
              )}

              {activeTab === "others" && (
                <>
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-500 w-32">ID</span>
                    <span>#{selectedClient.id}</span>
                  </div>

                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-500 w-32">
                      Location
                    </span>
                    <span>{selectedClient.location || "—"}</span>
                  </div>

                  <div className="flex gap-2 items-center">
                    <span className="font-semibold text-gray-500 w-32">
                      Status
                    </span>

                    <StatusBadge
                      status={selectedClient.verification_status}
                      label={selectedClient.verification_status_display}
                    />
                  </div>

                  {selectedClient.client_type === "individual" && (
                    <div className="flex gap-2">
                      <span className="font-semibold text-gray-500 w-32">
                        National ID
                      </span>
                      <span>{selectedClient.national_id || "—"}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  navigate(`/admin/edit/client/${selectedClient.id}`);
                  closeModal();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Edit size={13} />
                Edit
              </button>
              <button
                onClick={() => handlePrint(selectedClient)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
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

export default Clients;

/* Status Filter*/
export function StatusFilter({ statusFilter, setStatusFilter }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const options = [
    { label: "All Status", value: "all" },
    { label: "Under Review", value: "pending" },
    { label: "Verified", value: "verified" },
    { label: "Not Verified", value: "unverified" },
    { label: "Rejected", value: "rejected" },
  ];

  const selected = options.find((o) => o.value === statusFilter);

  // close on outside click
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
      <label className="text-xs font-medium text-gray-600 mb-1 block">
        Filter By Status
      </label>

      {/* BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm 
                   border border-gray-200 bg-white rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        <span className="text-gray-800 flex items-center gap-2">
          {selected?.label}

          {/* ACTIVE DOT */}
          {statusFilter !== "all" && (
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          )}
        </span>

        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                setStatusFilter(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer transition hover:bg-gray-100
                ${statusFilter === opt.value ? "bg-gray-50 font-medium" : ""}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
