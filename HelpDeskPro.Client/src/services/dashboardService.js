import api from "./api";

const getSummary = async () => {
  const response = await api.get("/Dashboard/summary");
  return response.data;
};

const getTicketsByCategory = async () => {
  const response = await api.get("/Dashboard/categories");
  return response.data;
};

const getTicketsByPriority = async () => {
  const response = await api.get("/Dashboard/priorities");
  return response.data;
};

const getTicketsByAgent = async () => {
  const response = await api.get("/Dashboard/agents");
  return response.data;
};

const getMonthlyTicketStatistics = async () => {
  const response = await api.get("/Dashboard/monthly");
  return response.data;
};

const dashboardService = {
  getSummary,
  getTicketsByCategory,
  getTicketsByPriority,
  getTicketsByAgent,
  getMonthlyTicketStatistics,
};

export default dashboardService;