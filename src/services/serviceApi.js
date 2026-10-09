import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Helper untuk mengambil token dari localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

// GET ALL SERVICES
export const getServices = async () => {
  const response = await axios.get(`${API_URL}/services`, getAuthHeaders());
  return response.data;
};

// GET SERVICE BY ID
export const getServiceById = async (id) => {
  const response = await axios.get(`${API_URL}/services/${id}`, getAuthHeaders());
  return response.data;
};

// CREATE SERVICE
export const createService = async (data) => {
  const response = await axios.post(`${API_URL}/services`, data, getAuthHeaders());
  return response.data;
};

// UPDATE SERVICE
export const updateService = async (id, data) => {
  const response = await axios.put(`${API_URL}/services/${id}`, data, getAuthHeaders());
  return response.data;
};

// DELETE SERVICE
export const deleteService = async (id) => {
  const response = await axios.delete(`${API_URL}/services/${id}`, getAuthHeaders());
  return response.data;
};