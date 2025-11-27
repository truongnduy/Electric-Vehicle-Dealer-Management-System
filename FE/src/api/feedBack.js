import axiosClient from "../config/axiosClient";

// GET all feedbacks
export const getAllFeedbacks = () => {
  return axiosClient.get("/api/feedbacks");
};

// Get feedback by ID
export const getFeedbackById = (id) => {
  return axiosClient.get(`/api/feedbacks/${id}`);
};

// Create feedback
export const createFeedback = (data) => {
  return axiosClient.post("/api/feedbacks", data);
};
