import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchUsers as listUsers,
  createClient,
} from "../../../services/userServices";

function CreateClient() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    phone: "",
    company_name: "",
    verified: "",
    location: "",
  });

  /* FETCH USERS */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await listUsers();
        const clientsOnly = data.filter(
          (u) =>
            u.user_type === "client" && u.client === null && u.worker === null,
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

    const user = users.find((u) => String(u.id) === String(userId));

    setForm((prev) => ({
      ...prev,
      email: user?.email || "",
      phone: user?.phone || "",
    }));

    setErrors((prev) => ({ ...prev, user: "" }));
  };

  /* INPUT CHANGE */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "verified" ? value === "true" : value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  /* VALIDATION */
  const validate = () => {
    let newErrors = {};

    // USER
    if (!selectedUserId) {
      newErrors.user = "Please select a user";
    }

    // TEXT VALIDATOR
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

    // COMPANY NAME
    const companyError = validateTextField(form.company_name);
    if (companyError) newErrors.company_name = companyError;

    // VERIFICATION STATUS
    if (!form.verified) {
      newErrors.verified = "Please select a verification status";
    }

    // LOCATION
    const locationError = validateTextField(form.location);
    if (locationError) newErrors.location = locationError;

    return newErrors;
  };

  /* ERROR PARSER */
  const parseErrors = (errData) => {
    const newErrors = {};

    if (!errData || typeof errData !== "object") {
      return { general: "Something went wrong" };
    }

    Object.keys(errData).forEach((key) => {
      newErrors[key] = Array.isArray(errData[key])
        ? errData[key][0]
        : errData[key];
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

      await createClient({
        user: selectedUserId,
        company_name: form.company_name,
        verified: form.verified,
        location: form.location,
      });

      navigate("/admin/clients");
    } catch (err) {
      console.error(err);
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
      <h2 className="text-xl font-bold mb-4">Create Client</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* USER */}
        <div>
          <label className="text-sm font-semibold">
            Select A Non-linked Client User
          </label>

          <select
            value={selectedUserId}
            onChange={handleUserChange}
            className={inputClass("user")}
          >
            <option value="">-- Select User --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email} (ID: {user.id})
              </option>
            ))}
          </select>

          {errors.user && <p className="text-red-500 text-sm">{errors.user}</p>}
        </div>
        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          disabled
          className={`${inputClass("email")} cursor-not-allowed bg-gray-100`}
        />

        {/* PHONE */}
        <input
          value={form.phone}
          disabled
          placeholder="Phone"
          className={`${inputClass("email")} cursor-not-allowed bg-gray-100`}
        />
        {/* COMPANY NAME */}
        <input
          name="company_name"
          placeholder="Company Name"
          autoComplete="off"
          value={form.company_name}
          onChange={handleChange}
          className={inputClass("company_name")}
        />
        {errors.company_name && (
          <p className="text-red-500 text-sm">{errors.company_name}</p>
        )}

        {/* VERIFICATION */}
        <select
          name="verified"
          value={form.verified}
          onChange={handleChange}
          className={inputClass("verified")}
        >
          <option value="">Select Status</option>
          <option value="true">Verified</option>
          <option value="false">Not Verified</option>
        </select>
        {errors.verified && (
          <p className="text-red-500 text-sm">{errors.verified}</p>
        )}

        {/* LOCATION */}
        <input
          name="location"
          placeholder="Location"
          autoComplete="off"
          value={form.location}
          onChange={handleChange}
          className={inputClass("location")}
        />
        {errors.location && (
          <p className="text-red-500 text-sm">{errors.location}</p>
        )}

        {/* GENERAL ERROR */}
        {errors.general && (
          <p className="text-red-500 text-sm">{errors.general}</p>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-400 px-4 py-2 rounded font-semibold w-full"
        >
          {loading ? "Creating..." : "Create Client"}
        </button>
      </form>
    </div>
  );
}

export default CreateClient;
