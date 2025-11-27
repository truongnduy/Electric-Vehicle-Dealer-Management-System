import axiosClient from "../config/axiosClient";

const getAllVehicles = () => {
  return axiosClient.get("/api/vehicles");
};

const getEVMVehicles = () => {
  return axiosClient.get("/api/vehicles/manufacturer/vehicles");
}

const getVehicleById = (id) => {
  return axiosClient.get(`/api/vehicles/${id}`);
};

const getVehicleDealers = (id) => {
  return axiosClient.get(`/api/vehicles/dealer/${id}/vehicles`);
};

const createVehicle = (formData) => {
  return axiosClient.post("/api/vehicles", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const updateVehicle = (id, formData) => {
  return axiosClient.put(`/api/vehicles/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const deleteVehicle = (id) => {
  return axiosClient.delete(`/api/vehicles/${id}`);
};

const getTestDriverVehicles = (id) => {
  return axiosClient.get(`/api/vehicles/test-drive`);
}

const updateVehicleTestDriveStatus = (id) => {
  return axiosClient.put(`/api/vehicles/${id}/test-drive`);
}

const removeVehicleTestDriveStatus = (id) => {
  return axiosClient.put(`/api/vehicles/${id}/return-test-drive`);
}

export {
  getAllVehicles,
  getVehicleById,
  getVehicleDealers,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getEVMVehicles,
  getTestDriverVehicles,
  updateVehicleTestDriveStatus,
  removeVehicleTestDriveStatus,
};
