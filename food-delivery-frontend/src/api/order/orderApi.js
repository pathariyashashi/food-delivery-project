import api from "../axios";

export const placeOrder = async (deliveryAddress) => {
  const response = await api.post("/orders/place/", {
    delivery_address: deliveryAddress,
  });

  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get("/orders/");

  return response.data;
};

export const getOrderDetail = async (orderId) => {
  const response = await api.get(
    `/orders/${orderId}/`
  );

  return response.data;
};

export const updateOrderStatus = async (
  orderId,
  newStatus
) => {
  const response = await api.patch(
    `/orders/${orderId}/status/`,
    {
      status: newStatus,
    }
  );

  return response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await api.patch(
    `/orders/${orderId}/cancel/`
  );

  return response.data;
};