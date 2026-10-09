import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Tag,
  Clock,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  UserCog,
  RefreshCw,
} from "lucide-react";

import ticketService from "../../services/ticketService";
import userService from "../../services/userService";

function AdminTicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [assignmentHistory, setAssignmentHistory] =
    useState([]);
  const [comments, setComments] = useState([]);

  const [selectedAgent, setSelectedAgent] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState("");

  const [selectedPriority, setSelectedPriority] =
    useState("");

  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =====================================================
     LOAD TICKET
  ===================================================== */

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        ticketData,
        agentData,
        historyData,
        assignmentData,
        commentData,
      ] = await Promise.all([
        ticketService.getTicketById(id),
        userService.getActiveAgents(),
        ticketService.getStatusHistory(id),
        ticketService.getAssignmentHistory(id),
        ticketService.getComments(id),
      ]);

      setTicket(ticketData);

      setAgents(
        Array.isArray(agentData)
          ? agentData
          : []
      );

      setStatusHistory(
        Array.isArray(historyData)
          ? historyData
          : []
      );

      setAssignmentHistory(
        Array.isArray(assignmentData)
          ? assignmentData
          : []
      );

      setComments(
        Array.isArray(commentData)
          ? commentData
          : []
      );

      setSelectedAgent(
        ticketData?.assignedToId
          ? String(ticketData.assignedToId)
          : ""
      );

      setSelectedStatus(
        ticketData?.status || ""
      );

      setSelectedPriority(
        ticketData?.priority || ""
      );
    } catch (err) {
      console.error(
        "Ticket details error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load ticket details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  /* =====================================================
     AVAILABLE STATUS TRANSITIONS

     Backend rules:

     Open -> Assigned
     Assigned -> In Progress
     In Progress -> Resolved
     Resolved -> Closed

     Admin cannot directly skip workflow stages.
  ===================================================== */

  const availableStatuses = useMemo(() => {
    if (!ticket) return [];

    switch (ticket.status) {
      case "Open":
        return ["Assigned"];

      case "Assigned":
        return ["In Progress"];

      case "In Progress":
        return ["Resolved"];

      case "Resolved":
        return [];

      case "Closed":
        return [];

      default:
        return [];
    }
  }, [ticket]);

  /* =====================================================
     DATE FORMAT
  ===================================================== */

  const formatDateTime = (date) => {
    if (!date) return "Unknown";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown";
    }

    return parsedDate.toLocaleString(
      "en-GB",
      {
        timeZone: "Asia/Colombo",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    );
  };

  /* =====================================================
     ASSIGN TICKET
  ===================================================== */

  const handleAssign = async () => {
    if (!selectedAgent) {
      setError("Please select an agent.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await ticketService.assignTicket(
        id,
        selectedAgent
      );

      setSuccess(
        "Ticket assigned successfully."
      );

      await loadTicket();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to assign ticket."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     UPDATE TICKET
  ===================================================== */

  const handleUpdate = async () => {
    if (!selectedStatus) {
      setError("Please select a status.");
      return;
    }

    if (!selectedPriority) {
      setError("Please select a priority.");
      return;
    }

    if (
      selectedStatus === ticket.status &&
      selectedPriority === ticket.priority
    ) {
      setError(
        "No changes have been made."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await ticketService.updateTicket(
        id,
        {
          status: selectedStatus,
          priority: selectedPriority,
        }
      );

      setSuccess(
        "Ticket updated successfully."
      );

      await loadTicket();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to update ticket."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     ADD COMMENT
  ===================================================== */

  const handleAddComment = async () => {
    if (!comment.trim()) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await ticketService.addComment(
        id,
        {
          comment: comment.trim(),
        }
      );

      setComment("");

      const updatedComments =
        await ticketService.getComments(id);

      setComments(
        Array.isArray(updatedComments)
          ? updatedComments
          : []
      );

      setSuccess(
        "Comment added successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to add comment."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     STATUS BADGE
  ===================================================== */

  const getStatusBadge = (status) => {
    const styles = {
      Open:
        "bg-blue-50 text-blue-700",

      Assigned:
        "bg-violet-50 text-violet-700",

      "In Progress":
        "bg-amber-50 text-amber-700",

      Resolved:
        "bg-emerald-50 text-emerald-700",

      Closed:
        "bg-slate-100 text-slate-700",
    };

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
          styles[status] ||
          "bg-slate-100 text-slate-600"
        }`}
      >
        {status || "Unknown"}
      </span>
    );
  };

  /* =====================================================
     PRIORITY BADGE
  ===================================================== */

  const getPriorityBadge = (priority) => {
    const styles = {
      Low:
        "bg-slate-100 text-slate-600",

      Medium:
        "bg-blue-50 text-blue-700",

      High:
        "bg-orange-50 text-orange-700",

      Critical:
        "bg-red-50 text-red-700",
    };

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
          styles[priority] ||
          "bg-slate-100 text-slate-600"
        }`}
      >
        {priority || "Unknown"}
      </span>
    );
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
            Loading ticket details...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     TICKET NOT FOUND
  ===================================================== */

  if (!ticket) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="text-red-600"
            size={22}
          />

          <div>
            <h2 className="font-semibold text-red-800">
              Ticket not found
            </h2>

            <p className="mt-1 text-sm text-red-700">
              {error ||
                "The requested ticket could not be found."}
            </p>

            <button
              onClick={() =>
                navigate("/admin/tickets")
              }
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Back to Tickets
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <button
            onClick={() =>
              navigate("/admin/tickets")
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={17} />
            Back to tickets
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {ticket.ticketNumber ||
                `Ticket #${ticket.id}`}
            </h1>

            {getStatusBadge(ticket.status)}

            {getPriorityBadge(ticket.priority)}
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Ticket management and support details
          </p>
        </div>

        <button
          onClick={loadTicket}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {/* =================================================
          ALERTS
      ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="space-y-6 xl:col-span-2">

          {/* Ticket Information */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
              {ticket.title}
            </h2>

            <div className="mt-5 rounded-xl bg-slate-50 p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {ticket.description ||
                  "No description provided."}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <UserRound size={18} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Created By
                  </p>

                  <p className="text-sm font-semibold text-slate-900">
                    {ticket.createdBy ||
                      "Unknown"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <Tag size={18} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Category
                  </p>

                  <p className="text-sm font-semibold text-slate-900">
                    {ticket.category ||
                      "Uncategorized"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Created
                  </p>

                  <p className="text-sm font-semibold text-slate-900">
                    {formatDateTime(
                      ticket.createdAt
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Clock size={18} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Last Updated
                  </p>

                  <p className="text-sm font-semibold text-slate-900">
                    {formatDateTime(
                      ticket.updatedAt
                    )}
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Comments */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-2">
              <MessageSquare
                size={19}
                className="text-blue-600"
              />

              <h2 className="text-lg font-semibold text-slate-900">
                Comments
              </h2>
            </div>

            <div className="mt-5 space-y-4">

              {comments.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No comments yet.
                </p>
              ) : (
                comments.map(
                  (item, index) => (
                    <div
                      key={
                        item.id || index
                      }
                      className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">

                        <p className="text-sm font-semibold text-slate-900">
                          {item.createdBy ||
                            item.userName ||
                            item.fullName ||
                            "User"}
                        </p>

                        <span className="text-xs text-slate-400">
                          {formatDateTime(
                            item.createdAt
                          )}
                        </span>

                      </div>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {item.comment ||
                          item.content ||
                          ""}
                      </p>
                    </div>
                  )
                )
              )}

            </div>

            <div className="mt-5">

              <textarea
                value={comment}
                onChange={(e) =>
                  setComment(e.target.value)
                }
                placeholder="Add a comment..."
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
              />

              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleAddComment}
                  disabled={
                    saving ||
                    !comment.trim()
                  }
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add Comment
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            RIGHT SIDEBAR
        ================================================= */}

        <div className="space-y-6">

          {/* Assignment */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-2">
              <UserCog
                size={19}
                className="text-blue-600"
              />

              <h2 className="font-semibold text-slate-900">
                Assignment
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Assign this ticket to an active support agent.
            </p>

            <select
              value={selectedAgent}
              onChange={(e) =>
                setSelectedAgent(e.target.value)
              }
              disabled={
                saving ||
                ticket.status === "Resolved" ||
                ticket.status === "Closed"
              }
              className="mt-4 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                Select agent
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

            <button
              onClick={handleAssign}
              disabled={
                saving ||
                !selectedAgent ||
                ticket.status === "Resolved" ||
                ticket.status === "Closed"
              }
              className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Assigning..."
                : "Assign Agent"}
            </button>

          </div>

          {/* Update Ticket */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="font-semibold text-slate-900">
              Update Ticket
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Follow the ticket workflow when updating the status.
            </p>

            <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </label>

            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value)
              }
              disabled={
                saving ||
                availableStatuses.length === 0
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                Select status
              </option>

              {availableStatuses.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}

              {ticket.status ===
                "Resolved" && (
                <option value="Resolved">
                  Resolved
                </option>
              )}

              {ticket.status ===
                "Closed" && (
                <option value="Closed">
                  Closed
                </option>
              )}
            </select>

            <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Priority
            </label>

            <select
              value={selectedPriority}
              onChange={(e) =>
                setSelectedPriority(e.target.value)
              }
              disabled={
                saving ||
                ticket.status === "Resolved" ||
                ticket.status === "Closed"
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="Low">
                Low
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="High">
                High
              </option>

              <option value="Critical">
                Critical
              </option>
            </select>

            <button
              onClick={handleUpdate}
              disabled={
                saving ||
                !selectedStatus ||
                availableStatuses.length === 0
              }
              className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

            {availableStatuses.length === 0 && (
              <p className="mt-3 text-xs text-slate-500">
                This ticket cannot be moved to another status.
              </p>
            )}

          </div>

          {/* Current Assignment */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="font-semibold text-slate-900">
              Current Assignment
            </h2>

            <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {ticket.assignedTo
                  ? ticket.assignedTo
                      .split(" ")
                      .map(
                        (name) => name[0]
                      )
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "—"}
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Assigned Agent
                </p>

                <p className="text-sm font-semibold text-slate-900">
                  {ticket.assignedTo ||
                    "Unassigned"}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          HISTORY
      ================================================= */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Status History */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-2">
            <CheckCircle2
              size={19}
              className="text-emerald-600"
            />

            <h2 className="font-semibold text-slate-900">
              Status History
            </h2>
          </div>

          <div className="mt-5 space-y-4">

            {statusHistory.length === 0 ? (
              <p className="text-sm text-slate-500">
                No status history available.
              </p>
            ) : (
              statusHistory.map(
                (item, index) => (
                  <div
                    key={
                      item.id || index
                    }
                    className="flex gap-3"
                  >
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.status ||
                          item.newStatus ||
                          item.toStatus ||
                          "Status updated"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatDateTime(
                          item.createdAt ||
                            item.changedAt ||
                            item.changedAtUtc
                        )}
                      </p>
                    </div>
                  </div>
                )
              )
            )}

          </div>

        </div>

        {/* Assignment History */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-2">
            <UserCog
              size={19}
              className="text-violet-600"
            />

            <h2 className="font-semibold text-slate-900">
              Assignment History
            </h2>
          </div>

          <div className="mt-5 space-y-4">

            {assignmentHistory.length === 0 ? (
              <p className="text-sm text-slate-500">
                No assignment history available.
              </p>
            ) : (
              assignmentHistory.map(
                (item, index) => (
                  <div
                    key={
                      item.id || index
                    }
                    className="rounded-xl bg-slate-50 p-4"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {item.assignedTo ||
                        item.agentName ||
                        item.assignedToName ||
                        "Agent"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatDateTime(
                        item.createdAt ||
                          item.assignedAt
                      )}
                    </p>
                  </div>
                )
              )
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminTicketDetails;