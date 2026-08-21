import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { registerUser } from "../../../services/userServices";
import { translateApiError } from "../../../utils/translateApiError";
import EthiopianDatePicker from "../../../components/common/EthiopianDatePicker";
import { ethiopianToGregorian } from "../../../utils/ethiopianToGregorian";

function CreateUser() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    password: "",
    password_2: "",
    user_type: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    let newErrors = {};

    // Helper for validating names with Unicode support (Amharic, English, Oromo, etc.)
    const validateNameField = (val, requiredKey) => {
      const trimmed = val?.trim() || "";

      if (!trimmed) {
        return t(requiredKey);
      }
      if (trimmed.length < 2) {
        return t("create_user.validation.min2Chars"); // or t("workerSignup.validation.min2Chars")
      }
      if (!/^\p{L}/u.test(trimmed)) {
        return t("create_user.validation.textLetterStart");
      }
      if (!/^[\p{L}\s]+$/u.test(trimmed)) {
        return t("create_user.validation.lettersOnly");
      }
      return null;
    };

    // First Name Check
    const firstNameErr = validateNameField(
      form.first_name,
      "create_user.validation.first_name_required"
    );
    if (firstNameErr) newErrors.first_name = firstNameErr;

    // Last Name Check
    const lastNameErr = validateNameField(
      form.last_name,
      "create_user.validation.last_name_required"
    );
    if (lastNameErr) newErrors.last_name = lastNameErr;

    // Email
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = t("create_user.validation.invalid_email");
    }

    // Gender
    if (!form.gender) {
      newErrors.gender = t("create_user.validation.select_gender");
    }

    // Date of Birth
    if (!form.date_of_birth) {
      newErrors.date_of_birth = t("create_user.validation.enter_dob");
    }

    // Phone
    const phone = form.phone?.trim();
    if (!/^\+2519\d{8}$/.test(phone) && !/^\d{10}$/.test(phone)) {
      newErrors.phone = t("create_user.validation.invalid_phone");
    }

    // Passwords
    if (!form.password || form.password.length < 8) {
      newErrors.password = t("create_user.validation.min_password");
    }

    if (!form.password_2) {
      newErrors.password_2 = t("create_user.validation.confirm_password_required");
    } else if (form.password !== form.password_2) {
      newErrors.password_2 = t("create_user.validation.passwords_do_not_match");
    }

    // User Type
    if (!form.user_type) {
      newErrors.user_type = t("create_user.validation.select_user_type");
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

      // Handle nested error objects (e.g., client: { email: [...] })
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          newErrors[key] = translateApiError(t, `${key}.${nestedKey}`, nestedValue);
        });
        return;
      }

      // Handle multiple error strings in an array by translating and joining them
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);

      // Convert Ethiopian date to Gregorian for API payload
      const payload = {
        ...form,
        date_of_birth: ethiopianToGregorian(form.date_of_birth),
      };

      await registerUser(payload);

      toast.success(t("create_user.success_toast"));
      navigate("/admin/users");
    } catch (err) {
      const backendErrors = parseErrors(err?.response?.data);

      setErrors(backendErrors);

      toast.error(
        backendErrors.general ||
        Object.values(backendErrors)[0] ||
        t("create_user.validation.default_failed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-4 px-2 bg-gray-100 dark:bg-gray-900 transition-all">
      {/* CARD WRAPPER */}
      <div className="max-w-xl mx-auto rounded-2xl shadow-xl bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">
            {t("create_user.title")}
          </h2>

          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t("create_user.subtitle")}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FIRST NAME */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("create_user.first_name")}
              </label>
              <input
                name="first_name"
                placeholder={t("create_user.first_name_placeholder")}
                value={form.first_name}
                onChange={handleChange}
                autoComplete="off"
                className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
              )}
            </div>

            {/* LAST NAME */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("create_user.last_name")}
              </label>
              <input
                name="last_name"
                placeholder={t("create_user.last_name_placeholder")}
                value={form.last_name}
                onChange={handleChange}
                autoComplete="off"
                className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
              )}
            </div>
          </div>



          {/* GENDER */}
          <div>
            <div className="flex items-center gap-6">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("create_user.gender")}
              </label>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={form.gender === "male"}
                    onChange={handleChange}
                    className="accent-gray-900 dark:accent-white"
                  />
                  <span>{t("create_user.male")}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={form.gender === "female"}
                    onChange={handleChange}
                    className="accent-gray-900 dark:accent-white"
                  />
                  <span>{t("create_user.female")}</span>
                </label>
              </div>
            </div>

            {errors.gender && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                {errors.gender}
              </p>
            )}
          </div>

          {/* DATE OF BIRTH */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("create_user.date_of_birth")}
            </label>

            <EthiopianDatePicker
              value={form.date_of_birth}
              onChange={(formattedDate) => {
                setForm((prev) => ({ ...prev, date_of_birth: formattedDate }));
                setErrors((prev) => ({ ...prev, date_of_birth: "" }));
              }}
            />

            {errors.date_of_birth && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                {errors.date_of_birth}
              </p>
            )}
          </div>
          {/* EMAIL AND PHONE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("create_user.email")}
              </label>
              <input
                name="email"
                type="email"
                placeholder={t("create_user.email_placeholder")}
                value={form.email}
                onChange={handleChange}
                autoComplete="off"
                className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* PHONE */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("create_user.phone")}
              </label>
              <input
                name="phone"
                placeholder={t("create_user.phone_placeholder")}
                value={form.phone}
                onChange={handleChange}
                autoComplete="off"
                className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* USER TYPE */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("create_user.user_type")}
            </label>
            <select
              name="user_type"
              value={form.user_type}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
            >
              <option value="">{t("create_user.select_user_type")}</option>
              <option value="client">{t("create_user.client")}</option>
              <option value="worker">{t("create_user.worker")}</option>
              <option value="admin">{t("create_user.admin")}</option>
            </select>

            {errors.user_type && (
              <p className="text-red-500 text-sm mt-1">{errors.user_type}</p>
            )}
          </div>

          {/* PASSWORD GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("create_user.password")}
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="off"
                className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("create_user.confirm_password")}
              </label>
              <input
                type="password"
                name="password_2"
                value={form.password_2}
                onChange={handleChange}
                autoComplete="off"
                className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              />
              {errors.password_2 && (
                <p className="text-red-500 text-sm mt-1">{errors.password_2}</p>
              )}
            </div>
          </div>

          {/* GENERAL ERROR */}
          {errors.general && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm text-center border border-red-200 dark:border-red-700">
              {errors.general}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold transition-all shadow-sm cursor-pointer ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:opacity-90"
              }`}
          >
            {loading
              ? t("create_user.creating")
              : t("create_user.create_btn")}
          </button>

          {/* FOOTER NAVIGATION */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 
               bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              {t("create_user.back_to_users")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUser;