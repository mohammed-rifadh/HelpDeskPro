import api from "./api";

/* =====================================================
   GET MY TICKETS
===================================================== */

const getMyTickets = async () => {
  const response = await api.get("/Tickets/my");

  return response.data;
};


/* =====================================================
   GET ALL TICKETS
   Admin / Agent
===================================================== */

const getAllTickets = async () => {
  const response = await api.get("/Tickets");

  return response.data;
};


/* =====================================================
   GET TICKET BY ID
===================================================== */

const getTicketById = async (id) => {
  const response = await api.get(`/Tickets/${id}`);

  return response.data;
};


/* =====================================================
   CREATE TICKET
===================================================== */

const createTicket = async (ticketData) => {
  const response = await api.post(
    "/Tickets",
    ticketData
  );

  return response.data;
};


/* =====================================================
   CLOSE TICKET
===================================================== */

const closeTicket = async (id) => {
  const response = await api.patch(
    `/Tickets/${id}/close`
  );

  return response.data;
};


/* =====================================================
   SEARCH / FILTER TICKETS
   Admin / Agent
===================================================== */

const searchTickets = async (filters = {}) => {
  const params = {};

  // Search by ticket number, title or description
  if (filters.search?.trim()) {
    params.Search = filters.search.trim();
  }

  // Filter by status
  if (filters.status) {
    params.Status = filters.status;
  }

  // Filter by priority
  if (filters.priority) {
    params.Priority = filters.priority;
  }

  // Filter by category
  if (filters.categoryId) {
    params.CategoryId = Number(filters.categoryId);
  }

  // Filter by assigned agent
  if (filters.assignedToId) {
    params.AssignedToId = Number(filters.assignedToId);
  }

  const response = await api.get(
    "/Tickets/search",
    {
      params,
    }
  );

  return response.data;
};


/* =====================================================
   ASSIGN TICKET TO AGENT
   Admin only
===================================================== */

const assignTicket = async (
  ticketId,
  assignedToId
) => {
  const response = await api.patch(
    `/Tickets/${ticketId}/assign`,
    {
      assignedToId: Number(assignedToId),
    }
  );

  return response.data;
};


/* =====================================================
   UPDATE TICKET
   Admin / Agent
===================================================== */

const updateTicket = async (
  ticketId,
  ticketData
) => {
  const response = await api.put(
    `/Tickets/${ticketId}`,
    ticketData
  );

  return response.data;
};


/* =====================================================
   GET ASSIGNMENT HISTORY
   Admin / Agent
===================================================== */

const getAssignmentHistory = async (
  ticketId
) => {
  const response = await api.get(
    `/Tickets/${ticketId}/assignments`
  );

  return response.data;
};


/* =====================================================
   GET STATUS HISTORY
===================================================== */

const getStatusHistory = async (
  ticketId
) => {
  const response = await api.get(
    `/tickets/${ticketId}/status-history`
  );

  return response.data;
};


/* =====================================================
   GET COMMENTS
===================================================== */

const getComments = async (
  ticketId
) => {
  const response = await api.get(
    `/tickets/${ticketId}/comments`
  );

  return response.data;
};


/* =====================================================
   ADD COMMENT
===================================================== */

const addComment = async (
  ticketId,
  comment
) => {
  const response = await api.post(
    `/tickets/${ticketId}/comments`,
    comment
  );

  return response.data;
};


/* =====================================================
   GET CATEGORIES
===================================================== */

const getCategories = async () => {
  const response = await api.get(
    "/Categories"
  );

  return response.data;
};


/* =====================================================
   EXPORT
===================================================== */

const ticketService = {
  // Employee
  getMyTickets,
  getTicketById,
  createTicket,
  closeTicket,

  // Admin / Agent
  getAllTickets,
  searchTickets,
  assignTicket,
  updateTicket,
  getAssignmentHistory,

  // Ticket details
  getStatusHistory,
  getComments,
  addComment,

  // Categories
  getCategories,
};

export default ticketService;