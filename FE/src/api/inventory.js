import axiosClient from "../config/axiosClient";


const getInventory = () => {
  return axiosClient.get("/api/vehicles/manufacturer/stock");
};

const getDealerInventory = (id) => {
  return axiosClient.get(`/api/vehicles/dealer/${id}/stock`);
};

const recallInventory = ({ requestId, dealerId }) => {
  return axiosClient.post(`/api/inventory/recall/${requestId}`, { dealerId });
};

const allocateInventory = ({ requestId, dealerId, items }) => {
  return axiosClient.post(`/api/inventory/allocate/${requestId}`, {
    dealerId,
    items,
  });
};

export {
  getInventory,
  recallInventory,
  allocateInventory,
  getDealerInventory,
};
