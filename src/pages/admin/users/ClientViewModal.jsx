import React, { useEffect, useState } from "react";
import { X, Edit, Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import StatusBadge from "../../../components/common/StatusBadge";
import { handlePrintClient } from "../../../utils/clientPrint";

function ClientViewModal({ isOpen, client, onClose, onEdit }) {
    const { t } = useTranslation();

    // Determine initial tab directly based on client prop
    const defaultTab = client?.client_type === "company" ? "company" : "personal";
    const [activeTab, setActiveTab] = useState(defaultTab);

    // Sync state if client ID changes, without using a synchronous effect body
    const [prevClientId, setPrevClientId] = useState(client?.id);
    if (client?.id !== prevClientId) {
        setPrevClientId(client?.id);
        setActiveTab(defaultTab);
    }

    // Manage body scroll locking
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

    if (!isOpen || !client) return null;

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[0.5px] flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {t("clients.modal.title")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-100 transition-colors cursor-pointer"
                    >
                        <X size={18} strokeWidth={2.8} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                    {client.client_type === "individual" ? (
                        <>
                            <button
                                onClick={() => setActiveTab("personal")}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === "personal"
                                    ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                                    : "text-gray-500 dark:text-gray-400"
                                    }`}
                            >
                                {t("clients.modal.tabs.personal")}
                            </button>

                            <button
                                onClick={() => setActiveTab("contact")}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === "contact"
                                    ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                                    : "text-gray-500 dark:text-gray-400"
                                    }`}
                            >
                                {t("clients.modal.tabs.contact")}
                            </button>

                            <button
                                onClick={() => setActiveTab("others")}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === "others"
                                    ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                                    : "text-gray-500 dark:text-gray-400"
                                    }`}
                            >
                                {t("clients.modal.tabs.others")}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setActiveTab("company")}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === "company"
                                    ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                                    : "text-gray-500 dark:text-gray-400"
                                    }`}
                            >
                                {t("clients.modal.tabs.company")}
                            </button>

                            <button
                                onClick={() => setActiveTab("contact")}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === "contact"
                                    ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                                    : "text-gray-500 dark:text-gray-400"
                                    }`}
                            >
                                {t("clients.modal.tabs.contact")}
                            </button>

                            <button
                                onClick={() => setActiveTab("others")}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === "others"
                                    ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                                    : "text-gray-500 dark:text-gray-400"
                                    }`}
                            >
                                {t("clients.modal.tabs.others")}
                            </button>
                        </>
                    )}
                </div>

                {/* Tab Content */}
                <div className="space-y-3 text-sm">
                    {activeTab === "personal" && client.client_type === "individual" && (
                        <>
                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                    {t("clients.fields.first_name")}
                                </span>
                                <span className="text-gray-900 dark:text-gray-200">
                                    {client.first_name || "—"}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                    {t("clients.fields.last_name")}
                                </span>
                                <span className="text-gray-900 dark:text-gray-200">
                                    {client.last_name || "—"}
                                </span>
                            </div>
                        </>
                    )}

                    {activeTab === "company" && client.client_type === "company" && (
                        <div className="flex gap-2">
                            <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                {t("clients.fields.company_name")}
                            </span>
                            <span className="text-gray-900 dark:text-gray-200">
                                {client.company_name || "—"}
                            </span>
                        </div>
                    )}

                    {activeTab === "contact" && (
                        <>
                            {client.client_type === "company" && (
                                <>
                                    <div className="flex gap-2">
                                        <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                            {t("clients.fields.contact_first_name")}
                                        </span>
                                        <span className="text-gray-900 dark:text-gray-200">
                                            {client.first_name || "—"}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                            {t("clients.fields.contact_last_name")}
                                        </span>
                                        <span className="text-gray-900 dark:text-gray-200">
                                            {client.last_name || "—"}
                                        </span>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                    {t("clients.fields.email")}
                                </span>
                                <span className="text-gray-900 dark:text-gray-200">
                                    {client.email || "—"}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                    {t("clients.fields.phone")}
                                </span>
                                <span className="text-gray-900 dark:text-gray-200">
                                    {client.phone || "—"}
                                </span>
                            </div>
                        </>
                    )}

                    {activeTab === "others" && (
                        <>
                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                    {t("clients.fields.id")}
                                </span>
                                <span className="text-gray-900 dark:text-gray-200">
                                    #{client.id}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                    {t("clients.fields.location")}
                                </span>
                                <span className="text-gray-900 dark:text-gray-200">
                                    {client.location || "—"}
                                </span>
                            </div>

                            <div className="flex gap-2 items-center">
                                <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                    {t("clients.fields.status")}
                                </span>

                                <StatusBadge
                                    status={client.verification_status}
                                    label={client.verification_status_display}
                                />
                            </div>

                            {client.client_type === "individual" && (
                                <div className="flex gap-2">
                                    <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                        {t("clients.fields.national_id")}
                                    </span>
                                    <span className="text-gray-900 dark:text-gray-200">
                                        {client.national_id || "—"}
                                    </span>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                    {t("clients.fields.joined_on")}
                                </span>
                                <span className="text-gray-900 dark:text-gray-200">
                                    {client.joined_on ?
                                        new Date(client.joined_on).toLocaleDateString()
                                        : "—"
                                    }
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400 w-32">
                                    {t("clients.fields.last_update")}
                                </span>
                                <span className="text-gray-900 dark:text-gray-200">
                                    {client.last_update ?
                                        new Date(client.last_update).toLocaleDateString()
                                        : "—"
                                    }
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex gap-2 mt-6">
                    <button
                        onClick={() => {
                            onEdit(client);
                            onClose();
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <Edit size={13} />
                        {t("clients.edit")}
                    </button>
                    <button
                        onClick={() => handlePrintClient(client)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <Printer size={13} />
                        {t("clients.print")}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ClientViewModal;