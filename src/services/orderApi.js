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

// dipakai kasir: ubah status cucian
export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/orders/${id}/status`, { status });

  return response.data;
};

// publik: cek status via nomor invoice (dipakai di homepage)
export const trackOrder = async (invoice) => {
  const response = await api.get(
    `/orders/track/${encodeURIComponent(invoice)}`
  );

  return response.data;
};