import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { signupClient } from "../../services/userServices";
import { translateApiError } from "../../utils/translateApiError";
import EthiopianDatePicker from "../../components/common/EthiopianDatePicker";
import { ethiopianToGregorian } from "../../utils/ethiopianToGregorian";

function ClientSignup() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    password_2: "",
    client_type: "individual",
    first_name: "",
    last_name: "",
    gender: "",
    date_of_birth: "",
    national_id: "",
    company_name: "",
    location: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isCompany = form.client_type === "company";
  const isIndividual = form.client_type === "individual";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      form: "",
    }));
  };

  const validate = () => {
    let e = {};

    // EMAIL
    if (!form.email) {
      e.email = t("clientSignup.validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = t("clientSignup.validation.emailValid");
    }

    // PHONE
    const phone = form.phone?.trim();
    if (!phone) {
      e.phone = t("clientSignup.validation.phoneRequired");
    } else if (!/^\+2519\d{8}$/.test(phone) && !/^\d{10}$/.test(phone)) {
      e.phone = t("clientSignup.validation.phoneValid");
    }

    // PASSWORD
    if (!form.password || form.password.length < 8) {
      e.password = t("clientSignup.validation.passwordMin");
    }

    // CONFIRM PASSWORD
    if (form.password && !form.password_2) {
      e.password_2 = t("clientSignup.validation.confirmRequired");
    } else if (form.password !== form.password_2) {
      e.password_2 = t("clientSignup.validation.passwordMatch");
    }

    // NAME VALIDATION
    const validateTextField = (value) => {
      const val = value?.trim();

      if (!val || val.length < 2) {
        return t("clientSignup.validation.textMin");
      }
      // Accepts letters from ANY language (including Amharic / Ge'ez)
      if (!/^\p{L}/u.test(val)) {
        return t("clientSignup.validation.textLetterStart");
      }

      // Allows letters from any language + spaces
      if (!/^[\p{L}\s]+$/u.test(val)) {
        return t("clientSignup.validation.textLettersOnly");
      }

      return null;
    };

    const firstNameError = validateTextField(form.first_name);
    if (firstNameError) e.first_name = firstNameError;

    const lastNameError = validateTextField(form.last_name);
    if (lastNameError) e.last_name = lastNameError;

    const locationError = validateTextField(form.location);
    if (locationError) e.location = locationError;

    // CONDITIONAL FIELDS
    if (isIndividual) {
      if (!form.national_id || form.national_id.trim().length != 12) {
        e.national_id = t("clientSignup.validation.finRequired");
      }

      // GENDER & DOB
      if (!form.gender) {
        e.gender = t("create_user.validation.select_gender");
      }
      if (!form.date_of_birth) {
        e.date_of_birth = t("create_user.validation.enter_dob");
      }
    }

    if (isCompany) {
      const company = form.company_name?.trim();

      if (!company) {
        e.company_name = t("clientSignup.validation.companyRequired");
      } else if (company.length < 2) {
        e.company_name = t("clientSignup.validation.companyMin");
      }
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
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        gender: form.gender || null,
        date_of_birth: ethiopianToGregorian(form.date_of_birth) || null,
        national_id: form.national_id?.trim() || null,
        company_name: form.company_name?.trim() || null,
        location: form.location?.trim() || null,
      };

      await signupClient(payload);

      toast.success(t("clientSignup.accountCreatedSuccess"));
      navigate("/login");
    } catch (err) {
      const backendErrors = parseErrors(err?.response?.data);

      setErrors(backendErrors);

      toast.error(
        backendErrors.form ||
        Object.values(backendErrors)[0] ||
        t("clientSignup.validation.defaultFailedClient")
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) => `w-full px-3 py-2.5 rounded-lg text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
    text-gray-900 dark:text-white  placeholder-gray-400 dark:placeholder-gray-500  focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10
    focus:border-gray-400 dark:focus:border-gray-500  transition
   ${errors[field]
      ? "border-red-400 focus:ring-red-200 dark:focus:ring-red-900"
      : ""
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors">
      <div className="w-full max-w-xl">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 text-center md:text-left">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t("clientSignup.title")}
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("clientSignup.subtitle")}
            </p>
          </div>

          <div className="md:text-right">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t("clientSignup.lookingForWork")}?
              <Link
                to="/signup/worker/"
                className="font-medium text-black dark:text-white hover:opacity-70 transition ml-2"
              >
                {t("clientSignup.applyAsWorker")} →
              </Link>
            </p>
          </div>
        </div>

        {/* CARD */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8 transition-colors">
          {errors.form && (
            <div className="mb-4 text-sm text-red-500 text-center">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CLIENT TYPE */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {t("clientSignup.accountType")}
              </label>

              <select
                name="client_type"
                value={form.client_type}
                onChange={handleChange}
                className={inputClass("client_type")}
              >
                <option value="individual">{t("clientSignup.individual")}</option>
                <option value="company">{t("clientSignup.company")}</option>
              </select>
            </div>

            {/* NAME */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  {isCompany ? t("clientSignup.contactFirstName") : t("clientSignup.firstName")}
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
                  {isCompany ? t("clientSignup.contactLastName") : t("clientSignup.lastName")}
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

            {/* CONDITIONAL */}
            {isIndividual && (
              <>
                {/* GENDER */}
                <div>
                  <div className="flex items-center gap-6">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ">
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
                      setForm((prev) => ({
                        ...prev,
                        date_of_birth: formattedDate,
                      }));

                      setErrors((prev) => ({
                        ...prev,
                        date_of_birth: "",
                      }));
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
                    {t("clientSignup.nationalId")}
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
              </>
            )}

            {isCompany && (
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  {t("clientSignup.companyName")}
                </label>
                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  className={inputClass("company_name")}
                  autoComplete="off"
                />
                {errors.company_name && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.company_name}
                  </p>
                )}
              </div>
            )}

            {/* CONTACT */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  {t("clientSignup.location")}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-300">
                    {t("clientSignup.email")}
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
                    {t("clientSignup.phone")}
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
            </div>

            {/* SECURITY */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  {t("clientSignup.password")}
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
                  {t("clientSignup.confirmPassword")}
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
              {loading ? t("clientSignup.creating") : t("clientSignup.createAccount")}
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-gray-600 dark:text-gray-400">
            {t("clientSignup.alreadyHaveAccount")}?{" "}
            <Link
              to="/login"
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline underline-offset-4 cursor-pointer transition"
            >
              {t("clientSignup.login")}
            </Link>
          </p>
        </div>
      </div >
    </div >
  );
}

export default ClientSignup;