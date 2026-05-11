import api from "./axios";

/* LOGIN */
export const loginUser = (data) => {
  return api.post("/users/login/", data);
};

/* LOGOUT */
export const logoutUser = (refresh) => {
  return api.post("/users/logout/", { refresh });
};

/* CURRENT USER */
export const getMe = (token) => {
  return api.get("/users/me/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/* USERS LIST */
export const getUsers = () => {
  return api.get("/users/");
};


/* REGISTER USER */
export const registerUserAPI = (payload) => {
  return api.post(`/users/register/`, payload);
}

/* DELETE USER */
export const deleteUserApi = (id) => {
  return api.delete(`/users/${id}/delete/`);
};

/* UPDATE USER */
export const updateUserApi = (id, data) => {
  return api.put(`/users/${id}/update/`, data);
};



/* CLIENT  SIGNUP */
export const clientSignupApi = (payload) => {
  return api.post("/users/signup/client/", payload);
};

/* WORKER SIGNUP */
export const workerSignupApi = (payload) => {
  return api.post("/users/signup/worker/", payload);
};


/* LIST WORKERS */
export const listWorkerApi = () => {
  return api.get("/users/workers/");
};

/* LIST CLIENTS */
export const listClientApi = () => {
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
export const clientCreateApi = (payload) => {
  return api.post("/users/create/client/", payload);
};
