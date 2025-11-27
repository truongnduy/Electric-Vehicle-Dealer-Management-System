import { create } from "zustand";
import {
  getAllDealers,
  getDealerById,
  deleteDealer,
  createDealer,
  updateDealer,
} from "../api/dealer";
import { toast } from "react-toastify";
const useDealerStore = create((set) => ({
  dealers: [],
  isLoading: false,
  fetchDealers: async () => {
    try {
      set({ isLoading: true });
      const response = await getAllDealers();
      if (response && response.status === 200) {
        set({ isLoading: false, dealers: response.data.data || [] });
      }
    } catch (error) {
      console.error("Error fetching dealers:", error);
      set({ isLoading: false });
    }
  },

  dealerDetail: {},
  fetchDealerById: async (id) => {
    try {
      set({ isLoading: true });
      const response = await getDealerById(id);
      if (response && response.status === 200) {
        set({ isLoading: false, dealerDetail: response.data.data || {} });
      }
    } catch (error) {
      console.error("Error fetching dealer by id:", error);
      set({ isLoading: false });
    }
  },
  isLoadingDelete: false,
  deleteDealer: async (id) => {
    try {
      set({ isLoadingDelete: true });
      const response = await deleteDealer(id);
      if (response && response.status === 200) {
        set({ isLoadingDelete: false });
      }
      return response;
    } catch (error) {
      console.error("Error deleting dealer:", error);

      set({ isLoadingDelete: false });
    }
  },

  createDealer: async (dealerData) => {
    try {
      set({ isLoading: true });
      const response = await createDealer(dealerData);
      if (response && response.status === 200) {
        set({ isLoading: false });
      }
      return response;
    } catch (error) {
      console.error("Error creating dealer:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateDealer: async (id, dealerData) => {
    try {
      set({ isLoading: true });
      const response = await updateDealer(id, dealerData);
      if (response && response.status === 200) {
        set({ isLoading: false });
        set({ dealerDetail: response.data.data || {} });
        return response;
      }
    } catch (error) {
      console.error("Error updating dealer:", error);
      set({ isLoading: false });
      throw error;
    }
  },
}));

export default useDealerStore;
