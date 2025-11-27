import axiosClient from "../config/axiosClient";

const getAllModels = () => {
  return axiosClient.get("/api/models");
};

const createModel = (data) => {
  return axiosClient.post("/api/models", data);
};

const updateModel = (id, data) => {
  return axiosClient.put(`/api/models/${id}`, data);
};

const activateModel = (id) => {
  return axiosClient.put(`/api/models/activate/${id}`);
};

const deleteModel = (id) => {
  return axiosClient.delete(`/api/models/${id}`);
};
export {
  getAllModels,
  createModel,
  updateModel,
  activateModel,
  deleteModel,
};
