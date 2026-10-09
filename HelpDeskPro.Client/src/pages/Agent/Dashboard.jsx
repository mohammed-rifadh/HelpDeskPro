import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Ticket,
  UserCheck,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

function AgentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/Tickets");

      setTickets(response.data || []);
    } catch (err) {
      console.error("Agent dashboard error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

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

  const highPriorityTickets = tickets.filter(
    (ticket) =>
      ticket.priority === "High" ||
      ticket.priority === "Critical"
  ).length;

  // =====================================================
  // RECENT TICKETS
  // =====================================================

  const recentTickets = [...tickets]
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    )
    .slice(0, 5);

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
          <span>Loading agent dashboard...</span>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
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
            Agent Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor and manage your assigned support tickets.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDashboard(true)}
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
            onClick={() => loadDashboard()}
            className="cursor-pointer text-sm font-semibold text-red-700 hover:text-red-900"
          >
            Retry
          </button>

        </div>
      )}


      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

        {/* Total */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Assigned
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
              <UserCheck size={22} />
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


        {/* High Priority */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                High Priority
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {highPriorityTickets}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertCircle size={22} />
            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          QUICK ACTION
      ================================================= */}

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Ready to work on your tickets?
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Open your assigned tickets and update their status.
            </p>
          </div>

          <Link
            to="/agent/tickets"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            View My Tickets
            <ArrowRight size={17} />
          </Link>

        </div>

      </div>


      {/* =================================================
          RECENT TICKETS
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <div>
            <h2 className="font-semibold text-slate-900">
              Recent Assigned Tickets
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Your latest assigned support requests
            </p>
          </div>

          <Link
            to="/agent/tickets"
            className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>

        </div>


        {recentTickets.length === 0 ? (

          <div className="px-5 py-12 text-center">

            <Ticket
              size={32}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-medium text-slate-700">
              No assigned tickets
            </p>

            <p className="mt-1 text-sm text-slate-500">
              You currently have no tickets assigned to you.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ticket
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Title
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

                {recentTickets.map((ticket) => (

                  <tr
                    key={ticket.id}
                    className="transition hover:bg-slate-50"
                  >

                    <td className="px-5 py-4">

                      <span className="text-sm font-semibold text-slate-900">
                        {ticket.ticketNumber}
                      </span>

                    </td>


                    <td className="max-w-[280px] px-5 py-4">

                      <p className="truncate text-sm font-medium text-slate-800">
                        {ticket.title}
                      </p>

                    </td>


                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getPriorityStyle(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>

                    </td>


                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>

                    </td>


                    <td className="px-5 py-4 text-sm text-slate-500">
                      {formatDate(ticket.createdAt)}
                    </td>


                    <td className="px-5 py-4 text-right">

                      <Link
                        to={`/agent/tickets/${ticket.id}`}
                        className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
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

export default AgentDashboard;