import React, { useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import { handleUserPrint } from "../../../utils/userPrint";
import { gregorianToEthiopian } from "../../../utils/gregorianToEthiopian";

function UserViewModal({ isOpen, user, onClose, onEdit }) {
    const { t } = useTranslation();
    const { full_name } = useAuth();
    const [activeTab, setActiveTab] = useState("info");

    if (!isOpen || !user) return null;

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[0.5px] flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={onClose}
        >
            <div
                className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl bg-white dark:bg-gray-800 
                rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* MODAL HEADER */}
                <div
                    className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 
                    border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                        {t("all_users.view_modal.title")}
                    </h2>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {/* TABS */}
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

                            {/* FIRST NAME */}
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                                <p className="text-xs text-gray-800 dark:text-white">
                                    {t("all_users.view_modal.labels.first_name")}
                                </p>
                                <p className="text-gray-900 dark:text-white">
                                    {user.first_name || "-"}
                                </p>
                            </div>

                            {/* LAST NAME */}
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                                <p className="text-xs text-gray-800 dark:text-white">
                                    {t("all_users.view_modal.labels.last_name")}
                                </p>
                                <p className="text-gray-900 dark:text-white">
                                    {user.last_name || "-"}
                                </p>
                            </div>
                            {/* GENDER */}
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                                <p className="text-xs text-gray-800 dark:text-white">
                                    {t("all_users.view_modal.labels.gender")}
                                </p>
                                <p className="capitalize text-gray-900 dark:text-white">
                                    {user.gender || "-"}
                                </p>
                            </div>

                            {/* DATE OF BIRTH */}
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                                <p className="text-xs text-gray-800 dark:text-white">
                                    {t("all_users.view_modal.labels.date_of_birth")}
                                </p>
                                <p className="text-gray-900 dark:text-white">
                                    {user.date_of_birth
                                        ? `${gregorianToEthiopian(user.date_of_birth)} ${t("date_picker.ec")}`
                                        : "-"}                                </p>
                            </div>

                            {/* EMAIL */}
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                                <p className="text-xs text-gray-800 dark:text-white">
                                    {t("all_users.view_modal.labels.email")}
                                </p>
                                <p className="break-all text-gray-900 dark:text-white">
                                    {user.email || "-"}
                                </p>
                            </div>

                            {/* PHONE */}
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                                <p className="text-xs text-gray-800 dark:text-white">
                                    {t("all_users.view_modal.labels.phone")}
                                </p>
                                <p className="text-gray-900 dark:text-white">
                                    {user.phone || "-"}
                                </p>
                            </div>



                            {/* USER TYPE */}
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                                <p className="text-xs text-gray-800 dark:text-white">
                                    {t("all_users.view_modal.labels.user_type")}
                                </p>
                                <p className="capitalize text-gray-900 dark:text-white">
                                    {user.user_type}
                                </p>
                            </div>

                            {/* STATUS */}
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                                <p className="text-xs text-gray-800 dark:text-white">
                                    {t("all_users.view_modal.labels.status")}
                                </p>
                                <p
                                    className={
                                        user.is_active
                                            ? "text-green-500 font-semibold"
                                            : "text-red-500 font-semibold"
                                    }
                                >
                                    {user.is_active
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
                                <p className="text-gray-900 dark:text-white">#{user.id}</p>
                            </div>

                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                                <p className="text-xs text-gray-800 dark:text-white">
                                    {t("all_users.view_modal.labels.superuser")}
                                </p>
                                <p className="text-gray-900 dark:text-white">
                                    {user.is_superuser
                                        ? t("all_users.view_modal.labels.yes")
                                        : t("all_users.view_modal.labels.no")}
                                </p>
                            </div>

                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                                <p className="text-xs text-gray-800 dark:text-white">
                                    {t("all_users.view_modal.labels.staff")}
                                </p>
                                <p className="text-gray-900 dark:text-white">
                                    {user.is_staff
                                        ? t("all_users.view_modal.labels.yes")
                                        : t("all_users.view_modal.labels.no")}
                                </p>
                            </div>

                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                                <p className="text-xs text-gray-800 dark:text-white">
                                    {t("all_users.view_modal.labels.registered")}
                                </p>
                                <p className="text-xs text-gray-900 dark:text-white">
                                    {user.registered_date
                                        ? new Date(user.registered_date).toLocaleString()
                                        : "-"}
                                </p>
                            </div>

                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                                <p className="text-xs text-gray-800 dark:text-white">
                                    {t("all_users.view_modal.labels.last_update")}
                                </p>
                                <p className="text-xs text-gray-900 dark:text-white">
                                    {user.last_update
                                        ? new Date(user.last_update).toLocaleString()
                                        : "-"}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === "profile" && (
                        <div className="space-y-4">
                            {user?.client && (
                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-blue-600">
                                            {`${t("all_users.view_modal.labels.client")} (${user.client.client_type === "company"
                                                ? t("all_users.view_modal.labels.company")
                                                : t("all_users.view_modal.labels.individual")
                                                })`}
                                        </span>
                                        <span className="text-xs text-blue-600">
                                            {t("all_users.table.id")} #{user.client.id}
                                        </span>
                                    </div>

                                    <p className="mt-2 font-semibold text-blue-900 dark:text-blue-200">
                                        {user.client.client_type === "company"
                                            ? `${t("all_users.view_modal.labels.company")}: ${user.client.company_name || "N/A"
                                            }`
                                            : `${t("all_users.view_modal.labels.name")}: ${full_name || "N/A"
                                            }`}
                                    </p>
                                </div>
                            )}

                            {user?.worker && (
                                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-green-600">
                                            {t("all_users.view_modal.labels.worker")}
                                        </span>
                                        <span className="text-xs text-green-600">
                                            {t("all_users.table.id")} #{user.worker.id}
                                        </span>
                                    </div>

                                    <p className="mt-2 font-semibold text-green-900 dark:text-green-200">
                                        {user.worker.first_name} {user.worker.last_name}
                                    </p>
                                </div>
                            )}

                            {user.user_type === "admin" && (
                                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900">
                                    <span className="text-xs font-bold text-purple-600">
                                        {t("all_users.view_modal.labels.admin")}
                                    </span>
                                    <p className="mt-2 text-purple-900 dark:text-purple-200 font-semibold">
                                        {t("all_users.view_modal.labels.system_admin")}
                                    </p>
                                </div>
                            )}

                            {!user.client &&
                                !user.worker &&
                                user.user_type !== "admin" && (
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
                                onEdit(user);
                                onClose();
                            }}
                            className="flex-1 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium cursor-pointer"
                        >
                            {t("all_users.view_modal.buttons.edit")}
                        </button>

                        <button
                            onClick={() => handleUserPrint(user, t)}
                            className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white font-medium cursor-pointer"
                        >
                            {t("all_users.view_modal.buttons.print")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserViewModal;