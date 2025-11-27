import { create } from "zustand";
import {
  getDealerDebtt,
  getDeealerdebtById,
  getDealerDebtShedule,
  getDebt,
  makePayment,
  getPaymentHistory,
  confirmDebtPayment,
  rejectDebtPayment,
  makeCustomerPayment,
} from "../api/dealerdebt";
const useDealerDebt = create((set) => ({
  dealerDebt: [],
  isLoadingDealerDebt: false,
  fetchDealerDebt: async () => {
    set({ isLoadingDealerDebt: true });
    try {
      const response = await getDealerDebtt();
      if (response && response.status === 200) {
        set({ dealerDebt: response.data.data, isLoadingDealerDebt: false });
      }
      return response;
    } catch (error) {
      console.error("Error fetching dealer debt:", error);
    } finally {
      set({ isLoadingDealerDebt: false });
    }
  },

  dealerDebtById: {},
  isLoadingDealerDebtById: false,
  fetchDealerDebtById: async (id) => {
    set({ isLoadingDealerDebtById: true });
    try {
      const response = await getDeealerdebtById(id);
      if (response && response.data.success) {
        set({
          dealerDebtById: response.data.data,
          isLoadingDealerDebtById: false,
        });
      }
      return response;
    } catch (error) {
      console.error("Error fetching dealer debt by ID:", error);
    } finally {
      set({ isLoadingDealerDebtById: false });
    }
  },

  debtSchedules: [],
  isLoadingDebtSchedules: false,
  fetchDebtSchedules: async (id) => {
    set({ isLoadingDebtSchedules: true });
    try {
      const response = await getDealerDebtShedule(id);
      if (response && response.data.success) {
        set({
          debtSchedules: response.data.data,
          isLoadingDebtSchedules: false,
        });
      }
      return response;
    } catch (error) {
      console.error("Error fetching debt schedules:", error);
      set({ isLoadingDebtSchedules: false });
    }
  },

  clearDebtSchedules: () =>
    set({ debtSchedules: [], isLoadingDebtSchedules: false }),

  paymentHistory: [],
  isLoadingPaymentHistory: false,
  fetchPaymentHistory: async (id) => {
    set({ isLoadingPaymentHistory: true });
    try {
      const response = await getPaymentHistory(id);
      if (response && response.data.success) {
        set({
          paymentHistory: response.data.data,
          isLoadingPaymentHistory: false,
        });
      }
      return response;
    } catch (error) {
      console.error("Error fetching payment history:", error);
      set({ isLoadingPaymentHistory: false });
    }
  },

  clearPaymentHistory: () =>
    set({ paymentHistory: [], isLoadingPaymentHistory: false }),

  isLoadingConfirmPayment: false,
  confirmDebtPayment: async (debtId, paymentId, confirmedBy) => {
    set({ isLoadingConfirmPayment: true });
    try {
      const response = await confirmDebtPayment(debtId, paymentId, confirmedBy);
      if (response && response.status === 200) {
        set({ isLoadingConfirmPayment: false });
      }
      return response;
    } catch (error) {
      console.error("Error confirming debt payment:", error);
      set({ isLoadingConfirmPayment: false });
      throw error;
    }
  },
  isLoadingRejectPayment: false,
  rejectDebtPayment: async (debtId, paymentId, rejectedBy, reason) => {
    set({ isLoadingRejectPayment: true });
    try {
      const response = await rejectDebtPayment(
        debtId,
        paymentId,
        rejectedBy,
        reason
      );
      if (response && response.status === 200) {
        set({ isLoadingRejectPayment: false });
      }
      return response;
    } catch (error) {
      console.error("Error rejecting debt payment:", error);
      set({ isLoadingRejectPayment: false });
      throw error;
    }
  },

  // của dealer manager
  debts: [],
  isLoadingDebts: false,
  fetchDebts: async (id) => {
    set({ isLoadingDebts: true });
    try {
      const response = await getDebt(id);
      if (response && response.status === 200) {
        set({ debts: response.data.data, isLoadingDebts: false });
      }
      return response;
    } catch (error) {
      console.error("Error fetching debts:", error);
      set({ isLoadingDebts: false });
    }
  },

  isMakingPayment: false,
  makePayment: async (debtId, paymentData, dealerId) => {
    set({ isMakingPayment: true });
    try {
      const response = await makePayment(debtId, paymentData); //
      if (response && response.status === 200) {
        set({ isMakingPayment: false });
      }
      return response;
    } catch (error) {
      console.error("Error making payment:", error);
      set({ isMakingPayment: false });
      return false;
    }
  },

  isLoadingCustomerPayment: false,
  makeCustomerPayment: async (scheduleId, amount,  paymentMethod, note) => {
    set({ isLoadingCustomerPayment: true });
    try {
      const response = await makeCustomerPayment(scheduleId, amount,  paymentMethod, note);
      if (response && response.status === 200) {
        set({ isLoadingCustomerPayment: false });
      }
      return response;
    } catch (error) {
      console.error("Error making customer payment:", error);
      set({ isLoadingCustomerPayment: false });
      throw error;
    }
  },
}));

export default useDealerDebt;
