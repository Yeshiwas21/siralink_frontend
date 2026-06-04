import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { signupClient } from "../../services/userServices";

function ClientSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    password_2: "",
    client_type: "individual",
    first_name: "",
    last_name: "",
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

    if (!form.email) e.email = "Email is required";
    if (!form.phone) e.phone = "Phone is required";

    if (!form.first_name) e.first_name = "First name is required";
    if (!form.last_name) e.last_name = "Last name is required";

    if (!form.password || form.password.length < 8) {
      e.password = "Minimum 8 characters required";
    }

    if (form.password !== form.password_2) {
      e.password_2 = "Passwords do not match";
    }

    if (!form.location) {
      e.location = "Location is required";
    }

    if (isIndividual && !form.national_id) {
      e.national_id = "National ID is required";
    }

    if (isCompany && !form.company_name) {
      e.company_name = "Company name is required";
    }

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const eObj = validate();
    setErrors(eObj);

    if (Object.keys(eObj).length > 0) return;

    try {
      setLoading(true);

      await signupClient(form);

      toast.success("Account created successfully");
      navigate("/login");
    } catch (err) {
      const backend = err?.response?.data || {};
      let formatted = {};

      // user-level errors
      Object.entries(backend).forEach(([key, value]) => {
        if (key === "client") return;
        formatted[key] = Array.isArray(value) ? value[0] : value;
      });

      // nested client errors
      if (backend.client) {
        Object.entries(backend.client).forEach(([key, value]) => {
          formatted[key] = Array.isArray(value) ? value[0] : value;
        });
      }

      setErrors(formatted);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full border p-2 rounded ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-5 text-center">Client Signup</h2>

      {/* CLIENT TYPE */}
      <select
        name="client_type"
        value={form.client_type}
        onChange={handleChange}
        className={inputClass("client_type")}
      >
        <option value="individual">Individual</option>
        <option value="company">Company</option>
      </select>
      {errors.client_type && (
        <p className="text-red-500 text-sm">{errors.client_type}</p>
      )}

      {/* NAME */}
      <input
        name="first_name"
        placeholder={isCompany ? "Contact First Name" : "First Name"}
        value={form.first_name}
        onChange={handleChange}
        className={inputClass("first_name")}
      />
      {errors.first_name && (
        <p className="text-red-500 text-sm">{errors.first_name}</p>
      )}

      <input
        name="last_name"
        placeholder={isCompany ? "Contact Last Name" : "Last Name"}
        value={form.last_name}
        onChange={handleChange}
        className={inputClass("last_name")}
      />
      {errors.last_name && (
        <p className="text-red-500 text-sm">{errors.last_name}</p>
      )}

      {/* NATIONAL ID */}
      {isIndividual && (
        <>
          <input
            name="national_id"
            placeholder="National ID"
            value={form.national_id}
            onChange={handleChange}
            className={inputClass("national_id")}
          />
          {errors.national_id && (
            <p className="text-red-500 text-sm">{errors.national_id}</p>
          )}
        </>
      )}

      {/* COMPANY NAME */}
      {isCompany && (
        <>
          <input
            name="company_name"
            placeholder="Company Name"
            value={form.company_name}
            onChange={handleChange}
            className={inputClass("company_name")}
          />
          {errors.company_name && (
            <p className="text-red-500 text-sm">{errors.company_name}</p>
          )}
        </>
      )}

      {/* LOCATION */}
      <input
        name="location"
        placeholder="Location"
        value={form.location}
        onChange={handleChange}
        className={inputClass("location")}
      />
      {errors.location && (
        <p className="text-red-500 text-sm">{errors.location}</p>
      )}

      {/* EMAIL */}
      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className={inputClass("email")}
      />
      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

      {/* PHONE */}
      <input
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
        className={inputClass("phone")}
      />
      {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

      {/* PASSWORD */}
      <input
        type="password"
        name="password"
        placeholder="Password"
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
        value={form.password_2}
        onChange={handleChange}
        className={inputClass("password_2")}
      />
      {errors.password_2 && (
        <p className="text-red-500 text-sm">{errors.password_2}</p>
      )}

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Creating..." : "Create Account"}
      </button>

      <p className="text-sm text-center mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600">
          Login
        </Link>
      </p>
    </div>
  );
}

export default ClientSignup;
