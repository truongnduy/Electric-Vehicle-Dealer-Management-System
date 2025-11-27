import { create } from "zustand";
import {
  getTestDrives,
  createTestDrive,
  updateTestDriveStatus,
  cancelTestDrive,
  ReschuduleTestDrive,
  completeTestDrive,
} from "../api/appointment";

const useTestDriveStore = create((set, get) => ({
  testDrives: [],
  isLoading: false,
  error: null,

  fetchTestDrives: async (dealerId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getTestDrives(dealerId);
      if (response && response.status === 200) {
        set({ testDrives: response.data.data, isLoading: false });
      }
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addTestDrive: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createTestDrive(data);
      if (response && response.status === 200) {
        set({ isLoading: false });
      }
      return response;
    } catch (error) {
      console.log("error at add test drive", error);
      set({ error: error.message, isLoading: false });
    }
  },

  updateTestDrive: async (testDriveId, status, note) => {
    set({ isLoading: true, error: null });
    try {
      const response = await updateTestDriveStatus(testDriveId, status, note);
      if (response && response.status === 200) {
        set({ isLoading: false });
      }
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  rescheduleTestDrive: async (testDriveId, newDate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ReschuduleTestDrive(testDriveId, newDate);
      if (response && response.status === 200) {
        set({ isLoading: false });
      }
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  cancelTestDrive: async (testDriveId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cancelTestDrive(testDriveId);
      if (response && response.status === 200) {
        set({ isLoading: false });
      }
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  completeTestDrive: async (testDriveId, note = "") => {
    set({ isLoading: true, error: null });
    try {
      const response = await completeTestDrive(testDriveId, note);
      if (response && response.status === 200) {
        set({ isLoading: false });
      }
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

export default useTestDriveStore;
