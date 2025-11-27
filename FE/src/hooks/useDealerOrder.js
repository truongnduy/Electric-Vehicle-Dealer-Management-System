import { create } from "zustand";
import {
  createDealerOrder,
  getCustomerOrders,
  getCustomer,
  getCustomerOrderById,
  getCustomerById,
  CancelCustomerOrderById,
  getOrderById,
} from "../api/dealerOrder";

const useDealerOrder = create((set) => ({
  CustomerOrder: [],
  isLoadingCustomerOrder: false,
  getCustomerOrders: async (id) => {
    set({ isLoadingCustomerOrder: true });
    try {
      const response = await getCustomerOrders(id);
      if (response && response.status === 200) {
        set({
          CustomerOrder: response.data.data,
          isLoadingCustomerOrder: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch customer orders:", error);
      set({ isLoadingCustomerOrder: false });
      throw error;
    }
  },

  Customer: [],
  isLoadingCustomer: false,
  getCustomer: async (id) => {
    set({ isLoadingCustomer: true });
    try {
      const response = await getCustomer(id);
      if (response && response.status === 200) {
        set({ Customer: response.data.data, isLoadingCustomer: false });
      }
      return response;
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      set({ isLoadingCustomer: false });
      throw error;
    }
  },

  CustomerDetail: {},
  isLoadingCustomerDetail: false,
  getCustomerById: async (id) => {
    set({ isLoadingCustomer: true });
    try {
      const response = await getCustomerById(id);
      if (response && response.status === 200) {
        set({
          CustomerDetail: response.data.data,
          isLoadingCustomerDetail: false,
        });
      }
      return response;
    } catch (error) {
      set({ isLoadingCustomer: false });
      console.log("Erro at fetch customer by id at DealerOrderStore", error);
      throw error;
    }
  },

  CustomerOrderDetail: {},
  isLoadingOrderDetail: false,
  fetchCustomerOrderById: async (id) => {
    set({ isLoadingOrderDetail: true });
    try {
      const response = await getCustomerOrderById(id);
      if (response && response.status === 200) {
        set({
          CustomerOrderDetail: response.data.data,
          isLoadingOrderDetail: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch customer order by ID:", error);
      set({ isLoadingOrderDetail: false });
      throw error;
    }
  },

  isLoadingCreateOrder: false,
  createDealerOrder: async (data) => {
    set({ isLoadingCreateOrder: true });
    try {
      const response = await createDealerOrder(data);
      if (response && response.status === 200) {
        set({ isLoadingCreateOrder: false });
      }
      return response;
    } catch (error) {
      console.error("Failed to create dealer order:", error);
      set({ isLoadingCreateOrder: false });
      throw error;
    }
  },

  isLoadingCancelOrder: false,
  CancelCustomerOrderById: async (id) => {
    set({ isLoadingCancelOrder: true });
    try {
      const response = await CancelCustomerOrderById(id);
      if (response && response.status === 200) {
        set({ isLoadingCancelOrder: false });
      }
      return response;
    } catch (error) {
      console.error("Failed to cancel customer order:", error);
      set({ isLoadingCancelOrder: false });
      throw error;
    }
  },

  isLoadingFetchOrderById: false,
  OrderDetail: {},
  fetchOrderById: async (id) => {
    try {
      set({ isLoadingFetchOrderById: true });
      const response = await getOrderById(id);
      if (response && response.status === 200) {
        set({
          isLoadingFetchOrderById: false,
          OrderDetail: response.data.data,
        });
      }
      return response;
    } catch (error) {
      console.error("Failed to fetch order by ID:", error);
      set({ isLoadingFetchOrderById: false });
      throw error;
    }
  },
}));

export default useDealerOrder;
