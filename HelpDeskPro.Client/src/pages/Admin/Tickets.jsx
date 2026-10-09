import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  Ticket,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import ticketService from "../../services/ticketService";
import userService from "../../services/userService";

function AdminTickets() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [assignedToId, setAssignedToId] = useState("");

  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ticketData, agentData, categoryData] =
        await Promise.all([
          ticketService.getAllTickets(),
          userService.getActiveAgents(),
          ticketService.getCategories(),
        ]);

      setTickets(
        Array.isArray(ticketData)
          ? ticketData
          : []
      );

      setAgents(
        Array.isArray(agentData)
          ? agentData
          : []
      );

      setCategories(
        Array.isArray(categoryData)
          ? categoryData.filter(
              (category) =>
                category.isActive !== false
            )
          : []
      );
    } catch (err) {
      console.error(
        "Admin ticket loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load ticket management data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =====================================================
     FILTER TICKETS
  ===================================================== */

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchValue =
        search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        ticket.ticketNumber
          ?.toLowerCase()
          .includes(searchValue) ||
        ticket.title
          ?.toLowerCase()
          .includes(searchValue) ||
        ticket.description
          ?.toLowerCase()
          .includes(searchValue) ||
        ticket.createdBy
          ?.toLowerCase()
          .includes(searchValue) ||
        ticket.assignedTo
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        !status ||
        ticket.status === status;

      const matchesPriority =
        !priority ||
        ticket.priority === priority;

      const matchesCategory =
        !categoryId ||
        Number(ticket.categoryId) ===
          Number(categoryId);

      const matchesAgent =
        !assignedToId ||
        Number(ticket.assignedToId) ===
          Number(assignedToId);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory &&
        matchesAgent
      );
    });
  }, [
    tickets,
    search,
    status,
    priority,
    categoryId,
    assignedToId,
  ]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const statistics = useMemo(() => {
    return {
      total: tickets.length,

      open: tickets.filter(
        (ticket) => ticket.status === "Open"
      ).length,

      inProgress: tickets.filter(
        (ticket) =>
          ticket.status === "In Progress"
      ).length,

      resolved: tickets.filter(
        (ticket) =>
          ticket.status === "Resolved"
      ).length,

      critical: tickets.filter(
        (ticket) =>
          ticket.priority === "Critical"
      ).length,
    };
  }, [tickets]);

  /* =====================================================
     DATE FORMAT
  ===================================================== */

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-GB",
      {
        timeZone: "Asia/Colombo",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     STATUS BADGE
  ===================================================== */

  const getStatusBadge = (ticketStatus) => {
    const styles = {
      Open:
        "bg-blue-50 text-blue-700 ring-blue-600/20",

      Assigned:
        "bg-violet-50 text-violet-700 ring-violet-600/20",

      "In Progress":
        "bg-amber-50 text-amber-700 ring-amber-600/20",

      Resolved:
        "bg-emerald-50 text-emerald-700 ring-emerald-600/20",

      Closed:
        "bg-slate-100 text-slate-700 ring-slate-500/20",
    };

    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
          styles[ticketStatus] ||
          "bg-slate-100 text-slate-600 ring-slate-500/20"
        }`}
      >
        {ticketStatus || "Unknown"}
      </span>
    );
  };

  /* =====================================================
     PRIORITY BADGE
  ===================================================== */

  const getPriorityBadge = (ticketPriority) => {
    const styles = {
      Low:
        "bg-slate-100 text-slate-600 ring-slate-500/20",

      Medium:
        "bg-blue-50 text-blue-700 ring-blue-600/20",

      High:
        "bg-orange-50 text-orange-700 ring-orange-600/20",

      Critical:
        "bg-red-50 text-red-700 ring-red-600/20",
    };

    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
          styles[ticketPriority] ||
          "bg-slate-100 text-slate-600 ring-slate-500/20"
        }`}
      >
        {ticketPriority || "Unknown"}
      </span>
    );
  };

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setCategoryId("");
    setAssignedToId("");
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading ticket management...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 text-red-600"
            size={22}
          />

          <div>
            <h2 className="font-semibold text-red-800">
              Unable to load tickets
            </h2>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

            <button
              onClick={loadData}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Ticket size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Ticket Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage and monitor all IT support tickets.
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Ticket size={20} />
            </div>

            <span className="text-xs text-slate-400">
              Total
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-slate-900">
            {statistics.total}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            All tickets
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Clock3 size={20} />
            </div>

            <span className="text-xs text-slate-400">
              Status
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-slate-900">
            {statistics.open}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Open tickets
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <RefreshCw size={20} />
            </div>

            <span className="text-xs text-slate-400">
              Status
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-slate-900">
            {statistics.inProgress}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            In progress
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>

            <span className="text-xs text-slate-400">
              Status
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-slate-900">
            {statistics.resolved}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Resolved tickets
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={20} />
            </div>

            <span className="text-xs text-slate-400">
              Priority
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-slate-900">
            {statistics.critical}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Critical tickets
          </p>
        </div>

      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter
              size={18}
              className="text-slate-500"
            />

            <h2 className="font-semibold text-slate-900">
              Search & Filters
            </h2>
          </div>

          <button
            onClick={clearFilters}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Clear filters
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">

          <div className="relative lg:col-span-2">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search tickets..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="">
              All Statuses
            </option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">
              In Progress
            </option>
            <option value="Resolved">
              Resolved
            </option>
            <option value="Closed">
              Closed
            </option>
          </select>

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="">
              All Priorities
            </option>
            <option value="Low">Low</option>
            <option value="Medium">
              Medium
            </option>
            <option value="High">High</option>
            <option value="Critical">
              Critical
            </option>
          </select>

          <select
            value={categoryId}
            onChange={(e) =>
              setCategoryId(e.target.value)
            }
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="">
              All Categories
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

        </div>

        <div className="mt-3">
          <select
            value={assignedToId}
            onChange={(e) =>
              setAssignedToId(e.target.value)
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white md:w-1/2 lg:w-1/4"
          >
            <option value="">
              All Agents
            </option>

            {agents.map((agent) => (
              <option
                key={agent.id}
                value={agent.id}
              >
                {agent.fullName}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            All Tickets
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Showing {filteredTickets.length} of{" "}
            {tickets.length} tickets
          </p>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <XCircle
                size={25}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No tickets found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              No tickets match your current filters.
            </p>

            <button
              onClick={clearFilters}
              className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="min-w-[1100px] w-full">

              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Ticket
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Title
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Employee
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Category
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Priority
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Agent
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Created
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="transition hover:bg-slate-50/70"
                  >

                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="font-semibold text-blue-600">
                        {ticket.ticketNumber ||
                          `#${ticket.id}`}
                      </span>
                    </td>

                    <td className="max-w-[230px] px-5 py-4">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {ticket.title ||
                          "Untitled ticket"}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {ticket.description ||
                          "No description"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="text-sm font-medium text-slate-800">
                        {ticket.createdBy ||
                          "Unknown"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="text-sm text-slate-600">
                        {ticket.category ||
                          "Uncategorized"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      {getPriorityBadge(
                        ticket.priority
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      {getStatusBadge(
                        ticket.status
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="text-sm text-slate-600">
                        {ticket.assignedTo ||
                          "Unassigned"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="text-sm text-slate-500">
                        {formatDate(
                          ticket.createdAt
                        )}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/tickets/${ticket.id}`
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Eye size={15} />
                        View
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
  );
}

export default AdminTickets;