import api from "./axios";


/* LOGIN */
export const loginUser = (data) => {
  return api.post("/users/login/", data);
};


/* LOGOUT */
export const logoutUser = () => {
  return api.post("/users/logout/");
};


/* CURRENT USER */
export const getMe = () => {
  return api.get("/users/me/", {
    skipRefresh: true,  //This prevents the app from trying to refresh tokens when the user is not logged in yet.
  });
};


/* USERS LIST */
export const getUsers = () => {
  return api.get("/users/");
};


/* REGISTER USER */
export const userRegisterAPI = (data) => {
  return api.post("/users/register/", data);
};


/* DELETE USER */
export const userDeleteApi = (id) => {
  return api.delete(`/users/${id}/delete/`);
};


/* UPDATE USER */
export const userUpdateApi = (id, data) => {
  return api.put(`/users/${id}/update/`, data);
};


/* CLIENT SIGNUP */
export const clientSignupApi = (data) => {
  return api.post("/users/signup/client/", data);
};

/* CLIENT UPDATE */
export const clientUpdateApi = (id, data) => {
  return api.put(`/users/client/${id}/update/`, data);
};


/* WORKER SIGNUP */
export const workerSignupApi = (data) => {
  return api.post("/users/signup/worker/", data);
};

/* WORKER UPDATE*/
export const workerUpdateApi = (id, data) => {
  return api.put(`/users/worker/${id}/update/`, data)
}

/* LIST WORKERS */
export const workerListApi = () => {
  return api.get("/users/workers/");
};


/* LIST CLIENTS */
export const clientListApi = () => {
  return api.get("/users/clients/");
};


/* WORKER CREATE */
export const workerCreateApi = (data) => {
  return api.post("/users/create/worker/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


/* CLIENT CREATE */
export const clientCreateApi = (data) => {
  return api.post("/users/create/client/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


/* DELETE CLIENT */
export const clientDeleteApi = (id) => {
  return api.delete(`/users/client/${id}/delete/`);
};


/* DELETE WORKER */
export const workerDeleteApi = (id) => {
  return api.delete(`/users/worker/${id}/delete/`);
};

/* RESET PASSWORD EMAIL */
export const passwordResetEmailRequestApi = (email) => {
  return api.post('/users/request-reset-email/', { email })
}

/* SET NEW PASSWORD */
export const setPasswordResetApi = (data) => {
  // data: { password, token, uidb64 }
  return api.patch('/users/set-new-password/', data);
};



export const requestEmailVerificationApi = async (email) => {
  return api.post("/users/email-verification/request/", { email });
};

export const verifyEmailApi = async (data) => {
  return api.post("/users/email-verification/verify/", data);
};