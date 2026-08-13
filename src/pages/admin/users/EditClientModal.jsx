import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { updateClient } from "../../../services/userServices";
import { translateApiError } from "../../../utils/translateApiError";

export default function EditClientModal({
    isEditOpen,
    formData,
    setFormData,
    editErrors,
    setEditErrors,
    onEditClose,
    onEditSuccess,
}) {
    const { t } = useTranslation();

    // Manage body scroll locking
    useEffect(() => {
        if (isEditOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "hidden";
        }
    }, [isEditOpen])

    if (!isEditOpen || !formData) return null;

    const validateTextField = (value) => {
        const val = value?.trim();
        if (!val || val.length < 2) {
            return t("clients.edit_modal.min2_chars", "Minimum 2 characters required");
        }
        return null;
    };

    const validate = () => {
        let newErrors = {};

        if (formData.client_type === "company") {
            const companyError = validateTextField(formData.company_name);
            if (companyError) newErrors.company_name = companyError;
        }

        if (formData.client_type === "individual") {
            if (!formData.national_id?.trim()) {
                newErrors.national_id = t("clients.edit_modal.national_id_required", "National ID is required");
            }
        }

        if (!formData.location?.trim()) {
            newErrors.location = t("clients.edit_modal.location_required", "Location is required");
        }

        if (!formData.verification_status) {
            newErrors.verification_status = t("clients.edit_modal.status_required", "Verification status is required");
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
                    newErrors[nestedKey] = translateApiError(
                        t,
                        `${key}.${nestedKey}`,
                        nestedValue
                    );
                });
                return;
            }

            if (Array.isArray(value)) {
                newErrors[key] = value
                    .map((item) => translateApiError(t, key, item))
                    .join(" ");
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

    const handleSave = async () => {
        const validationErrors = validate();
        setEditErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;
        // Prepare cleaned payload based on client_type
        const payload = {
            ...formData,
            national_id: formData.client_type === "company"
                ? null
                : formData.national_id?.trim() || null,
            company_name: formData.client_type === "individual"
                ? ""
                : formData.company_name?.trim() || "",
        };
        try {
            await updateClient(payload.id, payload);
            onEditSuccess(formData);
        } catch (err) {
            const backendErrors = parseErrors(err?.response?.data);
            setEditErrors(backendErrors);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[0.5px] flex items-center justify-center z-50 p-4"
            onClick={onEditClose}
        >
            <div
                className="w-full max-w-md rounded-2xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {t("clients.edit_modal.title", "Edit Client Details")}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("clients.edit_modal.subtitle", "Update client profile settings and status.")}
                    </p>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* General Error Alert */}
                    {editErrors.general && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                            {editErrors.general}
                        </div>
                    )}

                    {/* Client Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t("clients.fields.client_type", "Client Type")}
                        </label>
                        <select
                            name="client_type"
                            value={formData.client_type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none"
                        >
                            <option value="individual">{t("clients.types.individual", "Individual")}</option>
                            <option value="company">{t("clients.types.company", "Company")}</option>
                        </select>
                    </div>

                    {/* Company Name */}
                    {formData.client_type === "company" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t("clients.fields.company_name", "Company Name")}
                            </label>
                            <input
                                name="company_name"
                                value={formData.company_name || ""}
                                onChange={handleChange}
                                autoComplete="off"
                                className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none"
                                placeholder={t("clients.placeholders.company_name", "Enter company name")}
                            />
                            {editErrors.company_name && (
                                <p className="text-red-500 text-sm mt-1">{editErrors.company_name}</p>
                            )}
                        </div>
                    )}

                    {/* National ID */}
                    {formData.client_type === "individual" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t("clients.fields.national_id", "National ID")}
                            </label>
                            <input
                                name="national_id"
                                value={formData.national_id || ""}
                                onChange={handleChange}
                                autoComplete="off"
                                className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none"
                                placeholder={t("clients.placeholders.national_id", "Enter national ID")}
                            />
                            {editErrors.national_id && (
                                <p className="text-red-500 text-sm mt-1">{editErrors.national_id}</p>
                            )}
                        </div>
                    )}

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t("clients.fields.location", "Location")}
                        </label>
                        <input
                            name="location"
                            value={formData.location || ""}
                            onChange={handleChange}
                            autoComplete="off"
                            className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none"
                            placeholder={t("clients.placeholders.location", "Enter location/address")}
                        />
                        {editErrors.location && (
                            <p className="text-red-500 text-sm mt-1">{editErrors.location}</p>
                        )}
                    </div>

                    {/* Verification Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t("clients.fields.status", "Verification Status")}
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
                            <p className="text-red-500 text-sm mt-1">{editErrors.verification_status}</p>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <button
                        type="button"
                        onClick={onEditClose}
                        className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-80 transition cursor-pointer"
                    >
                        {t("clients.edit_modal.cancel")}
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition font-medium cursor-pointer"
                    >
                        {t("clients.edit_modal.save")}
                    </button>
                </div>
            </div>
        </div>
    );
}