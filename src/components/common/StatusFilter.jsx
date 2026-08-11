import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

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
                Filter By Status
            </label>

            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm 
                   border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 transition-colors"
            >
                <span className="text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    {selected?.label}

                    {statusFilter !== "all" && (
                        <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></span>
                    )}
                </span>

                <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg dark:shadow-2xl overflow-hidden">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            onClick={() => {
                                setStatusFilter(opt.value);
                                setOpen(false);
                            }}
                            className={`px-3 py-2 text-sm cursor-pointer transition text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800
                ${statusFilter === opt.value
                                    ? "bg-gray-50 dark:bg-gray-800/60 font-medium text-gray-900 dark:text-white"
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

export default StatusFilter;