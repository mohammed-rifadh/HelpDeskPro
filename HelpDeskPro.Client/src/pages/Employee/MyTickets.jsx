import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Ticket,
  ChevronRight,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import ticketService from "../../services/ticketService";

function MyTickets() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Load employee tickets
  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await ticketService.getMyTickets();

      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load tickets:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load your tickets. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Safely get values from API objects or strings
  const getValue = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      return String(value);
    }

    if (typeof value === "object") {
      return (
        value.name ||
        value.title ||
        value.value ||
        value.status ||
        value.priority ||
        ""
      );
    }

    return "";
  };

  // Ticket ID
  const getTicketId = (ticket) => {
    return (
      ticket.id ||
      ticket.ticketId ||
      ticket.ticketID
    );
  };

  // Ticket title
  const getTicketTitle = (ticket) => {
    return (
      ticket.title ||
      ticket.subject ||
      ticket.ticketTitle ||
      "Untitled ticket"
    );
  };

  // Ticket category
  const getTicketCategory = (ticket) => {
    return (
      getValue(ticket.category) ||
      ticket.categoryName ||
      "General"
    );
  };

  // Ticket priority
  const getTicketPriority = (ticket) => {
    return (
      getValue(ticket.priority) ||
      ticket.priorityName ||
      "Normal"
    );
  };

  // Ticket status
  const getTicketStatus = (ticket) => {
    return (
      getValue(ticket.status) ||
      ticket.statusName ||
      "Open"
    );
  };

  // Ticket date
  const getTicketDate = (ticket) => {
    const date =
      ticket.updatedAt ||
      ticket.createdAt ||
      ticket.updatedDate ||
      ticket.createdDate;

    if (!date) {
      return "Recently";
    }

    try {
      return new Date(date).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "Recently";
    }
  };

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const id = String(getTicketId(ticket) || "");
      const title = getTicketTitle(ticket);
      const category = getTicketCategory(ticket);
      const status = getTicketStatus(ticket);
      const priority = getTicketPriority(ticket);

      const searchText =
        `${id} ${title} ${category} ${status} ${priority}`.toLowerCase();

      const matchesSearch =
        searchText.includes(
          searchTerm.toLowerCase()
        );

      const matchesStatus =
        statusFilter === "All" ||
        status.toLowerCase() ===
          statusFilter.toLowerCase();

      const matchesPriority =
        priorityFilter === "All" ||
        priority.toLowerCase() ===
          priorityFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tickets,
    searchTerm,
    statusFilter,
    priorityFilter,
  ]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    statusFilter !== "All" ||
    priorityFilter !== "All";

  // Status badge styles
  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-blue-50 text-blue-700";

      case "assigned":
        return "bg-purple-50 text-purple-700";

      case "in progress":
        return "bg-amber-50 text-amber-700";

      case "resolved":
        return "bg-emerald-50 text-emerald-700";

      case "closed":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // Priority badge styles
  const getPriorityStyle = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-700";

      case "medium":
        return "bg-amber-50 text-amber-700";

      case "low":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-sm font-medium text-blue-600">
            Employee Portal
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            My Tickets
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and track all your IT support requests.
          </p>
        </div>

        <button
          type="button"
          onClick={loadTickets}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              loading ? "animate-spin" : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex items-center gap-2 mb-4">

          <Filter
            size={18}
            className="text-slate-500"
          />

          <h2 className="text-sm font-semibold text-slate-800">
            Search & Filters
          </h2>

        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

          {/* Search */}
          <div className="relative md:col-span-1">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search tickets..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">
              All Statuses
            </option>

            <option value="Open">
              Open
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
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">
              All Priorities
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

        {/* Active Filter */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

            <p className="text-xs text-slate-500">
              Showing {filteredTickets.length} of{" "}
              {tickets.length} tickets
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <X size={14} />

              Clear filters
            </button>

          </div>
        )}

      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to load tickets
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={loadTickets}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-100"
          >
            <RefreshCw size={16} />

            Retry
          </button>

        </div>
      )}

      {/* Ticket List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* List Header */}
        <div className="border-b border-slate-200 px-5 py-5">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Support Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Loading tickets..."
                  : `${filteredTickets.length} ticket${
                      filteredTickets.length !== 1
                        ? "s"
                        : ""
                    } found`}
              </p>
            </div>

            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-blue-50 sm:flex">
              <Ticket
                size={19}
                className="text-blue-600"
              />
            </div>

          </div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3 p-5">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-xl border border-slate-100 p-4"
              >
                <div className="h-4 w-20 rounded bg-slate-200" />

                <div className="mt-3 h-4 w-2/3 rounded bg-slate-200" />

                <div className="mt-3 h-3 w-1/3 rounded bg-slate-200" />
              </div>
            ))}

          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          filteredTickets.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Ticket
                  size={26}
                  className="text-slate-400"
                />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-800">
                {tickets.length === 0
                  ? "No tickets found"
                  : "No matching tickets"}
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {tickets.length === 0
                  ? "You haven't created any support tickets yet."
                  : "Try changing your search or filters."}
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <X size={16} />

                  Clear Filters
                </button>
              )}

            </div>
          )}

        {/* Desktop Table */}
        {!loading &&
          !error &&
          filteredTickets.length > 0 && (
            <div className="hidden overflow-x-auto md:block">

              <table className="w-full">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Ticket
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
                      Updated
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredTickets.map((ticket) => {

                    const ticketId =
                      getTicketId(ticket);

                    const title =
                      getTicketTitle(ticket);

                    const category =
                      getTicketCategory(ticket);

                    const priority =
                      getTicketPriority(ticket);

                    const status =
                      getTicketStatus(ticket);

                    const date =
                      getTicketDate(ticket);

                    return (
                      <tr
                        key={ticketId}
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-5 py-4">

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/tickets/${ticketId}`
                              )
                            }
                            className="text-left"
                          >

                            <p className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                              #{ticketId}
                            </p>

                            <p className="mt-1 max-w-sm truncate text-sm text-slate-700">
                              {title}
                            </p>

                          </button>

                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {category}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityStyle(
                              priority
                            )}`}
                          >
                            {priority}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                              status
                            )}`}
                          >
                            {status}
                          </span>

                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {date}
                        </td>

                        <td className="px-5 py-4 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/tickets/${ticketId}`
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                          >
                            View

                            <ChevronRight
                              size={15}
                            />
                          </button>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        {/* Mobile Cards */}
        {!loading &&
          !error &&
          filteredTickets.length > 0 && (
            <div className="divide-y divide-slate-100 md:hidden">

              {filteredTickets.map((ticket) => {

                const ticketId =
                  getTicketId(ticket);

                const title =
                  getTicketTitle(ticket);

                const category =
                  getTicketCategory(ticket);

                const priority =
                  getTicketPriority(ticket);

                const status =
                  getTicketStatus(ticket);

                const date =
                  getTicketDate(ticket);

                return (
                  <div
                    key={ticketId}
                    className="p-5"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/tickets/${ticketId}`
                          )
                        }
                        className="min-w-0 text-left"
                      >

                        <p className="text-sm font-semibold text-blue-600">
                          #{ticketId}
                        </p>

                        <p className="mt-1 truncate text-sm font-medium text-slate-800">
                          {title}
                        </p>

                      </button>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                          status
                        )}`}
                      >
                        {status}
                      </span>

                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">

                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                        {category}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityStyle(
                          priority
                        )}`}
                      >
                        {priority}
                      </span>

                    </div>

                    <div className="mt-3 flex items-center justify-between">

                      <span className="text-xs text-slate-400">
                        Updated {date}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/tickets/${ticketId}`
                          )
                        }
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600"
                      >
                        View Ticket

                        <ChevronRight
                          size={14}
                        />
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

      </div>

    </div>
  );
}

export default MyTickets;