import {
  loginUser,
  logoutUser,
  getMe,
} from "../api/userApi";

/**
 * Login user.
 * Backend sets HttpOnly cookies.
 */
export const loginApi = async (data) => {

  if (!data.turnstile_token) {
    throw new Error("Captcha not completed");
  }
  const res = await loginUser(data);

  return res.data;
};


/**
 * Logout user.
 * Backend clears authentication cookies.
 */
export const logoutApi = async () => {
  try {
    await logoutUser();
  } catch (error) {

    console.log(
      "Logout API failed (ignored)",
      error
    );
  }
};



/**
 * Get authenticated user.
 */
export const getMeApi = async () => {
  const res = await getMe();
  return res.data;

};