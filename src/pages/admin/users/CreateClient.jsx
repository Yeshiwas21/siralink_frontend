import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  fetchUsers as listUsers,
  createClient,
} from "../../../services/userServices";
import { translateApiError } from "../../../utils/translateApiError";

function CreateClient() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    phone: "",
    client_type: "individual",
    company_name: "",
    national_id: "",
    location: "",
    avatar: null,
  });

  const isCompany = form.client_type === "company";
  const isIndividual = form.client_type === "individual";

  /* FETCH USERS */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await listUsers();

        const clientsOnly = data.filter(
          (u) =>
            u.user_type === "client" &&
            u.client === null &&
            u.worker === null
        );

        setUsers(clientsOnly);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  /* USER SELECT */
  const handleUserChange = (e) => {
    const userId = e.target.value;

    setSelectedUserId(userId);

    const user = users.find(
      (u) => String(u.id) === String(userId)
    );

    setForm((prev) => ({
      ...prev,
      email: user?.email || "",
      phone: user?.phone || "",
    }));

    setErrors((prev) => ({
      ...prev,
      user: "",
    }));
  };

  /* INPUT CHANGE */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* TEXT VALIDATOR (Updated with Unicode properties matching WorkerSignup) */
  const validateTextField = (value) => {
    const val = value?.trim();

    if (!val || val.length < 2) {
      return t("createClient.validation.min2Chars");
    }

    // Accepts letters from ANY language (including Amharic / Ge'ez)
    if (!/^\p{L}/u.test(val)) {
      return t("createClient.validation.mustStartWithLetter");
    }

    // Allows letters from any language + spaces
    if (!/^[\p{L}\s]+$/u.test(val)) {
      return t("createClient.validation.lettersAndSpacesOnly");
    }

    return null;
  };

  /* VALIDATION */
  const validate = () => {
    let newErrors = {};

    // USER
    if (!selectedUserId) {
      newErrors.user = t("createClient.validation.userRequired");
    }

    // NATIONAL ID VALIDATION
    if (isIndividual) {
      if (!form.national_id?.trim()) {
        newErrors.national_id = t("createClient.validation.nationalIdRequired");
      } else if (form.national_id.trim().length !== 12) {
        newErrors.national_id = t("createClient.validation.finExact12Digits");
      }
    }

    // COMPANY NAME VALIDATION
    if (isCompany) {
      const company = form.company_name?.trim();

      if (!company) {
        newErrors.company_name = t("clientSignup.validation.companyRequired");
      } else if (company.length < 2) {
        newErrors.company_name = t("clientSignup.validation.companyMin");
      }
    }

    // LOCATION
    const locationError = validateTextField(form.location);
    if (locationError) {
      newErrors.location = locationError;
    }

    // AVATAR
    if (form.avatar) {
      const file = form.avatar;

      if (!file.type.startsWith("image/")) {
        newErrors.avatar = t("createClient.validation.mustBeImage");
      }

      if (file.size > 2 * 1024 * 1024) {
        newErrors.avatar = t("createClient.validation.maxSize2MB");
      }
    }

    return newErrors;
  };

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("user", selectedUserId);
      formData.append("client_type", form.client_type);
      formData.append("location", form.location?.trim());

      if (form.client_type === "company") {
        formData.append("company_name", form.company_name?.trim());
      }

      if (form.client_type === "individual") {
        formData.append("national_id", form.national_id?.trim());
      }

      if (form.avatar) {
        formData.append("avatar", form.avatar);
      }

      await createClient(formData);

      toast.success(t("createClient.messages.success"));

      navigate("/admin/clients");
    } catch (err) {
      const data = err?.response?.data || {};
      let formatted = {};

      const extractRawValue = (val) => {
        if (Array.isArray(val)) return extractRawValue(val[0]);
        if (typeof val === "object" && val !== null) {
          return val.error_code || val.code || val.message || extractRawValue(Object.values(val)[0]);
        }
        return val;
      };

      // Helper to flatten nested DRF objects
      const flattenErrors = (obj) => {
        let flat = {};
        if (typeof obj !== "object" || obj === null) return flat;

        Object.entries(obj).forEach(([key, val]) => {
          if ((key === "client" || key === "worker") && typeof val === "object" && val !== null && !Array.isArray(val)) {
            Object.assign(flat, flattenErrors(val));
          } else {
            flat[key] = val;
          }
        });
        return flat;
      };

      const flatData = flattenErrors(data);

      Object.entries(flatData).forEach(([key, val]) => {
        const rawVal = extractRawValue(val);

        if (key === "non_field_errors" || key === "detail") {
          formatted.form = translateApiError(t, "form", rawVal);
          return;
        }

        let normKey = key === "confirm_password" ? "password_2" : key;
        const cleanKey = normKey.replace(/^(client|worker)\./, "");

        const translatedMessage = translateApiError(t, cleanKey, rawVal);

        formatted[cleanKey] = translatedMessage;
        formatted[normKey] = translatedMessage;
        formatted[key] = translatedMessage;
      });

      console.log("Formatted Errors Object:", formatted);
      setErrors(formatted);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `mt-1 w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition ${errors[field] ? "border-red-500 focus:ring-red-200" : ""
    }`;

  return (
    <div className="min-h-screen py-16 px-4 bg-gray-100 dark:bg-gray-900 transition-all">
      {/* CARD WRAPPER */}
      <div className="max-w-xl mx-auto rounded-2xl shadow-xl bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">

        {/* HEADER */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">
            {t("createClient.title")}
          </h2>

          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t("createClient.subtitle")}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.form && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm text-center border border-red-200 dark:border-red-700">
              {errors.form}
            </div>
          )}

          {/* USER */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("createClient.fields.selectUserLabel")}
            </label>

            <select
              value={selectedUserId}
              onChange={handleUserChange}
              className={inputClass("user")}
            >
              <option value="">{t("createClient.fields.selectUserPlaceholder")}</option>

              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email} ({t("createClient.fields.idLabel")}: {user.id})
                </option>
              ))}
            </select>

            {errors.user && (
              <p className="text-red-500 text-sm mt-1">
                {errors.user}
              </p>
            )}
          </div>

          {/* EMAIL + PHONE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("createClient.fields.email")}
              </label>

              <input
                type="email"
                placeholder={t("createClient.placeholders.email")}
                value={form.email}
                disabled
                className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none transition cursor-not-allowed"
              />

              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* PHONE */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("createClient.fields.phone")}
              </label>

              <input
                value={form.phone}
                disabled
                placeholder={t("createClient.placeholders.phone")}
                className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none transition cursor-not-allowed"
              />

              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* CLIENT TYPE */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("createClient.fields.clientType")}
            </label>

            <select
              name="client_type"
              value={form.client_type}
              onChange={handleChange}
              className={inputClass("client_type")}
            >
              <option value="individual">{t("createClient.options.individual")}</option>
              <option value="company">{t("createClient.options.company")}</option>
            </select>

            {errors.client_type && (
              <p className="text-red-500 text-sm mt-1">
                {errors.client_type}
              </p>
            )}
          </div>

          {/* COMPANY */}
          {isCompany && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("createClient.fields.companyName")}
              </label>

              <input
                name="company_name"
                placeholder={t("createClient.placeholders.companyName")}
                value={form.company_name}
                onChange={handleChange}
                autoComplete="off"
                className={inputClass("company_name")}
              />

              {errors.company_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.company_name}
                </p>
              )}
            </div>
          )}

          {/* NATIONAL ID */}
          {isIndividual && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("createClient.fields.nationalId")}
              </label>

              <input
                name="national_id"
                placeholder={t("createClient.placeholders.nationalId")}
                value={form.national_id}
                onChange={handleChange}
                autoComplete="off"
                className={inputClass("national_id")}
              />

              {errors.national_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.national_id}
                </p>
              )}
            </div>
          )}

          {/* LOCATION */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("createClient.fields.location")}
            </label>

            <input
              name="location"
              placeholder={t("createClient.placeholders.location")}
              autoComplete="off"
              value={form.location}
              onChange={handleChange}
              className={inputClass("location")}
            />

            {errors.location && (
              <p className="text-red-500 text-sm mt-1">
                {errors.location}
              </p>
            )}
          </div>

          {/* AVATAR */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("createClient.fields.profileImage")}
            </label>

            <input
              type="file"
              name="avatar"
              accept="image/*"
              onChange={(e) => {
                setForm({
                  ...form,
                  avatar: e.target.files[0],
                });

                setErrors({
                  ...errors,
                  avatar: "",
                });
              }}
              className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-200 dark:file:bg-gray-600 file:text-gray-700 dark:file:text-gray-200"
            />

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("createClient.hints.maxFileSize")}
            </p>

            {errors.avatar && (
              <p className="text-red-500 text-sm mt-1">
                {errors.avatar}
              </p>
            )}
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
              ? t("createClient.buttons.creating")
              : t("createClient.buttons.create")}
          </button>

          {/* FOOTER NAVIGATION */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate("/admin/clients")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              ← {t("createClient.buttons.backToClients")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateClient;