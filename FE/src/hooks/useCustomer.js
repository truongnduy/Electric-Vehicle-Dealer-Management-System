import { create } from "zustand";
import {
  getAllCustomers,
  getCustomerById,
  deleteCustomerById,
  createCustomer,
  updateCustomer,
} from "../api/customer";

const useCustomerStore = create((set) => ({
  customers: [],
  isLoading: false,
  fetchCustomersByDealerId: async (Id) => {
    try {
      set({ isLoading: true });
      const response = await getAllCustomers(Id);
      if (response && response.status === 200)
        set({ customers: response.data.data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  },

  deleteCustomer: async (Id) => {
    try {
      set({ isLoading: true });
      const response = await deleteCustomerById(Id);
      if (response && response.status === 200) {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Failed to delete customer:", error);
      set({ isLoading: false });
    }
  },

  customerDetail: {},
  getCustomerById: async (Id) => {
    try {
      set({ isLoading: true });
      const response = await getCustomerById(Id);
      if (response && response.status === 200) {
        set({ customerDetail: response.data.data, isLoading: false });
      }
    } catch (error) {
      console.error("Failed to fetch customer by ID:", error);
      set({ isLoading: false });
    }
  },

  deleteCustomerById: async (Id) => {
    try {
      set({ isLoading: true });
      const response = await deleteCustomerById(Id);
      if (response && response.status === 200) {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Failed to delete customer by ID:", error);
      set({ isLoading: false });
    }
  },

  createCustomer: async (customerData) => {
    try {
      set({ isLoading: true });
      const response = await createCustomer(customerData);
      if (response && response.status === 200) {
        set({ isLoading: false });
        return response.data;
      }
    } catch (error) {
      console.error("Failed to create customer:", error);
      set({ isLoading: false });
    }
  },
  isLoadingUpdateCustomer: false,
  updateCustomer: async (Id, customerData) => {
    try {
      set({ isLoadingUpdateCustomer: true });
      const response = await updateCustomer(Id, customerData);
      if (response && response.status === 200) {
        set({ isLoadingUpdateCustomer: false });
      }
      return response;
    } catch (error) {
      console.error("Failed to update customer:", error);
      set({ isLoadingUpdateCustomer: false });
    }
  },
}));

export default useCustomerStore;
