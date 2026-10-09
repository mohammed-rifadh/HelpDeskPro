import { useEffect, useState } from "react";
import {
  Ticket,
  Clock3,
  CircleCheck,
  AlertCircle,
  Plus,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import ticketService from "../../services/ticketService";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Safely get a value from a string or object
  const getValue = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "string" || typeof value === "number") {
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

  // Get ticket title
  const getTicketTitle = (ticket) => {
    return (
      ticket.title ||
      ticket.subject ||
      ticket.ticketTitle ||
      "Untitled ticket"
    );
  };

  // Get ticket category
  const getTicketCategory = (ticket) => {
    return (
      getValue(ticket.category) ||
      ticket.categoryName ||
      "General"
    );
  };

  // Get ticket priority
  const getTicketPriority = (ticket) => {
    return (
      getValue(ticket.priority) ||
      ticket.priorityName ||
      "Normal"
    );
  };

  // Get ticket status
  const getTicketStatus = (ticket) => {
    return (
      getValue(ticket.status) ||
      ticket.statusName ||
      "Open"
    );
  };

  // Get ticket ID
  const getTicketId = (ticket) => {
    return ticket.id || ticket.ticketId || ticket.ticketID;
  };

  // Get ticket date
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
      return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  // Calculate statistics
  const openTickets = tickets.filter(
    (ticket) =>
      getTicketStatus(ticket).toLowerCase() === "open"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) =>
      getTicketStatus(ticket).toLowerCase() ===
      "in progress"
  ).length;

  const resolvedTickets = tickets.filter((ticket) => {
    const status = getTicketStatus(ticket).toLowerCase();

    return (
      status === "resolved" ||
      status === "closed"
    );
  }).length;

  const highPriorityTickets = tickets.filter(
    (ticket) =>
      getTicketPriority(ticket).toLowerCase() ===
      "high"
  ).length;

  // Dashboard statistics
  const stats = [
    {
      title: "Open Tickets",
      value: openTickets,
      description: "Currently active",
      icon: Ticket,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "In Progress",
      value: inProgressTickets,
      description: "Being handled",
      icon: Clock3,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Resolved",
      value: resolvedTickets,
      description: "Successfully resolved",
      icon: CircleCheck,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "High Priority",
      value: highPriorityTickets,
      description: "Needs attention",
      icon: AlertCircle,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

  // Latest five tickets
  const recentTickets = tickets.slice(0, 5);

  // Priority badge
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

  // Status badge
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

  return (
    <div className="space-y-6">

      {/* Welcome Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <p className="text-sm font-medium text-blue-600">
            Employee Portal
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Good morning, {user?.fullName || "there"} 👋
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here's an overview of your IT support requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/tickets/create")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />

          New Ticket
        </button>

      </div>

      {/* Error Message */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {loading ? "—" : stat.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {stat.description}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg}`}
                >
                  <Icon
                    size={21}
                    className={stat.iconColor}
                  />
                </div>

              </div>
            </div>
          );
        })}

      </div>

      {/* Recent Tickets */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Tickets
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your latest support requests
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/tickets")}
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View all

            <ArrowRight size={16} />
          </button>

        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4 p-5">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-xl bg-slate-100 p-4"
              >
                <div className="h-4 w-1/4 rounded bg-slate-200" />

                <div className="mt-3 h-3 w-2/3 rounded bg-slate-200" />

                <div className="mt-3 h-3 w-1/3 rounded bg-slate-200" />
              </div>
            ))}

          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tickets.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Ticket
                size={26}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-800">
              No tickets yet
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              You haven't created any support tickets yet.
            </p>

            <button
              type="button"
              onClick={() => navigate("/tickets/create")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={17} />

              Create Ticket
            </button>

          </div>
        )}

        {/* Desktop Table */}
        {!loading && tickets.length > 0 && (
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

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Updated
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {recentTickets.map((ticket) => {
                  const ticketId = getTicketId(ticket);
                  const title = getTicketTitle(ticket);
                  const category = getTicketCategory(ticket);
                  const priority = getTicketPriority(ticket);
                  const status = getTicketStatus(ticket);
                  const date = getTicketDate(ticket);

                  return (
                    <tr
                      key={ticketId}
                      onClick={() =>
                        navigate(`/tickets/${ticketId}`)
                      }
                      className="cursor-pointer transition hover:bg-slate-50"
                    >

                      <td className="px-5 py-4">
                        <div>

                          <p className="text-sm font-semibold text-slate-800">
                            #{ticketId}
                          </p>

                          <p className="mt-0.5 max-w-xs truncate text-sm text-slate-500">
                            {title}
                          </p>

                        </div>
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

                      <td className="px-5 py-4 text-right text-sm text-slate-500">
                        {date}
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

        {/* Mobile Cards */}
        {!loading && tickets.length > 0 && (
          <div className="divide-y divide-slate-100 md:hidden">

            {recentTickets.map((ticket) => {
              const ticketId = getTicketId(ticket);
              const title = getTicketTitle(ticket);
              const category = getTicketCategory(ticket);
              const priority = getTicketPriority(ticket);
              const status = getTicketStatus(ticket);
              const date = getTicketDate(ticket);

              return (
                <div
                  key={ticketId}
                  onClick={() =>
                    navigate(`/tickets/${ticketId}`)
                  }
                  className="cursor-pointer p-5 transition hover:bg-slate-50"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="text-sm font-semibold text-slate-800">
                        #{ticketId}
                      </p>

                      <p className="mt-1 truncate text-sm text-slate-600">
                        {title}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {category} • {date}
                      </p>

                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                        status
                      )}`}
                    >
                      {status}
                    </span>

                  </div>

                  <div className="mt-3">

                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityStyle(
                        priority
                      )}`}
                    >
                      {priority} Priority
                    </span>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* Help Banner */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h3 className="font-semibold text-blue-900">
              Need technical assistance?
            </h3>

            <p className="mt-1 text-sm text-blue-700">
              Create a support ticket and our IT team will help you.
            </p>

          </div>

          <button
            type="button"
            onClick={() => navigate("/tickets/create")}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100"
          >
            <Plus size={17} />

            Create Ticket
          </button>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;