import { create } from "zustand";
import {
  getVehicleVariants,
  getVehicleVariantById,
  createVehicleVariant,
  deleteVehicleVariant,
  updateVehicleVariant,
  getVehicleVariantDetails,
  createVehicleVariantDetails,
  updateVehicleVariantDetails,
} from "../api/vehicleVariant";
import { toast } from "react-toastify";

const useVariantStore = create((set) => ({
  variants: [],
  isLoading: false,
  isLoadingVariantList: false,
  fetchVariants: async () => {
    set({ isLoading: true, isLoadingVariantList: true });
    try {
      const response = await getVehicleVariants();
      set({
        variants: response.data.data,
        isLoading: false,
        isLoadingVariantList: false,
      });
    } catch (error) {
      console.error("Failed to fetch variants:", error);
      set({ isLoading: false, isLoadingVariantList: false });
      throw error;
    }
  },

  variantDetail: {},
  fetchVariantById: async (id) => {
    set({ isLoading: true });
    try {
      const response = await getVehicleVariantById(id);
      set({ variantDetail: response.data.data, isLoading: false });
      return response;
    } catch (error) {
      console.error("Failed to fetch variant by ID:", error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  variantDetails: {},
  fetchVariantDetails: async (id) => {
    set({ isLoading: true });
    try {
      const response = await getVehicleVariantDetails(id);
      if (response && response.status)
        set({ variantDetails: response.data.data, isLoading: false });
      return response;
    } catch (error) {
      console.error("Failed to fetch variant details:", error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  createVariant: async (data) => {
    set({ isLoading: true });
    try {
      const response = await createVehicleVariant(data);
      if (response && response.status === 200) {
        set({ isLoading: false });
      }
      return response;
    } catch (error) {
      console.error("Failed to create variant:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  createVariantDetails: async (id, data) => {
    set({ isLoading: true });
    try {
      const response = await createVehicleVariantDetails(id, data);
      if (response && response.status === 200) {
        set({ isLoading: false });
      }
      return response;
    } catch (error) {
      console.error("Failed to create variant details:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  deleteVariant: async (id) => {
    set({ isLoading: true });
    try {
      const response = await deleteVehicleVariant(id);
      if (response && response.status === 200) {
        set({ isLoading: false });
      }
      return response;
    } catch (error) {
      console.error("Failed to delete variant:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateVariant: async (id, formData) => {
    set({ isLoading: true });
    try {
      const response = await updateVehicleVariant(id, formData);
      if (response && response.data.success) {
        set({ isLoading: false });
      }
      return response;
    } catch (error) {
      console.error("Failed to update variant:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  isUpdating: false,
  updateVariantDetail: async (id, data) => {
    set({ isUpdating: true });
    try {
      const response = await updateVehicleVariantDetails(id, data);
      if (response && response.data.success) {
        set({ isUpdating: false });
      }
      return response;
    } catch (error) {
      console.error("Failed to update variant:", error);
      set({ isUpdating: false });
      throw error;
    }
  },
}));

export default useVariantStore;
