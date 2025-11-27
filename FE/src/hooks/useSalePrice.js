import { create } from "zustand";
import {
  getSalePrices,
  getSalePriceById,
  getSalePricesByDealer,
  getSalePricesByVariant,
  getEffectivePrice,
  createSalePrice,
  updateSalePrice,
  deleteSalePrice,
} from "../api/saleprice";

const useSalePrice = create((set) => ({
  // State
  salePrices: [],
  salePriceDetail: null,
  isLoading: false,
  isLoadingCreate: false,
  isLoadingUpdate: false,
  isLoadingDelete: false,

  // Lấy tất cả sale prices
  fetchSalePrices: async () => {
    set({ isLoading: true });
    try {
      const response = await getSalePrices();
      if (response && response.status === 200) {
        set({ salePrices: response.data.data || [], isLoading: false });
      }
      return response;
    } catch (error) {
      console.error("Error fetching sale prices:", error);
      set({ isLoading: false });
    }
  },

  // Lấy sale price theo ID
  fetchSalePriceById: async (id) => {
    set({ isLoading: true });
    try {
      const response = await getSalePriceById(id);
      if (response && response.status === 200) {
        set({ salePriceDetail: response.data.data, isLoading: false });
      }
      return response;
    } catch (error) {
      console.error("Error fetching sale price by ID:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  // Lấy sale prices theo dealer
  fetchSalePricesByDealer: async (dealerId) => {
    set({ isLoading: true });
    try {
      const response = await getSalePricesByDealer(dealerId);
      if (response && response.status === 200) {
        set({ salePrices: response.data.data || [], isLoading: false });
      }
      return response;
    } catch (error) {
      console.error("Error fetching sale prices by dealer:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  // Lấy sale prices theo variant
  fetchSalePricesByVariant: async (variantId) => {
    set({ isLoading: true });
    try {
      const response = await getSalePricesByVariant(variantId);
      if (response && response.status === 200) {
        set({ salePrices: response.data.data || [], isLoading: false });
      }
      return response;
    } catch (error) {
      console.error("Error fetching sale prices by variant:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  // Lấy giá hiệu lực
  fetchEffectivePrice: async (dealerId, variantId) => {
    set({ isLoading: true });
    try {
      const response = await getEffectivePrice(dealerId, variantId);
      if (response && response.status === 200) {
        set({ isLoading: false });
      }
       return response;
    } catch (error) {
      console.error("Error fetching effective price:", error);
      set({ isLoading: false });
      throw error;
    }
  },
  // Tạo sale price mới
  createSalePrice: async (data) => {
    set({ isLoadingCreate: true });
    try {
      const response = await createSalePrice(data);
      if (response && response.status === 200) {
        set({ isLoadingCreate: false });
      }
      return response;
    } catch (error) {
      console.error("Error creating sale price:", error);
      set({ isLoadingCreate: false });
      throw error;
    }
  },

  // Cập nhật sale price
  updateSalePrice: async (id, data) => {
    set({ isLoadingUpdate: true });
    try {
      const response = await updateSalePrice(id, data);
      if (response && response.status === 200) {
        set({ isLoadingUpdate: false });
      }
      return response;
    } catch (error) {
      console.error("Error updating sale price:", error);
      set({ isLoadingUpdate: false });
      throw error;
    }
  },

  // Xóa sale price
  deleteSalePrice: async (id) => {
    set({ isLoadingDelete: true });
    try {
      const response = await deleteSalePrice(id);
      if (response && response.status === 200) {
        set({ isLoadingDelete: false });
      }
       return response;
    } catch (error) {
      console.error("Error deleting sale price:", error);
      set({ isLoadingDelete: false });
      throw error;
    }
  },
}));

export default useSalePrice;
