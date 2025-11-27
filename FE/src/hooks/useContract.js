import { create } from "zustand";
import {
  getOrders,
  getContracts,
  getContractById,
  getContractFile,
  createContract,
  signContract,
  deleteContract,
} from "../api/contract";

const useContract = create((set) => ({
  orderList: [],
  isLoadingGetOrderList: false,
  fetchOrderList: async (dealerId) => {
    try {
      set({ isLoadingGetOrderList: true });
      const response = await getOrders(dealerId);
      if (response && response.status === 200) {
        set({
          orderList: response.data.data || [],
          isLoadingGetOrderList: false,
        });
      }
      return response;
    } catch (error) {
      console.error("Failed to fetch order list:", error);
      set({ isLoadingGetOrderList: false });
      throw error;
    }
  },

  contractList: [],
  isLoadingGetContractList: false,
  fetchContractList: async (dealerId) => {
    try {
      set({ isLoadingGetContractList: true });
      const response = await getContracts(dealerId);
      if (response && response.status === 200) {
        set({
          contractList: response.data.data || [],
          isLoadingGetContractList: false,
        });
      }
      return response;
    } catch (error) {
      console.error("Failed to fetch contract list:", error);
      set({ isLoadingGetContractList: false });
      throw error;
    }
  },

  contractDetail: null,
  isLoadingGetContractDetail: false,
  fetchContractById: async (contractId) => {
    try {
      set({ isLoadingGetContractDetail: true });
      const response = await getContractById(contractId);
      if (response && response.status === 200) {
        set({
          contractDetail: response.data.data,
          isLoadingGetContractDetail: false,
        });
      }
      return response;
    } catch (error) {
      console.error("Failed to fetch contract detail:", error);
      set({ isLoadingGetContractDetail: false });
      throw error;
    }
  },

  isLoadingGetContractFile: false,
  fetchContractFile: async (contractId) => {
    try {
      set({ isLoadingGetContractFile: true });
      const response = await getContractFile(contractId);
      if (response && response.status === 200) {
        set({ isLoadingGetContractFile: false });
      }
      return response;
    } catch (error) {
      console.error("Failed to fetch contract file:", error);
      set({ isLoadingGetContractFile: false });
      throw error;
    }
  },

  isLoadingCreateContract: false,
  createNewContract: async (data) => {
    try {
      set({ isLoadingCreateContract: true });
      const response = await createContract(data);
      if (response && response.status === 200) {
        set({ isLoadingCreateContract: false });
      }
      return response;
    } catch (error) {
      console.error("Failed to create contract:", error);
      set({ isLoadingCreateContract: false });
      throw error;
    }
  },

  isLoadingSignContract: false,
  signExistingContract: async (contractId) => {
    try {
      set({ isLoadingSignContract: true });
      const response = await signContract(contractId);
      if (response && response.status === 200) {
        set({ isLoadingSignContract: false });
      }
      return response;
    } catch (error) {
      console.error("Failed to sign contract:", error);
      set({ isLoadingSignContract: false });
      throw error;
    }
  },

  isLoadingDeleteContract: false,
  deleteExistingContract: async (contractId) => {
    try {
      set({ isLoadingDeleteContract: true });
      const response = await deleteContract(contractId);
      if (response && response.status === 200) {
        set({ isLoadingDeleteContract: false });
      }
      return response;
    } catch (error) {
      console.error("Failed to delete contract:", error);
      set({ isLoadingDeleteContract: false });
      throw error;
    }
  },
}));

export default useContract;