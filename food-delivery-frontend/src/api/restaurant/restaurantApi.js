import api from "../axios";

export const getRestaurants = async (params = {}) => {
  const response = await api.get("/restaurants/", {
    params: params,
  });

  return response.data;
};

export const getRestaurant = async (restaurantId) => {
  const response = await api.get(
    `/restaurants/${restaurantId}/`
  );

  return response.data;
};

export const createRestaurant = async (restaurantData) => {
  const response = await api.post(
    "/restaurants/create/",
    restaurantData
  );

  return response.data;
};

export const updateRestaurant = async (
  restaurantId,
  restaurantData
) => {
  const response = await api.put(
    `/restaurants/${restaurantId}/update/`,
    restaurantData
  );

  return response.data;
};

export const deleteRestaurant = async (restaurantId) => {
  const response = await api.delete(
    `/restaurants/${restaurantId}/delete/`
  );

  return response.data;
};