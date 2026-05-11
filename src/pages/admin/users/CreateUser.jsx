import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../../services/userServices";

function CreateUser() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    password_2: "",
    user_type: "",
    is_active: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* INPUT CHANGE */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  /* VALIDATION */
  const validate = () => {
    let newErrors = {};

    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Enter a valid email";
    }

    const phone = form.phone?.trim();
    if (!/^\+2519\d{8}$/.test(phone) && !/^\d{10}$/.test(phone)) {
      newErrors.phone = "Use +2519XXXXXXXX or 10 digit local number";
    }

    if (!form.password || form.password.length < 8) {
      newErrors.password = "Min 8 characters required";
    }
    if (!form.password_2) {
      newErrors.password_2 = "Please confirm a password";
    } else if (form.password !== form.password_2) {
      newErrors.password_2 = "Passwords do not match";
    }

    if (!form.user_type) {
      newErrors.user_type = "Select user type";
    }

    if (!form.is_active) {
      newErrors.is_active = "Select a status";
    }

    return newErrors;
  };

  /* ERROR PARSER */
  const parseErrors = (errData) => {
    const newErrors = {};

    if (!errData || typeof errData !== "object") {
      return { general: "Something went wrong" };
    }

    Object.keys(errData).forEach((key) => {
      const value = errData[key];

      newErrors[key] = Array.isArray(value)
        ? value?.[0]
        : value || "Invalid value";
    });

    return newErrors;
  };

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);

      await registerUser(form);
      navigate("/admin/users");
    } catch (err) {
      setErrors(parseErrors(err?.response?.data));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full border p-2 rounded ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div className="p-6 bg-white rounded-xl shadow max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Create User</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* EMAIL */}
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          autoComplete="off"
          value={form.email}
          onChange={handleChange}
          className={inputClass("email")}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        {/* PHONE */}
        <input
          name="phone"
          required
          placeholder="Phone (+2519XXXXXXXX or 09XXXXXXXX)"
          autoComplete="off"
          value={form.phone}
          onChange={handleChange}
          className={inputClass("phone")}
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

        {/* USER TYPE */}
        <select
          name="user_type"
          required
          value={form.user_type}
          onChange={handleChange}
          className={inputClass("user_type")}
        >
          <option value="">Select User Type</option>
          <option value="client">Client</option>
          <option value="worker">Worker</option>
          <option value="admin">Admin</option>
        </select>
        {errors.user_type && (
          <p className="text-red-500 text-sm">{errors.user_type}</p>
        )}

        {/* PASSWORD */}
        <input
          type="password"
          name="password"
          required
          placeholder="Password (min 8 characters)"
          autoComplete="off"
          value={form.password}
          onChange={handleChange}
          className={inputClass("password")}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password}</p>
        )}

        {/* CONFIRM PASSWORD */}
        <input
          type="password"
          name="password_2"
          placeholder="Confirm Password"
          autoComplete="off"
          value={form.password_2}
          onChange={handleChange}
          className={inputClass("password_2")}
        />
        {errors.password_2 && (
          <p className="text-red-500 text-sm">{errors.password_2}</p>
        )}

        {/* STATUS */}
        <select
          name="is_active"
          value={form.is_active}
          onChange={handleChange}
          className={inputClass("is_active")}
        >
          <option value="">Select A Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        {errors.is_active && (
          <p className="text-red-500 text-sm">{errors.is_active}</p>
        )}

        {/* GENERAL ERROR */}
        {errors.general && (
          <p className="text-red-500 text-sm text-center">{errors.general}</p>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded font-semibold w-full cursor-pointer"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
}

export default CreateUser;
