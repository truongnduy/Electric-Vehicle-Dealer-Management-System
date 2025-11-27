import { create } from "zustand";
import { startDelivery, completedDelivery } from "../api/delivery";

const useDelivery = create((set) => ({
  isStartingDelivery: false,
  isCompletingDelivery: false,
  startDelivery: async (orderId) => {
    set({ isStartingDelivery: true });
    try {
      const response = await startDelivery(orderId);
      if (response && response.status === 200) {
        set({ isStartingDelivery: false });
      }
      return response;
    } catch (error) {
      console.log("error at use delivery start delivery", error);
      set({ isStartingDelivery: false });
      throw error;
    }
  },
  completeDelivery: async (orderId) => {
    set({ isCompletingDelivery: true });
    try {
      const response = await completedDelivery(orderId);
      if (response && response.status === 200) {
        set({ isCompletingDelivery: false });
      }
      return response;
    } catch (error) {
      console.log("error at use delivery complete delivery", error);
      set({ isCompletingDelivery: false });
      throw error;
    }
  },
}));

export default useDelivery;
