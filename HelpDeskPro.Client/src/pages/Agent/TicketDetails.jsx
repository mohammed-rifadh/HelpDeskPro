import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquare,
  Send,
  Ticket,
  User,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";

function AgentTicketDetails() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);

  const [comment, setComment] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // GET NEXT VALID STATUS
  // =========================================================

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "Open":
        return "Assigned";

      case "Assigned":
        return "In Progress";

      case "In Progress":
        return "Resolved";

      case "Resolved":
        return "Resolved";

      case "Closed":
        return "Closed";

      default:
        return "";
    }
  };

  // =========================================================
  // LOAD TICKET DATA
  // =========================================================

  const loadTicketData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        ticketResponse,
        commentsResponse,
        historyResponse,
      ] = await Promise.all([
        api.get(`/Tickets/${id}`),
        api.get(`/tickets/${id}/comments`),
        api.get(`/tickets/${id}/status-history`),
      ]);

      const ticketData = ticketResponse.data;

      setTicket(ticketData);

      // IMPORTANT:
      // Select the NEXT valid status, not the current status.
      setNewStatus(getNextStatus(ticketData.status));

      // =====================================================
      // COMMENTS
      // =====================================================

      setComments(
        Array.isArray(commentsResponse.data)
          ? commentsResponse.data
          : commentsResponse.data?.data || []
      );

      // =====================================================
      // STATUS HISTORY
      // =====================================================

      setStatusHistory(
        Array.isArray(historyResponse.data)
          ? historyResponse.data
          : historyResponse.data?.data || []
      );
    } catch (err) {
      console.error("Ticket Details Error:", err);

      console.error(
        "Backend Response:",
        err.response?.data
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
    loadTicketData();
  }, [id]);

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const handleStatusUpdate = async () => {
    if (!ticket || !newStatus) {
      return;
    }

    // Prevent updating to the same status
    if (newStatus === ticket.status) {
      return;
    }

    try {
      setSavingStatus(true);
      setError("");
      setSuccess("");

      console.log("Updating Ticket:", {
        ticketId: id,
        currentStatus: ticket.status,
        newStatus: newStatus,
        priority: ticket.priority,
      });

      // IMPORTANT:
      // Backend UpdateTicketDto requires BOTH
      // Priority and Status.
      const response = await api.put(`/Tickets/${id}`, {
        priority: ticket.priority,
        status: newStatus,
      });

      console.log(
        "Status Update Response:",
        response.data
      );

      setSuccess(
        "Ticket status updated successfully."
      );

      // Reload ticket information
      await loadTicketData();
    } catch (err) {
      console.error(
        "Status Update Error:",
        err
      );

      console.error(
        "Backend Response:",
        err.response?.data
      );

      const backendMessage =
        err.response?.data?.message;

      const validationErrors =
        err.response?.data?.errors;

      let message =
        backendMessage ||
        "Unable to update ticket status.";

      // ASP.NET validation errors
      if (
        validationErrors?.Priority?.length
      ) {
        message =
          validationErrors.Priority[0];
      }

      if (
        validationErrors?.Status?.length
      ) {
        message =
          validationErrors.Status[0];
      }

      setError(message);
    } finally {
      setSavingStatus(false);
    }
  };

  // =========================================================
  // ADD COMMENT
  // =========================================================

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      return;
    }

    try {
      setSendingComment(true);
      setError("");
      setSuccess("");

      await api.post(
        `/tickets/${id}/comments`,
        {
          comment: comment.trim(),
        }
      );

      setComment("");

      setSuccess(
        "Comment added successfully."
      );

      // Reload comments
      const response = await api.get(
        `/tickets/${id}/comments`
      );

      setComments(
        Array.isArray(response.data)
          ? response.data
          : response.data?.data || []
      );
    } catch (err) {
      console.error(
        "Comment Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to add comment."
      );
    } finally {
      setSendingComment(false);
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDateTime = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString(
      "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // =========================================================
  // PRIORITY STYLE
  // =========================================================

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-700";

      case "High":
        return "bg-orange-100 text-orange-700";

      case "Medium":
        return "bg-yellow-100 text-yellow-700";

      case "Low":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-700";

      case "Assigned":
        return "bg-purple-100 text-purple-700";

      case "In Progress":
        return "bg-yellow-100 text-yellow-700";

      case "Resolved":
        return "bg-green-100 text-green-700";

      case "Closed":
        return "bg-gray-200 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />

          <span>
            Loading ticket details...
          </span>
        </div>
      </div>
    );
  }

  // =========================================================
  // TICKET NOT FOUND
  // =========================================================

  if (!ticket) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">

          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6" />

            <div>
              <h2 className="font-semibold">
                Ticket not found
              </h2>

              <p className="mt-1 text-sm">
                {error ||
                  "Unable to find this ticket."}
              </p>
            </div>
          </div>

          <Link
            to="/agent/tickets"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to My Tickets
          </Link>

        </div>
      </div>
    );
  }

  // =========================================================
  // TICKET STATUS
  // =========================================================

  const isClosed =
    ticket.status === "Closed";

  const isResolved =
    ticket.status === "Resolved";

  const canUpdate =
    !isClosed &&
    !isResolved &&
    newStatus !== ticket.status &&
    !savingStatus;

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="space-y-6 p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>

        <Link
          to="/agent/tickets"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to My Tickets
        </Link>

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-gray-900 p-3 text-white">
              <Ticket className="h-6 w-6" />
            </div>

            <div>

              <p className="text-sm text-gray-500">
                Ticket
              </p>

              <h1 className="text-2xl font-bold text-gray-900">
                #{ticket.ticketNumber}
              </h1>

            </div>

          </div>

          <div className="flex flex-wrap items-center gap-2">

            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${getPriorityClass(
                ticket.priority
              )}`}
            >
              {ticket.priority}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                ticket.status
              )}`}
            >
              {ticket.status}
            </span>

          </div>

        </div>
      </div>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

          <AlertCircle className="h-5 w-5 shrink-0" />

          <span>
            {error}
          </span>

        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">

          <CheckCircle2 className="h-5 w-5 shrink-0" />

          <span>
            {success}
          </span>

        </div>
      )}

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* ===================================================
            MAIN COLUMN
        =================================================== */}

        <div className="space-y-6 xl:col-span-2">

          {/* =================================================
              TICKET INFORMATION
          ================================================= */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Ticket className="h-5 w-5" />
              </div>

              <h2 className="text-lg font-semibold text-gray-900">
                Ticket Information
              </h2>

            </div>

            <div className="space-y-5">

              {/* TITLE */}

              <div>

                <p className="mb-1 text-sm font-medium text-gray-500">
                  Title
                </p>

                <h3 className="text-xl font-semibold text-gray-900">
                  {ticket.title ||
                    "No title"}
                </h3>

              </div>

              {/* DESCRIPTION */}

              <div>

                <p className="mb-2 text-sm font-medium text-gray-500">
                  Description
                </p>

                <div className="rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                  {ticket.description ||
                    "No description provided."}
                </div>

              </div>

              {/* DATES */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div className="rounded-xl border border-gray-100 p-4">

                  <div className="mb-2 flex items-center gap-2 text-gray-500">

                    <CalendarDays className="h-4 w-4" />

                    <span className="text-xs font-medium">
                      Created
                    </span>

                  </div>

                  <p className="text-sm font-semibold text-gray-900">
                    {formatDateTime(
                      ticket.createdAt
                    )}
                  </p>

                </div>

                <div className="rounded-xl border border-gray-100 p-4">

                  <div className="mb-2 flex items-center gap-2 text-gray-500">

                    <Clock3 className="h-4 w-4" />

                    <span className="text-xs font-medium">
                      Updated
                    </span>

                  </div>

                  <p className="text-sm font-semibold text-gray-900">
                    {formatDateTime(
                      ticket.updatedAt
                    )}
                  </p>

                </div>

                <div className="rounded-xl border border-gray-100 p-4">

                  <div className="mb-2 flex items-center gap-2 text-gray-500">

                    <CheckCircle2 className="h-4 w-4" />

                    <span className="text-xs font-medium">
                      Resolved
                    </span>

                  </div>

                  <p className="text-sm font-semibold text-gray-900">
                    {formatDateTime(
                      ticket.resolvedAt
                    )}
                  </p>

                </div>

              </div>

            </div>
          </div>

          {/* =================================================
              CONVERSATION
          ================================================= */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                <MessageSquare className="h-5 w-5" />
              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Conversation
                </h2>

                <p className="text-sm text-gray-500">
                  {comments.length}{" "}
                  {comments.length === 1
                    ? "comment"
                    : "comments"}
                </p>

              </div>

            </div>

            {/* COMMENTS */}

            {comments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">

                <MessageSquare className="mx-auto h-10 w-10 text-gray-400" />

                <p className="mt-3 font-medium text-gray-700">
                  No comments yet
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Start the conversation with the employee.
                </p>

              </div>
            ) : (
              <div className="space-y-4">

                {comments.map(
                  (item, index) => (
                    <div
                      key={
                        item.id ||
                        index
                      }
                      className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                    >

                      <div className="flex items-start gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700">
                          <User className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-col justify-between gap-1 sm:flex-row">

                            <p className="text-sm font-semibold text-gray-900">
                              {item.userName ||
                                item.createdBy ||
                                item.authorName ||
                                "User"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {formatDateTime(
                                item.createdAt
                              )}
                            </p>

                          </div>

                          <p className="mt-2 text-sm leading-6 text-gray-700">
                            {item.comment ||
                              item.content ||
                              item.message ||
                              "No comment text."}
                          </p>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

            {/* ADD COMMENT */}

            {!isClosed && (
              <form
                onSubmit={
                  handleAddComment
                }
                className="mt-6 border-t border-gray-100 pt-6"
              >

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Add Comment
                </label>

                <textarea
                  value={comment}
                  onChange={(e) =>
                    setComment(
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="Write a message to the employee..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                />

                <div className="mt-3 flex justify-end">

                  <button
                    type="submit"
                    disabled={
                      sendingComment ||
                      !comment.trim()
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {sendingComment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}

                    {sendingComment
                      ? "Sending..."
                      : "Send Comment"}

                  </button>

                </div>

              </form>
            )}

          </div>

          {/* =================================================
              STATUS HISTORY
          ================================================= */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <div className="rounded-lg bg-green-50 p-2 text-green-600">
                <Clock3 className="h-5 w-5" />
              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Status History
                </h2>

                <p className="text-sm text-gray-500">
                  Ticket workflow activity
                </p>

              </div>

            </div>

            {statusHistory.length === 0 ? (
              <p className="text-sm text-gray-500">
                No status history available.
              </p>
            ) : (
              <div className="space-y-5">

                {statusHistory.map(
                  (history, index) => (
                    <div
                      key={
                        history.id ||
                        index
                      }
                      className="relative flex gap-4"
                    >

                      <div className="flex flex-col items-center">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>

                        {index !==
                          statusHistory.length -
                            1 && (
                          <div className="mt-2 h-full w-px bg-gray-200" />
                        )}

                      </div>

                      <div className="pb-4">

                        <p className="font-semibold text-gray-900">
                          {history.fromStatus ||
                            history.oldStatus ||
                            "Open"}

                          {" → "}

                          {history.toStatus ||
                            history.newStatus ||
                            history.status}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {history.changedByName ||
                            history.changedBy ||
                            history.userName ||
                            "System"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {formatDateTime(
                            history.changedAt ||
                              history.createdAt
                          )}
                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </div>

        {/* ===================================================
            RIGHT SIDEBAR
        =================================================== */}

        <div className="space-y-6">

          {/* =================================================
              EMPLOYEE
          ================================================= */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center gap-3">

              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <User className="h-5 w-5" />
              </div>

              <h2 className="text-lg font-semibold text-gray-900">
                Employee
              </h2>

            </div>

            <div className="rounded-xl bg-gray-50 p-4">

              <p className="text-base font-semibold text-gray-900">
                {ticket.createdBy ||
                  "Unknown"}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Employee ID:{" "}
                {ticket.createdById ??
                  "-"}
              </p>

            </div>

          </div>

          {/* =================================================
              ASSIGNED AGENT
          ================================================= */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center gap-3">

              <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                <User className="h-5 w-5" />
              </div>

              <h2 className="text-lg font-semibold text-gray-900">
                Assigned Agent
              </h2>

            </div>

            <div className="rounded-xl bg-gray-50 p-4">

              <p className="text-base font-semibold text-gray-900">
                {ticket.assignedTo ||
                  "Unassigned"}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Agent ID:{" "}
                {ticket.assignedToId ??
                  "-"}
              </p>

            </div>

          </div>

          {/* =================================================
              TICKET DETAILS
          ================================================= */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-lg font-semibold text-gray-900">
              Ticket Details
            </h2>

            <div className="space-y-4">

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Category
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {ticket.category ||
                    "Uncategorized"}
                </p>

              </div>

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Priority
                </p>

                <span
                  className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-medium ${getPriorityClass(
                    ticket.priority
                  )}`}
                >
                  {ticket.priority ||
                    "Not Set"}
                </span>

              </div>

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Ticket ID
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {ticket.id}
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              UPDATE STATUS
          ================================================= */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-gray-900">
              Update Status
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Change the ticket workflow status.
            </p>

            <div className="mt-5">

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(
                    e.target.value
                  )
                }
                disabled={
                  isClosed ||
                  isResolved ||
                  savingStatus
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              >

                {/* OPEN → ASSIGNED */}

                {ticket.status ===
                  "Open" && (
                  <option value="Assigned">
                    Assigned
                  </option>
                )}

                {/* ASSIGNED → IN PROGRESS */}

                {ticket.status ===
                  "Assigned" && (
                  <option value="In Progress">
                    In Progress
                  </option>
                )}

                {/* IN PROGRESS → RESOLVED */}

                {ticket.status ===
                  "In Progress" && (
                  <option value="Resolved">
                    Resolved
                  </option>
                )}

                {/* RESOLVED */}

                {isResolved && (
                  <option value="Resolved">
                    Resolved
                  </option>
                )}

                {/* CLOSED */}

                {isClosed && (
                  <option value="Closed">
                    Closed
                  </option>
                )}

              </select>

              {/* STATUS INFORMATION */}

              {ticket.status ===
                "Open" && (
                <p className="mt-2 text-xs text-gray-500">
                  This ticket must be assigned
                  before work can begin.
                </p>
              )}

              {ticket.status ===
                "Assigned" && (
                <p className="mt-2 text-xs text-gray-500">
                  This ticket is assigned to you.
                  Move it to In Progress when
                  you start working on it.
                </p>
              )}

              {ticket.status ===
                "In Progress" && (
                <p className="mt-2 text-xs text-gray-500">
                  Move the ticket to Resolved
                  when the issue has been fixed.
                </p>
              )}

              {isResolved && (
                <p className="mt-2 text-xs text-green-600">
                  This ticket has been resolved
                  and cannot be updated.
                </p>
              )}

              {isClosed && (
                <p className="mt-2 text-xs text-gray-500">
                  This ticket is closed and
                  cannot be updated.
                </p>
              )}

              {/* UPDATE BUTTON */}

              {!isClosed &&
                !isResolved && (
                  <button
                    type="button"
                    onClick={
                      handleStatusUpdate
                    }
                    disabled={!canUpdate}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {savingStatus && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {savingStatus
                      ? "Updating..."
                      : "Update Status"}

                  </button>
                )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AgentTicketDetails;