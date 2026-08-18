import React from "react";
import { useTranslation } from "react-i18next";
import { updateUser } from "../../../services/userServices";
import { translateApiError } from "../../../utils/translateApiError";
import EthiopianDatePicker from "../../../components/common/EthiopianDatePicker";
import { gregorianToEthiopian } from "../../../utils/gregorianToEthiopian";
import { ethiopianToGregorian } from "../../../utils/ethiopianToGregorian";

export default function EditUserModal({ isOpen, editForm, setEditForm, errors, setErrors, onClose, onSuccess }) {
    const { t } = useTranslation();

    if (!isOpen || !editForm) return null;

    const validateTextField = (value) => {
        const val = value?.trim();
        if (!val || val.length < 2) {
            return t("all_users.edit_modal.min2_chars");
        }
        if (!/^\p{L}/u.test(val)) {
            return t("all_users.edit_modal.text_letter_start");
        }
        if (!/^[\p{L}\s]+$/u.test(val)) {
            return t("all_users.edit_modal.letters_only");
        }
        return null;
    };

    const validate = () => {
        let newErrors = {};

        const firstNameError = validateTextField(editForm.first_name);
        if (firstNameError) newErrors.first_name = firstNameError;

        const lastNameError = validateTextField(editForm.last_name);
        if (lastNameError) newErrors.last_name = lastNameError;

        if (!editForm.email) {
            newErrors.email = t("all_users.edit_modal.email_required");
        } else if (!/^\S+@\S+\.\S+$/.test(editForm.email)) {
            newErrors.email = t("all_users.edit_modal.invalid_email");
        }

        const phone = editForm.phone?.trim();
        if (!phone) {
            newErrors.phone = t("all_users.edit_modal.phone_required");
        } else if (!/^\+2519\d{8}$/.test(phone) && !/^\d{10}$/.test(phone)) {
            newErrors.phone = t("all_users.edit_modal.invalid_phone");
        }

        if (!editForm.user_type) {
            newErrors.user_type = t("all_users.edit_modal.user_type");
        }

        return newErrors;
    };

    const parseErrors = (errData) => {
        const newErrors = {};

        if (!errData || typeof errData !== "object") {
            return { general: t("backendErrors.generic") };
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

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleUpdateUser = async () => {
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        try {
            await updateUser(editForm.id, editForm);
            onSuccess(editForm);
        } catch (err) {
            const backendErrors = parseErrors(err?.response?.data);
            setErrors(backendErrors);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[0.5px] flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-3xl rounded-2xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-visible flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-2xl shrink-0">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {t("all_users.edit_modal.title")}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("all_users.edit_modal.subtitle")}
                    </p>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-105]">
                    {/* Row 1: First Name & Last Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t("all_users.edit_modal.first_name")}
                            </label>
                            <input
                                name="first_name"
                                value={editForm.first_name}
                                onChange={handleEditChange}
                                autoComplete="off"
                                className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none"
                                placeholder={t("all_users.edit_modal.first_name")}
                            />
                            {errors.first_name && (
                                <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t("all_users.edit_modal.last_name")}
                            </label>
                            <input
                                name="last_name"
                                value={editForm.last_name}
                                onChange={handleEditChange}
                                autoComplete="off"
                                className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none"
                                placeholder={t("all_users.edit_modal.last_name")}
                            />
                            {errors.last_name && (
                                <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Gender & Date of Birth */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t("all_users.view_modal.labels.gender")}
                            </label>

                            <div className="flex gap-6 py-2">
                                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="male"
                                        checked={editForm.gender === "male"}
                                        onChange={handleEditChange}
                                        className="accent-gray-900 dark:accent-white"
                                    />
                                    <span>{t("create_user.male")}</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="female"
                                        checked={editForm.gender === "female"}
                                        onChange={handleEditChange}
                                        className="accent-gray-900 dark:accent-white"
                                    />
                                    <span>{t("create_user.female")}</span>
                                </label>
                            </div>

                            {errors.gender && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.gender}
                                </p>
                            )}
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t("all_users.view_modal.labels.date_of_birth")}
                            </label>
                            <EthiopianDatePicker
                                value={gregorianToEthiopian(editForm.date_of_birth)}
                                onChange={(ethiopianDateStr) => {
                                    const gregorianDateStr = ethiopianToGregorian(ethiopianDateStr);
                                    setEditForm((prev) => ({ ...prev, date_of_birth: gregorianDateStr }));
                                    setErrors((prev) => ({ ...prev, date_of_birth: "" }));
                                }}
                            />
                            {errors.date_of_birth && (
                                <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>
                            )}
                        </div>
                    </div>

                    {/* Row 3: Email & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t("all_users.edit_modal.email")}
                            </label>
                            <input
                                name="email"
                                value={editForm.email}
                                onChange={handleEditChange}
                                autoComplete="off"
                                className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none"
                                placeholder={t("all_users.edit_modal.email")}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t("all_users.edit_modal.phone")}
                            </label>
                            <input
                                name="phone"
                                value={editForm.phone || ""}
                                onChange={handleEditChange}
                                autoComplete="off"
                                className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none"
                                placeholder={t("all_users.edit_modal.phone")}
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                            )}
                        </div>
                    </div>

                    {/* Row 4: User Type & Account Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t("all_users.edit_modal.user_type")}
                            </label>
                            <select
                                name="user_type"
                                value={editForm.user_type}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none"
                            >
                                <option value="admin">{t("all_users.filter_role.admin")}</option>
                                <option value="client">{t("all_users.filter_role.client")}</option>
                                <option value="worker">{t("all_users.filter_role.worker")}</option>
                            </select>
                            {errors.user_type && (
                                <p className="text-red-500 text-sm mt-1">{errors.user_type}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t("all_users.edit_modal.status")}
                            </label>
                            <select
                                name="account_status"
                                value={editForm.account_status}
                                onChange={(e) =>
                                    setEditForm((prev) => ({
                                        ...prev,
                                        account_status: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none"
                            >
                                <option value="active">{t("all_users.status_labels.active")}</option>
                                <option value="pending">{t("all_users.status_labels.pending")}</option>
                                <option value="rejected">{t("all_users.status_labels.rejected")}</option>
                                <option value="suspended">{t("all_users.status_labels.suspended")}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-2xl shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-80 transition cursor-pointer"
                    >
                        {t("all_users.edit_modal.cancel")}
                    </button>

                    <button
                        onClick={handleUpdateUser}
                        className="px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition font-medium cursor-pointer"
                    >
                        {t("all_users.edit_modal.save")}
                    </button>
                </div>
            </div>
        </div>
    );
}