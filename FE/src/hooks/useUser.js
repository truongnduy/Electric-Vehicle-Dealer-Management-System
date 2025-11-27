import { create } from "zustand";
import { updateUser, changePassword, getDealerAccounts } from "../api/user";
import { toast } from "react-toastify";
const useUserStore = create((set) => ({
  isLoading: false,
  UpdateProfile: async (data) => {
    try {
      set({ isLoading: true });
      const response = await updateUser(data);
      set({ isLoading: false });
      if (response && response.status === 200) {
        return {
          success: true,
          status: response.status,
          data: response.data.data || response.data,
        };
      }
      return { success: false, status: response.status };
    } catch (error) {
      set({ isLoading: false });
      console.error("Error updating user profile:", error);
      toast.error(error.response?.data?.message || "Cập nhật hồ sơ thất bại", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
      });
      throw error;
    }
  },

  changePassword: async (data) => {
    try {
      set({ isLoading: true });
      const response = await changePassword(data);
      set({ isLoading: false });
      if (response && response.status === 200) {
        return {
          success: true,
          status: response.status,
          data: response.data.data || response.data,
        };
      }
      return { success: false, status: response.status };
    } catch (error) {
      set({ isLoading: false });
      console.error("Error changing password:", error);
      throw error;
    }
  },

  dealerAccounts: [],
  isLoadingDealerAccounts: false,
  fetchDealerAccounts: async (id) => {
    try {
      set({ isLoadingDealerAccounts: true });
      const response = await getDealerAccounts(id);
      if (response && response.status === 200) {
        set({
          dealerAccounts: response.data.data || response.data,
          isLoadingDealerAccounts: false,
        });
      }
    } catch (error) {
      set({ isLoadingDealerAccounts: false });
      console.error("Error fetching dealer accounts:", error);
    }
  },
}));

export default useUserStore;
