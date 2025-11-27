import axiosClient from "../config/axiosClient";

const getAllDealers = () => {
  return axiosClient.get("/api/dealers/all");
};

const getDealerById = (id) => {
  return axiosClient.get(`/api/dealers/${id}`);
}

const createDealer = (data) => {
  return axiosClient.post("/api/dealers/create", data);
}

const updateDealer = (id, data) => {
  return axiosClient.put(`/api/dealers/update/${id}`, data);
}

const deleteDealer = (id) => {
  return axiosClient.delete(`/api/dealers/delete/${id}`);
}

const createDealerManagerAccount = (data) => {
  return axiosClient.post("/api/admin/create-dealer-account", data);
}

const createDealerStaffAccount = (data) => {
  return axiosClient.post("/api/admin/create-dealer-staff", data);
}



export { getAllDealers, getDealerById, createDealer, deleteDealer , updateDealer, createDealerManagerAccount, createDealerStaffAccount };


