import axiosClient from "../config/axiosClient";

export const getStaffSalesByDealer = (dealerId) => {
  if (!dealerId) throw new Error("dealerId is required");
  return axiosClient.get(`/api/reports/staff-sales/${dealerId}`);
};

export const getDealersSummary = () => {
  return axiosClient.get("/api/reports/dealers/summary");
};

export const getInventoryReport = () => {
  return axiosClient.get("/api/reports/inventory");
};

export const getTurnoverReport = () => {
  return axiosClient.get("/api/reports/turnover");
};

export const getDealerSales = ({ dealerId, year, month } = {}) =>
  axiosClient.get("/api/reports/dealer-sales", {
    params: { dealerId, year, month },
  });

export const getStaffSelfSales = (userId, year, month) =>
  axiosClient.get(
    `/api/reports/staff-sales-report?userId=${userId}`
  );
