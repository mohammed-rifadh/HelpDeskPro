import api from "./api";

const login = async (email, password) => {
  const response = await api.post("/Auth/login", {
    email,
    password,
  });

  return response.data;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const getCurrentUser = () => {
  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
};

const getToken = () => {
  return localStorage.getItem("token");
};

const authService = {
  login,
  logout,
  getCurrentUser,
  getToken,
};

export default authService;