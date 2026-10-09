import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Shield,
  UserCog,
  Mail,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
} from "lucide-react";

import userService from "../../services/userService";

const AdminUsers = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    roleId: 3,
  });

  // =====================================================
  // LOAD USERS
  // =====================================================

  const loadUsers = async (isRefresh = false) => {
    // Prevent multiple refresh requests
    if (isRefresh && refreshing) {
      return;
    }

    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log("Loading users...");

      const data = await userService.getAllUsers();

      console.log("Users received:", data);

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load users:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        err.message ||
        "Unable to load users. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadUsers(false);
  }, []);

  // =====================================================
  // FILTER USERS
  // =====================================================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        user.fullName?.toLowerCase().includes(searchText) ||
        user.email?.toLowerCase().includes(searchText);

      const matchesRole =
        roleFilter === "All" ||
        user.role?.toLowerCase() === roleFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && user.isActive === true) ||
        (statusFilter === "Inactive" && user.isActive === false);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.isActive === true
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.isActive === false
  ).length;

  const agentUsers = users.filter(
    (user) => user.role?.toLowerCase() === "agent"
  ).length;

  const adminUsers = users.filter(
    (user) => user.role?.toLowerCase() === "admin"
  ).length;

  const employeeUsers = users.filter(
    (user) => user.role?.toLowerCase() === "employee"
  ).length;

  // =====================================================
  // FORM HANDLING
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "roleId" ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setForm({
      fullName: "",
      email: "",
      password: "",
      roleId: 3,
    });
  };

  // =====================================================
  // CREATE USER
  // =====================================================

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      setError("Please enter the user's full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter the user's email.");
      return;
    }

    if (!form.password.trim()) {
      setError("Please enter a password.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      await userService.createUser(form);

      resetForm();
      setShowCreateModal(false);

      // Reload latest users from database
      await loadUsers(true);
    } catch (err) {
      console.error("Failed to create user:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        err.message ||
        "Unable to create user.";

      setError(message);
    } finally {
      setCreating(false);
    }
  };

  // =====================================================
  // TOGGLE USER STATUS
  // =====================================================

  const handleToggleStatus = async (user) => {
    const action = user.isActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(user.id);
      setError("");

      await userService.toggleUserStatus(user.id);

      // Reload latest data
      await loadUsers(true);
    } catch (err) {
      console.error("Failed to update user status:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        err.message ||
        "Unable to update user status.";

      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // ROLE BADGE
  // =====================================================

  const getRoleBadge = (role) => {
    const normalizedRole = role?.toLowerCase();

    if (normalizedRole === "admin") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
          <Shield size={13} />
          Admin
        </span>
      );
    }

    if (normalizedRole === "agent") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          <UserCog size={13} />
          Agent
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
        <Users size={13} />
        Employee
      </span>
    );
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          <CheckCircle2 size={13} />
          Active
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        <XCircle size={13} />
        Inactive
      </span>
    );
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-xl bg-blue-600 p-3 text-white shadow-sm">
                <Users size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  User Management
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Manage administrators, agents, and employees.
                </p>
              </div>
            </div>

            {lastUpdated && (
              <p className="ml-1 mt-2 text-xs text-gray-400">
                Last updated:{" "}
                {lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">

            {/* REFRESH */}

            <button
              type="button"
              onClick={() => loadUsers(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            {/* CREATE USER */}

            <button
              type="button"
              onClick={() => {
                setError("");
                setShowCreateModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <UserPlus size={17} />
              Create User
            </button>
          </div>
        </div>

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 shrink-0" size={18} />

              <div>
                <p className="font-semibold">Something went wrong</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">

          {/* TOTAL */}

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Users
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {totalUsers}
                </h2>
              </div>

              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <Users size={22} />
              </div>
            </div>
          </div>

          {/* ACTIVE */}

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active
                </p>

                <h2 className="mt-2 text-3xl font-bold text-green-600">
                  {activeUsers}
                </h2>
              </div>

              <div className="rounded-xl bg-green-100 p-3 text-green-600">
                <UserCheck size={22} />
              </div>
            </div>
          </div>

          {/* INACTIVE */}

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Inactive
                </p>

                <h2 className="mt-2 text-3xl font-bold text-red-600">
                  {inactiveUsers}
                </h2>
              </div>

              <div className="rounded-xl bg-red-100 p-3 text-red-600">
                <UserX size={22} />
              </div>
            </div>
          </div>

          {/* ADMINS */}

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Admins
                </p>

                <h2 className="mt-2 text-3xl font-bold text-purple-600">
                  {adminUsers}
                </h2>
              </div>

              <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                <Shield size={22} />
              </div>
            </div>
          </div>

          {/* AGENTS */}

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Agents
                </p>

                <h2 className="mt-2 text-3xl font-bold text-blue-600">
                  {agentUsers}
                </h2>
              </div>

              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <UserCog size={22} />
              </div>
            </div>
          </div>

          {/* EMPLOYEES */}

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Employees
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-700">
                  {employeeUsers}
                </h2>
              </div>

              <div className="rounded-xl bg-gray-100 p-3 text-gray-600">
                <Users size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* SEARCH */}

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* ROLE */}

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Agent">Agent</option>
              <option value="Employee">Employee</option>
            </select>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* =================================================
            USER TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          {/* TABLE HEADER */}

          <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                System Users
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Showing {filteredUsers.length} of {totalUsers} users
              </p>
            </div>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2
                  size={32}
                  className="animate-spin text-blue-600"
                />

                <p className="text-sm text-gray-500">
                  Loading users...
                </p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            /* EMPTY */

            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="rounded-full bg-gray-100 p-4">
                <Users size={28} className="text-gray-400" />
              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                No users found
              </h3>

              <p className="mt-1 max-w-md text-sm text-gray-500">
                Try changing your search or filter options.
              </p>
            </div>
          ) : (
            /* TABLE */

            <div className="overflow-x-auto">
              <table className="min-w-full">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      User
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Role
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Created
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* USER */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                            {user.fullName
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">
                              {user.fullName}
                            </p>

                            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                              <Mail size={12} />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ROLE */}

                      <td className="px-5 py-4">
                        {getRoleBadge(user.role)}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        {getStatusBadge(user.isActive)}
                      </td>

                      {/* CREATED */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarDays
                            size={15}
                            className="text-gray-400"
                          />

                          {formatDate(user.createdAt)}
                        </div>
                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4 text-right">

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          disabled={actionLoading === user.id}
                          className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            user.isActive
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {actionLoading === user.id ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : user.isActive ? (
                            <UserX size={14} />
                          ) : (
                            <UserCheck size={14} />
                          )}

                          {actionLoading === user.id
                            ? "Updating..."
                            : user.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </button>

                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================
          CREATE USER MODAL
      =================================================== */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Create New User
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add a new user to the HelpDeskPro system.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                  setError("");
                }}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleCreateUser}
              className="space-y-5 p-6"
            >

              {/* FULL NAME */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={creating}
                />
              </div>

              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={creating}
                />
              </div>

              {/* PASSWORD */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={creating}
                />
              </div>

              {/* ROLE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Role
                </label>

                <select
                  name="roleId"
                  value={form.roleId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={creating}
                >
                  <option value={3}>Employee</option>
                  <option value={2}>Agent</option>
                  <option value={1}>Admin</option>
                </select>
              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                    setError("");
                  }}
                  disabled={creating}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Create User
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;