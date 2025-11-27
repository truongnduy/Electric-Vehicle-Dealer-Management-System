import axiosClient from "../config/axiosClient";

const updateUser = (data) => {
  return axiosClient.put(`/api/auth/update-user`, data);
};

const changePassword = (data) => {
  return axiosClient.post(`/api/auth/change-password`, data);
};

const getDealerAccounts = (id) => {
  return axiosClient.get(`/api/users/dealer/${id}`);
};

export { updateUser, changePassword, getDealerAccounts };
