import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Auth/Login";

// =====================================================
// NOTIFICATION CONTEXT
// =====================================================

import { NotificationProvider } from "./context/NotificationContext";

// =====================================================
// EMPLOYEE PAGES
// =====================================================

import Dashboard from "./pages/Employee/Dashboard";
import MyTickets from "./pages/Employee/MyTickets";
import CreateTicket from "./pages/Employee/CreateTicket";
import TicketDetails from "./pages/Employee/TicketDetails";
import Profile from "./pages/Employee/Profile";

// =====================================================
// ADMIN PAGES
// =====================================================

import AdminDashboard from "./pages/Admin/Dashboard";
import AdminTickets from "./pages/Admin/Tickets";
import AdminTicketDetails from "./pages/Admin/TicketDetails";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminAgents from "./pages/Admin/AdminAgents";
import AdminCategories from "./pages/Admin/AdminCategories";
import AdminReports from "./pages/Admin/AdminReports";
import AdminProfile from "./pages/Admin/Profile";

// =====================================================
// AGENT PAGES
// =====================================================

import AgentDashboard from "./pages/Agent/Dashboard";
import AgentMyTickets from "./pages/Agent/MyTickets";
import AgentTicketDetails from "./pages/Agent/TicketDetails";
import AgentProfile from "./pages/Agent/Profile";

// =====================================================
// LAYOUTS & ROUTES
// =====================================================

import ProtectedRoute from "./routes/ProtectedRoute";

import EmployeeLayout from "./components/Layout/EmployeeLayout";
import AdminLayout from "./components/Admin/AdminLayout";
import AgentLayout from "./components/Agent/AgentLayout";

function App() {
  return (
    <NotificationProvider>
      <Routes>

        {/* =====================================================
            LOGIN
        ===================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =====================================================
            EMPLOYEE ROUTES
        ===================================================== */}

        <Route element={<ProtectedRoute />}>

          <Route element={<EmployeeLayout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/tickets"
              element={<MyTickets />}
            />

            <Route
              path="/tickets/create"
              element={<CreateTicket />}
            />

            <Route
              path="/tickets/:id"
              element={<TicketDetails />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

          </Route>

        </Route>

        {/* =====================================================
            ADMIN ROUTES
        ===================================================== */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["Admin"]} />
          }
        >

          <Route element={<AdminLayout />}>

            {/* Dashboard */}

            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            {/* Admin Profile */}

            <Route
              path="/admin/profile"
              element={<AdminProfile />}
            />

            {/* Ticket Management */}

            <Route
              path="/admin/tickets"
              element={<AdminTickets />}
            />

            <Route
              path="/admin/tickets/:id"
              element={<AdminTicketDetails />}
            />

            {/* User Management */}

            <Route
              path="/admin/users"
              element={<AdminUsers />}
            />

            {/* Agent Management */}

            <Route
              path="/admin/agents"
              element={<AdminAgents />}
            />

            {/* Categories */}

            <Route
              path="/admin/categories"
              element={<AdminCategories />}
            />

            {/* Reports */}

            <Route
              path="/admin/reports"
              element={<AdminReports />}
            />

          </Route>

        </Route>

        {/* =====================================================
            AGENT ROUTES
        ===================================================== */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["Agent"]} />
          }
        >

          <Route element={<AgentLayout />}>

            {/* Agent Dashboard */}

            <Route
              path="/agent/dashboard"
              element={<AgentDashboard />}
            />

            {/* Agent Tickets */}

            <Route
              path="/agent/tickets"
              element={<AgentMyTickets />}
            />

            {/* Agent Ticket Details */}

            <Route
              path="/agent/tickets/:id"
              element={<AgentTicketDetails />}
            />

            {/* Agent Profile */}

            <Route
              path="/agent/profile"
              element={<AgentProfile />}
            />

          </Route>

        </Route>

        {/* =====================================================
            DEFAULT ROUTE
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </NotificationProvider>
  );
}

export default App;