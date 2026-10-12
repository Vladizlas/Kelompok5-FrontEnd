import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// GET ALL SERVICES (PUBLIC)
export const getServices = async () => {
  const response = await axios.get(`${API_URL}/services`);
  return response.data;
};

// GET SERVICE BY ID (PUBLIC)
export const getServiceById = async (id) => {
  const response = await axios.get(`${API_URL}/services/${id}`);
  return response.data;
};

// CREATE SERVICE (AUTH REQUIRED)
export const createService = async (data) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(`${API_URL}/services`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// UPDATE SERVICE (AUTH REQUIRED)
export const updateService = async (id, data) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(`${API_URL}/services/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// DELETE SERVICE (AUTH REQUIRED)
export const deleteService = async (id) => {
  const token = localStorage.getItem("token");

  const response = await axios.delete(`${API_URL}/services/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};