import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
      [name]: value,
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

    if (isIndividual && !form.national_id) {
      newErrors.national_id = "National ID is required";
    }

    if (isCompany && !form.company_name) {
      newErrors.company_name = "Company name is required";
    }

    // LOCATION
    const locationError = validateTextField(form.location);
    if (locationError) newErrors.location = locationError;

    // AVATAR
    if (form.avatar) {
      const file = form.avatar;

      if (!file.type.startsWith("image/")) {
        newErrors.avatar = "File must be an image";
      }

      if (file.size > 2 * 1024 * 1024) {
        newErrors.avatar = "Max size is 2MB";
      }
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

      /* Use FormData: You CANNOT send image with JSON.
       */
      const formData = new FormData();

      formData.append("user", selectedUserId);
      formData.append("client_type", form.client_type);
      formData.append("location", form.location);

      if (form.client_type === "company") {
        formData.append("company_name", form.company_name);
      }

      if (form.client_type === "individual") {
        formData.append("national_id", form.national_id);
      }

      if (form.avatar) {
        formData.append("avatar", form.avatar);
      }

      await createClient(formData);

      toast.success("New client created");
      navigate("/admin/clients");
    } catch (err) {
      console.error(err);
      setErrors(parseErrors(err?.response?.data));
      toast.error("Failed to create a client");
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
        <div>
          <label className="text-sm font-semibold">Client Type</label>

          <select
            name="client_type"
            value={form.client_type}
            onChange={handleChange}
            className={inputClass("client_type")}
          >
            <option value="individual">Individual</option>
            <option value="company">Company</option>
          </select>
        </div>
        {form.client_type === "company" && (
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

        {form.client_type === "individual" && (
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

        {/* AVATAR */}
        <input
          type="file"
          name="avatar"
          accept="image/*"
          className={inputClass("avatar")}
          onChange={(e) =>
            setForm({
              ...form,
              avatar: e.target.files[0],
            })
          }
        />

        {errors.avatar && (
          <p className="text-red-500 text-sm">{errors.avatar}</p>
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
