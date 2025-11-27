import { create } from "zustand";
import {
  getDealerRequest,
  createDealerRequest,
  getDealerRequestById,
  confirmVehicleRequest,
  deleteDealerRequest,
} from "../api/dealerRequest";

const useDealerRequest = create((set) => ({
  requestLists: [],
  requestDetail: null,
  isLoading: false,
  error: null,

  // Fetch all requests by dealer ID
  fetchRequestsByDealer: async (dealerId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getDealerRequest(dealerId);

      if (response && response.data) {
        set({
          requestLists: response.data.data || [],
          isLoading: false,
        });
        return response.data.data;
      }
      set({ isLoading: false });
      return [];
    } catch (error) {
      console.error("Error fetching dealer requests:", error);
      set({
        error: error.message || "Failed to fetch requests",
        isLoading: false,
        requestLists: [],
      });
      return [];
    }
  },

  // Fetch request detail by ID
  fetchRequestById: async (requestId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getDealerRequestById(requestId);

      if (response && response.data) {
        set({
          requestDetail: response.data.data || null,
          isLoading: false,
        });
        return response.data.data;
      }
      set({ isLoading: false });
      return null;
    } catch (error) {
      console.error("Error fetching request detail:", error);
      set({
        error: error.message || "Failed to fetch request detail",
        isLoading: false,
        requestDetail: null,
      });
      return null;
    }
  },

  // Create new request
  isLoadingCreateRequest: false,
  createRequestVehicle: async (data) => {
    try {
      set({ isLoadingCreateRequest: true, error: null });
      const response = await createDealerRequest(data);
      if (response && response.status === 200) {
        set({ isLoadingCreateRequest: false });
      }
      return response;
    } catch (error) {
      console.error("Error creating dealer request:", error);
      set({
        error: error.response?.data?.message || "Failed to create request",
        isLoadingCreateRequest: false,
      });
      throw error;
    }
  },

  isLoadingConfirmRequest: false,
  confirmRequestReceived: async (id) => {
    try {
      set({ isLoadingConfirmRequest: true });
      const response = await confirmVehicleRequest(id);
      if (response && response.status === 200) {
        set({ isLoadingConfirmRequest: false });
      }
      return response;
    } catch (error) {
      set({ isLoadingConfirmRequest: false });
      console.error("Error confirming request:", error);
      throw error;
    }
  },

  isLoadingDeleteRequest: false,
  deleteRequest: async (id) => {
    try {
      set({ isLoadingDeleteRequest: true });
      const response = await deleteDealerRequest(id);
      if (response && response.status === 200) {
        set({ isLoadingDeleteRequest: false });
      }
      return response;
    } catch (error) {
      console.error("Error deleting request:", error);
      throw error;
    }
  },
}));

export default useDealerRequest;
