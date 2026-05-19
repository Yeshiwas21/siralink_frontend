import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { signupWorker } from "../../services/userServices";

function WorkerSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    password_2: "",
    first_name: "",
    last_name: "",
    national_id: "",
    skills: "",
    bio: "",
    location: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    // clear field error while typing
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const capitalizeWords = (value) => {
    return value
      .toLowerCase()
      .replace(/(^|\s|[-'])\w/g, (char) => char.toUpperCase());
  };

  const handleNameChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: capitalizeWords(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    const phone = form.phone?.trim();

    if (/^\+2519\d{8}$/.test(phone)) {
      delete newErrors.phone; // valid international format
    } else if (/^\d{10}$/.test(phone)) {
      delete newErrors.phone; // valid local format
    } else {
      newErrors.phone =
        "Phone must be +2519XXXXXXXX (14 chars) or 10 digit local number";
    }
    // PASSWORD
    if (!form.password || form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else {
      delete newErrors.password;
    }

    // CONFIRM PASSWORD
    if (form.password !== form.password_2) {
      newErrors.password_2 = "Passwords do not match";
    } else {
      delete newErrors.password_2;
    }

    // TEXT FIELD VALIDATOR (letters + spaces, starts with letter)
    const validateTextField = (value) => {
      const val = value?.trim();

      if (!val || val.length < 2) {
        return "Minimum 2 characters required";
      } else if (!/^[A-Za-z]/.test(val)) {
        return "Must start with a letter";
      } else if (!/^[A-Za-z\s]+$/.test(val)) {
        return "Only letters are allowed";
      }

      return null;
    };

    // FIRST NAME
    const firstNameError = validateTextField(form.first_name);
    if (firstNameError) {
      newErrors.first_name = firstNameError;
    } else {
      delete newErrors.first_name;
    }

    // LAST NAME
    const lastNameError = validateTextField(form.last_name);
    if (lastNameError) {
      newErrors.last_name = lastNameError;
    } else {
      delete newErrors.last_name;
    }

    // NATIONAL ID
    if (!form.national_id || form.national_id.trim().length < 16) {
      newErrors.national_id = "Minimum 16 characters required";
    } else {
      delete newErrors.national_id;
    }

    // LOCATION
    const locationError = validateTextField(form.location);
    if (locationError) {
      newErrors.location = locationError;
    } else {
      delete newErrors.location;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      await signupWorker(form);
      toast.success("Your account created successfully. You can login");
      navigate("/login");
    } catch (err) {
      const backendErrors = err.response?.data;

      let formattedErrors = {};

      if (backendErrors) {
        // Handle nested worker errors
        if (backendErrors.worker) {
          Object.entries(backendErrors.worker).forEach(([key, value]) => {
            formattedErrors[key] = value[0]; // take first error message
          });
        }

        // Handle top-level errors
        Object.entries(backendErrors).forEach(([key, value]) => {
          if (key !== "worker") {
            formattedErrors[key] = Array.isArray(value) ? value[0] : value;
          }
        });
      }

      // fallback
      if (Object.keys(formattedErrors).length === 0) {
        formattedErrors.form = "Signup failed";
      }

      setErrors(formattedErrors);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full border p-2 rounded ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-5 text-center">Join as Worker</h2>
      <p className="text-center text-sm text-gray-500 mb-6">
        Find jobs and offer services
      </p>

      {errors.form && (
        <p className="text-red-500 text-sm mb-3 text-center">{errors.form}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* FIRST NAME */}
        <input
          name="first_name"
          placeholder="First Name"
          autoComplete="off"
          autoCapitalize="words"
          required
          className={inputClass("first_name")}
          value={form.first_name}
          onChange={handleNameChange}
        />
        {errors.first_name && (
          <p className="text-red-500 text-sm">{errors.first_name}</p>
        )}

        {/* LAST NAME */}
        <input
          name="last_name"
          placeholder="Last Name"
          autoComplete="off"
          autoCapitalize="words"
          required
          className={inputClass("last_name")}
          value={form.last_name}
          onChange={handleNameChange}
        />
        {errors.last_name && (
          <p className="text-red-500 text-sm">{errors.last_name}</p>
        )}

        {/* NATIONAL ID */}
        <input
          name="national_id"
          placeholder="National ID"
          autoComplete="off"
          required
          className={inputClass("national_id")}
          onChange={handleChange}
        />
        {errors.national_id && (
          <p className="text-red-500 text-sm">{errors.national_id}</p>
        )}

        {/* LOCATION */}
        <input
          name="location"
          placeholder="Location"
          autoComplete="off"
          required
          className={inputClass("location")}
          onChange={handleChange}
        />
        {errors.location && (
          <p className="text-red-500 text-sm">{errors.location}</p>
        )}

        {/* EMAIL */}
        <input
          name="email"
          placeholder="Email"
          autoComplete="off"
          required
          className={inputClass("email")}
          onChange={handleChange}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        {/* PHONE */}
        <input
          name="phone"
          placeholder="Phone (+2519XXXXXXXX or 09XXXXXXXX)"
          autoComplete="off"
          required
          className={inputClass("phone")}
          onChange={handleChange}
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

        {/* PASSWORD */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="off"
          required
          className={inputClass("password")}
          onChange={handleChange}
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
          required
          className={inputClass("password_2")}
          onChange={handleChange}
        />
        {errors.password_2 && (
          <p className="text-red-500 text-sm">{errors.password_2}</p>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
      <p className="text-sm text-center mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600">
          Login
        </Link>
      </p>
    </div>
  );
}

export default WorkerSignup;
