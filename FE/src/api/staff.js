import axios from "axios";

export const getAllStaffs = () => {
  return axios.get("/api/staff"); 
};

export const getStaffById = (id) => {
  return axios.get(`/api/staff/${id}`);
};

export const deleteStaff = (id) => {
  return axios.delete(`/api/staff/${id}`);
};

export const createStaff = (data) => {
  return axios.post("/api/staff", data);
};

export const updateStaff = (id, data) => {
  return axios.put(`/api/staff/${id}`, data);
};
