import axiosClient from "../config/axiosClient";
const getAllCustomers = (id) => {
    return axiosClient.get(`/api/customers/dealer/${id}`);
}
const deleteCustomerById = (id) => {
    return axiosClient.delete(`/api/customers/${id}`);
}
const getCustomerById = (id) => {
    return axiosClient.get(`/api/customers/${id}`);
}
const createCustomer = (data) => {
    return axiosClient.post(`/api/customers`, data);
}
const updateCustomer = (id, data) => {
    return axiosClient.put(`/api/customers/${id}`, data);
}
export { getAllCustomers, deleteCustomerById, getCustomerById, createCustomer, updateCustomer };
