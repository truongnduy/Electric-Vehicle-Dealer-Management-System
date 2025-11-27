import { create } from "zustand";
import {
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
} from "../api/dashboard";

const useDashboard = create((set, get) => ({
  // State
  staffSalesData: null,
  staffData: null,
  customerData: null,
  orderData: null,
  customerDebtData: null,
  dealerEvmDebtData: null,
  dealerDebtData: null,
  revenueData: null,
  inventoryData: null,
  feedbackData: null,
  testDriveData: null,
  contractData: null,
  isLoading: false,
  error: null,

  // Fetch staff sales data
  fetchStaffSalesData: async (dealerId, year, month) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getStaffSalesData(dealerId, year, month);
      if (response?.data?.success) {
        set({ staffSalesData: response.data.data, isLoading: false });
        return response.data.data;
      }
      set({ isLoading: false });
      return null;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error("Error fetching staff sales data:", error);
      return null;
    }
  },

  // Fetch customer data
  fetchCustomerData: async (dealerId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getDealerCustomerData(dealerId);
      if (response?.data?.success) {
        set({ customerData: response.data.data, isLoading: false });
        return response.data.data;
      }
      set({ isLoading: false });
      return null;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error("Error fetching customer data:", error);
      return null;
    }
  },

  // Fetch order data
  fetchOrderData: async (dealerId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getDealerOrderData(dealerId);
      if (response?.data?.success) {
        set({ orderData: response.data.data, isLoading: false });
        return response.data.data;
      }
      set({ isLoading: false });
      return null;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error("Error fetching order data:", error);
      return null;
    }
  },

  // Fetch customer debt data
  fetchCustomerDebtData: async (dealerId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getCustomerDebtData(dealerId);
      if (response?.data?.success) {
        set({ customerDebtData: response.data.data, isLoading: false });
        return response.data.data;
      }
      set({ isLoading: false });
      return null;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error("Error fetching customer debt data:", error);
      return null;
    }
  },

  // Fetch dealer debt data
  fetchDealerDebtData: async (dealerId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getDealerDebtData(dealerId);
      if (response?.data?.success) {
        set({ dealerDebtData: response.data.data, isLoading: false });
        return response.data.data;
      }
      set({ isLoading: false });
      return null;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error("Error fetching dealer debt data:", error);
      return null;
    }
  },

  // Fetch revenue data
  fetchRevenueData: async (dealerId, year, month) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getDealerRevenueData(dealerId, year, month);
      if (response?.data?.success) {
        set({ revenueData: response.data.data, isLoading: false });
        return response.data.data;
      }
      set({ isLoading: false });
      return null;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error("Error fetching revenue data:", error);
      return null;
    }
  },

  // Fetch staff data
  fetchStaffData: async (dealerId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getStaffData(dealerId);
      if (response?.data?.success) {
        set({ staffData: response.data.data, isLoading: false });
        return response.data.data;
      }
      set({ isLoading: false });
      return null;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error("Error fetching staff data:", error);
      return null;
    }
  },

  // Fetch inventory data
  fetchInventoryData: async (dealerId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getDealerInventory(dealerId);
      if (response?.data?.success) {
        set({ inventoryData: response.data.data, isLoading: false });
        return response.data.data;
      }
      set({ isLoading: false });
      return null;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error("Error fetching inventory data:", error);
      return null;
    }
  },

  // Fetch feedback data
  fetchFeedbackData: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await getDealerFeedbacks();
      if (response?.data?.success) {
        set({ feedbackData: response.data.data, isLoading: false });
        return response.data.data;
      }
      set({ isLoading: false });
      return null;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error("Error fetching feedback data:", error);
      return null;
    }
  },

  // Fetch test drive data
  fetchTestDriveData: async (dealerId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getDealerTestDrives(dealerId);
      if (response?.data?.success) {
        set({ testDriveData: response.data.data, isLoading: false });
        return response.data.data;
      }
      set({ isLoading: false });
      return null;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error("Error fetching test drive data:", error);
      return null;
    }
  },

  // Fetch contract data
  fetchContractData: async (dealerId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getDealerContracts(dealerId);
      if (response?.data?.success) {
        set({ contractData: response.data.data, isLoading: false });
        return response.data.data;
      }
      set({ isLoading: false });
      return null;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error("Error fetching contract data:", error);
      return null;
    }
  },

  // Fetch all dashboard data
  fetchAllDashboardData: async (dealerId, year, month) => {
    try {
      set({ isLoading: true, error: null });
      const state = get();
      
      await Promise.all([
        state.fetchStaffSalesData(dealerId, year, month),
        state.fetchStaffData(dealerId),
        state.fetchCustomerData(dealerId),
        state.fetchOrderData(dealerId),
        state.fetchCustomerDebtData(dealerId),
        state.fetchDealerDebtData(dealerId),
        state.fetchRevenueData(dealerId, year, month),
        state.fetchInventoryData(dealerId),
        state.fetchFeedbackData(),
        state.fetchTestDriveData(dealerId),
        state.fetchContractData(dealerId),
      ]);

      set({ isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error("Error fetching all dashboard data:", error);
    }
  },

  // Clear all data
  clearData: () => {
    set({
      staffSalesData: null,
      staffData: null,
      customerData: null,
      orderData: null,
      customerDebtData: null,
      dealerEvmDebtData: null,
      dealerDebtData: null,
      revenueData: null,
      inventoryData: null,
      feedbackData: null,
      testDriveData: null,
      contractData: null,
      isLoading: false,
      error: null,
    });
  },
}));

export default useDashboard;
