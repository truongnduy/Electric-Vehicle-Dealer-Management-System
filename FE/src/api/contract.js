import axiosClient from "../config/axiosClient";

const getOrders = (dealerId) => {
  return axiosClient.get(`/api/orders/dealer/${dealerId}/no-contract`);
};

const getContracts = (dealerId) => {
  return axiosClient.get(`/api/contracts/dealer/${dealerId}`);
};

const getContractById = (contractId) => {
  return axiosClient.get(`/api/contracts/${contractId}`);
};

const getContractFile = (contractId) => {
  return axiosClient.get(`/api/contracts/files/${contractId}`, {
    responseType: "blob",
  });
};

const createContract = (data) => {
  return axiosClient.post("/api/contracts", data);
};

const signContract = (contractId) => {
  return axiosClient.put(`/api/contracts/${contractId}/sign`);
};

const deleteContract = (contractId) => {
  return axiosClient.delete(`/api/contracts/${contractId}`);
};


export {
  getOrders,
  getContracts,
  getContractById,
  getContractFile,
  createContract,
  signContract,
  deleteContract,
};
