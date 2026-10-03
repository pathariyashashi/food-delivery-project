import api from "../axios";

export const registerUser = async (userData) => {
  const response = await api.post("/register/", userData);
  return response.data;
};

export const loginUser = async (loginData) => {
  const response = await api.post("/login/", loginData);

  localStorage.setItem("access_token", response.data.access);
  localStorage.setItem("refresh_token", response.data.refresh);

  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/profile/");
  return response.data;
};

export const logoutUser = async () => {
  try {
    await api.post("/logout/");
  } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
};