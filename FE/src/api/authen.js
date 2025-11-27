import axiosClient from "../config/axiosClient";
import Cookies from "js-cookie";

const login = (values) => {
    return axiosClient.post("/api/auth/login", values);
}

const logout = () => {
    const token = Cookies.get("token");
    return axiosClient.post("/api/auth/logout", {}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export { login, logout };