import { create } from "zustand";
import {
  createPayment,
  createPaymentWithVNPay,
  paymentSuccess,
  getPayment,
  getPaymentById,
} from "../api/payment";
const usePaymentStore = create((set) => ({
  payment: [],
  isLoadingPayment: false,
  getPayment: async () => {
    set({ isLoadingPayment: true });
    try {
      const response = await getPayment();
      if (response && response.status === 200) {
        set({ payment: response.data.data, isLoadingPayment: false });
      }
      return response;
    } catch (error) {
      console.error("Error fetching payments:", error);
      set({ isLoadingPayment: false });
    }
  },

  paymentById: {},
  isLoadingPaymentById: false,
  getPaymentById: async (id) => {
    set({ isLoadingPaymentById: true });
    try {
      const response = await getPaymentById(id);
      if (response && response.status === 200) {
        set({ paymentById: response.data.data, isLoadingPaymentById: false });
      }
      return response;
    } catch (error) {
      console.error("Error fetching payment by ID:", error);
      set({ isLoadingPaymentById: false });
    }
  },

  isLoadingCreatePayment: false,
  createPayment: async (data) => {
    set({ isLoadingCreatePayment: true });
    try {
      const response = await createPayment(data);
      if (response && response.status === 200) {
        set({ isLoadingCreatePayment: false });
      }
      return response;
    } catch (error) {
      console.error("Error creating payment:", error);
      set({ isLoadingCreatePayment: false });
    }
  },

  isLoadingCreateVNPayPayment: false,
  createPaymentWithVNPay: async (data) => {
    set({ isLoadingCreateVNPayPayment: true });
    try {
      const response = await createPaymentWithVNPay(data);
      if (response && response.status === 200) {
        set({ isLoadingCreateVNPayPayment: false });
      }
      return response;
    } catch (error) {
      console.error("Error creating VNPay payment:", error);
      set({ isLoadingCreateVNPayPayment: false });
      throw error;
    }
  },

  isPaymentSuccessLoading: false,
  paymentSuccess: async (id, status) => {
    set({ isPaymentSuccessLoading: true });
    try {
      const response = await paymentSuccess(id, status);
      if (response && response.status === 200) {
        set({ isPaymentSuccessLoading: false });
      }
      return response;
    } catch (error) {
      console.error("Error updating payment status:", error);
      set({ isPaymentSuccessLoading: false });
    }
  },
}));
export default usePaymentStore;
