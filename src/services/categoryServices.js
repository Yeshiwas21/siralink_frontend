import { workerCategoryListAPI } from "../api/workerCategoryApi";

export const listWorkerCategory = async () => {
    const response = await workerCategoryListAPI();
    return response.data
}