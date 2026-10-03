import api from "../axios";

export const getCategories = async () => {
  const response = await api.get("/categories/");
  return response.data;
};

export const getFoodItems = async (params = {}) => {
  const response = await api.get("/food-items/", {
    params: params,
  });

  return response.data;
};

export const getRestaurantMenu = async (restaurantId) => {
  const response = await api.get(
    `/restaurants/${restaurantId}/menu/`
  );

  return response.data;
};