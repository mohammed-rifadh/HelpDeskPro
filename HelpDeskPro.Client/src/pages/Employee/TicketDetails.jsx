import { useEffect, useState } from "react";
import {
  ArrowLeft,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MessageCircle,
  RefreshCw,
  Send,
  Tag,
  User,
  XCircle,
  Lock,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import ticketService from "../../services/ticketService";
import { useAuth } from "../../context/AuthContext";

function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [comments, setComments] = useState([]);

  const [commentText, setCommentText] = useState("");

  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [closingTicket, setClosingTicket] = useState(false);

  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [closeError, setCloseError] = useState("");
  const [closeSuccess, setCloseSuccess] = useState("");

  /* =====================================================
     LOAD ALL TICKET DATA
  ====================================================== */

  const loadTicketData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ticketData, historyData, commentsData] =
        await Promise.all([
          ticketService.getTicketById(id),
          ticketService.getStatusHistory(id),
          ticketService.getComments(id),
        ]);

      setTicket(ticketData);

      setStatusHistory(
        Array.isArray(historyData) ? historyData : []
      );

      setComments(
        Array.isArray(commentsData) ? commentsData : []
      );
    } catch (error) {
      console.error(
        "Failed to load ticket details:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load ticket details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicketData();
  }, [id]);

  /* =====================================================
     CLOSE TICKET
     Employee can close ONLY a Resolved ticket.
  ====================================================== */

  const handleCloseTicket = async () => {
    if (!ticket) {
      return;
    }

    const currentStatus = getStatus();

    if (currentStatus !== "Resolved") {
      setCloseError(
        "Only resolved tickets can be closed."
      );

      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to close this ticket?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setClosingTicket(true);
      setCloseError("");
      setCloseSuccess("");

      await ticketService.closeTicket(id);

      setCloseSuccess(
        "Ticket closed successfully."
      );

      // Refresh ticket, status history and comments
      await loadTicketData();
    } catch (error) {
      console.error(
        "Failed to close ticket:",
        error
      );

      console.error(
        "Backend Response:",
        error.response?.data
      );

      setCloseError(
        error.response?.data?.message ||
          "Unable to close ticket."
      );
    } finally {
      setClosingTicket(false);
    }
  };

  /* =====================================================
     GENERAL HELPERS
  ====================================================== */

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

  const getTicketId = () => {
    return (
      ticket?.id ||
      ticket?.ticketId ||
      ticket?.ticketID ||
      id
    );
  };

  const getTitle = () => {
    return (
      ticket?.title ||
      ticket?.subject ||
      ticket?.ticketTitle ||
      "Untitled ticket"
    );
  };

  const getDescription = () => {
    return (
      ticket?.description ||
      ticket?.details ||
      ticket?.issueDescription ||
      "No description provided."
    );
  };

  const getCategory = () => {
    return (
      getValue(ticket?.category) ||
      ticket?.categoryName ||
      "General"
    );
  };

  const getPriority = () => {
    return (
      getValue(ticket?.priority) ||
      ticket?.priorityName ||
      "Normal"
    );
  };

  const getStatus = () => {
    return (
      getValue(ticket?.status) ||
      ticket?.statusName ||
      "Open"
    );
  };

  /* =====================================================
     ASSIGNED AGENT
  ====================================================== */

  const getAssignedAgent = () => {
    // Your backend TicketDto returns assignedTo
    // as a string such as "IT Support Agent".

    if (
      typeof ticket?.assignedTo === "string" &&
      ticket.assignedTo.trim()
    ) {
      return ticket.assignedTo;
    }

    // Fallbacks in case another response format is used.
    if (
      ticket?.assignedTo?.fullName
    ) {
      return ticket.assignedTo.fullName;
    }

    if (ticket?.assignedToName) {
      return ticket.assignedToName;
    }

    if (ticket?.assignedAgentName) {
      return ticket.assignedAgentName;
    }

    return "Not assigned";
  };

  /* =====================================================
     DATE / TIME HELPERS
  ====================================================== */

  const formatDate = (date) => {
    if (!date) {
      return "Unknown";
    }

    try {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return "Unknown";
      }

      return parsedDate.toLocaleDateString("en-GB", {
        timeZone: "Asia/Colombo",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "Unknown";
    }

    try {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return "Unknown";
      }

      return parsedDate.toLocaleString("en-GB", {
        timeZone: "Asia/Colombo",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "Unknown";
    }
  };

  /* =====================================================
     STATUS / PRIORITY STYLES
  ====================================================== */

  const getStatusStyle = (status) => {
    switch (String(status).toLowerCase()) {
      case "open":
        return "bg-blue-50 text-blue-700 border-blue-100";

      case "assigned":
        return "bg-purple-50 text-purple-700 border-purple-100";

      case "in progress":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "closed":
        return "bg-slate-100 text-slate-600 border-slate-200";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getPriorityStyle = (priority) => {
    switch (String(priority).toLowerCase()) {
      case "critical":
        return "bg-red-50 text-red-700 border-red-100";

      case "high":
        return "bg-red-50 text-red-700 border-red-100";

      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "low":
        return "bg-slate-100 text-slate-600 border-slate-200";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  /* =====================================================
     STATUS HISTORY HELPERS
  ====================================================== */

  const getHistoryStatus = (item) => {
    return (
      getValue(item.status) ||
      item.statusName ||
      item.newStatus ||
      item.toStatus ||
      "Updated"
    );
  };

  const getHistoryDate = (item) => {
    return (
      item.createdAt ||
      item.changedAt ||
      item.updatedAt ||
      item.date
    );
  };

  const getHistoryUser = (item) => {
    return (
      item.changedBy?.fullName ||
      item.changedBy?.name ||
      item.changedByName ||
      item.updatedByName ||
      item.userName ||
      "System"
    );
  };

  /* =====================================================
     COMMENT HELPERS
  ====================================================== */

  const getCommentText = (comment) => {
    return (
      comment.comment ||
      comment.content ||
      comment.message ||
      ""
    );
  };

  const getCommentUser = (comment) => {
    return (
      comment.user?.fullName ||
      comment.user?.name ||
      comment.fullName ||
      comment.userName ||
      comment.createdByName ||
      "User"
    );
  };

  const getCommentDate = (comment) => {
    return (
      comment.createdAt ||
      comment.createdDate ||
      comment.date
    );
  };

  /* =====================================================
     ADD COMMENT
  ====================================================== */

  const handleAddComment = async (e) => {
    e.preventDefault();

    const trimmedComment =
      commentText.trim();

    if (!trimmedComment) {
      return;
    }

    try {
      setCommentLoading(true);
      setCommentError("");

      const newComment =
        await ticketService.addComment(id, {
          comment: trimmedComment,
        });

      setComments((currentComments) => [
        ...currentComments,
        newComment,
      ]);

      setCommentText("");
    } catch (error) {
      console.error(
        "Failed to add comment:",
        error
      );

      setCommentError(
        error.response?.data?.message ||
          "Unable to add your comment."
      );
    } finally {
      setCommentLoading(false);
    }
  };

  /* =====================================================
     LOADING
  ====================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw
            size={28}
            className="animate-spin text-blue-600"
          />

          <p className="text-sm text-slate-500">
            Loading ticket details...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ====================================================== */

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <XCircle
              size={25}
              className="text-red-600"
            />
          </div>

          <h2 className="text-lg font-semibold text-slate-900">
            Unable to load ticket
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <div className="mt-6 flex justify-center gap-3">

            <button
              type="button"
              onClick={() =>
                navigate("/tickets")
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to Tickets
            </button>

            <button
              type="button"
              onClick={loadTicketData}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>

          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  const status = getStatus();
  const priority = getPriority();

  const canClose =
    status === "Resolved";

  const isClosed =
    status === "Closed";

  /* =====================================================
     MAIN UI
  ====================================================== */

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* =================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <button
            type="button"
            onClick={() =>
              navigate("/tickets")
            }
            className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={17} />

            Back to My Tickets
          </button>

          <div className="flex flex-wrap items-center gap-3">

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Ticket #{getTicketId()}
            </h1>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                status
              )}`}
            >
              {status}
            </span>

          </div>

          <p className="mt-1 text-sm text-slate-500">
            View your support request, progress and
            conversation.
          </p>

        </div>

        <button
          type="button"
          onClick={loadTicketData}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={17} />

          Refresh
        </button>

      </div>

      {/* =================================================
          CLOSE SUCCESS
      ================================================== */}

      {closeSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">

          <CheckCircle2 size={18} />

          {closeSuccess}

        </div>
      )}

      {/* =================================================
          CLOSE ERROR
      ================================================== */}

      {closeError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

          <AlertCircle size={18} />

          {closeError}

        </div>
      )}

      {/* =================================================
          MAIN GRID
      ================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* =================================================
            LEFT CONTENT
        ================================================== */}

        <div className="space-y-6 xl:col-span-2">

          {/* =================================================
              ISSUE
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">

                  <FileText
                    size={20}
                    className="text-blue-600"
                  />

                </div>

                <div className="min-w-0">

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Issue
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    {getTitle()}
                  </h2>

                </div>

              </div>

            </div>

            <div className="px-6 py-6">

              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {getDescription()}
              </p>

            </div>

          </div>

          {/* =================================================
              STATUS HISTORY
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">

                  <Clock3
                    size={20}
                    className="text-blue-600"
                  />

                </div>

                <div>

                  <h2 className="text-lg font-semibold text-slate-900">
                    Status History
                  </h2>

                  <p className="text-sm text-slate-500">
                    Track the progress of your ticket.
                  </p>

                </div>

              </div>

            </div>

            {statusHistory.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">

                <Clock3
                  size={25}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-2 text-sm text-slate-500">
                  No status history available.
                </p>

              </div>
            ) : (
              <div className="space-y-0">

                {statusHistory.map(
                  (item, index) => {

                    const historyStatus =
                      getHistoryStatus(item);

                    return (
                      <div
                        key={
                          item.id ||
                          item.historyId ||
                          index
                        }
                        className="flex gap-4"
                      >

                        <div className="flex flex-col items-center">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">

                            <CheckCircle2
                              size={18}
                              className="text-blue-600"
                            />

                          </div>

                          {index <
                            statusHistory.length -
                              1 && (
                            <div className="h-full min-h-12 w-px bg-slate-200" />
                          )}

                        </div>

                        <div className="pb-6">

                          <div className="flex flex-wrap items-center gap-2">

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                historyStatus
                              )}`}
                            >
                              {historyStatus}
                            </span>

                          </div>

                          <p className="mt-2 text-xs text-slate-400">
                            {formatDateTime(
                              getHistoryDate(item)
                            )}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">

                            Updated by{" "}

                            <span className="font-medium text-slate-700">
                              {getHistoryUser(item)}
                            </span>

                          </p>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>

          {/* =================================================
              COMMENTS
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">

                  <MessageCircle
                    size={20}
                    className="text-purple-600"
                  />

                </div>

                <div>

                  <h2 className="text-lg font-semibold text-slate-900">
                    Comments
                  </h2>

                  <p className="text-sm text-slate-500">
                    Conversation about this ticket.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6">

              {comments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">

                  <MessageCircle
                    size={25}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-2 text-sm text-slate-500">
                    No comments yet.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Start the conversation below.
                  </p>

                </div>
              ) : (
                <div className="space-y-5">

                  {comments.map(
                    (comment, index) => (

                      <div
                        key={
                          comment.id ||
                          comment.commentId ||
                          index
                        }
                        className="flex gap-3"
                      >

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">

                          {getCommentUser(comment)
                            .charAt(0)
                            .toUpperCase()}

                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <p className="text-sm font-semibold text-slate-800">
                              {getCommentUser(comment)}
                            </p>

                            <span className="text-xs text-slate-400">
                              {formatDateTime(
                                getCommentDate(
                                  comment
                                )
                              )}
                            </span>

                          </div>

                          <div className="mt-2 rounded-2xl rounded-tl-md bg-slate-50 px-4 py-3">

                            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                              {getCommentText(
                                comment
                              )}
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
                  className="mt-6 border-t border-slate-100 pt-6"
                >

                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Add a comment
                  </label>

                  <textarea
                    value={commentText}
                    onChange={(e) =>
                      setCommentText(
                        e.target.value
                      )
                    }
                    rows={4}
                    placeholder="Write an update or reply..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />

                  {commentError && (
                    <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                      {commentError}
                    </div>
                  )}

                  <div className="mt-3 flex justify-end">

                    <button
                      type="submit"
                      disabled={
                        commentLoading ||
                        !commentText.trim()
                      }
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      {commentLoading ? (
                        <>
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />

                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} />

                          Send Comment
                        </>
                      )}

                    </button>

                  </div>

                </form>
              )}

            </div>

          </div>

        </div>

        {/* =================================================
            RIGHT SIDEBAR
        ================================================== */}

        <div className="space-y-6">

          {/* =================================================
              CLOSE TICKET CARD
          ================================================== */}

          {canClose && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">

                  <CheckCircle2
                    size={20}
                    className="text-emerald-600"
                  />

                </div>

                <div>

                  <h2 className="font-semibold text-emerald-900">
                    Issue Resolved
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-emerald-700">
                    The support agent has resolved
                    your issue. You can now close
                    this ticket.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  handleCloseTicket
                }
                disabled={closingTicket}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {closingTicket ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Closing Ticket...
                  </>
                ) : (
                  <>
                    <Lock size={18} />

                    Close Ticket
                  </>
                )}

              </button>

            </div>
          )}

          {/* =================================================
              CLOSED MESSAGE
          ================================================== */}

          {isClosed && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200">

                  <Lock
                    size={19}
                    className="text-slate-600"
                  />

                </div>

                <div>

                  <h2 className="font-semibold text-slate-800">
                    Ticket Closed
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    This support request has been
                    closed.
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* =================================================
              TICKET INFORMATION
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-lg font-semibold text-slate-900">
              Ticket Information
            </h2>

            <div className="space-y-5">

              {/* Category */}

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">

                  <Tag
                    size={17}
                    className="text-slate-600"
                  />

                </div>

                <div>

                  <p className="text-xs font-medium text-slate-400">
                    Category
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {getCategory()}
                  </p>

                </div>

              </div>

              {/* Priority */}

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">

                  <AlertCircle
                    size={17}
                    className="text-red-600"
                  />

                </div>

                <div>

                  <p className="text-xs font-medium text-slate-400">
                    Priority
                  </p>

                  <div className="mt-1">

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityStyle(
                        priority
                      )}`}
                    >
                      {priority}
                    </span>

                  </div>

                </div>

              </div>

              {/* Assigned Agent */}

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50">

                  <User
                    size={17}
                    className="text-purple-600"
                  />

                </div>

                <div>

                  <p className="text-xs font-medium text-slate-400">
                    Assigned Agent
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {getAssignedAgent()}
                  </p>

                </div>

              </div>

              {/* Created */}

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">

                  <CalendarDays
                    size={17}
                    className="text-emerald-600"
                  />

                </div>

                <div>

                  <p className="text-xs font-medium text-slate-400">
                    Created
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDate(
                      ticket.createdAt ||
                        ticket.createdDate
                    )}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              USER CARD
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Signed in as
            </p>

            <div className="mt-4 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">

                {user?.fullName
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}

              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-semibold text-slate-800">
                  {user?.fullName ||
                    "Employee"}
                </p>

                <p className="truncate text-xs text-slate-400">
                  {user?.email || ""}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default TicketDetails;
