import api from "./api";

export const getServicePrices = async () => {
  const response = await api.get("/service-prices");

  return response.data;
};

export const getServicePrice = async (id) => {
  const response = await api.get(`/service-prices/${id}`);

  return response.data;
};

export const getPricesByService = async (serviceId) => {
  const response = await api.get(
    `/service-prices/service/${serviceId}`
  );

  return response.data;
};

export const createServicePrice = async (data) => {
  const response = await api.post("/service-prices", data);

  return response.data;
};

export const updateServicePrice = async (id, data) => {
  const response = await api.put(
    `/service-prices/${id}`,
    data
  );

  return response.data;
};

export const deleteServicePrice = async (id) => {
  const response = await api.delete(
    `/service-prices/${id}`
  );

  return response.data;
};
