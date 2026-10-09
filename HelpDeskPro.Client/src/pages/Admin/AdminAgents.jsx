import React, { useEffect, useState } from "react";
import api from "../../services/api";

const AdminAgents = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [agents, setAgents] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add Agent Modal
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const [submitting, setSubmitting] = useState(false);

  // =====================================================
  // GET ALL USERS AND FILTER AGENTS
  // =====================================================

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/Users");

      const users = response.data;

      // Filter only Agent users
      const agentUsers = users.filter(
        (user) =>
          user.role === "Agent" ||
          user.roleName === "Agent" ||
          user.role?.name === "Agent"
      );

      setAgents(agentUsers);
    } catch (err) {
      console.error("Error fetching agents:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load agents."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD AGENTS WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    fetchAgents();
  }, []);

  // =====================================================
  // SEARCH + STATUS FILTER
  // =====================================================

  const filteredAgents = agents.filter((agent) => {
    const fullName =
      agent.fullName ||
      agent.name ||
      "";

    const email =
      agent.email ||
      "";

    const matchesSearch =
      fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      email
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" &&
        agent.isActive === true) ||
      (statusFilter === "Inactive" &&
        agent.isActive === false);

    return matchesSearch && matchesStatus;
  });

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalAgents = agents.length;

  const activeAgents = agents.filter(
    (agent) => agent.isActive === true
  ).length;

  const inactiveAgents = agents.filter(
    (agent) => agent.isActive === false
  ).length;

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // =====================================================
  // OPEN ADD AGENT MODAL
  // =====================================================

  const openAddModal = () => {
    setFormData({
      fullName: "",
      email: "",
      password: ""
    });

    setShowAddModal(true);
  };

  // =====================================================
  // CLOSE ADD AGENT MODAL
  // =====================================================

  const closeAddModal = () => {
    if (submitting) return;

    setShowAddModal(false);

    setFormData({
      fullName: "",
      email: "",
      password: ""
    });
  };

  // =====================================================
  // CREATE NEW AGENT
  // =====================================================

  const handleAddAgent = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName.trim()) {
      alert("Please enter the agent's full name.");
      return;
    }

    if (!formData.email.trim()) {
      alert("Please enter the agent's email address.");
      return;
    }

    if (!formData.password) {
      alert("Please enter a password.");
      return;
    }

    try {
      setSubmitting(true);

      // Matches CreateUserDto exactly
      const agentData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        roleId: 2
      };

      console.log("Creating agent:", agentData);

      await api.post("/Users", agentData);

      alert("Agent created successfully.");

      // Close modal
      setShowAddModal(false);

      // Clear form
      setFormData({
        fullName: "",
        email: "",
        password: ""
      });

      // Refresh agent list
      await fetchAgents();
    } catch (err) {
      console.error("Error creating agent:", err);

      alert(
        err.response?.data?.message ||
          "Failed to create agent."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // TOGGLE AGENT STATUS
  // =====================================================

  const handleToggleStatus = async (agent) => {
    const fullName =
      agent.fullName ||
      agent.name ||
      "this agent";

    const action =
      agent.isActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${fullName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.patch(
        `/Users/${agent.id}/status`
      );

      await fetchAgents();
    } catch (err) {
      console.error(
        "Error updating agent status:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to update agent status."
      );
    }
  };

  // =====================================================
  // EDIT AGENT
  // =====================================================

  const handleEdit = (agent) => {
    alert(
      "Edit Agent functionality will be added after the backend update endpoint is implemented."
    );
  };

  // =====================================================
  // DELETE AGENT
  // =====================================================

  const handleDelete = (agent) => {
    alert(
      "Delete functionality is not available in the current Users API."
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Agent Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage IT support agents and their account status.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
        >
          <span className="text-lg">+</span>
          Add Agent
        </button>

      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* Total */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Agents
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-800">
                {totalAgents}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl">
              👥
            </div>

          </div>
        </div>

        {/* Active */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Active Agents
              </p>

              <h2 className="mt-2 text-2xl font-bold text-green-600">
                {activeAgents}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
              ✓
            </div>

          </div>
        </div>

        {/* Inactive */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Inactive Agents
              </p>

              <h2 className="mt-2 text-2xl font-bold text-red-600">
                {inactiveAgents}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl">
              !
            </div>

          </div>
        </div>

      </div>

      {/* =================================================
          SEARCH + FILTER
      ================================================= */}

      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-4 md:flex-row">

          {/* Search */}
          <div className="relative flex-1">

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search agents by name or email..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* Status Filter */}
          <div className="md:w-48">

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>

          </div>

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* =================================================
          AGENTS TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px]">

            <thead className="border-b bg-gray-50">

              <tr>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Agent
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Email
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Role
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {/* Loading */}
              {loading && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Loading agents...
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loading &&
                filteredAgents.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No agents found.
                    </td>
                  </tr>
                )}

              {/* Agent Rows */}
              {!loading &&
                filteredAgents.map((agent) => {

                  const fullName =
                    agent.fullName ||
                    agent.name ||
                    "Unknown Agent";

                  const isActive =
                    agent.isActive === true;

                  return (
                    <tr
                      key={agent.id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* Agent */}
                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                            {fullName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-medium text-gray-800">
                              {fullName}
                            </p>

                            <p className="text-xs text-gray-400">
                              ID: {agent.id}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {agent.email || "-"}
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          Agent
                        </span>

                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">

                        {isActive ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                            Inactive
                          </span>
                        )}

                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">

                        <div className="flex items-center justify-end gap-2">

                          {/* Edit */}
                          <button
                            onClick={() =>
                              handleEdit(agent)
                            }
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                          >
                            Edit
                          </button>

                          {/* Activate / Deactivate */}
                          <button
                            onClick={() =>
                              handleToggleStatus(agent)
                            }
                            className={
                              isActive
                                ? "rounded-lg border border-orange-200 px-3 py-1.5 text-sm font-medium text-orange-600 transition hover:bg-orange-50"
                                : "rounded-lg border border-green-200 px-3 py-1.5 text-sm font-medium text-green-600 transition hover:bg-green-50"
                            }
                          >
                            {isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() =>
                              handleDelete(agent)
                            }
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          ADD AGENT MODAL
      ================================================= */}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Add New Agent
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create an IT support agent account.
                </p>
              </div>

              <button
                onClick={closeAddModal}
                disabled={submitting}
                className="text-2xl text-gray-400 transition hover:text-gray-600 disabled:cursor-not-allowed"
              >
                ×
              </button>

            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleAddAgent}
              className="space-y-5 p-6"
            >

              {/* Full Name */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />

              </div>

              {/* Email */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="agent@example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />

              </div>

              {/* Password */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />

              </div>

              {/* Role */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Role
                </label>

                <input
                  type="text"
                  value="IT Support Agent"
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  The account will automatically be created with Agent role.
                </p>

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t pt-5">

                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={submitting}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Creating..."
                    : "Create Agent"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default AdminAgents;