import {
  clientSignupApi,
  workerSignupApi,
  getUsers,
  userRegisterAPI,
  userUpdateApi,
  userDeletApi,
  clientListApi,
  workerListApi,
  clientCreateApi,
  workerCreateApi,
  clientDeleteApi,
  workerDeleteApi
} from "../api/userApi";

/* USERS LIST */
export const fetchUsers = async () => {
  const res = await getUsers();
  return res.data;
};

/* CLIENT SIGNUP */
export const signupClient = async (form) => {
  const payload = {
    email: form.email,
    phone: form.phone,
    first_name: form.first_name,
    last_name: form.last_name,
    password: form.password,
    password_2: form.password_2,
    client: {
      client_type: form.client_type,
      national_id: form.national_id ,
      company_name: form.company_name,
      location: form.location,
    },
  };
  

  const res = await clientSignupApi(payload);
  return res.data;
};

/* WORKER SIGNUP */
export const signupWorker = async (form) => {
  const payload = {
    email: form.email,
    phone: form.phone,
    first_name: form.first_name,
    last_name: form.last_name,
    password: form.password,
    password_2: form.password_2,
    worker: {
      national_id: form.national_id,
      location: form.location,
      
    },
  };

  const res = await workerSignupApi(payload);
  return res.data;
};

/* REGISTER USER */
export const registerUser = async (payload) => {
  const response = await userRegisterAPI(payload);
  return response.data;
};

/* DELETE USER */
export const deleteUser = async (id) => {
  const response = await userDeletApi(id);
  return response.data;
};

/* UPDATE USER */
export const updateUser = async (id, data) => {
  const response = await userUpdateApi(id, data);
  return response.data;
};

/* LIST WORKER */
export const listWorker = async () => {
  const response = await workerListApi();
  return response.data;
};

/* LIST CLIENT */
export const listClient = async () => {
  const response = await clientListApi();
  return response.data;
};

/* CREATE CLIENT */
export const createClient = async (data) => {
  const response = await clientCreateApi(data);
  return response.data;
};

/* CREATE Worker */
export const createWorker = async (formData) => {
  const response = await workerCreateApi(formData);
  return response.data;
};

/* DELETE CLIENT */
export const deleteClient = async (id) => {
  const response = await clientDeleteApi(id);
  return response.data
}

/* DELETE WORKER */
export const deleteWorker = async(id) => {
  const response = await workerDeleteApi(id)
  return response.data
}