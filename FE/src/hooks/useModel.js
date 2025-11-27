import { create } from "zustand";
import {
  getModelById,
  getAllModels,
  createModel,
  updateModel,
  deleteModel,
} from "../api/model";

const useModelStore = create((set) => ({
  models: [],
  isLoading: false,
  fetchModels: async () => {
    try {
      set({ isLoading: true });
      const response = await getAllModels();
      if (response && response.status === 200) {
        set({ models: response.data.data, isLoading: false });
      }
      return response;
    } catch (error) {
      set({ isLoading: false });
      console.log("Error", error);
    }
  },

  modelDetail: {},
  fetchModelById: async (id) => {
    try {
      set({ isLoading: true });
      const response = await getModelById(id);
      if (response && response.status === 200) {
        set({ isLoading: false, modelDetail: response.data.data });
      }
      return response;
    } catch (error) {
      set({ isLoading: false });
      console.log("Error", error);
    }
  },
  isCreateModelLoading: false,
  createModel: async (data) => {
    try {
      set({ isCreateModelLoading: true });
      const response = await createModel(data);
      console.log("check response", response);
      if (response && response.status === 200) {
        set({ isCreateModelLoading: false });
      }
      return response;
    } catch (error) {
      set({ isCreateModelLoading: false });
      console.error("Error creating model:", error);
      throw error;
    }
  },
  updateModel: async (id, data) => {
    try {
      const response = await updateModel(id, data);
      if (response && response.status === 200) {
        set({ isLoading: false });
      }
      return response;
    } catch (error) {
      console.error("Error updating model:", error);
      set({ isLoading: false });
      throw error;
    }
  },
  deleteModelById: async (id) => {
    try {
      set({ isLoading: true });
      const response = await deleteModel(id);
      if (response && response.status === 200) {
        set({ isLoading: false });
      }
      return response;
    } catch (error) {
      console.error("Error deleting model:", error);
      set({ isLoading: false });
      throw error;
    }
  },
}));

export default useModelStore;
