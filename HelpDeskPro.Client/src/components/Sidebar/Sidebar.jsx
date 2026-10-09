import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  UserCircle,
  LogOut,
  Headphones,
  X,
  AlertTriangle,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Tickets",
      path: "/tickets",
      icon: Ticket,
    },
    {
      name: "Create Ticket",
      path: "/tickets/create",
      icon: PlusCircle,
    },
    {
      name: "My Profile",
      path: "/profile",
      icon: UserCircle,
    },
  ];

  // Open logout confirmation
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // Confirm logout
  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);

    navigate("/login", {
      replace: true,
    });
  };

  // Cancel logout
  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">

        {/* =====================================================
            LOGO
        ===================================================== */}

        <div className="flex h-20 items-center border-b border-slate-200 px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Headphones size={21} />
            </div>

            <div>

              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                HelpDeskPro
              </h1>

              <p className="text-[11px] font-medium text-slate-400">
                IT Support System
              </p>

            </div>

          </div>

        </div>

        {/* =====================================================
            NAVIGATION
        ===================================================== */}

        <nav className="flex-1 space-y-1 px-4 py-6">

          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          {menuItems.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >

                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      className={
                        isActive
                          ? "text-blue-600"
                          : "text-slate-400 group-hover:text-slate-600"
                      }
                    />

                    <span>
                      {item.name}
                    </span>
                  </>
                )}

              </NavLink>
            );

          })}

        </nav>

        {/* =====================================================
            USER SECTION
        ===================================================== */}

        <div className="border-t border-slate-200 p-4">

          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {user?.fullName
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0">

              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.fullName || "Employee"}
              </p>

              <p className="truncate text-xs text-slate-400">
                {user?.role || "Employee"}
              </p>

            </div>

          </div>

          {/* =================================================
              LOGOUT BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >

            <LogOut size={19} />

            <span>
              Sign out
            </span>

          </button>

        </div>

      </aside>

      {/* =====================================================
          LOGOUT CONFIRMATION MODAL
      ===================================================== */}

      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          onClick={cancelLogout}
        >

          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <AlertTriangle size={23} />
                </div>

                <div>

                  <h2 className="text-lg font-semibold text-slate-900">
                    Confirm Sign Out
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Are you sure you want to sign out?
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={cancelLogout}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X size={18} />
              </button>

            </div>

            {/* =================================================
                MODAL MESSAGE
            ================================================= */}

            <div className="px-6 py-5">

              <p className="text-sm leading-6 text-slate-600">
                You will be signed out of your HelpDeskPro
                employee account and redirected to the login page.
              </p>

            </div>

            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">

              <button
                type="button"
                onClick={cancelLogout}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmLogout}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                <LogOut size={16} />
                Sign Out
              </button>

            </div>

          </div>

        </div>
      )}

    </>
  );
}

export default Sidebar;