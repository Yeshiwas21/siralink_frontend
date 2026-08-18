import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  fetchUsers as listUsers,
  createWorker,
} from "../../../services/userServices";
import { translateApiError } from "../../../utils/translateApiError";

function CreateWorker() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    national_id: "",
    location: "",
    email: "",
    phone: "",
    skills: "",
    bio: "",
    experience_years: "",
    portfolio_link: "",
    profile_image: null,
  });

  /* FETCH USERS */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await listUsers();

        const availableUsers = data.filter((u) => {
          return (
            u.user_type === "worker" &&
            (u.worker === null || u.worker === undefined) &&
            (u.client === null || u.client === undefined)
          );
        });

        setUsers(availableUsers);
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

    const user = users.find((u) => String(u.id) === String(userId));

    setForm((prev) => ({
      ...prev,
      email: user?.email || "",
      phone: user?.phone || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
    }));

    setErrors((prev) => ({ ...prev, user: "" }));
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

  /* TEXT VALIDATOR (Unicode properties matching CreateClient) */
  const validateTextField = (value) => {
    const val = value?.trim();

    if (!val || val.length < 2) {
      return t("createWorker.validation.min2Chars");
    }

    // Accepts letters from ANY language (including Amharic / Ge'ez)
    if (!/^\p{L}/u.test(val)) {
      return t("createWorker.validation.mustStartWithLetter");
    }

    // Allows letters from any language + spaces
    if (!/^[\p{L}\s]+$/u.test(val)) {
      return t("createWorker.validation.lettersAndSpacesOnly");
    }

    return null;
  };

  /* VALIDATION */
  const validate = () => {
    let newErrors = {};

    // USER
    if (!selectedUserId) {
      newErrors.user = t("createWorker.validation.userRequired");
    }

    // NATIONAL ID
    if (!form.national_id?.trim() || form.national_id.trim().length != 12) {
      newErrors.national_id = t("createWorker.validation.finExact12Digits");
    }

    // LOCATION
    const locationError = validateTextField(form.location);
    if (locationError) {
      newErrors.location = locationError;
    }

    // SKILLS
    if (!form.skills?.trim() || form.skills.trim().length < 2) {
      newErrors.skills = t("createWorker.validation.skillsMin2");
    }

    // BIO
    if (form.bio?.trim() && form.bio.trim().length < 10) {
      newErrors.bio = t("createWorker.validation.bioMin10");
    }

    // EXPERIENCE
    if (
      form.experience_years === "" ||
      isNaN(form.experience_years) ||
      Number(form.experience_years) < 0
    ) {
      newErrors.experience_years = t("createWorker.validation.validExperience");
    }

    // PORTFOLIO LINK
    if (form.portfolio_link?.trim()) {
      const urlPattern = /^(https?:\/\/)?([\w.-]+)+(:\d+)?(\/([\w/_-]+))*\/?$/;
      if (!urlPattern.test(form.portfolio_link.trim())) {
        newErrors.portfolio_link = t("createWorker.validation.validUrl");
      }
    }

    // PROFILE IMAGE
    if (form.profile_image) {
      const file = form.profile_image;

      if (!file.type.startsWith("image/")) {
        newErrors.profile_image = t("createWorker.validation.mustBeImage");
      }

      if (file.size > 2 * 1024 * 1024) {
        newErrors.profile_image = t("createWorker.validation.maxSize2MB");
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
      formData.append("national_id", form.national_id?.trim());
      formData.append("location", form.location?.trim());
      formData.append("skills", form.skills?.trim());
      formData.append("bio", form.bio?.trim() || "");
      formData.append("experience_years", form.experience_years);
      formData.append("portfolio_link", form.portfolio_link?.trim() || "");

      if (form.profile_image) {
        formData.append("profile_image", form.profile_image);
      }

      await createWorker(formData);

      toast.success(t("createWorker.messages.success"));
      navigate("/admin/workers");
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
    <div className="min-h-screen py-4 px-4 bg-gray-100 dark:bg-gray-900 transition-all">
      {/* CARD WRAPPER */}
      <div className="max-w-xl mx-auto rounded-2xl shadow-xl bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">

        {/* HEADER */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">
            {t("createWorker.title")}
          </h2>

          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t("createWorker.subtitle")}
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
              {t("createWorker.fields.selectUserLabel")}
            </label>

            <select
              value={selectedUserId}
              onChange={handleUserChange}
              className={inputClass("user")}
            >
              <option value="">{t("createWorker.fields.selectUserPlaceholder")}</option>

              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email} ({t("createWorker.fields.idLabel")}: {user.id})
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
                {t("createWorker.fields.email")}
              </label>

              <input
                type="email"
                placeholder={t("createWorker.placeholders.email")}
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
                {t("createWorker.fields.phone")}
              </label>

              <input
                value={form.phone}
                disabled
                placeholder={t("createWorker.placeholders.phone")}
                className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none transition cursor-not-allowed"
              />

              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* FIRST NAME + LAST NAME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FIRST NAME */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("createWorker.fields.firstName")}
              </label>

              <input
                name="first_name"
                disabled
                placeholder={t("createWorker.placeholders.firstName")}
                className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none transition cursor-not-allowed"
                value={form.first_name}
              />

              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.first_name}
                </p>
              )}
            </div>

            {/* LAST NAME */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("createWorker.fields.lastName")}
              </label>

              <input
                name="last_name"
                disabled
                placeholder={t("createWorker.placeholders.lastName")}
                className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none transition cursor-not-allowed"
                value={form.last_name}
              />

              {errors.last_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.last_name}
                </p>
              )}
            </div>
          </div>

          {/* NATIONAL ID */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("createWorker.fields.nationalId")}
            </label>

            <input
              name="national_id"
              placeholder={t("createWorker.placeholders.nationalId")}
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

          {/* LOCATION */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("createWorker.fields.location")}
            </label>

            <input
              name="location"
              placeholder={t("createWorker.placeholders.location")}
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

          {/* SKILLS */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("createWorker.fields.skills")}
            </label>

            <input
              name="skills"
              placeholder={t("createWorker.placeholders.skills")}
              value={form.skills}
              onChange={handleChange}
              className={inputClass("skills")}
            />

            {errors.skills && (
              <p className="text-red-500 text-sm mt-1">
                {errors.skills}
              </p>
            )}
          </div>

          {/* BIO */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("createWorker.fields.bio")}
            </label>

            <textarea
              name="bio"
              rows={3}
              placeholder={t("createWorker.placeholders.bio")}
              value={form.bio}
              onChange={handleChange}
              className={inputClass("bio")}
            />

            {errors.bio && (
              <p className="text-red-500 text-sm mt-1">
                {errors.bio}
              </p>
            )}
          </div>

          {/* EXPERIENCE YEARS */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("createWorker.fields.experienceYears")}
            </label>

            <input
              type="number"
              name="experience_years"
              placeholder={t("createWorker.placeholders.experienceYears")}
              value={form.experience_years}
              onChange={handleChange}
              className={inputClass("experience_years")}
            />

            {errors.experience_years && (
              <p className="text-red-500 text-sm mt-1">
                {errors.experience_years}
              </p>
            )}
          </div>

          {/* PORTFOLIO LINK */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("createWorker.fields.portfolioLink")}
            </label>

            <input
              name="portfolio_link"
              placeholder={t("createWorker.placeholders.portfolioLink")}
              value={form.portfolio_link}
              onChange={handleChange}
              className={inputClass("portfolio_link")}
            />

            {errors.portfolio_link && (
              <p className="text-red-500 text-sm mt-1">
                {errors.portfolio_link}
              </p>
            )}
          </div>

          {/* PROFILE IMAGE */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("createWorker.fields.profileImage")}
            </label>

            <input
              type="file"
              name="profile_image"
              accept="image/*"
              onChange={(e) => {
                setForm({
                  ...form,
                  profile_image: e.target.files[0],
                });

                setErrors({
                  ...errors,
                  profile_image: "",
                });
              }}
              className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-200 dark:file:bg-gray-600 file:text-gray-700 dark:file:text-gray-200"
            />

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("createWorker.hints.maxFileSize")}
            </p>

            {errors.profile_image && (
              <p className="text-red-500 text-sm mt-1">
                {errors.profile_image}
              </p>
            )}
          </div>

          {/* GENERAL ERROR */}
          {errors.general && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm text-center border border-red-200 dark:border-red-700">
              {errors.general}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold transition-all shadow-sm cursor-pointer ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:opacity-90"
              }`}
          >
            {loading
              ? t("createWorker.buttons.creating")
              : t("createWorker.buttons.create")}
          </button>

          {/* FOOTER NAVIGATION */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate("/admin/workers")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              ← {t("createWorker.buttons.backToWorkers")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateWorker;