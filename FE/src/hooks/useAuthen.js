import { create } from "zustand";
import Cookies from "js-cookie";
import { login, logout as logoutAPI } from "../api/authen.js";

const useAuthen = create((set, get) => ({
  isLoading: false,
  role: null,
  userDetail: null,
  isAuthenticated: false,
  isInitialized: false,

  login: async (values) => {
    set({ isLoading: true });
    try {
      const response = await login(values);
      if (response && response.data && response.data.success) {
        const user = response.data.data?.user;
        const accessToken = response.data.data?.accessToken;

        // Save to storage with proper cookie settings
        Cookies.set("token", accessToken, {
          expires: 7, // 7 days
          sameSite: "Lax", // Allow cookie on redirect from external sites
          secure: false, // Set to true in production with HTTPS
        });
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userDetail", JSON.stringify(user));


        // Update state
        set({
          userDetail: user,
          role: user.role,
          isLoading: false,
          isAuthenticated: true,
          isInitialized: true,
        });
        return { success: true, role: user.role };
      }

      set({ isLoading: false, isInitialized: true });
      return { success: false , response: response };
    } catch (err) {
      console.log("Login error", err);
      set({ isLoading: false, isInitialized: true });
      return { success: false };
    }
  },

  logout: async () => {
    try {
      await logoutAPI();

      Cookies.remove("token");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userDetail");

      set({
        userDetail: null,
        role: null,
        isAuthenticated: false,
        isInitialized: true,
      });

      return true;
    } catch (err) {
      console.log("Logout error", err);

      Cookies.remove("token");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userDetail");

      set({
        userDetail: null,
        role: null,
        isAuthenticated: false,
        isInitialized: true,
      });

      return false;
    }
  },

  initAuth: () => {
    const token = Cookies.get("token");
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userRole = localStorage.getItem("userRole");
    const userDetail = localStorage.getItem("userDetail");

    if (token && isAuthenticated === "true" && userRole && userDetail) {
      try {
        const parsedUserDetail = JSON.parse(userDetail);
        set({
          isAuthenticated: true,
          role: userRole,
          userDetail: parsedUserDetail,
          isInitialized: true,
        });
      } catch (err) {
        console.error("❌ InitAuth - Error parsing stored user data:", err);
        Cookies.remove("token");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userDetail");
        set({
          isAuthenticated: false,
          role: null,
          userDetail: null,
          isInitialized: true,
        });
      }
    } else {
      // Clear any invalid data
      Cookies.remove("token");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userDetail");
      set({
        isAuthenticated: false,
        role: null,
        userDetail: null,
        isInitialized: true,
      });
    }
  },

}));

export default useAuthen;
