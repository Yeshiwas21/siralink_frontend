import api from "./axios";

// WorkerCategor List API
export const workerCategoryListAPI = () => {
    return api.get("users/worker/worker_categor/");
}