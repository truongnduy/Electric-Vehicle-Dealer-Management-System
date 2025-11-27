import { create } from "zustand";
import {
  getDealerStaffByDealerId,
  getUserById,
  createDealerStaff,
  deleteDealerStaff,
  updateDealerStaff,
} from "../api/dealerStaff";

const useDealerStaff = create((set) => ({
  staffs: [],
  staffDetail: {},
  isLoading: false,
  error: null,

  // Lấy danh sách nhân viên theo dealerId
  fetchStaffs: async (dealerId) => {
    try {
      set({ isLoading: true, error: null });
      const res = await getDealerStaffByDealerId(dealerId);
      set({ staffs: res?.data?.data || [], isLoading: false });
    } catch (err) {
      console.error("Error fetching dealer staff:", err);
      set({ isLoading: false, error: err, staffs: [] });
      toast.error("Không tải được danh sách nhân viên.");
    }
  },

  // Lấy chi tiết 1 nhân viên theo userId
  fetchStaffById: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const res = await getUserById(userId);
      set({ staffDetail: res?.data?.data || {}, isLoading: false });
    } catch (err) {
      console.error("Error fetching staff by id:", err);
      set({ isLoading: false, error: err });
      toast.error("Không tải được chi tiết nhân viên.");
    }
  },

  isLoadingDeleteStaff: false,
  deleteStaff: async (userId) => {
    try {
      set({ isLoadingDeleteStaff: true });
      const response = await deleteDealerStaff(userId);
      if (response && response.status === 200) {
        set({ isLoadingDeleteStaff: false });
      }
      return response;
    } catch (err) {
      console.error("Error deleting staff:", err);
      set({ isLoadingDeleteStaff: false });
      throw err;
    }
  },

  createStaff: async (payload) => {
    try {
      set({ isLoading: true });
      const res = await createDealerStaff(payload); // 200 OK (theo Swagger)
      set({ isLoading: false });
      return res?.data;
    } catch (err) {
      console.error("Error creating staff:", err);
      set({ isLoading: false });
      throw err;
    }
  },

  updateStaff: async (payload) => {
   try {
      set({ isLoading: true });
      const { staffId, userId, ...body } = payload;
      const id = staffId ?? userId;
      if (!id) {
        throw new Error("Missing staffId/userId in payload");
      }

      const res = await updateDealerStaff(id, body);
      set({ isLoading: false });
      return res?.data;
    } catch (err) {
      console.error("Error updating staff:", err);
      set({ isLoading: false });
      throw err;
    }
  },
}));

export default useDealerStaff;
