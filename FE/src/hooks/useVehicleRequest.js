import { create } from "zustand";
import {
  getVehicleRequests,
  getVehicleRequestsPending,
  getVehicleRequestsDetail,
  approveVehicleRequest,
  rejectVehicleRequest,
} from "../api/vehicleReques";

const useVehicleRequestStore = create((set) => ({
  vehicleRequestLists: [],
  isLoadingVehicleRequests: false,
  fetchVehicleRequests: async () => {
    set({ isLoadingVehicleRequests: true });
    try {
      const response = await getVehicleRequests();
      if (response && response.status === 200) {
        set({
          vehicleRequestLists: response.data.data,
          isLoadingVehicleRequests: false,
        });
      }
      return response;
    } catch (error) {
      set({ isLoadingVehicleRequests: false });
      console.error("Failed to fetch vehicle requests:", error);
    }
  },

  vehicleRequestDetail: {},
  fetchVehicleRequestDetail: async (id) => {
    set({ isLoadingVehicleRequests: true });
    try {
      const response = await getVehicleRequestsDetail(id);
      if (response && response.status === 200) {
        set({
          vehicleRequestDetail: response.data.data || {},
          isLoadingVehicleRequests: false,
        });
      }
      return response;
    } catch (error) {
      set({ isLoadingVehicleRequests: false });
      console.error("Failed to fetch vehicle requests:", error);
    }
  },

  vehicleRequestPending: [],
  fetchVehicleRequestPending: async () => {
    set({ isLoadingVehicleRequests: true });
    try {
      const response = await getVehicleRequestsPending();
      if (response && response.status === 200) {
        set({
          vehicleRequestPending: response.data.data,
          isLoadingVehicleRequests: false,
        });
      }
      return response;
    } catch (error) {
      set({ isLoadingVehicleRequests: false });
      console.error("Failed to fetch vehicle requests:", error);
    }
  },

  approvedRequest: async (id) => {
    try {
      const response = await approveVehicleRequest(id);
      if (response && response.status === 200) {
        set({ isLoadingVehicleRequests: false });
      }
      return response;
    } catch (error) {
      console.error("Failed to approve vehicle request:", error);
    }
  },

  rejectedRequest: async (id) => {
    try {
      const response = await rejectVehicleRequest(id);
      if (response && response.status === 200) {
        set({ isLoadingVehicleRequests: false });
      }
      return response;
    } catch (error) {
      console.error("Failed to reject vehicle request:", error);
    }
  },
}));

export default useVehicleRequestStore;
