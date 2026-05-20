import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { listWorker, deleteWorker } from "../../../services/userServices";
import { StatCard } from "./AllUsers";
import {
  Users,
  Search,
  RefreshCw,
  CircleCheck,
  BadgeAlert,
  Download,
  MoreHorizontal,
} from "lucide-react";

function Workers() {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedRows, setSelectedRows] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".action-menu")) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const data = await listWorker();
      setWorkers(data);
      setFilteredWorkers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let data = [...workers];

    if (searchTerm.trim()) {
      data = data.filter(
        (w) =>
          w.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.phone?.includes(searchTerm) ||
          w.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(w.id).includes(searchTerm),
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((w) =>
        statusFilter === "verified" ? w.verified == 1 : w.verified == 0,
      );
    }

    setFilteredWorkers(data);
  }, [searchTerm, workers, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: workers.length,
      verified: workers.filter((w) => w.verified == 1).length,
      unverified: workers.filter((w) => w.verified == 0).length,
    };
  }, [workers]);

  const openViewModal = (worker) => {
    setSelectedWorker(worker);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setSelectedWorker(null);
    setIsViewModalOpen(false);
  };

  const handleDeleteWorker = async (id) => {
    if (!window.confirm("Delete this worker?")) return;

    await deleteWorker(id);
    setWorkers((prev) => prev.filter((w) => w.id !== id));
    toast.success("Deleted");
  };

  /* ---------------- MULTI SELECT ---------------- */
  const toggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedRows.length === filteredWorkers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredWorkers.map((w) => w.id));
    }
  };
  const allSelected =
    selectedRows.length === filteredWorkers.length &&
    filteredWorkers.length > 0;

  const someSelected =
    selectedRows.length > 0 && selectedRows.length < filteredWorkers.length;

  const handleBulkDelete = async () => {
    if (!window.confirm("Delete selected workers?")) return;

    await Promise.all(selectedRows.map((id) => deleteWorker(id)));
    setWorkers((prev) => prev.filter((w) => !selectedRows.includes(w.id)));
    setSelectedRows([]);
    toast.success("Deleted selected");
  };

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
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white p-8 text-center rounded-xl shadow">
          <RefreshCw className="animate-spin mx-auto mb-2" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <header className="flex justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Workers Management</h1>
          <p className="text-gray-500">Manage all registered workers</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchWorkers}
            className="px-4 py-2 bg-yellow-300 rounded-lg flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          <button
            onClick={() => navigate("/admin/create/worker")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            + Add Worker
          </button>
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard title="Total" value={stats.total} icon={<Users />} />

        <StatCard
          title="Verified"
          value={stats.verified}
          icon={<CircleCheck />}
        />

        <StatCard
          title="Unverified"
          value={stats.unverified}
          icon={<BadgeAlert />}
        />
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white p-4 rounded-xl shadow border mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" />

          <input
            className="w-full pl-10 p-2 border rounded-lg"
            placeholder="Search by ID, email, name, phone, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="unverified">Not Verified</option>
        </select>
      </div>

      {/* ACTION BAR */}
      {selectedRows.length > 0 && (
        <div className="flex justify-between items-center bg-white p-3 rounded-xl mb-3 shadow">
          <span>{selectedRows.length} selected</span>

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
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-linear-to-r text-left">
            <tr>
              <th className="p-3 w-12 text-center align-middle">
                <input
                  type="checkbox"
                  className="w-4 h-4 mx-auto block"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                />
              </th>

              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredWorkers.map((w, index) => (
              <tr
                key={w.id}
                onClick={() => openViewModal(w)}
                className={`cursor-pointer transition hover:bg-blue-50
                ${index % 2 === 0 ? "bg-white" : "bg-gray-50/40"}
              `}
              >
                <td
                  className="p-3 w-12 text-center align-middle"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 mx-auto block"
                    checked={selectedRows.includes(w.id)}
                    onChange={() => toggleRow(w.id)}
                  />
                </td>
                <td className="px-6 py-4">{w.id}</td>
                <td className="px-6 py-4 font-semibold">
                  {[w.first_name, w.last_name].filter(Boolean).join(" ") || "—"}
                </td>

                <td className="px-6 py-4">{w.email}</td>
                <td className="px-6 py-4">{w.phone}</td>
                <td className="p-3">{w.location}</td>

                <td className="px-6 py-4">
                  <span className={"px-2 py-1 text-xs rounded-full"}>
                    {w.verified ? "Verified" : "Not Verified"}
                  </span>
                </td>

                {/* ACTIONS */}
                <td
                  className="px-6 py-2 relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setOpenMenu(openMenu === w.id ? null : w.id)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <MoreHorizontal />
                  </button>

                  {openMenu === w.id && (
                    <div
                      className="action-menu absolute right-0 mt-2 w-44 bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          openViewModal(w);
                          setOpenMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-all duration-150"
                      >
                        View
                      </button>

                      <button
                        onClick={() => {
                          navigate(`/admin/edit/worker/${w.id}`);
                          setOpenMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition-all duration-150"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          handleDeleteWorker(w.id);
                          setOpenMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-150"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isViewModalOpen && selectedWorker && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Worker Details</h2>

            <div className="space-y-2 text-sm">
              <p>
                <b>ID:</b> #{selectedWorker.id}
              </p>

              <p>
                <b>Name:</b>{" "}
                {[selectedWorker.first_name, selectedWorker.last_name]
                  .filter(Boolean)
                  .join(" ") || "—"}
              </p>

              <p>
                <b>Email:</b> {selectedWorker.email}
              </p>

              <p>
                <b>Phone:</b> {selectedWorker.phone}
              </p>

              <p>
                <b>Location:</b> {selectedWorker.location}
              </p>

              <p>
                <b>Status:</b>{" "}
                {selectedWorker.verified ? "Verified" : "Not Verified"}
              </p>
            </div>

            <button
              onClick={closeModal}
              className="mt-5 px-4 py-2 bg-gray-200 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Workers;
