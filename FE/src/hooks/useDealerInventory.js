import { create } from "zustand";
import { getDealerInventory } from "../api/inventory";

const useDealerInventory = create((set) => ({
  inventory: [],
  isLoading: false,
  fetchDealerInventory: async (id) => {
    try {
      set({ isLoading: true });
      const response = await getDealerInventory(id);
      if (response && response.status === 200) {
        set({ inventory: response.data.data, isLoading: false });
      }
      return response;
    } catch (error) {
      set({ isLoading: false });
      console.error("Error fetching dealer inventory:", error);
      throw error;
    }
  },


  

}));

export default useDealerInventory;
