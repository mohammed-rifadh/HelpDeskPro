import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminReports() {
  const [summary, setSummary] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agentReport, setAgentReport] = useState([]);
  const [monthly, setMonthly] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // EXPORT STATE
  // =========================================================

  const [exporting, setExporting] = useState("");
// =========================================================
// LOAD REPORTS
// =========================================================

useEffect(() => {
  loadReports(false);
}, []);

const loadReports = async (isRefresh = false) => {
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

    const [
      summaryResponse,
      prioritiesResponse,
      categoriesResponse,
      agentsResponse,
      monthlyResponse,
    ] = await Promise.all([
      api.get("/Reports/summary"),
      api.get("/Reports/priorities"),
      api.get("/Reports/categories"),
      api.get("/Reports/agents"),
      api.get("/Reports/monthly"),
    ]);

    setSummary(summaryResponse.data);

    setPriorities(
      Array.isArray(prioritiesResponse.data)
        ? prioritiesResponse.data
        : []
    );

    setCategories(
      Array.isArray(categoriesResponse.data)
        ? categoriesResponse.data
        : []
    );

    setAgentReport(
      Array.isArray(agentsResponse.data)
        ? agentsResponse.data
        : []
    );

    setMonthly(
      Array.isArray(monthlyResponse.data)
        ? monthlyResponse.data
        : []
    );
  } catch (err) {
    console.error("Reports loading error:", err);

    if (err.response?.status === 401) {
      setError(
        "Your session has expired. Please login again."
      );
    } else if (err.response?.status === 403) {
      setError(
        "You do not have permission to access admin reports."
      );
    } else {
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          err.message ||
          "Unable to load reports. Please try again."
      );
    }
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  // =========================================================
  // SAFE VALUES
  // =========================================================

  const totalTickets = Number(summary?.totalTickets || 0);
  const openTickets = Number(summary?.openTickets || 0);
  const assignedTickets = Number(summary?.assignedTickets || 0);
  const inProgressTickets = Number(
    summary?.inProgressTickets || 0
  );
  const resolvedTickets = Number(
    summary?.resolvedTickets || 0
  );
  const closedTickets = Number(summary?.closedTickets || 0);

  // =========================================================
  // ANALYTICS
  // =========================================================

  const completionRate = useMemo(() => {
    if (totalTickets === 0) return 0;

    return (
      ((resolvedTickets + closedTickets) / totalTickets) *
      100
    );
  }, [
    totalTickets,
    resolvedTickets,
    closedTickets,
  ]);

  const activeTickets =
    openTickets +
    assignedTickets +
    inProgressTickets;

  const totalAgentAssigned = agentReport.reduce(
    (total, agent) =>
      total + Number(agent.assignedTickets || 0),
    0
  );

  const totalAgentCompleted = agentReport.reduce(
    (total, agent) =>
      total +
      Number(agent.resolvedTickets || 0) +
      Number(agent.closedTickets || 0),
    0
  );

  const overallAgentRate =
    totalAgentAssigned > 0
      ? (totalAgentCompleted / totalAgentAssigned) * 100
      : 0;

  // =========================================================
  // HELPER FUNCTIONS
  // =========================================================

  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return {
          badge:
            "bg-red-50 text-red-700 border-red-200",
          bar: "bg-red-500",
          dot: "bg-red-500",
        };

      case "high":
        return {
          badge:
            "bg-orange-50 text-orange-700 border-orange-200",
          bar: "bg-orange-500",
          dot: "bg-orange-500",
        };

      case "medium":
        return {
          badge:
            "bg-yellow-50 text-yellow-700 border-yellow-200",
          bar: "bg-yellow-500",
          dot: "bg-yellow-500",
        };

      case "low":
        return {
          badge:
            "bg-green-50 text-green-700 border-green-200",
          bar: "bg-green-500",
          dot: "bg-green-500",
        };

      default:
        return {
          badge:
            "bg-gray-50 text-gray-700 border-gray-200",
          bar: "bg-gray-500",
          dot: "bg-gray-500",
        };
    }
  };

  const getRateColor = (rate) => {
    if (rate >= 80) return "text-emerald-600";
    if (rate >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getRateBar = (rate) => {
    if (rate >= 80) return "bg-emerald-500";
    if (rate >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const getInitials = (name) => {
    if (!name) return "AG";

    const words = name.trim().split(" ");

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getCategoryWidth = (count) => {
    const max = Math.max(
      ...categories.map((item) =>
        Number(item.ticketCount || 0)
      ),
      1
    );

    return Math.max(
      (Number(count || 0) / max) * 100,
      5
    );
  };

  const getPriorityWidth = (count) => {
    const max = Math.max(
      ...priorities.map((item) =>
        Number(item.ticketCount || 0)
      ),
      1
    );

    return Math.max(
      (Number(count || 0) / max) * 100,
      5
    );
  };

  // =========================================================
  // CSV HELPER
  // =========================================================

  const downloadCSV = (
    filename,
    headers,
    rows
  ) => {
    const escapeCSV = (value) => {
      if (value === null || value === undefined) {
        return "";
      }

      const text = String(value);

      if (
        text.includes(",") ||
        text.includes('"') ||
        text.includes("\n")
      ) {
        return `"${text.replace(/"/g, '""')}"`;
      }

      return text;
    };

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) =>
        row.map(escapeCSV).join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =========================================================
  // EXPORT SUMMARY CSV
  // =========================================================

  const exportSummaryCSV = () => {
    try {
      setExporting("summary-csv");

      downloadCSV(
        "HelpDeskPro_Ticket_Summary.csv",
        [
          "Metric",
          "Count",
        ],
        [
          ["Total Tickets", totalTickets],
          ["Open Tickets", openTickets],
          ["Assigned Tickets", assignedTickets],
          [
            "In Progress Tickets",
            inProgressTickets,
          ],
          ["Resolved Tickets", resolvedTickets],
          ["Closed Tickets", closedTickets],
          [
            "Completed Tickets",
            resolvedTickets + closedTickets,
          ],
          [
            "Active Tickets",
            activeTickets,
          ],
          [
            "Completion Rate",
            `${completionRate.toFixed(1)}%`,
          ],
        ]
      );
    } catch (error) {
      console.error(
        "Summary CSV export failed:",
        error
      );
    } finally {
      setTimeout(() => {
        setExporting("");
      }, 500);
    }
  };

  // =========================================================
  // EXPORT AGENT CSV
  // =========================================================

  const exportAgentCSV = () => {
    try {
      setExporting("agent-csv");

      const rows = agentReport.map(
        (agent) => {
          const assigned = Number(
            agent.assignedTickets || 0
          );

          const resolved = Number(
            agent.resolvedTickets || 0
          );

          const closed = Number(
            agent.closedTickets || 0
          );

          const completed =
            resolved + closed;

          const rate =
            assigned > 0
              ? (completed / assigned) * 100
              : 0;

          return [
            agent.agentId,
            agent.agentName,
            assigned,
            resolved,
            closed,
            completed,
            `${rate.toFixed(1)}%`,
          ];
        }
      );

      downloadCSV(
        "HelpDeskPro_Agent_Performance.csv",
        [
          "Agent ID",
          "Agent Name",
          "Assigned Tickets",
          "Resolved Tickets",
          "Closed Tickets",
          "Completed Tickets",
          "Completion Rate",
        ],
        rows
      );
    } catch (error) {
      console.error(
        "Agent CSV export failed:",
        error
      );
    } finally {
      setTimeout(() => {
        setExporting("");
      }, 500);
    }
  };

  // =========================================================
  // EXPORT PRIORITY CSV
  // =========================================================

  const exportPriorityCSV = () => {
    try {
      setExporting("priority-csv");

      const rows = priorities.map(
        (item) => [
          item.priority,
          Number(item.ticketCount || 0),
        ]
      );

      downloadCSV(
        "HelpDeskPro_Priority_Report.csv",
        [
          "Priority",
          "Ticket Count",
        ],
        rows
      );
    } catch (error) {
      console.error(
        "Priority CSV export failed:",
        error
      );
    } finally {
      setTimeout(() => {
        setExporting("");
      }, 500);
    }
  };

  // =========================================================
  // EXPORT CATEGORY CSV
  // =========================================================

  const exportCategoryCSV = () => {
    try {
      setExporting("category-csv");

      const rows = categories.map(
        (item) => [
          item.category,
          Number(item.ticketCount || 0),
        ]
      );

      downloadCSV(
        "HelpDeskPro_Category_Report.csv",
        [
          "Category",
          "Ticket Count",
        ],
        rows
      );
    } catch (error) {
      console.error(
        "Category CSV export failed:",
        error
      );
    } finally {
      setTimeout(() => {
        setExporting("");
      }, 500);
    }
  };

  // =========================================================
  // EXPORT MONTHLY CSV
  // =========================================================

  const exportMonthlyCSV = () => {
    try {
      setExporting("monthly-csv");

      const rows = monthly.map(
        (item) => [
          item.year,
          item.month,
          item.monthName,
          Number(item.ticketCount || 0),
        ]
      );

      downloadCSV(
        "HelpDeskPro_Monthly_Report.csv",
        [
          "Year",
          "Month Number",
          "Month",
          "Tickets Created",
        ],
        rows
      );
    } catch (error) {
      console.error(
        "Monthly CSV export failed:",
        error
      );
    } finally {
      setTimeout(() => {
        setExporting("");
      }, 500);
    }
  };

  // =========================================================
  // EXPORT COMPLETE PDF
  // =========================================================

  const exportFullPDF = () => {
    try {
      setExporting("full-pdf");

      const doc = new jsPDF();

      const generatedDate =
        new Date().toLocaleString();

      // -----------------------------------------------------
      // TITLE
      // -----------------------------------------------------

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");

      doc.text(
        "HelpDeskPro",
        14,
        18
      );

      doc.setFontSize(15);
      doc.setFont("helvetica", "normal");

      doc.text(
        "Reports & Analytics",
        14,
        27
      );

      doc.setFontSize(9);

      doc.setTextColor(100);

      doc.text(
        `Generated: ${generatedDate}`,
        14,
        34
      );

      doc.setTextColor(0);

      // -----------------------------------------------------
      // SUMMARY
      // -----------------------------------------------------

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");

      doc.text(
        "Ticket Summary",
        14,
        46
      );

      autoTable(doc, {
        startY: 50,

        head: [
          [
            "Metric",
            "Count",
          ],
        ],

        body: [
          ["Total Tickets", totalTickets],
          ["Open Tickets", openTickets],
          ["Assigned Tickets", assignedTickets],
          [
            "In Progress Tickets",
            inProgressTickets,
          ],
          [
            "Resolved Tickets",
            resolvedTickets,
          ],
          [
            "Closed Tickets",
            closedTickets,
          ],
          [
            "Completed Tickets",
            resolvedTickets + closedTickets,
          ],
          [
            "Active Tickets",
            activeTickets,
          ],
          [
            "Completion Rate",
            `${completionRate.toFixed(1)}%`,
          ],
        ],

        theme: "grid",

        headStyles: {
          fillColor: [37, 99, 235],
        },

        styles: {
          fontSize: 9,
        },
      });

      // -----------------------------------------------------
      // AGENT PERFORMANCE
      // -----------------------------------------------------

      let currentY =
        doc.lastAutoTable.finalY + 15;

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");

      doc.text(
        "Agent Performance",
        14,
        currentY
      );

      const agentRows =
        agentReport.map((agent) => {
          const assigned = Number(
            agent.assignedTickets || 0
          );

          const resolved = Number(
            agent.resolvedTickets || 0
          );

          const closed = Number(
            agent.closedTickets || 0
          );

          const completed =
            resolved + closed;

          const rate =
            assigned > 0
              ? (completed / assigned) * 100
              : 0;

          return [
            agent.agentId,
            agent.agentName,
            assigned,
            resolved,
            closed,
            completed,
            `${rate.toFixed(1)}%`,
          ];
        });

      autoTable(doc, {
        startY: currentY + 5,

        head: [
          [
            "ID",
            "Agent",
            "Assigned",
            "Resolved",
            "Closed",
            "Completed",
            "Rate",
          ],
        ],

        body:
          agentRows.length > 0
            ? agentRows
            : [["-", "No data", "-", "-", "-", "-", "-"]],

        theme: "grid",

        headStyles: {
          fillColor: [37, 99, 235],
        },

        styles: {
          fontSize: 8,
        },
      });

      // -----------------------------------------------------
      // PRIORITY REPORT
      // -----------------------------------------------------

      currentY =
        doc.lastAutoTable.finalY + 15;

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");

      doc.text(
        "Priority Distribution",
        14,
        currentY
      );

      autoTable(doc, {
        startY: currentY + 5,

        head: [
          [
            "Priority",
            "Ticket Count",
          ],
        ],

        body:
          priorities.length > 0
            ? priorities.map((item) => [
                item.priority,
                Number(
                  item.ticketCount || 0
                ),
              ])
            : [["No data", 0]],

        theme: "grid",

        headStyles: {
          fillColor: [234, 88, 12],
        },

        styles: {
          fontSize: 9,
        },
      });

      // -----------------------------------------------------
      // CATEGORY REPORT
      // -----------------------------------------------------

      currentY =
        doc.lastAutoTable.finalY + 15;

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");

      doc.text(
        "Category Distribution",
        14,
        currentY
      );

      autoTable(doc, {
        startY: currentY + 5,

        head: [
          [
            "Category",
            "Ticket Count",
          ],
        ],

        body:
          categories.length > 0
            ? categories.map((item) => [
                item.category,
                Number(
                  item.ticketCount || 0
                ),
              ])
            : [["No data", 0]],

        theme: "grid",

        headStyles: {
          fillColor: [37, 99, 235],
        },

        styles: {
          fontSize: 9,
        },
      });

      // -----------------------------------------------------
      // MONTHLY REPORT
      // -----------------------------------------------------

      currentY =
        doc.lastAutoTable.finalY + 15;

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");

      doc.text(
        "Monthly Ticket Activity",
        14,
        currentY
      );

      autoTable(doc, {
        startY: currentY + 5,

        head: [
          [
            "Year",
            "Month",
            "Tickets Created",
          ],
        ],

        body:
          monthly.length > 0
            ? monthly.map((item) => [
                item.year,
                item.monthName,
                Number(
                  item.ticketCount || 0
                ),
              ])
            : [["-", "No data", 0]],

        theme: "grid",

        headStyles: {
          fillColor: [37, 99, 235],
        },

        styles: {
          fontSize: 9,
        },
      });

      // -----------------------------------------------------
      // FOOTER
      // -----------------------------------------------------

      const pageCount =
        doc.internal.getNumberOfPages();

      for (
        let page = 1;
        page <= pageCount;
        page++
      ) {
        doc.setPage(page);

        doc.setFontSize(8);
        doc.setTextColor(120);

        doc.text(
          `HelpDeskPro • Reports & Analytics • Page ${page} of ${pageCount}`,
          14,
          doc.internal.pageSize.height - 10
        );
      }

      doc.save(
        "HelpDeskPro_Full_Report.pdf"
      );
    } catch (error) {
      console.error(
        "PDF export failed:",
        error
      );
    } finally {
      setTimeout(() => {
        setExporting("");
      }, 700);
    }
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                Loading Reports
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Preparing your analytics dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR SCREEN
  // =========================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <svg
                  className="h-7 w-7 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3.75m0 3.75h.008M10.29 3.86l-7.82 13.5A2 2 0 004.2 20.36h15.6a2 2 0 001.73-3l-7.82-13.5a2 2 0 00-1.73 3z"
                  />
                </svg>
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Unable to Load Reports
              </h2>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                {error}
              </p>

              <button
                onClick={loadReports}
                className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>

              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Admin Analytics
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Reports & Analytics
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500 sm:text-base">
              Monitor help desk performance, ticket trends and
              agent productivity from one place.
            </p>
          </div>

          <button
            onClick={loadReports}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>

            {refreshing
              ? "Refreshing..."
              : "Refresh Reports"}
          </button>
        </div>

        {/* ===================================================
            EXPORT REPORTS
        =================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2-8h-1a3 3 0 00-3-3h-2a3 3 0 00-3 3H7a3 3 0 00-3 3v8a3 3 0 003 3h10a3 3 0 003-3V8a3 3 0 00-3-3z"
                      />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Export Reports
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Download your analytics data for
                      management, reporting and analysis.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-xs font-medium text-blue-600">
                  Available Data
                </p>

                <p className="mt-0.5 text-sm font-bold text-blue-900">
                  {totalTickets} Tickets
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

            {/* Full PDF */}
            <button
              onClick={exportFullPDF}
              disabled={exporting !== ""}
              className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  {exporting === "full-pdf" ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-200 border-t-red-600"></div>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 18h10a2 2 0 002-2V8l-5-5H7a2 2 0 00-2 2v11a2 2 0 002 2z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 3v5h5"
                      />
                    </svg>
                  )}
                </div>
              </div>

              <p className="mt-4 text-sm font-bold text-slate-900">
                Full PDF
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Complete analytics report
              </p>
            </button>

            {/* Summary CSV */}
            <button
              onClick={exportSummaryCSV}
              disabled={exporting !== ""}
              className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                {exporting === "summary-csv" ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"></div>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v12m6-6H6"
                    />
                  </svg>
                )}
              </div>

              <p className="mt-4 text-sm font-bold text-slate-900">
                Ticket Summary
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Export ticket status data
              </p>
            </button>

            {/* Agent CSV */}
            <button
              onClick={exportAgentCSV}
              disabled={exporting !== ""}
              className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                {exporting === "agent-csv" ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600"></div>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </div>

              <p className="mt-4 text-sm font-bold text-slate-900">
                Agent Performance
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Export agent productivity
              </p>
            </button>

            {/* Priority CSV */}
            <button
              onClick={exportPriorityCSV}
              disabled={exporting !== ""}
              className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                {exporting === "priority-csv" ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600"></div>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16a2 2 0 001.73 3z"
                    />
                  </svg>
                )}
              </div>

              <p className="mt-4 text-sm font-bold text-slate-900">
                Priorities
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Export priority distribution
              </p>
            </button>

            {/* Category CSV */}
            <button
              onClick={exportCategoryCSV}
              disabled={exporting !== ""}
              className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                {exporting === "category-csv" ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-200 border-t-cyan-600"></div>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </div>

              <p className="mt-4 text-sm font-bold text-slate-900">
                Categories
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Export category statistics
              </p>
            </button>

            {/* Monthly CSV */}
            <button
              onClick={exportMonthlyCSV}
              disabled={exporting !== ""}
              className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                {exporting === "monthly-csv" ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600"></div>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>

              <p className="mt-4 text-sm font-bold text-slate-900">
                Monthly Activity
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Export monthly ticket trends
              </p>
            </button>
          </div>
        </div>

        {/* ===================================================
            KPI CARDS
        =================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">

          {/* Total */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Tickets
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {totalTickets}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6l5 5v11a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-600">
                All tickets
              </span>
            </div>
          </div>

          {/* Open */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Open
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {openTickets}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-sky-500"
                style={{
                  width: `${
                    totalTickets
                      ? Math.min(
                          (openTickets /
                            totalTickets) *
                            100,
                          100
                        )
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Assigned */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Assigned
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {assignedTickets}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11c1.657 0 3-1.567 3-3.5S17.657 4 16 4s-3 1.567-3 3.5 1.343 3.5 3 3.5zM8 11c1.657 0 3-1.567 3-3.5S9.657 4 8 4 5 5.567 5 7.5 6.343 11 8 11zM3 20a5 5 0 0110 0M13 16a5 5 0 018 4"
                  />
                </svg>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Tickets currently assigned
            </p>
          </div>

          {/* In Progress */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  In Progress
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {inProgressTickets}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Active work in progress
            </p>
          </div>

          {/* Resolved */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Resolved
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {resolvedTickets}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <p className="mt-4 text-xs font-medium text-emerald-600">
              Successfully resolved
            </p>
          </div>

          {/* Closed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Closed
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {closedTickets}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2m-14 0h14m-14 0v10a2 2 0 002 2h10a2 2 0 002-2V8"
                  />
                </svg>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Completed and closed
            </p>
          </div>
        </div>

        {/* ===================================================
            OVERVIEW + PERFORMANCE
        =================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Ticket Overview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Ticket Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current ticket distribution across all statuses.
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
                {activeTickets} active tickets
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
                  <span className="text-xs font-medium text-slate-500">
                    Open
                  </span>
                </div>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {openTickets}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-500"></span>
                  <span className="text-xs font-medium text-slate-500">
                    Assigned
                  </span>
                </div>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {assignedTickets}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-xs font-medium text-slate-500">
                    In Progress
                  </span>
                </div>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {inProgressTickets}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-medium text-slate-500">
                    Completed
                  </span>
                </div>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {resolvedTickets + closedTickets}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Ticket Distribution
                </span>

                <span className="text-xs font-semibold text-slate-700">
                  {totalTickets} total
                </span>
              </div>

              <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100">

                {totalTickets > 0 && (
                  <>
                    <div
                      className="bg-sky-500 transition-all"
                      style={{
                        width: `${
                          (openTickets /
                            totalTickets) *
                          100
                        }%`,
                      }}
                      title={`Open: ${openTickets}`}
                    ></div>

                    <div
                      className="bg-violet-500 transition-all"
                      style={{
                        width: `${
                          (assignedTickets /
                            totalTickets) *
                          100
                        }%`,
                      }}
                      title={`Assigned: ${assignedTickets}`}
                    ></div>

                    <div
                      className="bg-amber-500 transition-all"
                      style={{
                        width: `${
                          (inProgressTickets /
                            totalTickets) *
                          100
                        }%`,
                      }}
                      title={`In Progress: ${inProgressTickets}`}
                    ></div>

                    <div
                      className="bg-emerald-500 transition-all"
                      style={{
                        width: `${
                          ((resolvedTickets +
                            closedTickets) /
                            totalTickets) *
                          100
                        }%`,
                      }}
                      title={`Completed: ${
                        resolvedTickets +
                        closedTickets
                      }`}
                    ></div>
                  </>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                  Open
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-violet-500"></span>
                  Assigned
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  In Progress
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Completed
                </div>
              </div>
            </div>
          </div>

          {/* Completion Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Completion Rate
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Overall ticket completion performance.
              </p>
            </div>

            <div className="mt-8 flex justify-center">
              <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-[14px] border-slate-100">

                <div
                  className="absolute inset-[-14px] rounded-full border-[14px] border-transparent"
                  style={{
                    borderTopColor: "#2563eb",
                    borderRightColor:
                      completionRate >= 50
                        ? "#2563eb"
                        : "transparent",
                    borderBottomColor:
                      completionRate >= 75
                        ? "#2563eb"
                        : "transparent",
                    borderLeftColor:
                      completionRate >= 90
                        ? "#2563eb"
                        : "transparent",
                    transform: "rotate(45deg)",
                  }}
                ></div>

                <div className="relative text-center">
                  <p className="text-3xl font-bold text-slate-900">
                    {completionRate.toFixed(1)}%
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Completed
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 space-y-3">

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Resolved
                </span>

                <span className="font-semibold text-slate-900">
                  {resolvedTickets}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Closed
                </span>

                <span className="font-semibold text-slate-900">
                  {closedTickets}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                <span className="font-medium text-slate-700">
                  Total Completed
                </span>

                <span className="font-bold text-emerald-600">
                  {resolvedTickets +
                    closedTickets}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* ===================================================
            AGENT PERFORMANCE
        =================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Agent Performance
                  </h2>

                  <p className="text-sm text-slate-500">
                    Support team productivity and completion rate.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">
                Team Completion
              </p>

              <p className="mt-0.5 text-lg font-bold text-slate-900">
                {overallAgentRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {agentReport.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-slate-500">
                No agent performance data available.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Agent
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Assigned
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Resolved
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Closed
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Completed
                    </th>

                    <th className="min-w-[240px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Performance
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {agentReport.map((agent) => {
                    const assigned = Number(
                      agent.assignedTickets || 0
                    );

                    const resolved = Number(
                      agent.resolvedTickets || 0
                    );

                    const closed = Number(
                      agent.closedTickets || 0
                    );

                    const completed =
                      resolved + closed;

                    const resolutionRate =
                      assigned > 0
                        ? (completed / assigned) * 100
                        : 0;

                    const safeRate = Math.min(
                      resolutionRate,
                      100
                    );

                    return (
                      <tr
                        key={agent.agentId}
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700">
                              {getInitials(
                                agent.agentName
                              )}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {agent.agentName ||
                                  "Unknown Agent"}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                Agent ID:{" "}
                                {agent.agentId}
                              </p>
                            </div>

                          </div>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <span className="font-bold text-slate-900">
                            {assigned}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <span className="inline-flex min-w-8 justify-center rounded-lg bg-emerald-50 px-2.5 py-1.5 text-sm font-semibold text-emerald-700">
                            {resolved}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <span className="inline-flex min-w-8 justify-center rounded-lg bg-slate-100 px-2.5 py-1.5 text-sm font-semibold text-slate-700">
                            {closed}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <span className="font-bold text-slate-900">
                            {completed}
                          </span>
                        </td>

                        <td className="px-6 py-5">

                          <div className="flex items-center justify-between gap-4">

                            <div className="flex-1">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs text-slate-500">
                                  Completion
                                </span>

                                <span
                                  className={`text-sm font-bold ${getRateColor(
                                    resolutionRate
                                  )}`}
                                >
                                  {resolutionRate.toFixed(
                                    1
                                  )}
                                  %
                                </span>
                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full transition-all ${getRateBar(
                                    resolutionRate
                                  )}`}
                                  style={{
                                    width: `${safeRate}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===================================================
            PRIORITY + CATEGORY
        =================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Priority */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Priority Distribution
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Tickets grouped by priority level.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16a2 2 0 001.73 3z"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-7 space-y-5">

              {priorities.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No priority data available.
                </p>
              ) : (
                priorities.map((item, index) => {
                  const style =
                    getPriorityStyle(
                      item.priority
                    );

                  const count = Number(
                    item.ticketCount || 0
                  );

                  return (
                    <div
                      key={`${item.priority}-${index}`}
                    >

                      <div className="mb-2 flex items-center justify-between">

                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${style.dot}`}
                          ></span>

                          <span className="text-sm font-medium text-slate-700">
                            {item.priority}
                          </span>
                        </div>

                        <span className="text-sm font-bold text-slate-900">
                          {count}
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${style.bar}`}
                          style={{
                            width: `${getPriorityWidth(
                              count
                            )}%`,
                          }}
                        ></div>
                      </div>

                    </div>
                  );
                })
              )}

            </div>
          </div>

          {/* Categories */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Ticket Categories
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Distribution across support categories.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-7 space-y-5">

              {categories.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No category data available.
                </p>
              ) : (
                categories.map((item, index) => {
                  const count = Number(
                    item.ticketCount || 0
                  );

                  return (
                    <div
                      key={`${item.category}-${index}`}
                    >

                      <div className="mb-2 flex items-center justify-between">

                        <span className="text-sm font-medium text-slate-700">
                          {item.category}
                        </span>

                        <span className="text-sm font-bold text-slate-900">
                          {count}
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${getCategoryWidth(
                              count
                            )}%`,
                          }}
                        ></div>
                      </div>

                    </div>
                  );
                })
              )}

            </div>
          </div>
        </div>

        {/* ===================================================
            MONTHLY REPORT
        =================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Monthly Ticket Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Number of tickets created over time.
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 px-4 py-2.5">
              <span className="text-xs font-medium text-blue-600">
                Total Records
              </span>

              <span className="ml-2 text-sm font-bold text-blue-700">
                {monthly.length}
              </span>
            </div>

          </div>

          {monthly.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-slate-500">
                No monthly ticket data available.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Year
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Month
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Activity
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Tickets Created
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {monthly.map((item, index) => {
                    const count = Number(
                      item.ticketCount || 0
                    );

                    const maxMonthly = Math.max(
                      ...monthly.map((m) =>
                        Number(
                          m.ticketCount || 0
                        )
                      ),
                      1
                    );

                    const width = Math.max(
                      (count / maxMonthly) * 100,
                      4
                    );

                    return (
                      <tr
                        key={`${item.year}-${item.month}-${index}`}
                        className="transition hover:bg-slate-50"
                      >

                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                          {item.year}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {item.monthName}
                        </td>

                        <td className="min-w-[250px] px-6 py-4">

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{
                                width: `${width}%`,
                              }}
                            ></div>
                          </div>

                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right">

                          <span className="inline-flex min-w-10 justify-center rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">
                            {count}
                          </span>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===================================================
            FOOTER INSIGHT
        =================================================== */}

        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-900">
                Analytics Insight
              </p>

              <p className="mt-1 text-sm text-blue-700">
                {totalTickets === 0
                  ? "No ticket activity is available yet."
                  : `${totalTickets} tickets have been recorded, with ${
                      resolvedTickets +
                      closedTickets
                    } completed and ${activeTickets} currently active.`}
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}