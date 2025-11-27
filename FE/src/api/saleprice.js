import axiosClient from "../config/axiosClient";

const getSalePrices = () => {
  return axiosClient.get("/api/sale-prices");
};

const getSalePriceById = (id) => {
  return axiosClient.get(`/api/sale-prices/${id}`);
};

const getSalePricesByDealer = (dealerId) => {
  return axiosClient.get(`/api/sale-prices/dealer/${dealerId}`);
};

const getSalePricesByVariant = (variantId) => {
  return axiosClient.get(`/api/sale-prices/variant/${variantId}`);
};

const getEffectivePrice = (dealerId, variantId) => {
  return axiosClient.get(`/api/sale-prices/effective`, {
    params: { dealerId, variantId },
  });
};

const createSalePrice = (data) => {
  return axiosClient.post("/api/sale-prices", data);
};

const updateSalePrice = (id, data) => {
  return axiosClient.put(`/api/sale-prices/${id}`, data);
};

const deleteSalePrice = (id) => {
  return axiosClient.delete(`/api/sale-prices/${id}`);
};

export {
  getSalePrices,
  getSalePriceById,
  getSalePricesByDealer,
  getSalePricesByVariant,
  getEffectivePrice,
  createSalePrice,
  updateSalePrice,
  deleteSalePrice,
};

