import { useEffect, useMemo, useState } from "react";

import {
  Ticket,
  CircleDot,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Users,
  UserRoundCog,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  ArrowUpRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import dashboardService from "../../services/dashboardService";

function Dashboard() {
  // =========================================================
  // STATE
  // =========================================================

  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [agents, setAgents] = useState([]);
  const [monthly, setMonthly] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  const loadDashboard = async (isRefresh = false) => {
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
        summaryData,
        categoryData,
        priorityData,
        agentData,
        monthlyData,
      ] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getTicketsByCategory(),
        dashboardService.getTicketsByPriority(),
        dashboardService.getTicketsByAgent(),
        dashboardService.getMonthlyTicketStatistics(),
      ]);

      // =====================================================
      // UPDATE DATA
      // =====================================================

      setSummary(summaryData || null);

      setCategories(
        Array.isArray(categoryData)
          ? categoryData
          : []
      );

      setPriorities(
        Array.isArray(priorityData)
          ? priorityData
          : []
      );

      setAgents(
        Array.isArray(agentData)
          ? agentData
          : []
      );

      setMonthly(
        Array.isArray(monthlyData)
          ? monthlyData
          : []
      );

      // =====================================================
      // UPDATE LAST UPDATED TIME
      // =====================================================

      setLastUpdated(new Date());
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.title ||
          err?.message ||
          "Unable to load the admin dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadDashboard(false);
  }, []);

  // =========================================================
  // FORMAT LAST UPDATED
  // =========================================================

  const formattedLastUpdated = lastUpdated
    ? lastUpdated.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      })
    : "Not available";

  // =========================================================
  // FORMAT MONTH
  // =========================================================

  const formatMonth = (month) => {
    const date = new Date(
      2000,
      Number(month) - 1,
      1
    );

    return date.toLocaleString("en-US", {
      month: "short",
    });
  };

  // =========================================================
  // MONTHLY CHART DATA
  // =========================================================

  const monthlyChartData = useMemo(() => {
    return monthly.map((item) => ({
      name: `${formatMonth(item.month)} ${item.year}`,
      tickets: Number(item.ticketCount || 0),
    }));
  }, [monthly]);

  // =========================================================
  // CATEGORY CHART DATA
  // =========================================================

  const categoryChartData = useMemo(() => {
    return categories.map((item) => ({
      name: item.category,
      tickets: Number(item.ticketCount || 0),
    }));
  }, [categories]);

  // =========================================================
  // AGENT CHART DATA
  // =========================================================

  const agentChartData = useMemo(() => {
    return agents
      .map((item) => ({
        name: item.agentName,
        tickets: Number(item.ticketCount || 0),
      }))
      .sort(
        (a, b) => b.tickets - a.tickets
      );
  }, [agents]);

  // =========================================================
  // PRIORITY CHART DATA
  // =========================================================

  const priorityChartData = useMemo(() => {
    return priorities.map((item) => ({
      name: item.priority,
      value: Number(item.ticketCount || 0),
    }));
  }, [priorities]);

  // =========================================================
  // ANALYTICS
  // =========================================================

  const analytics = useMemo(() => {
    if (!summary) {
      return {
        total: 0,
        completed: 0,
        active: 0,
        completionRate: 0,
        activeRate: 0,
        criticalRate: 0,
        highRate: 0,
        riskRate: 0,
      };
    }

    const total = Number(
      summary.totalTickets || 0
    );

    const completed =
      Number(summary.resolvedTickets || 0) +
      Number(summary.closedTickets || 0);

    const active =
      Number(summary.openTickets || 0) +
      Number(summary.assignedTickets || 0) +
      Number(summary.inProgressTickets || 0);

    const completionRate =
      total > 0
        ? Math.round(
            (completed / total) * 100
          )
        : 0;

    const activeRate =
      total > 0
        ? Math.round(
            (active / total) * 100
          )
        : 0;

    const criticalRate =
      total > 0
        ? Math.round(
            (Number(
              summary.criticalTickets || 0
            ) /
              total) *
              100
          )
        : 0;

    const highRate =
      total > 0
        ? Math.round(
            (Number(
              summary.highPriorityTickets || 0
            ) /
              total) *
              100
          )
        : 0;

    const riskRate = Math.min(
      criticalRate + highRate,
      100
    );

    return {
      total,
      completed,
      active,
      completionRate,
      activeRate,
      criticalRate,
      highRate,
      riskRate,
    };
  }, [summary]);

  // =========================================================
  // TOP CATEGORY
  // =========================================================

  const topCategory = useMemo(() => {
    if (!categoryChartData.length) {
      return null;
    }

    return [...categoryChartData].sort(
      (a, b) => b.tickets - a.tickets
    )[0];
  }, [categoryChartData]);

  // =========================================================
  // TOP AGENT
  // =========================================================

  const topAgent = useMemo(() => {
    if (!agentChartData.length) {
      return null;
    }

    return agentChartData[0];
  }, [agentChartData]);

  // =========================================================
  // TOP PRIORITY
  // =========================================================

  const topPriority = useMemo(() => {
    if (!priorityChartData.length) {
      return null;
    }

    return [...priorityChartData].sort(
      (a, b) => b.value - a.value
    )[0];
  }, [priorityChartData]);

  // =========================================================
  // PRIORITY COLORS
  // =========================================================

  const priorityColors = {
    Low: "#10b981",
    Medium: "#2563eb",
    High: "#f97316",
    Critical: "#dc2626",
  };

  const fallbackPriorityColors = [
    "#2563eb",
    "#f59e0b",
    "#f97316",
    "#dc2626",
  ];

  // =========================================================
  // KPI CARDS
  // =========================================================

  const statCards = summary
    ? [
        {
          title: "Total Tickets",
          value: summary.totalTickets,
          subtitle: "All support requests",
          icon: Ticket,
          iconBg: "bg-blue-50",
          iconColor: "text-blue-600",
        },
        {
          title: "Open Tickets",
          value: summary.openTickets,
          subtitle: "Awaiting assignment",
          icon: CircleDot,
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-600",
        },
        {
          title: "In Progress",
          value: summary.inProgressTickets,
          subtitle: "Currently being handled",
          icon: Clock3,
          iconBg: "bg-amber-50",
          iconColor: "text-amber-600",
        },
        {
          title: "Resolved",
          value: summary.resolvedTickets,
          subtitle: "Successfully resolved",
          icon: CheckCircle2,
          iconBg: "bg-violet-50",
          iconColor: "text-violet-600",
        },
        {
          title: "Critical",
          value: summary.criticalTickets,
          subtitle: "Requires urgent attention",
          icon: AlertTriangle,
          iconBg: "bg-red-50",
          iconColor: "text-red-600",
          alert:
            Number(
              summary.criticalTickets || 0
            ) > 0,
        },
        {
          title: "High Priority",
          value: summary.highPriorityTickets,
          subtitle: "High-priority requests",
          icon: Flame,
          iconBg: "bg-orange-50",
          iconColor: "text-orange-600",
        },
        {
          title: "Employees",
          value: summary.totalEmployees,
          subtitle: "Registered employees",
          icon: Users,
          iconBg: "bg-cyan-50",
          iconColor: "text-cyan-600",
        },
        {
          title: "Support Agents",
          value: summary.totalAgents,
          subtitle: "Active support team",
          icon: UserRoundCog,
          iconBg: "bg-indigo-50",
          iconColor: "text-indigo-600",
        },
      ]
    : [];

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <RefreshCw
              size={28}
              className="animate-spin text-blue-600"
            />
          </div>

          <div className="text-center">
            <p className="font-semibold text-slate-900">
              Loading dashboard
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Preparing your latest analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR SCREEN
  // =========================================================

  if (error && !summary) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertTriangle
              size={28}
              className="text-red-600"
            />
          </div>

          <h2 className="text-lg font-semibold text-slate-900">
            Dashboard unavailable
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Retrying..."
              : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN DASHBOARD
  // =========================================================

  return (
    <div className="space-y-8 pb-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-50 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <Activity size={14} />
              Live System Overview
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Monitor support tickets, team workload,
              priorities, categories and service activity
              from one place.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              Last updated: {formattedLastUpdated}
            </div>
          </div>

          {/* REFRESH BUTTON */}

          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            aria-label="Refresh dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
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
              : "Refresh Dashboard"}
          </button>
        </div>
      </div>

      {/* =====================================================
          REFRESH ERROR
      ===================================================== */}

      {error && summary && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle
            size={18}
            className="shrink-0"
          />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="ml-auto font-semibold underline disabled:opacity-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* =====================================================
          KPI SECTION
      ===================================================== */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Performance Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Key metrics from your support operation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                      {card.value}
                    </p>

                    <p
                      className={`mt-2 text-xs ${
                        card.alert
                          ? "font-medium text-red-600"
                          : "text-slate-400"
                      }`}
                    >
                      {card.subtitle}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconBg} transition group-hover:scale-105`}
                  >
                    <Icon
                      size={21}
                      className={card.iconColor}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          ANALYTICS METRICS
      ===================================================== */}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <MetricCard
          title="Ticket Completion"
          value={`${analytics.completionRate}%`}
          subtitle={`${analytics.completed} completed tickets`}
          icon={Target}
          iconClass="bg-emerald-50 text-emerald-600"
          progress={analytics.completionRate}
        />

        <MetricCard
          title="Active Workload"
          value={`${analytics.activeRate}%`}
          subtitle={`${analytics.active} active tickets`}
          icon={Activity}
          iconClass="bg-blue-50 text-blue-600"
          progress={analytics.activeRate}
        />

        <MetricCard
          title="Priority Risk"
          value={`${analytics.riskRate}%`}
          subtitle={`${
            Number(summary.criticalTickets || 0) +
            Number(summary.highPriorityTickets || 0)
          } high-risk tickets`}
          icon={AlertTriangle}
          iconClass="bg-orange-50 text-orange-600"
          progress={analytics.riskRate}
        />

      </section>

      {/* =====================================================
          MONTHLY TICKET ACTIVITY
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">

          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <TrendingUp
                  size={18}
                  className="text-blue-600"
                />
              </div>

              <h2 className="text-lg font-semibold text-slate-900">
                Monthly Ticket Activity
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Ticket creation trend over time.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
            {monthly.length} period
            {monthly.length === 1
              ? ""
              : "s"}
          </div>
        </div>

        <div className="h-80">
          {monthlyChartData.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={monthlyChartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="ticketGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#2563eb"
                      stopOpacity={0.28}
                    />

                    <stop
                      offset="95%"
                      stopColor="#2563eb"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow:
                      "0 10px 25px rgba(15, 23, 42, 0.08)",
                  }}
                  labelStyle={{
                    color: "#0f172a",
                    fontWeight: 600,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="tickets"
                  name="Tickets"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#ticketGradient)"
                  activeDot={{
                    r: 6,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No monthly ticket data available." />
          )}
        </div>
      </section>

      {/* =====================================================
          CATEGORY + PRIORITY
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* CATEGORY */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                <BarChart3
                  size={18}
                  className="text-indigo-600"
                />
              </div>

              <h2 className="text-lg font-semibold text-slate-900">
                Tickets by Category
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Distribution of tickets across support categories.
            </p>
          </div>

          <div className="h-80">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={categoryChartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  />

                  <Bar
                    dataKey="tickets"
                    name="Tickets"
                    fill="#2563eb"
                    radius={[7, 7, 0, 0]}
                    maxBarSize={55}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No category data available." />
            )}
          </div>
        </section>

        {/* PRIORITY */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                <PieChartIcon
                  size={18}
                  className="text-orange-600"
                />
              </div>

              <h2 className="text-lg font-semibold text-slate-900">
                Tickets by Priority
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Current ticket priority distribution.
            </p>
          </div>

          <div className="h-80">
            {priorityChartData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={105}
                    innerRadius={62}
                    paddingAngle={4}
                  >
                    {priorityChartData.map(
                      (entry, index) => (
                        <Cell
                          key={`priority-${index}`}
                          fill={
                            priorityColors[
                              entry.name
                            ] ||
                            fallbackPriorityColors[
                              index %
                                fallbackPriorityColors.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border:
                        "1px solid #e2e8f0",
                    }}
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No priority data available." />
            )}
          </div>
        </section>
      </div>

      {/* =====================================================
          AGENT WORKLOAD
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">

          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                <Users
                  size={18}
                  className="text-slate-700"
                />
              </div>

              <h2 className="text-lg font-semibold text-slate-900">
                Agent Workload
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Number of tickets currently assigned to each support agent.
            </p>
          </div>

          {topAgent && (
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-slate-400">
                Highest workload
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {topAgent.name}
              </p>

              <p className="text-xs text-slate-500">
                {topAgent.tickets} ticket
                {topAgent.tickets === 1
                  ? ""
                  : "s"}
              </p>
            </div>
          )}
        </div>

        <div className="h-80">
          {agentChartData.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={agentChartData}
                layout="vertical"
                margin={{
                  left: 20,
                  right: 20,
                  top: 5,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#334155",
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border:
                      "1px solid #e2e8f0",
                  }}
                />

                <Bar
                  dataKey="tickets"
                  name="Assigned Tickets"
                  fill="#0f172a"
                  radius={[0, 7, 7, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No assigned tickets found." />
          )}
        </div>
      </section>

      {/* =====================================================
          STATUS SUMMARY
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <Activity
                size={18}
                className="text-emerald-600"
              />
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              Ticket Status Summary
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Current distribution of ticket workflow statuses.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <StatusItem
            label="Open"
            value={summary.openTickets}
            total={analytics.total}
            className="text-emerald-600 bg-emerald-50"
            barClass="bg-emerald-500"
          />

          <StatusItem
            label="Assigned"
            value={summary.assignedTickets}
            total={analytics.total}
            className="text-blue-600 bg-blue-50"
            barClass="bg-blue-500"
          />

          <StatusItem
            label="In Progress"
            value={summary.inProgressTickets}
            total={analytics.total}
            className="text-amber-600 bg-amber-50"
            barClass="bg-amber-500"
          />

          <StatusItem
            label="Resolved"
            value={summary.resolvedTickets}
            total={analytics.total}
            className="text-violet-600 bg-violet-50"
            barClass="bg-violet-500"
          />

          <StatusItem
            label="Closed"
            value={summary.closedTickets}
            total={analytics.total}
            className="text-slate-600 bg-slate-100"
            barClass="bg-slate-500"
          />

        </div>
      </section>

      {/* =====================================================
          SMART INSIGHTS
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm sm:p-6">

        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <TrendingUp size={18} />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Analytics Insights
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Quick insights from your current dashboard data.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <InsightCard
            title="Top Category"
            value={
              topCategory?.name ||
              "No data"
            }
            description={
              topCategory
                ? `${topCategory.tickets} ticket${
                    topCategory.tickets === 1
                      ? ""
                      : "s"
                  }`
                : "No category information available"
            }
            icon={BarChart3}
          />

          <InsightCard
            title="Most Common Priority"
            value={
              topPriority?.name ||
              "No data"
            }
            description={
              topPriority
                ? `${topPriority.value} ticket${
                    topPriority.value === 1
                      ? ""
                      : "s"
                  }`
                : "No priority information available"
            }
            icon={AlertTriangle}
          />

          <InsightCard
            title="Highest Workload"
            value={
              topAgent?.name ||
              "No data"
            }
            description={
              topAgent
                ? `${topAgent.tickets} assigned ticket${
                    topAgent.tickets === 1
                      ? ""
                      : "s"
                  }`
                : "No agent workload available"
            }
            icon={Users}
          />

        </div>

        <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">

          {analytics.completionRate >=
          70 ? (
            <TrendingUp
              size={20}
              className="shrink-0 text-emerald-400"
            />
          ) : (
            <TrendingDown
              size={20}
              className="shrink-0 text-amber-400"
            />
          )}

          <p className="text-sm leading-6 text-slate-300">
            {analytics.completionRate >=
            70
              ? `The support team has completed ${analytics.completionRate}% of all tickets. Overall ticket completion is currently healthy.`
              : `Current ticket completion is ${analytics.completionRate}%. Consider reviewing active workloads and unresolved tickets.`}
          </p>

          <ArrowUpRight
            size={18}
            className="ml-auto hidden shrink-0 text-slate-500 sm:block"
          />
        </div>
      </section>
    </div>
  );
}

// =============================================================
// METRIC CARD
// =============================================================

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
  progress,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={19} />
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900 transition-all duration-700"
          style={{
            width: `${Math.min(
              Math.max(progress, 0),
              100
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

// =============================================================
// STATUS ITEM
// =============================================================

function StatusItem({
  label,
  value,
  total,
  className,
  barClass,
}) {
  const percentage =
    total > 0
      ? Math.round(
          (Number(value || 0) / total) *
            100
        )
      : 0;

  return (
    <div className="rounded-xl border border-slate-200 p-4 transition hover:shadow-sm">

      <div className="flex items-center justify-between gap-2">

        <div
          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${className}`}
        >
          {label}
        </div>

        <span className="text-xs font-medium text-slate-400">
          {percentage}%
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${barClass} transition-all duration-700`}
          style={{
            width: `${Math.min(
              percentage,
              100
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

// =============================================================
// INSIGHT CARD
// =============================================================

function InsightCard({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <p className="mt-2 truncate text-lg font-semibold text-white">
            {value}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}

// =============================================================
// EMPTY CHART
// =============================================================

function EmptyChart({ message }) {
  return (
    <div className="flex h-full flex-col items-center justify-center">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50">
        <BarChart3
          size={21}
          className="text-slate-300"
        />
      </div>

      <p className="mt-3 text-sm text-slate-400">
        {message}
      </p>
    </div>
  );
}

export default Dashboard;