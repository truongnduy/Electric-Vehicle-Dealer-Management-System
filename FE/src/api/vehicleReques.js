import axiosClient from "../config/axiosClient";

const getVehicleRequests = () => {
  return axiosClient.get("/api/dealer-requests");
};

const getVehicleRequestsDetail = (id) => {
  return axiosClient.get(`/api/dealer-requests/${id}`);
};

const getVehicleRequestsPending = () => {
  return axiosClient.get("/api/dealer-requests/pending");
};

const approveVehicleRequest = (id) => {
  return axiosClient.post(`/api/dealer-requests/${id}/approve`);
};

const rejectVehicleRequest = (id) => {
  return axiosClient.post(`/api/dealer-requests/${id}/reject`);
};

export {
  getVehicleRequests,
  getVehicleRequestsPending,
  getVehicleRequestsDetail,
  approveVehicleRequest,
  rejectVehicleRequest,
};
