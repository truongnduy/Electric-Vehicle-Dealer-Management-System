import axiosClient from "../config/axiosClient";

const getVehicleVariants = () => {
  return axiosClient.get("/api/variants");
};

const getVehicleVariantById = (id) => {
  return axiosClient.get(`/api/variants/${id}`);
};

const getVehicleVariantDetails = (id) => {
  return axiosClient.get(`/api/variants/${id}/details`);
};

const createVehicleVariant = (data) => {
  return axiosClient.post("/api/variants", data);
};

const createVehicleVariantDetails = (id, data) => {
  return axiosClient.post(`/api/variants/${id}/details`, data);
};

const deleteVehicleVariant = (id) => {
  return axiosClient.delete(`/api/variants/${id}`);
};

const updateVehicleVariant = (id, data) => {
  return axiosClient.put(`/api/variants/${id}`, data);
};

const updateVehicleVariantDetails = (id, data) => {
  return axiosClient.put(`/api/variants/${id}/details`, data);
};

export {
  getVehicleVariants,
  getVehicleVariantById,
  createVehicleVariant,
  deleteVehicleVariant,
  updateVehicleVariant,
  getVehicleVariantDetails,
  createVehicleVariantDetails,
  updateVehicleVariantDetails,
};
