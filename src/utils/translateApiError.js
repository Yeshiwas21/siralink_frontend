export const translateApiError = (t, field, errorVal) => {
    if (!errorVal) return "";

    // 1. Extract string from array, object, or string
    let raw = "";
    if (Array.isArray(errorVal)) {
        raw = errorVal[0];
    } else if (typeof errorVal === "object" && errorVal !== null) {
        raw = errorVal.error_code || errorVal.code || errorVal.message || Object.values(errorVal)[0] || "";
    } else {
        raw = errorVal;
    }

    const str = raw.toString().trim();
    const lowerMsg = str.toLowerCase();

    // Convert snake_case or kebab-case to camelCase (e.g., national_id_exists -> nationalIdExists)
    const camelCode = str.replace(/[_|-]([a-z])/g, (_, letter) => letter.toUpperCase());

    // Helper to attempt translation lookup
    const tryTranslate = (key) => {
        const translated = t(key, { defaultValue: "" });
        return translated && translated !== key ? translated : null;
    };

    // --- Step A: Exact Code Matches (Direct Lookups) ---
    // Handles exact key matches like 'password_similar_company_name', 'national_id_registered_as_worker', etc.
    let result =
        tryTranslate(`backendErrors.${str}`) ||
        tryTranslate(`backendErrors.${camelCode}`) ||
        tryTranslate(`backendErrors.worker.${str}`) ||
        tryTranslate(`backendErrors.worker.${camelCode}`) ||
        tryTranslate(`backendErrors.client.${str}`) ||
        tryTranslate(`backendErrors.client.${camelCode}`);

    if (result) return result;

    // --- Step B: Password Similarity Fallbacks (Requires 'password' + context) ---
    if (str === "password_similar_first_name" || (lowerMsg.includes("password") && lowerMsg.includes("first name"))) {
        return t("backendErrors.password_similar_first_name");
    }
    if (str === "password_similar_last_name" || (lowerMsg.includes("password") && lowerMsg.includes("last name"))) {
        return t("backendErrors.password_similar_last_name");
    }
    if (str === "password_similar_email" || (lowerMsg.includes("password") && lowerMsg.includes("email"))) {
        return t("backendErrors.password_similar_email");
    }
    if (str === "password_similar_company_name" || (lowerMsg.includes("password") && lowerMsg.includes("company"))) {
        return t("backendErrors.password_similar_company_name");
    }

    // --- Step C: Password Complexity Validations ---
    if (
        lowerMsg.includes("numeric_password") ||
        str === "password_entirely_numeric" ||
        lowerMsg.includes("entirely numeric")
    ) {
        return t("backendErrors.numeric_password");
    }

    if (
        lowerMsg.includes("too common") ||
        lowerMsg.includes("weak_password") ||
        lowerMsg.includes("too short") ||
        str === "password_too_common" ||
        str === "password_too_short"
    ) {
        return t("backendErrors.weak_password");
    }

    // --- Step D: Auth Statuses ---
    if (lowerMsg.includes("invalid") || lowerMsg.includes("credential")) {
        return t("backendErrors.INVALID_CREDENTIAL");
    }
    if (lowerMsg.includes("pending") || lowerMsg.includes("review")) {
        return t("backendErrors.ACCOUNT_PENDING");
    }
    if (lowerMsg.includes("suspended")) {
        return t("backendErrors.ACCOUNT_SUSPENDED");
    }
    if (lowerMsg.includes("rejected")) {
        return t("backendErrors.ACCOUNT_REJECTED");
    }
    if (lowerMsg.includes("disabled")) {
        return t("backendErrors.USER_DISABLED");
    }

    // --- Step E: Duplicate Record Checks ---
    if (lowerMsg.includes("email already exists") || lowerMsg.includes("email_exists") || lowerMsg.includes("user with this email")) {
        return t("backendErrors.emailExists");
    }

    if (lowerMsg.includes("phone already exists") || lowerMsg.includes("phone_exists") || lowerMsg.includes("user with this phone")) {
        return t("backendErrors.phoneExists");
    }

    if (lowerMsg.includes("passwords do not match") || lowerMsg.includes("passwords_donot_match")) {
        return t("backendErrors.passwords_donot_match");
    }

    // --- Step F: Company Name & National ID Duplicates ---
    if (lowerMsg.includes("client with this company name") || lowerMsg.includes("company_name_exists") || lowerMsg.includes("company_exists")) {
        return t("backendErrors.client.companyNameExists");
    }

    if (lowerMsg.includes("registered as a client") || lowerMsg.includes("national_id_registered_as_client")) {
        return t("backendErrors.national_id_registered_as_client");
    }

    if (lowerMsg.includes("registered as a worker") || lowerMsg.includes("national_id_registered_as_worker")) {
        return t("backendErrors.national_id_registered_as_worker");
    }

    if (field === "national_id" || field === "client.national_id" || lowerMsg.includes("national_id") || lowerMsg.includes("national id")) {
        const workerMatch = tryTranslate("backendErrors.worker.nationalIdExists");
        if (workerMatch) return workerMatch;
        return t("backendErrors.client.nationalIdExists");
    }

    // Fallback: return raw error string if unmapped
    return str;
};