import api from "./api";

export const getOrders = async () => {
  const response = await api.get("/orders");

  return response.data;
};

export const getOrder = async (id) => {
  const response = await api.get(`/orders/${id}`);

  return response.data;
};

export const createOrder = async (data) => {
  const response = await api.post("/orders", data);

  return response.data;
};

export const updateOrder = async (id, data) => {
  const response = await api.put(`/orders/${id}`, data);

  return response.data;
};

export const deleteOrder = async (id) => {
  const response = await api.delete(`/orders/${id}`);

  return response.data;
};
