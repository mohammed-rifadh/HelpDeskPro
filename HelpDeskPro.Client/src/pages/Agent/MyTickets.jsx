import { useEffect, useState } from "react";
import {
  AlertCircle,
  Clock3,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  Ticket,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

function AgentMyTickets() {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD TICKETS
  // =====================================================

  const loadTickets = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/Tickets");

      const data = response.data || [];

      setTickets(data);
      setFilteredTickets(data);
    } catch (err) {
      console.error("Agent tickets error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your assigned tickets."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // =====================================================
  // FILTER TICKETS
  // =====================================================

  useEffect(() => {
    let result = [...tickets];

    const searchValue = search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((ticket) => {
        return (
          ticket.ticketNumber
            ?.toLowerCase()
            .includes(searchValue) ||
          ticket.title
            ?.toLowerCase()
            .includes(searchValue) ||
          ticket.description
            ?.toLowerCase()
            .includes(searchValue) ||
          ticket.createdBy?.fullName
            ?.toLowerCase()
            .includes(searchValue)
        );
      });
    }

    if (statusFilter !== "All") {
      result = result.filter(
        (ticket) => ticket.status === statusFilter
      );
    }

    if (priorityFilter !== "All") {
      result = result.filter(
        (ticket) => ticket.priority === priorityFilter
      );
    }

    setFilteredTickets(result);
  }, [
    tickets,
    search,
    statusFilter,
    priorityFilter,
  ]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalTickets = tickets.length;

  const assignedTickets = tickets.filter(
    (ticket) => ticket.status === "Assigned"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "In Progress"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "Resolved"
  ).length;

  // =====================================================
  // HELPERS
  // =====================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Assigned":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "In Progress":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "Resolved":
        return "bg-green-50 text-green-700 border-green-200";

      case "Closed":
        return "bg-slate-100 text-slate-700 border-slate-200";

      case "Open":
        return "bg-purple-50 text-purple-700 border-purple-200";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-50 text-red-700 border-red-200";

      case "High":
        return "bg-orange-50 text-orange-700 border-orange-200";

      case "Medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      case "Low":
        return "bg-green-50 text-green-700 border-green-200";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2
            size={22}
            className="animate-spin"
          />

          <span>
            Loading your tickets...
          </span>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <p className="text-sm font-medium text-blue-600">
            Agent Workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            My Tickets
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage tickets assigned to you.
          </p>

        </div>

        <button
          type="button"
          onClick={() => loadTickets(true)}
          disabled={refreshing}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">

          <div className="flex items-center gap-2 text-sm text-red-700">

            <AlertCircle size={18} />

            {error}

          </div>

          <button
            type="button"
            onClick={() => loadTickets()}
            className="cursor-pointer text-sm font-semibold text-red-700 hover:text-red-900"
          >
            Retry
          </button>

        </div>
      )}


      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total Tickets
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalTickets}
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Ticket size={22} />
            </div>

          </div>

        </div>


        {/* Assigned */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Assigned
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {assignedTickets}
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Clock3 size={22} />
            </div>

          </div>

        </div>


        {/* In Progress */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                In Progress
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {inProgressTickets}
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock3 size={22} />
            </div>

          </div>

        </div>


        {/* Resolved */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Resolved
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {resolvedTickets}
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <CheckCircle2 size={22} />
            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

          {/* Search */}
          <div className="relative">

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
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>


          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">
              All Statuses
            </option>

            <option value="Assigned">
              Assigned
            </option>

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


          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value)
            }
            className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">
              All Priorities
            </option>

            <option value="Critical">
              Critical
            </option>

            <option value="High">
              High
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Low">
              Low
            </option>

          </select>

        </div>

      </div>


      {/* =================================================
          TICKET TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <div>

            <h2 className="font-semibold text-slate-900">
              Assigned Tickets
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredTickets.length} ticket
              {filteredTickets.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>

          </div>

        </div>


        {filteredTickets.length === 0 ? (

          <div className="px-5 py-14 text-center">

            <Ticket
              size={38}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-800">
              No tickets found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filter options.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ticket
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Title
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Employee
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Priority
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {filteredTickets.map((ticket) => (

                  <tr
                    key={ticket.id}
                    className="transition hover:bg-slate-50"
                  >

                    {/* Ticket Number */}
                    <td className="px-5 py-4">

                      <span className="text-sm font-semibold text-slate-900">
                        {ticket.ticketNumber}
                      </span>

                    </td>


                    {/* Title */}
                    <td className="max-w-[260px] px-5 py-4">

                      <p className="truncate text-sm font-medium text-slate-800">
                        {ticket.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {ticket.category?.name ||
                          "Uncategorized"}
                      </p>

                    </td>


                    {/* Employee */}
                    <td className="px-5 py-4">

                      <p className="text-sm font-medium text-slate-800">
                        {ticket.createdBy?.fullName ||
                          "Unknown"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {ticket.createdBy?.email ||
                          "-"}
                      </p>

                    </td>


                    {/* Priority */}
                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getPriorityStyle(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>

                    </td>


                    {/* Status */}
                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>

                    </td>


                    {/* Created */}
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {formatDate(ticket.createdAt)}
                    </td>


                    {/* Action */}
                    <td className="px-5 py-4 text-right">

                      <Link
                        to={`/agent/tickets/${ticket.id}`}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Eye size={16} />
                        View
                      </Link>

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

export default AgentMyTickets;