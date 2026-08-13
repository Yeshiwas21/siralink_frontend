import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";

/* Status Filter */
export default function AllUsersStatusFilter({ statusFilter, setStatusFilter }) {
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
                className="w-full flex items-center justify-between px-3 py-2 text-sm  border border-gray-200 dark:border-gray-600
                   bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200  rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
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
                    className="absolute z-50 mt-1 w-full  bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                        rounded-lg shadow-lg overflow-hidden   transition-colors"
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