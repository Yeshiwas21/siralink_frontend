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
export const getMe = () => {
  return api.get("/users/me/");
};

/* USERS LIST */
export const getUsers = () => {
  return api.get("/users/");
};


/* REGISTER USER */
export const userRegisterAPI = (data) => {
  return api.post(`/users/register/`, data);
}

/* DELETE USER */
export const userDeletApi = (id) => {
  return api.delete(`/users/${id}/delete/`);
};

/* UPDATE USER */
export const userUpdateApi = (id, data) => {
  return api.put(`/users/${id}/update/`, data);
};



/* CLIENT  SIGNUP */
export const clientSignupApi = (data) => {
  return api.post("/users/signup/client/", data);
};

/* WORKER SIGNUP */
export const workerSignupApi = (data) => {
  return api.post("/users/signup/worker/", data);
};


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
