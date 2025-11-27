import axiosClient from "../config/axiosClient";


const startDelivery = async (orderId) => {
    return await axiosClient.put(`/api/orders/${orderId}/status?status=SHIPPED`);
}

const completedDelivery = async (orderId) => {
    return await axiosClient.put(`/api/orders/${orderId}/status?status=COMPLETED`);
}

export { startDelivery, completedDelivery };