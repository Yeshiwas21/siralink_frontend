import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchUsers as listUsers,
  createWorker,
} from "../../../services/userServices";

function CreateWorker() {
  const navigate = useNavigate();

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
    verified: "",
  });

  /* FETCH USERS */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await listUsers();

        const availableUsers = data.filter(
          (u) =>
            u.user_type === "worker" && u.worker === null && u.client === null,
        );

        setUsers(availableUsers);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  /* CAPITALIZE */
  const capitalizeWords = (value) => {
    return value
      .toLowerCase()
      .replace(/(^|\s|[-'])\w/g, (char) => char.toUpperCase());
  };

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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const handleNameChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: capitalizeWords(value),
    }));

    setErrors({
      ...errors,
      [name]: "",
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

    // FIRST NAME
    const firstNameError = validateTextField(form.first_name);
    if (firstNameError) newErrors.first_name = firstNameError;

    // LAST NAME
    const lastNameError = validateTextField(form.last_name);
    if (lastNameError) newErrors.last_name = lastNameError;

    // NATIONAL ID
    if (!form.national_id || form.national_id.trim().length < 16) {
      newErrors.national_id = "Minimum 16 characters required";
    }

    // LOCATION
    const locationError = validateTextField(form.location);
    if (locationError) newErrors.location = locationError;

    // SKILLS
    if (!form.skills || form.skills.trim().length < 2) {
      newErrors.skills = "Skills must be at least 2 characters";
    }

    // BIO
    if (form.bio && form.bio.length < 10) {
      newErrors.bio = "Bio must be at least 10 characters";
    }

    // EXPERIENCE
    if (
      form.experience_years === "" ||
      isNaN(form.experience_years) ||
      form.experience_years < 0
    ) {
      newErrors.experience_years = "Enter valid experience years";
    }

    // PORTFOLIO LINK
    if (form.portfolio_link) {
      const urlPattern = /^(https?:\/\/)?([\w.-]+)+(:\d+)?(\/([\w/_-]+))*\/?$/;
      if (!urlPattern.test(form.portfolio_link)) {
        newErrors.portfolio_link = "Enter a valid URL";
      }
    }

    // PROFILE
    if (form.profile_image) {
      const file = form.profile_image;

      if (!file.type.startsWith("image/")) {
        newErrors.profile_image = "File must be an image";
      }

      if (file.size > 2 * 1024 * 1024) {
        newErrors.profile_image = "Max size is 2MB";
      }
    }

    // VERIFIED
    if (!form.verified) {
      newErrors.verified = "Please select verification status";
    }

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
      formData.append("first_name", form.first_name);
      formData.append("last_name", form.last_name);
      formData.append("national_id", form.national_id);
      formData.append("location", form.location);
      formData.append("skills", form.skills);
      formData.append("bio", form.bio);
      formData.append("experience_years", form.experience_years);
      formData.append("portfolio_link", form.portfolio_link);
      formData.append("verified", form.verified === "true");

      if (form.profile_image) {
        formData.append("profile_image", form.profile_image);
      }

      await createWorker(formData);

      navigate("/admin/workers");
    } catch (err) {
      console.error(err);

      const backendErrors = err?.response?.data;
      let formattedErrors = {};

      if (backendErrors) {
        Object.entries(backendErrors).forEach(([key, value]) => {
          formattedErrors[key] = Array.isArray(value) ? value[0] : value;
        });
      }

      if (Object.keys(formattedErrors).length === 0) {
        formattedErrors.general = "Creation failed";
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
    <div className="p-6 bg-white rounded-xl shadow max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Worker</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* USER */}
        <div>
          <label className="text-sm font-semibold">
            Select A Non-linked Worker User
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
          value={form.email}
          disabled
          placeholder="Email"
          className={`${inputClass("email")} cursor-not-allowed bg-gray-100`}
        />

        {/* PHONE */}
        <input
          value={form.phone}
          disabled
          placeholder="Phone"
          className={`${inputClass("email")} cursor-not-allowed bg-gray-100`}
        />
        {/* FIRST NAME */}
        <input
          name="first_name"
          placeholder="First Name"
          autoComplete="off"
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
          className={inputClass("location")}
          onChange={handleChange}
        />
        {errors.location && (
          <p className="text-red-500 text-sm">{errors.location}</p>
        )}
        {/* SKILSS */}
        <input
          name="skills"
          placeholder="Skills (e.g. Plumbing, Electrical)"
          className={inputClass("skills")}
          value={form.skills}
          onChange={handleChange}
        />
        {errors.skills && (
          <p className="text-red-500 text-sm">{errors.skills}</p>
        )}

        {/* BIO */}
        <textarea
          name="bio"
          placeholder="Short Bio"
          className={inputClass("bio")}
          value={form.bio}
          onChange={handleChange}
        />
        {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}

        {/* EXPERIENCE */}
        <input
          type="number"
          name="experience_years"
          placeholder="Experience (years)"
          className={inputClass("experience_years")}
          value={form.experience_years}
          onChange={handleChange}
        />
        {errors.experience_years && (
          <p className="text-red-500 text-sm">{errors.experience_years}</p>
        )}

        {/* PORTFOLIO */}
        <input
          name="portfolio_link"
          placeholder="Portfolio Link (optional)"
          className={inputClass("portfolio_link")}
          value={form.portfolio_link}
          onChange={handleChange}
        />
        {errors.portfolio_link && (
          <p className="text-red-500 text-sm">{errors.portfolio_link}</p>
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

        {/* PROFILE IMAGE */}
        <input
          type="file"
          name="profile_image"
          accept="image/*"
          className={inputClass("profile_image")}
          onChange={(e) =>
            setForm({
              ...form,
              profile_image: e.target.files[0],
            })
          }
        />

        {errors.profile_image && (
          <p className="text-red-500 text-sm">{errors.profile_image}</p>
        )}
        {/* GENERAL ERROR */}
        {errors.general && (
          <p className="text-red-500 text-sm">{errors.general}</p>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white w-full p-2 rounded"
        >
          {loading ? "Creating..." : "Create Worker"}
        </button>
      </form>
    </div>
  );
}

export default CreateWorker;
