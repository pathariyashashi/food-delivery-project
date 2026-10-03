import api from "../axios";

export const addToCart = async (foodItemId, quantity = 1) => {
  const response = await api.post("/cart/add/", {
    food_item: foodItemId,
    quantity: quantity,
  });

  return response.data;
};

export const getCart = async () => {
  const response = await api.get("/cart/");

  return response.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await api.patch(
    `/cart/item/${itemId}/`,
    {
      quantity: quantity,
    }
  );

  return response.data;
};

export const removeCartItem = async (itemId) => {
  const response = await api.delete(
    `/cart/item/${itemId}/delete/`
  );

  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete("/cart/clear/");

  return response.data;
};