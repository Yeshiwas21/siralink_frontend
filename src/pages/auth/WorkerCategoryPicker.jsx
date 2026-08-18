// CategoryPicker.jsx
import React, { useState } from "react";

export function WorkerCategoryPicker({ categories, value, onChange, error, loading, t, inputClass }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const selectedCategory = categories.find((c) => String(c.id) === String(value));
    const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (catId) => {
        onChange(catId); // Replaces selection with the single clicked ID
        setIsOpen(false);
        setSearch("");
    };

    return (
        <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("workerSignup.category")}
            </label>

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                disabled={loading}
                className={`${inputClass("category")} flex items-center justify-between w-full text-left cursor-pointer`}
            >
                <span className={!selectedCategory ? "text-gray-400 dark:text-gray-500" : ""}>
                    {loading
                        ? t("workerSignup.loadingCategories")
                        : selectedCategory
                            ? selectedCategory.name
                            : t("workerSignup.selectCategory")}
                </span>
                <svg
                    className="w-4 h-4 text-gray-400 shrink-0 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Error Message */}
            {error && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {error}
                </p>
            )}

            {/* Mobile Modal / Bottom Sheet */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[80vh] flex flex-col shadow-xl border border-gray-200 dark:border-gray-800">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-base text-gray-900 dark:text-white">
                                {t("workerSignup.selectCategory")}
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    setSearch("");
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg rounded-lg"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="mb-3">
                            <input
                                type="text"
                                placeholder={t("workerSignup.searchCategoryPlaceholder") || "Search category..."}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                                autoFocus
                            />
                        </div>

                        {/* Single-Selection List */}
                        <div className="overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 flex-1 max-h-60">
                            {filtered.length === 0 ? (
                                <p className="py-4 text-center text-sm text-gray-400">
                                    {t("workerSignup.noCategoriesFound") || "No categories found"}
                                </p>
                            ) : (
                                filtered.map((cat) => {
                                    const isSelected = String(value) === String(cat.id);
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => handleSelect(cat.id)}
                                            className={`w-full text-left py-3 px-3 text-sm flex items-center justify-between rounded-lg transition-colors ${isSelected
                                                ? "bg-gray-100 dark:bg-gray-800 font-semibold text-black dark:text-white"
                                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                }`}
                                        >
                                            <span>{cat.name}</span>
                                            {isSelected && (
                                                <span className="text-black dark:text-white font-bold text-sm">✓</span>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}