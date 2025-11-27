import axiosClient from "../config/axiosClient";

const getStaffSalesData = async (dealerId, year, month) => {
  return axiosClient.get(
    `/api/reports/staff-sales/${dealerId}?year=${year}&month=${month}`
  );
};

const getDealerCustomerData = async (dealerId) => {
  return axiosClient.get(`/api/customers/dealer/${dealerId}`);
};

const getDealerOrderData = async (dealerId) => {
  return axiosClient.get(`/api/orders/dealer/${dealerId}`);
};

const getCustomerDebtData = async (dealerId) => {
  return axiosClient.get(`/api/debts/customer-debts/${dealerId}`);
};


const getDealerRevenueData = async (dealerId, year, month) => {
  return axiosClient.get(
    `/api/reports/dealer-sales?dealerId=${dealerId}&year=${year}&month=${month}`
  );
};

const getDealerDebtData = async (dealerId) => {
  return axiosClient.get(`/api/debts/dealer/${dealerId}`);
};

const getStaffData = async (dealerId) => {
  return axiosClient.get(`/api/users/dealer/${dealerId}/staff`);
}

// Inventory data (existing API)
const getDealerInventory = async (dealerId) => {
  return axiosClient.get(`/api/vehicles/dealer/${dealerId}/stock`);
};

// Feedback data (existing API)
const getDealerFeedbacks = async () => {
  return axiosClient.get("/api/feedbacks");
};

// Test drives data (existing API)
const getDealerTestDrives = async (dealerId) => {
  return axiosClient.get(`/api/testdrives/get-test-drives-by-dealer/${dealerId}`);
};

// Contracts data (existing API)
const getDealerContracts = async (dealerId) => {
  return axiosClient.get(`/api/contracts/dealer/${dealerId}`);
};

export {
  getStaffSalesData,
  getDealerCustomerData,
  getDealerOrderData,
  getCustomerDebtData,
  getDealerRevenueData,
  getDealerDebtData,
  getStaffData,
  getDealerInventory,
  getDealerFeedbacks,
  getDealerTestDrives,
  getDealerContracts,
};
