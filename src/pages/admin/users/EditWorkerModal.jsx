import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { updateWorker } from "../../../services/userServices";
import { listWorkerCategory } from "../../../services/categoryServices";
import { translateApiError } from "../../../utils/translateApiError";
import { WorkerCategoryPicker } from "../../auth/WorkerCategoryPicker";

export default function EditWorkerModal({
    isEditOpen,
    formData,
    setFormData,
    editErrors,
    setEditErrors,
    onEditClose,
    onEditSuccess,
}) {
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    const { t } = useTranslation();

    const VERIFICATION_STATUS_OPTIONS = [
        { value: "unverified", label: t("workers.verification.unverified", "Unverified") },
        { value: "pending", label: t("workers.verification.pending", "Pending") },
        { value: "verified", label: t("workers.verification.verified", "Verified") },
        { value: "rejected", label: t("workers.verification.rejected", "Rejected") },
    ];

    useEffect(() => {
        if (isEditOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isEditOpen]);

    useEffect(() => {
        if (!isEditOpen) return;

        const loadCategories = async () => {
            setLoadingCategories(true);
            try {
                const response = await listWorkerCategory();
                const categoryData = Array.isArray(response)
                    ? response
                    : Array.isArray(response?.data)
                        ? response.data
                        : Array.isArray(response?.data?.results)
                            ? response.data.results
                            : Array.isArray(response?.results)
                                ? response.results
                                : [];
                setCategories(categoryData);
            } catch (error) {
                console.error("Failed to load worker categories:", error);
                setCategories([]);
            } finally {
                setLoadingCategories(false);
            }
        };

        loadCategories();
    }, [isEditOpen]);

    if (!isEditOpen || !formData) return null;

    const userEmail = formData?.email || t("workers.labels.not_provided", "N/A");

    const validateTextField = (value) => {
        const val = value?.trim();
        if (!val || val.length < 2) {
            return t("workerSignup.validation.min2Chars");
        }
        if (!/^\p{L}/u.test(val)) {
            return t("workerSignup.validation.textLetterStart");
        }
        if (!/^[\p{L}\s]+$/u.test(val)) {
            return t("workerSignup.validation.lettersOnly");
        }
        return null;
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.category) {
            newErrors.category = t("workerSignup.validation.categoryRequired");
        }

        if (!formData.national_id?.trim()) {
            newErrors.national_id = t("workerSignup.validation.nationalIdInvalid");
        }

        const locationError = validateTextField(formData.location);
        if (locationError) newErrors.location = locationError;

        if (
            formData.experience_years !== "" &&
            formData.experience_years != null &&
            Number(formData.experience_years) < 0
        ) {
            newErrors.experience_years = t("workers.edit_modal.experience_invalid", "Experience years cannot be negative");
        }

        return newErrors;
    };

    const parseErrors = (errData) => {
        const newErrors = {};

        if (!errData || typeof errData !== "object") {
            return { general: t("backendErrors.generic", "An error occurred") };
        }

        if (errData.detail) {
            newErrors.general = translateApiError(t, "detail", errData.detail);
            return newErrors;
        }

        Object.entries(errData).forEach(([key, value]) => {
            if (key === "non_field_errors") {
                newErrors.general = translateApiError(t, key, value);
                return;
            }

            if (typeof value === "object" && !Array.isArray(value) && value !== null) {
                Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                    newErrors[nestedKey] = translateApiError(t, `${key}.${nestedKey}`, nestedValue);
                });
                return;
            }

            if (Array.isArray(value)) {
                newErrors[key] = value.map((item) => translateApiError(t, key, item)).join(" ");
            } else {
                newErrors[key] = translateApiError(t, key, value);
            }
        });

        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setEditErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFormData((prev) => ({ ...prev, profile_image: file }));
        setEditErrors((prev) => ({ ...prev, profile_image: "" }));
    };

    const handleSave = async () => {
        const validationErrors = validate();
        setEditErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        const selectedCategoryId =
            typeof formData.category === "object" && formData.category !== null
                ? formData.category.id
                : formData.category;

        const selectedCategoryObject =
            typeof formData.category === "object" && formData.category !== null
                ? formData.category
                : categories.find((cat) => String(cat.id) === String(selectedCategoryId)) || null;

        const payload = {
            category: selectedCategoryId || null,
            national_id: formData.national_id?.trim() || null,
            skills: formData.skills?.trim() || "",
            bio: formData.bio?.trim() || "",
            experience_years: formData.experience_years === "" ? 0 : Number(formData.experience_years),
            portfolio_link: formData.portfolio_link?.trim() || "",
            location: formData.location?.trim() || "",
            verification_status: formData.verification_status || "unverified",
        };

        let requestData = payload;

        if (formData.profile_image instanceof File) {
            requestData = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                requestData.append(key, value ?? "");
            });
            requestData.append("profile_image", formData.profile_image);
        }

        try {
            const response = await updateWorker(formData.id, requestData);
            const returnedData = response?.data || {};

            const updatedWorker = {
                ...formData,
                ...payload,
                ...returnedData,
                category:
                    typeof returnedData.category === "object" && returnedData.category !== null
                        ? returnedData.category
                        : selectedCategoryObject,
            };

            onEditSuccess(updatedWorker);
        } catch (err) {
            const backendErrors = parseErrors(err?.response?.data);
            setEditErrors(backendErrors);
        }
    };

    const inputClass = (field) =>
        `w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
        text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 
        focus:outline-none focus:ring-4 focus:ring-blue-500/15 dark:focus:ring-blue-500/15 
        focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200
        ${editErrors[field] ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`;

    const labelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1";

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[0.5px] flex items-center justify-center z-50 p-4 sm:p-6 transition-opacity"
            onClick={onEditClose}
        >
            <div
                className="w-full max-w-2xl rounded-2xl shadow-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t("workers.edit_modal.title")}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t("workers.edit_modal.subtitle")}
                    </p>
                </div>

                {/* FORM BODY */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {editErrors.general && (
                        <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/30 flex items-center gap-2">
                            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {editErrors.general}
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-3 p-3.5 bg-blue-50/60 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/40">
                        <div className="flex items-center gap-2 min-w-0">
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 shrink-0">
                                {t("workers.modal.fields.email")}:
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {userEmail}
                            </span>
                        </div>
                    </div>

                    {/* WORKER FIELDS */}
                    <div className="space-y-4 pt-1">
                        <div className="pb-2 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                {t("workers.sections.worker_info")}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <WorkerCategoryPicker
                                    categories={categories}
                                    value={formData.category}
                                    onChange={(catId) => {
                                        setFormData({ ...formData, category: catId });
                                        setEditErrors({ ...editErrors, category: "" });
                                    }}
                                    error={editErrors.category}
                                    loading={loadingCategories}
                                    t={t}
                                    inputClass={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    {t("workers.modal.fields.status")}
                                </label>
                                <select
                                    name="verification_status"
                                    value={formData.verification_status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none"
                                >
                                    <option value="pending">{t("clients.status_options.pending")}</option>
                                    <option value="verified">{t("clients.status_options.verified")}</option>
                                    <option value="unverified">{t("clients.status_options.unverified")}</option>
                                    <option value="rejected">{t("clients.status_options.rejected")}</option>
                                </select>
                                {editErrors.verification_status && (
                                    <p className="text-red-500 text-xs mt-1.5 ml-1">{editErrors.verification_status}</p>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>
                                    {t("workers.modal.fields.nationalId")}
                                </label>
                                <input
                                    name="national_id"
                                    value={formData.national_id || ""}
                                    onChange={handleChange}
                                    className={inputClass("national_id")}
                                    placeholder={t("workers.placeholders.national_id")}
                                />
                                {editErrors.national_id && <p className="text-red-500 text-xs mt-1.5 ml-1">{editErrors.national_id}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>
                                    {t("workers.modal.fields.location")}
                                </label>
                                <input
                                    name="location"
                                    value={formData.location || ""}
                                    onChange={handleChange}
                                    className={inputClass("location")}
                                    placeholder={t("workers.placeholders.location")}
                                />
                                {editErrors.location && <p className="text-red-500 text-xs mt-1.5 ml-1">{editErrors.location}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>
                                    {t("workers.modal.fields.experience")}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    name="experience_years"
                                    value={formData.experience_years ?? ""}
                                    onChange={handleChange}
                                    className={inputClass("experience_years")}
                                    placeholder="0"
                                />
                                {editErrors.experience_years && <p className="text-red-500 text-xs mt-1.5 ml-1">{editErrors.experience_years}</p>}
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>
                                {t("workers.modal.fields.skills")}
                            </label>
                            <textarea
                                name="skills"
                                value={formData.skills || ""}
                                onChange={handleChange}
                                rows={2}
                                className={`${inputClass("skills")} resize-none`}
                                placeholder={t("workers.placeholders.skills")}
                            />
                            {editErrors.skills && <p className="text-red-500 text-xs mt-1.5 ml-1">{editErrors.skills}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>
                                {t("workers.modal.fields.bio")}
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio || ""}
                                onChange={handleChange}
                                rows={3}
                                className={`${inputClass("bio")} resize-none`}
                                placeholder={t("workers.placeholders.bio")}
                            />
                            {editErrors.bio && <p className="text-red-500 text-xs mt-1.5 ml-1">{editErrors.bio}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>
                                {t("workers.modal.fields.portfolio")}
                            </label>
                            <input
                                type="url"
                                name="portfolio_link"
                                value={formData.portfolio_link || ""}
                                onChange={handleChange}
                                className={inputClass("portfolio_link")}
                                placeholder="https://example.com"
                            />
                            {editErrors.portfolio_link && <p className="text-red-500 text-xs mt-1.5 ml-1">{editErrors.portfolio_link}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>
                                {t("workers.modal.fields.profile_image")}
                            </label>
                            <div className="flex items-center gap-4 mt-1">
                                <label
                                    htmlFor="worker-profile-image-upload"
                                    className="py-2.5 px-4 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer inline-block"
                                >
                                    {t("workers.file_upload.choose_file")}
                                </label>
                                <input
                                    id="worker-profile-image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                    {formData?.profile_image instanceof File
                                        ? formData.profile_image.name
                                        : typeof formData?.profile_image === "string" && formData.profile_image
                                            ? formData.profile_image.split("/").pop()
                                            : t("workers.file_upload.no_file_chosen")}
                                </span>
                            </div>
                            {editErrors.profile_image && <p className="text-red-500 text-xs mt-1.5 ml-1">{editErrors.profile_image}</p>}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 px-6 py-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onEditClose}
                        className="px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-800 transition-all cursor-pointer shadow-sm"
                    >
                        {t("workers.modal.buttons.cancel")}
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all cursor-pointer shadow-sm shadow-blue-500/20"
                    >
                        {t("workers.modal.buttons.save")}
                    </button>
                </div>
            </div>
        </div>
    );
}