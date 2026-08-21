import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { signupWorker } from "../../services/userServices";
import { listWorkerCategory } from "../../services/categoryServices";
import { translateApiError } from "../../utils/translateApiError";
import { WorkerCategoryPicker } from "./WorkerCategoryPicker";
import EthiopianDatePicker from "../../components/common/EthiopianDatePicker";
import { ethiopianToGregorian } from "../../utils/ethiopianToGregorian";

function WorkerSignup() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    password: "",
    password_2: "",
    first_name: "",
    last_name: "",
    national_id: "",
    location: "",
    category: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await listWorkerCategory(); // Expects array: [{ id: 1, name: "Plumbing" }, ...]
        setCategories(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateTextField = (value) => {
    const val = value?.trim();
    if (!val || val.length < 2) {
      return t("workerSignup.validation.min2Chars");
    }
    // Accepts letters from ANY language (including Amharic / Ge'ez)
    if (!/^\p{L}/u.test(val)) {
      return t("workerSignup.validation.textLetterStart");
    }

    // Allows letters from any language + spaces
    if (!/^[\p{L}\s]+$/u.test(val)) {
      return t("workerSignup.validation.lettersOnly");
    }
    return null;
  };

  const validate = () => {
    let e = {};

    // EMAIL
    if (!form.email) {
      e.email = t("workerSignup.validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = t("workerSignup.validation.emailInvalid");
    }

    // PHONE
    const phone = form.phone?.trim();
    if (!phone) {
      e.phone = t("workerSignup.validation.phoneRequired");
    } else if (!/^\+2519\d{8}$/.test(phone) && !/^\d{10}$/.test(phone)) {
      e.phone = t("workerSignup.validation.phoneInvalidFormat");
    }


    // PASSWORD
    if (!form.password || form.password.length < 8) {
      e.password = t("workerSignup.validation.min8Chars");
    }

    // CONFIRM PASSWORD
    if (form.password && !form.password_2) {
      e.password_2 = t("workerSignup.validation.confirmPasswordRequired");
    } else if (form.password !== form.password_2) {
      e.password_2 = t("workerSignup.validation.passwordsDoNotMatch");
    }

    // NAME & LOCATION VALIDATION
    const firstNameError = validateTextField(form.first_name);
    if (firstNameError) e.first_name = firstNameError;

    const lastNameError = validateTextField(form.last_name);
    if (lastNameError) e.last_name = lastNameError;

    const locationError = validateTextField(form.location);
    if (locationError) e.location = locationError;

    // GENDER & DOB
    if (!form.gender) {
      e.gender = t("create_user.validation.select_gender");
    }
    if (!form.date_of_birth) {
      e.date_of_birth = t("create_user.validation.enter_dob");
    }

    // NATIONAL ID
    if (!form.national_id || form.national_id.trim().length < 12) {
      e.national_id = t("workerSignup.validation.nationalIdInvalid");
    }
    // CATEGORY VALIDATION
    if (!form.category) {
      e.category = t("workerSignup.validation.categoryRequired");
    }

    return e;
  };

  // Add or reuse the unified parseErrors helper in WorkerSignup.js
  const parseErrors = (errData) => {
    const newErrors = {};

    if (!errData || typeof errData !== "object") {
      return { form: t("backendErrors.generic") };
    }

    if (errData.detail) {
      newErrors.form = translateApiError(t, "detail", errData.detail);
      return newErrors;
    }

    // Helper to unnest nested wrapper objects (e.g. client or worker)
    const flatten = (data) => {
      let result = {};
      Object.entries(data).forEach(([key, val]) => {
        if ((key === "client" || key === "worker") && typeof val === "object" && !Array.isArray(val) && val !== null) {
          Object.assign(result, flatten(val));
        } else {
          result[key] = val;
        }
      });
      return result;
    };

    const flatData = flatten(errData);

    Object.entries(flatData).forEach(([key, value]) => {
      const fieldKey = key === "confirm_password" ? "password_2" : key;

      if (key === "non_field_errors") {
        newErrors.form = translateApiError(t, key, value);
        return;
      }

      if (Array.isArray(value)) {
        newErrors[fieldKey] = value
          .map((item) => translateApiError(t, fieldKey, item))
          .join(" ");
      } else {
        newErrors[fieldKey] = translateApiError(t, fieldKey, value);
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const eObj = validate();
    setErrors(eObj);

    if (Object.keys(eObj).length > 0) return;

    try {
      setLoading(true);

      const payload = {
        ...form,
        first_name: form.first_name?.trim(),
        last_name: form.last_name?.trim(),
        email: form.email?.trim(),
        phone: form.phone?.trim(),
        gender: form.gender,
        date_of_birth: ethiopianToGregorian(form.date_of_birth),
        national_id: form.national_id?.trim(),
        location: form.location?.trim() || null,
        category: form.category ? Number(form.category) : null, // Sends PK integer/ID
      };

      await signupWorker(payload);

      toast.success(t("workerSignup.accountCreatedSuccess"));
      navigate("/login");
    } catch (err) {
      const backendErrors = parseErrors(err?.response?.data);

      setErrors(backendErrors);

      toast.error(
        backendErrors.form ||
        Object.values(backendErrors)[0] ||
        t("workerSignup.validation.defaultFailedWorker")
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 rounded-lg text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
    text-gray-900 dark:text-white  placeholder-gray-400 dark:placeholder-gray-500  focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10
    focus:border-gray-400 dark:focus:border-gray-500   transition
    ${errors[field] ? "border-red-400 focus:ring-red-200" : ""}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors">
      <div className="w-full max-w-xl">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 text-center md:text-left">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t("workerSignup.title")}
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("workerSignup.subtitle")}
            </p>
          </div>

          <div className="md:text-right">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t("workerSignup.lookingForHiring")}
              <Link
                to="/signup/client/"
                className="font-medium text-black dark:text-white hover:opacity-70 ml-2"
              >
                {t("workerSignup.joinAsClient")}→
              </Link>
            </p>
          </div>
        </div>

        {/* CARD */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
          {errors.form && (
            <div className="mb-4 text-sm text-red-500 text-center">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NAME */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  {t("workerSignup.firstName")}
                </label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  className={inputClass("first_name")}
                  autoComplete="off"
                />
                {errors.first_name && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.first_name}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  {t("workerSignup.lastName")}
                </label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  className={inputClass("last_name")}
                  autoComplete="off"
                />
                {errors.last_name && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            {/* GENDER  */}
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
                    <span className="text-sm sm:text-base">{t("create_user.male")}</span>
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
                    <span className="text-sm sm:text-base">{t("create_user.female")}</span>
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

            {/* NATIONAL ID */}
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">
                {t("workerSignup.nationalId")}
              </label>
              <input
                name="national_id"
                value={form.national_id}
                onChange={handleChange}
                className={inputClass("national_id")}
                autoComplete="off"
              />
              {errors.national_id && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  {errors.national_id}
                </p>
              )}
            </div>

            {/* LOCATION */}
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">
                {t("workerSignup.location")}
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className={inputClass("location")}
                autoComplete="off"
              />
              {errors.location && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  {errors.location}
                </p>
              )}
            </div>

            {/* CATEGORY SELECTOR */}
            <WorkerCategoryPicker
              categories={categories}
              value={form.category}
              onChange={(catId) => {
                setForm({ ...form, category: catId });
                setErrors({ ...errors, category: "" });
              }}
              error={errors.category}
              loading={loadingCategories}
              t={t}
              inputClass={inputClass}
            />

            {/* CONTACT */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  {t("workerSignup.email")}
                </label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass("email")}
                  autoComplete="off"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  {t("workerSignup.phone")}
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass("phone")}
                  autoComplete="off"
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* PASSWORD */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  {t("workerSignup.password")}
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={inputClass("password")}
                  autoComplete="off"
                />
                {errors.password && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  {t("workerSignup.confirmPassword")}
                </label>
                <input
                  type="password"
                  name="password_2"
                  value={form.password_2}
                  onChange={handleChange}
                  className={inputClass("password_2")}
                  autoComplete="off"
                />
                {errors.password_2 && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.password_2}
                  </p>
                )}
              </div>
            </div>

            {/* BUTTON */}
            <button
              disabled={loading}
              className="w-full h-11 rounded-xl bg-black dark:bg-white dark:text-black text-white font-medium
              hover:opacity-90 active:scale-[0.99] transition shadow-sm cursor-pointer"
            >
              {loading ? t("workerSignup.creating") : t("workerSignup.createAccount")}
            </button>
          </form>
          <p className="text-sm text-center mt-6 text-gray-600 dark:text-gray-400">
            {t("workerSignup.alreadyHaveAccount")}?
            <Link
              to="/login"
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline underline-offset-4 cursor-pointer transition"
            >
              {t("workerSignup.login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default WorkerSignup;
