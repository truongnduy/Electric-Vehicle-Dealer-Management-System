// src/hooks/useReport.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getStaffSalesByDealer,
  getDealersSummary,
  getInventoryReport,
  getTurnoverReport,
  getDealerSales, // doanh thu 1 đại lý (manager xem)
  getStaffSelfSales, // báo cáo DOANH THU CÁ NHÂN của dealer staff
} from "../api/report";

const useReport = create(
  persist(
    (set, get) => ({
      isLoading: false,
      error: null,

      // ===== STATE =====
      staffSales: [], // báo cáo theo nhân viên của 1 đại lý (manager xem)
      dealersSummary: [], // tổng hợp theo đại lý
      inventoryReport: [], // tồn kho
      turnoverReport: [], // tốc độ tiêu thụ
      dealerSales: [], // doanh thu 1 đại lý (filter theo năm/tháng)
      staffSelf: null, // báo cáo CÁ NHÂN của dealer staff: { ... , orders: [] }

      // ===== ACTIONS =====
      /** Báo cáo theo nhân viên của 1 đại lý (manager xem) */
      fetchStaffSales: async (dealerId) => {
        try {
          set({ isLoading: true, error: null });
          const res = await getStaffSalesByDealer(dealerId);
          const list = Array.isArray(res?.data?.data) ? res.data.data : [];
          const normalized = list.map((i) => ({
            ...i,
            totalOrders: Number(i?.totalOrders) || 0,
            totalRevenue: Number(i?.totalRevenue) || 0,
          }));
          set({ staffSales: normalized, isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: err?.response?.data?.message || "Lỗi tải báo cáo",
          });
          throw err;
        }
      },

      /** Tổng hợp theo đại lý (toàn hệ thống) */
      fetchDealersSummary: async () => {
        try {
          set({ isLoading: true, error: null });
          const res = await getDealersSummary();
          const list = Array.isArray(res?.data?.data) ? res.data.data : [];
          const normalized = list.map((i) => ({
            ...i,
            dealerId: Number(i?.dealerId) || i?.dealerId,
            month: Number(i?.month) || i?.month,
            year: Number(i?.year) || i?.year,
            totalOrders: Number(i?.totalOrders) || 0,
            totalRevenue: Number(i?.totalRevenue) || 0,
          }));
          set({ dealersSummary: normalized, isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: err?.response?.data?.message || "Lỗi tải tổng hợp đại lý",
          });
          throw err;
        }
      },

      /** Báo cáo tồn kho */
      fetchInventoryReport: async () => {
        try {
          set({ isLoading: true, error: null });
          const res = await getInventoryReport();
          const list = Array.isArray(res?.data?.data) ? res.data.data : [];
          const normalized = list.map((i) => ({
            ...i,
            dealerId: Number(i?.dealerId) || i?.dealerId,
            totalVehicles: Number(i?.totalVehicles) || 0,
            availableVehicles: Number(i?.availableVehicles) || 0,
            soldVehicles: Number(i?.soldVehicles) || 0,
          }));
          set({ inventoryReport: normalized, isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: err?.response?.data?.message || "Lỗi tải tồn kho",
          });
          throw err;
        }
      },

      /** Báo cáo tốc độ tiêu thụ */
      fetchTurnoverReport: async () => {
        try {
          set({ isLoading: true, error: null });
          const res = await getTurnoverReport();
          const list = Array.isArray(res?.data?.data) ? res.data.data : [];
          const normalized = list.map((i) => ({
            ...i,
            dealerId: Number(i?.dealerId) || i?.dealerId,
            totalSold: Number(i?.totalSold) || 0,
            turnoverRate: Number(i?.turnoverRate) || 0, // 0.x
          }));
          set({ turnoverReport: normalized, isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: err?.response?.data?.message || "Lỗi tải tốc độ tiêu thụ",
          });
          throw err;
        }
      },

      /** Doanh thu 1 đại lý (manager xem, filter year/month) */
      fetchDealerSales: async ({ dealerId, year, month } = {}) => {
        try {
          set({ isLoading: true, error: null });
          const res = await getDealerSales({ dealerId, year, month });
          const list = Array.isArray(res?.data?.data) ? res.data.data : [];
          const normalized = list.map((i) => ({
            ...i,
            dealerId: Number(i?.dealerId) || i?.dealerId,
            year: Number(i?.year) || i?.year,
            month: Number(i?.month) || i?.month,
            totalOrders: Number(i?.totalOrders) || 0,
            totalRevenue: Number(i?.totalRevenue) || 0,
          }));
          set({ dealerSales: normalized, isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: err?.response?.data?.message || "Lỗi tải doanh thu đại lý",
          });
          throw err;
        }
      },

      isLoadingStaffSale: false,
      fetchStaffSelfSales: async (userId, year, month) => {
        try {
          set({ isLoadingStaffSale: true, error: null });
          const response = await getStaffSelfSales(userId, year, month);
          if (response && response.status === 200) {
            set({
              staffSelf: response.data.data,
              isLoadingStaffSale: false,
            });
          }
          return response;
        } catch (err) {
          console.log("error at get staffsale", err);
          set({
            isLoadingStaffSale: false,
            error: err?.response?.data?.message || "Lỗi tải báo cáo cá nhân",
          });
          throw err;
        }
      },

      // ===== HELPERS =====
      totalOrders: () =>
        get().staffSales.reduce(
          (s, i) => s + (Number(i.totalOrders) || 0),
          0
        ),
      totalRevenue: () =>
        get().staffSales.reduce((s, i) => s + (Number(i.totalRevenue) || 0), 0),

      summaryTotalOrders: () =>
        get().dealersSummary.reduce(
          (s, i) => s + (Number(i.totalOrders) || 0),
          0
        ),
      summaryTotalRevenue: () =>
        get().dealersSummary.reduce(
          (s, i) => s + (Number(i.totalRevenue) || 0),
          0
        ),
      summaryDealerCount: () => get().dealersSummary.length,

      invTurnoverTotalSold: () =>
        get().turnoverReport.reduce(
          (s, i) => s + (Number(i.totalSold) || 0),
          0
        ),
      invTurnoverAvgRate: () => {
        const arr = get().turnoverReport;
        if (!arr.length) return 0;
        const sum = arr.reduce((s, i) => s + (Number(i.turnoverRate) || 0), 0);
        return sum / arr.length; // 0.x
      },

      invTotalVehicles: () =>
        get().inventoryReport.reduce(
          (s, i) => s + (Number(i.totalVehicles) || 0),
          0
        ),
      invTotalAvailable: () =>
        get().inventoryReport.reduce(
          (s, i) => s + (Number(i.availableVehicles) || 0),
          0
        ),
      invTotalSold: () =>
        get().inventoryReport.reduce(
          (s, i) => s + (Number(i.soldVehicles) || 0),
          0
        ),

      // dealer sales helpers
      dealerSalesTotalOrders: () =>
        get().dealerSales.reduce((s, i) => s + (Number(i.totalOrders) || 0), 0),
      dealerSalesTotalRevenue: () =>
        get().dealerSales.reduce(
          (s, i) => s + (Number(i.totalRevenue) || 0),
          0
        ),

      // helpers cho báo cáo cá nhân
      staffSelfTotalOrders: () => get().staffSelf?.orders?.length || 0,
      staffSelfTotalRevenue: () =>
        (get().staffSelf?.orders || []).reduce(
          (s, o) => s + (Number(o.totalPrice) || 0),
          0
        ),
    }),
    {
      name: "report-store",
      // Persist những mảng/đối tượng cần dùng lại khi chuyển trang
      partialize: (s) => ({
        staffSales: s.staffSales,
        dealersSummary: s.dealersSummary,
        inventoryReport: s.inventoryReport,
        turnoverReport: s.turnoverReport,
        dealerSales: s.dealerSales,
        staffSelf: s.staffSelf,
      }),
    }
  )
);

export default useReport;
