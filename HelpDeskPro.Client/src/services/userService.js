import api from "./api";

// =========================================================
// GET ALL USERS
// =========================================================

const getAllUsers = async () => {
  const response = await api.get("/Users");

  return response.data;
};

// =========================================================
// GET USER BY ID
// =========================================================

const getUserById = async (id) => {
  const response = await api.get(`/Users/${id}`);

  return response.data;
};

// =========================================================
// CREATE USER
// =========================================================

const createUser = async (userData) => {
  const response = await api.post(
    "/Users",
    userData
  );

  return response.data;
};

// =========================================================
// TOGGLE USER STATUS
// =========================================================

const toggleUserStatus = async (id) => {
  const response = await api.patch(
    `/Users/${id}/status`
  );

  return response.data;
};

// =========================================================
// GET ACTIVE AGENTS
// =========================================================

const getActiveAgents = async () => {
  const users = await getAllUsers();

  if (!Array.isArray(users)) {
    return [];
  }

  return users.filter(
    (user) =>
      user.role?.toLowerCase() === "agent" &&
      user.isActive === true
  );
};

// =========================================================
// USER SERVICE
// =========================================================

const userService = {
  getAllUsers,
  getUserById,
  createUser,
  toggleUserStatus,
  getActiveAgents,
};

export default userService;