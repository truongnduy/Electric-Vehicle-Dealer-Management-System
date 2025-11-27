import { create } from "zustand";
import { getCustomerDebt, createCustomerDebt } from "../api/customerDebt";

const useCustomerDebt = create((set) => ({
  customerDebtsList: [],
  isLoadingCustomerDebts: false,
  fetchCustomerDebtsById: async (dealerId) => {
    set({ isLoadingCustomerDebts: true });
    try {
      const response = await getCustomerDebt(dealerId);
      if (response && response.status === 200) {
        set({
          customerDebtsList: response.data.data,
          isLoadingCustomerDebts: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch customer debts:", error);
      set({ isLoadingCustomerDebts: false });
    }
  },
  isLoadingCreateCustomerDebt: false,
  createCustomerDebtFromPayment: async (id) => {
    set({ isLoadingCreateCustomerDebt: true });
    try {
      const response = await createCustomerDebt(id);
      if (response && response.status === 200) {
        set({ isLoadingCreateCustomerDebt: false });
      }
      return response;
    } catch (error) {
      console.error("Failed to create customer debt from payment:", error);
      set({ isLoadingCreateCustomerDebt: false });
      throw error;
    }
  },
}));

export default useCustomerDebt;
