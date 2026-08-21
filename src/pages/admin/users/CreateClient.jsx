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

  const [activeTab, setActiveTab] = useState("contact"); // "contact" | "detail" | "media"

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
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
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
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

  /* CLIENT TYPE TAB CHANGE */
  const handleClientTypeChange = (type) => {
    setForm((prev) => ({
      ...prev,
      client_type: type,
    }));

    setErrors((prev) => ({
      ...prev,
      client_type: "",
      national_id: "",
      company_name: "",
    }));
  };

  /* TEXT VALIDATOR */
  const validateTextField = (value) => {
    const val = value?.trim();

    if (!val || val.length < 2) {
      return t("createClient.validation.min2Chars");
    }

    if (!/^\p{L}/u.test(val)) {
      return t("createClient.validation.mustStartWithLetter");
    }

    if (!/^[\p{L}\s]+$/u.test(val)) {
      return t("createClient.validation.lettersAndSpacesOnly");
    }

    return null;
  };

  /* VALIDATION */
  const validate = () => {
    let newErrors = {};

    if (!selectedUserId) {
      newErrors.user = t("createClient.validation.userRequired");
    }

    if (isIndividual) {
      if (!form.national_id?.trim()) {
        newErrors.national_id = t("createClient.validation.nationalIdRequired");
      } else if (form.national_id.trim().length !== 12) {
        newErrors.national_id = t("createClient.validation.finExact12Digits");
      }
    }

    if (isCompany) {
      const company = form.company_name?.trim();

      if (!company) {
        newErrors.company_name = t("clientSignup.validation.companyRequired");
      } else if (company.length < 2) {
        newErrors.company_name = t("clientSignup.validation.companyMin");
      }
    }

    const locationError = validateTextField(form.location);
    if (locationError) {
      newErrors.location = locationError;
    }

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
      if (validationErrors.user) {
        setActiveTab("contact");
      } else if (
        validationErrors.client_type ||
        validationErrors.national_id ||
        validationErrors.company_name ||
        validationErrors.location
      ) {
        setActiveTab("detail");
      } else if (validationErrors.avatar) {
        setActiveTab("media");
      }
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

      setErrors(formatted);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `mt-1 w-full px-3.5 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition text-sm ${errors[field] ? "border-red-500 focus:ring-red-200" : ""
    }`;

  const hasContactErrors = !!errors.user;
  const hasDetailErrors =
    !!errors.client_type ||
    !!errors.national_id ||
    !!errors.company_name ||
    !!errors.location;
  const hasMediaErrors = !!errors.avatar;

  return (
    <div className="min-h-screen py-2 sm:py-6 px-2 sm:px-4 bg-gray-100 dark:bg-gray-900 transition-all">
      <div className="max-w-xl mx-auto rounded-2xl shadow-xl bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">

        {/* HEADER */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white text-center">
            {t("createClient.title")}
          </h2>

          <p className="text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5">
            {t("createClient.subtitle")}
          </p>
        </div>

        {/* SCROLLABLE RESPONSIVE TABS */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("contact")}
            className={`flex-1 min-w-25 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 text-center transition-all whitespace-nowrap cursor-pointer ${activeTab === "contact"
              ? "border-gray-900 dark:border-white text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              }`}
          >
            {t("createClient.tabs.contactInfo")}
            {hasContactErrors && (
              <span className="ml-1 inline-block w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("detail")}
            className={`flex-1 min-w-25 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 text-center transition-all whitespace-nowrap cursor-pointer ${activeTab === "detail"
              ? "border-gray-900 dark:border-white text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              }`}
          >
            {t("createClient.tabs.details")}
            {hasDetailErrors && (
              <span className="ml-1 inline-block w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`flex-1 min-w-25 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 text-center transition-all whitespace-nowrap cursor-pointer ${activeTab === "media"
              ? "border-gray-900 dark:border-white text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              }`}
          >
            {t("createClient.tabs.media")}
            {hasMediaErrors && (
              <span className="ml-1 inline-block w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {errors.form && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs sm:text-sm text-center border border-red-200 dark:border-red-700">
              {errors.form}
            </div>
          )}

          {/* TAB 1: CONTACT INFO */}
          {activeTab === "contact" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("createClient.fields.selectUserLabel")}
                </label>

                <select
                  value={selectedUserId}
                  onChange={handleUserChange}
                  className={`${inputClass("user")} cursor-pointer`}
                >
                  <option value="">
                    {t("createClient.fields.selectUserPlaceholder")}
                  </option>

                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email} ({t("createClient.fields.idLabel")}: {user.id})
                    </option>
                  ))}
                </select>

                {errors.user && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.user}</p>
                )}
              </div>

              {selectedUserId && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("create_user.first_name")}
                      </label>
                      <input
                        placeholder={t("create_user.first_name")}
                        value={form.first_name}
                        disabled
                        className="mt-1 w-full px-3.5 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none transition cursor-not-allowed text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("create_user.last_name")}
                      </label>
                      <input
                        value={form.last_name}
                        placeholder={t("create_user.last_name")}
                        disabled
                        className="mt-1 w-full px-3.5 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none transition cursor-not-allowed text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("createClient.fields.email")}
                      </label>
                      <input
                        type="email"
                        placeholder={t("createClient.placeholders.email")}
                        value={form.email}
                        disabled
                        className="mt-1 w-full px-3.5 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none transition cursor-not-allowed text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("createClient.fields.phone")}
                      </label>
                      <input
                        value={form.phone}
                        disabled
                        placeholder={t("createClient.placeholders.phone")}
                        className="mt-1 w-full px-3.5 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none transition cursor-not-allowed text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLIENT DETAILS */}
          {activeTab === "detail" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  {t("createClient.fields.clientType")}
                </label>

                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <button
                    type="button"
                    onClick={() => handleClientTypeChange("individual")}
                    className={`py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${isIndividual
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                  >
                    {t("createClient.options.individual")}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleClientTypeChange("company")}
                    className={`py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${isCompany
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                  >
                    {t("createClient.options.company")}
                  </button>
                </div>

                {errors.client_type && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {errors.client_type}
                  </p>
                )}
              </div>

              {isCompany && (
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                      {errors.company_name}
                    </p>
                  )}
                </div>
              )}

              {isIndividual && (
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                      {errors.national_id}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {errors.location}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA */}
          {activeTab === "media" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  className="mt-1 w-full px-3 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition text-xs sm:text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-200 dark:file:bg-gray-600 file:text-gray-700 dark:file:text-gray-200"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t("createClient.hints.maxFileSize")}
                </p>
                {errors.avatar && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.avatar}</p>
                )}
              </div>
            </div>
          )}

          {errors.general && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs sm:text-sm text-center border border-red-200 dark:border-red-700">
              {errors.general}
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all shadow-sm cursor-pointer ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:opacity-90"
                }`}
            >
              {loading
                ? t("createClient.buttons.creating")
                : t("createClient.buttons.create")}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/clients")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer text-sm font-medium"
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