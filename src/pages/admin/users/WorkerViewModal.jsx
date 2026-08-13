import React, { useState, useEffect } from "react";
import { X, Edit, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import StatusBadge from "../../../components/common/StatusBadge";
import { handlePrintWorker } from "../../../utils/workerPrint"

function WorkerViewModal({ isOpen, worker, onClose }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("personal");

    // Prevent background body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen || !worker) return null;

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[0.5px] flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl border border-transparent dark:border-gray-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {t("workers.modal.title")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* TABS */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                    <button
                        onClick={() => setActiveTab("personal")}
                        className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${activeTab === "personal"
                            ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400"
                            }`}
                    >
                        {t("workers.modal.tabs.personal")}
                    </button>

                    <button
                        onClick={() => setActiveTab("contact")}
                        className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${activeTab === "contact"
                            ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400"
                            }`}
                    >
                        {t("workers.modal.tabs.contact")}
                    </button>

                    <button
                        onClick={() => setActiveTab("others")}
                        className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${activeTab === "others"
                            ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400"
                            }`}
                    >
                        {t("workers.modal.tabs.others")}
                    </button>
                </div>

                {/* CONTENT */}
                <div className="space-y-3 text-sm text-gray-800 dark:text-gray-200">
                    {activeTab === "personal" && (
                        <>
                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                    {t("workers.modal.fields.firstName")}
                                </span>
                                <span>{worker.first_name || "—"}</span>
                            </div>

                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                    {t("workers.modal.fields.lastName")}
                                </span>
                                <span>{worker.last_name || "—"}</span>
                            </div>
                        </>
                    )}

                    {activeTab === "contact" && (
                        <>
                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                    {t("workers.modal.fields.email")}
                                </span>
                                <span className="truncate">{worker.email || "—"}</span>
                            </div>

                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                    {t("workers.modal.fields.phone")}
                                </span>
                                <span>{worker.phone || "—"}</span>
                            </div>
                        </>
                    )}

                    {activeTab === "others" && (
                        <>
                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                    {t("workers.modal.fields.id")}
                                </span>
                                <span>#{worker.id}</span>
                            </div>

                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                    {t("workers.modal.fields.location")}
                                </span>
                                <span>{worker.location || "—"}</span>
                            </div>

                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                    {t("workers.modal.fields.nationalId")}
                                </span>
                                <span>{worker.national_id || "—"}</span>
                            </div>

                            <div className="flex gap-2 items-center">
                                <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                    {t("workers.modal.fields.status")}
                                </span>
                                <StatusBadge
                                    status={worker.verification_status}
                                    label={worker.verification_status_display}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 mt-6">
                    <button
                        onClick={() => {
                            navigate(`/admin/edit/worker/${worker.id}`);
                            onClose();
                        }}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <Edit size={13} />
                        {t("workers.modal.buttons.edit")}
                    </button>

                    <button
                        onClick={() => handlePrintWorker(worker)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <Printer size={13} />
                        {t("workers.modal.buttons.print")}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WorkerViewModal;