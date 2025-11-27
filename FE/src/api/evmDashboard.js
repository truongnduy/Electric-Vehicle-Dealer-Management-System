import axiosClient from "../config/axiosClient";

const getDealerData = async () => {
  return axiosClient.get(`/api/dealers/all`);
};

const getDealerRequestData = async () => {
  return axiosClient.get(`/api/dealer-requests`);
};

const getDealerSaleData = async (year, month) => {
  return axiosClient.get(
    `/api/reports/dealers/summary?year=${year}&month=${month}`
  );
};

const getDealerDebtData = async () => {
  return axiosClient.get(`/api/debts/dealer-debts`);
};

const getEvmStaffData = async () => {
  return axiosClient.get(`/api/evmstaff`);
};

const getVehicleInventoryData = async () => {
  return axiosClient.get(`/api/vehicles/manufacturer/stock`);
};

const getAllVehiclesData = async () => {
  return axiosClient.get(`/api/vehicles`);
};




export {
  getDealerData,
  getDealerRequestData,
  getDealerDebtData,
  getDealerSaleData,
  getEvmStaffData,
  getVehicleInventoryData,
  getAllVehiclesData,
};
