import axiosClient from "../config/axiosClient";

export const getAllModels = async () => {
  return await axiosClient.get("/api/models");
};

export const getModelById = async (id) => {
  return await axiosClient.get(`/api/models/${id}`);
};

export const createModel = async (data) => {
  return await axiosClient.post("/api/models", data);
};

export const updateModel = async (id, data) => {
  return await axiosClient.put(`/api/models/${id}`, data);
};

export const deleteModel = async (id) => {
  return await axiosClient.delete(`/api/models/${id}`);
};
