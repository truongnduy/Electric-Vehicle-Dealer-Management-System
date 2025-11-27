import axiosClient from "../config/axiosClient";

// của evm staff
const getDealerDebtt = () => {
  return axiosClient.get(`/api/debts/dealer-debts`);
};

const getDeealerdebtById = (id) => {
  return axiosClient.get(`/api/debts/${id}`);
};

const getDealerDebtShedule = (id) => {
  return axiosClient.get(`/api/debts/${id}/schedules`);
};


const confirmDebtPayment = (debtId, paymentId, confirmedBy) => {
  return axiosClient.put(`/api/debts/${debtId}/payments/${paymentId}/confirm?confirmedBy=${confirmedBy}`);
}

const rejectDebtPayment = (debtId, paymentId, rejectedBy, reason) => {
  return axiosClient.put(`/api/debts/${debtId}/payments/${paymentId}/reject?rejectedBy=${rejectedBy}&reason=${reason}`);
}


// của dealer manager
const getDebt = (id) => {
  return axiosClient.get(`/api/debts/dealer/${id}`);
};

const makePayment = (debtId, paymentData) => {
  return axiosClient.post(`/api/debts/${debtId}/payments`, paymentData); //
};

const makeCustomerPayment = (scheduleId, amount, paymentMethod, note) => {
  return axiosClient.post(`/api/debts/schedules/${scheduleId}/direct-pay?amount=${amount}&paymentMethod=${paymentMethod}&notes=${note}`);
}

const getPaymentHistory = (id) => {
  return axiosClient.get(`/api/debts/${id}/payments`);
};

export {
  getDealerDebtt,
  getDeealerdebtById,
  getDealerDebtShedule,
  getDebt,
  makePayment,
  getPaymentHistory,
  confirmDebtPayment,
  rejectDebtPayment,
  makeCustomerPayment
};
