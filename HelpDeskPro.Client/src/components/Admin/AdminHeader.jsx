import {
  Bell,
  ShieldCheck,
  Check,
  X,
  UserCircle,
  ChevronDown,
  Settings,
  ExternalLink,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";

function AdminHeader() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  // =====================================================
  // ADMIN INITIALS
  // =====================================================

  const initials = user?.fullName
    ? user.fullName
        .trim()
        .split(/\s+/)
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  // =====================================================
  // FORMAT NOTIFICATION TIME
  // =====================================================

  const formatTime = (createdAt) => {
    if (!createdAt) {
      return "";
    }

    const createdDate = new Date(createdAt);
    const now = new Date();

    const difference = Math.floor(
      (now - createdDate) / 1000
    );

    if (difference < 60) {
      return "Just now";
    }

    const minutes = Math.floor(
      difference / 60
    );

    if (minutes < 60) {
      return `${minutes} minute${
        minutes !== 1 ? "s" : ""
      } ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} hour${
        hours !== 1 ? "s" : ""
      } ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days} day${
        days !== 1 ? "s" : ""
      } ago`;
    }

    return createdDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // OPEN PROFILE
  // =====================================================

  const openProfile = () => {
    setShowProfileMenu(false);
    navigate("/admin/profile");
  };

  // =====================================================
  // NOTIFICATION TOGGLE
  // =====================================================

  const toggleNotifications = () => {
    setShowNotifications(
      (current) => !current
    );

    setShowProfileMenu(false);
  };

  // =====================================================
  // PROFILE MENU TOGGLE
  // =====================================================

  const toggleProfileMenu = () => {
    setShowProfileMenu(
      (current) => !current
    );

    setShowNotifications(false);
  };

  return (
    <header
      className="
        sticky top-0 z-40
        flex h-[76px]
        items-center justify-between
        border-b border-slate-200
        bg-white/95
        px-4
        backdrop-blur-xl
        sm:px-6
        lg:px-8
      "
    >
      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div className="min-w-0">

        <div className="flex items-center gap-2">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Administration
          </p>

          <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

          <p className="hidden text-xs font-medium text-blue-600 sm:block">
            Control Center
          </p>

        </div>

        <h2 className="mt-1 truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          Admin Dashboard
        </h2>

      </div>

      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="flex items-center gap-2 sm:gap-4">

        {/* =====================================================
            NOTIFICATIONS
        ===================================================== */}

        <div className="relative">

          <button
            type="button"
            onClick={toggleNotifications}
            className="
              relative
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              border border-transparent
              text-slate-500
              transition-all
              duration-200
              hover:border-slate-200
              hover:bg-slate-50
              hover:text-slate-900
              active:scale-95
            "
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >

            <Bell size={20} />

            {unreadCount > 0 && (
              <span
                className="
                  absolute
                  -right-0.5
                  -top-0.5
                  flex
                  h-[18px]
                  min-w-[18px]
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  border-white
                  bg-red-500
                  px-1
                  text-[9px]
                  font-bold
                  leading-none
                  text-white
                "
              >
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}

          </button>

          {/* =====================================================
              NOTIFICATION DROPDOWN
          ===================================================== */}

          {showNotifications && (
            <div
              className="
                absolute
                right-0
                top-12
                z-50
                w-[calc(100vw-2rem)]
                max-w-[390px]
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-2xl
                shadow-slate-900/10
              "
            >

              {/* HEADER */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-slate-100
                  bg-slate-50/70
                  px-5
                  py-4
                "
              >

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex h-10 w-10
                      items-center justify-center
                      rounded-xl
                      bg-blue-50
                      text-blue-600
                    "
                  >
                    <Bell size={18} />
                  </div>

                  <div>

                    <h3 className="text-sm font-bold text-slate-900">
                      Notifications
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {unreadCount === 0
                        ? "You're all caught up"
                        : `${unreadCount} unread notification${
                            unreadCount !== 1
                              ? "s"
                              : ""
                          }`}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowNotifications(false)
                  }
                  className="
                    flex h-8 w-8
                    items-center justify-center
                    rounded-lg
                    text-slate-400
                    transition
                    hover:bg-slate-200
                    hover:text-slate-700
                  "
                  aria-label="Close notifications"
                >
                  <X size={17} />
                </button>

              </div>

              {/* MARK ALL */}

              {unreadCount > 0 && (
                <div className="flex justify-end border-b border-slate-100 px-5 py-2.5">

                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      text-xs
                      font-semibold
                      text-blue-600
                      transition
                      hover:text-blue-700
                    "
                  >
                    <Check size={13} />
                    Mark all as read
                  </button>

                </div>
              )}

              {/* NOTIFICATION LIST */}

              <div className="max-h-[380px] overflow-y-auto">

                {notifications.length === 0 ? (

                  <div className="px-6 py-12 text-center">

                    <div
                      className="
                        mx-auto
                        flex h-14 w-14
                        items-center justify-center
                        rounded-2xl
                        bg-slate-100
                        text-slate-400
                      "
                    >
                      <Bell size={24} />
                    </div>

                    <h4 className="mt-4 text-sm font-bold text-slate-800">
                      No notifications
                    </h4>

                    <p className="mx-auto mt-1 max-w-[240px] text-xs leading-5 text-slate-400">
                      You don't have any new notifications right now.
                    </p>

                  </div>

                ) : (

                  notifications.map(
                    (notification) => (
                      <div
                        key={notification.id}
                        className={`
                          group
                          border-b
                          border-slate-100
                          px-5
                          py-4
                          transition
                          hover:bg-slate-50
                          ${
                            !notification.isRead
                              ? "bg-blue-50/40"
                              : "bg-white"
                          }
                        `}
                      >

                        <div className="flex gap-3">

                          {/* INDICATOR */}

                          <div className="pt-1.5">

                            <span
                              className={`
                                block
                                h-2.5
                                w-2.5
                                rounded-full
                                ${
                                  notification.isRead
                                    ? "bg-slate-300"
                                    : "bg-blue-600"
                                }
                              `}
                            />

                          </div>

                          {/* CONTENT */}

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-3">

                              <p
                                className={`
                                  text-sm
                                  leading-5
                                  ${
                                    notification.isRead
                                      ? "font-medium text-slate-700"
                                      : "font-bold text-slate-900"
                                  }
                                `}
                              >
                                {notification.title}
                              </p>

                              {!notification.isRead && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    markAsRead(
                                      notification.id
                                    )
                                  }
                                  className="
                                    flex h-7 w-7
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    text-slate-400
                                    opacity-0
                                    transition
                                    group-hover:opacity-100
                                    hover:bg-slate-200
                                    hover:text-slate-700
                                  "
                                  title="Mark as read"
                                  aria-label="Mark notification as read"
                                >
                                  <Check size={14} />
                                </button>
                              )}

                            </div>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {notification.message}
                            </p>

                            <p className="mt-2 text-[11px] font-medium text-slate-400">
                              {formatTime(
                                notification.createdAt
                              )}
                            </p>

                          </div>

                        </div>

                      </div>
                    )
                  )

                )}

              </div>

              {/* FOOTER */}

              {notifications.length > 0 && (
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    border-t
                    border-slate-100
                    bg-slate-50/60
                    px-5
                    py-3
                  "
                >

                  <span className="text-[11px] text-slate-400">
                    Latest notifications
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setShowNotifications(false)
                    }
                    className="
                      text-xs
                      font-semibold
                      text-slate-600
                      transition
                      hover:text-slate-900
                    "
                  >
                    Close
                  </button>

                </div>
              )}

            </div>
          )}

        </div>

        {/* =====================================================
            DIVIDER
        ===================================================== */}

        <div className="hidden h-9 w-px bg-slate-200 sm:block" />

        {/* =====================================================
            ADMIN PROFILE
        ===================================================== */}

        <div className="relative">

          <button
            type="button"
            onClick={toggleProfileMenu}
            className="
              group
              flex
              items-center
              gap-2.5
              rounded-xl
              border
              border-transparent
              px-1.5
              py-1.5
              transition-all
              duration-200
              hover:border-slate-200
              hover:bg-slate-50
            "
            aria-expanded={showProfileMenu}
          >

            {/* AVATAR */}

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-slate-900
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                group-hover:bg-slate-800
              "
            >
              {initials}
            </div>

            {/* DETAILS */}

            <div className="hidden text-left md:block">

              <p className="max-w-[150px] truncate text-sm font-bold text-slate-900">
                {user?.fullName ||
                  "Administrator"}
              </p>

              <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-slate-500">

                <ShieldCheck
                  size={12}
                  className="text-blue-600"
                />

                Administrator

              </div>

            </div>

            <ChevronDown
              size={15}
              className="
                hidden
                text-slate-400
                transition
                group-hover:text-slate-600
                md:block
              "
            />

          </button>

          {/* =====================================================
              PROFILE DROPDOWN
          ===================================================== */}

          {showProfileMenu && (
            <div
              className="
                absolute
                right-0
                top-14
                z-50
                w-64
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-2xl
                shadow-slate-900/10
              "
            >

              {/* PROFILE SUMMARY */}

              <div className="border-b border-slate-100 bg-slate-50/70 p-4">

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex h-11 w-11
                      shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-slate-900
                      text-sm
                      font-bold
                      text-white
                    "
                  >
                    {initials}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-bold text-slate-900">
                      {user?.fullName ||
                        "Administrator"}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {user?.email ||
                        "Administrator account"}
                    </p>

                  </div>

                </div>

              </div>

              {/* MENU */}

              <div className="p-2">

                <button
                  type="button"
                  onClick={openProfile}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-left
                    text-sm
                    font-semibold
                    text-slate-700
                    transition
                    hover:bg-blue-50
                    hover:text-blue-700
                  "
                >

                  <div
                    className="
                      flex h-9 w-9
                      items-center justify-center
                      rounded-lg
                      bg-slate-100
                    "
                  >
                    <UserCircle size={18} />
                  </div>

                  <div className="flex-1">

                    <p>My Profile</p>

                    <p className="mt-0.5 text-[11px] font-normal text-slate-400">
                      View account details
                    </p>

                  </div>

                  <ExternalLink
                    size={15}
                    className="text-slate-400"
                  />

                </button>

                <button
                  type="button"
                  onClick={openProfile}
                  className="
                    mt-1
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-left
                    text-sm
                    font-semibold
                    text-slate-700
                    transition
                    hover:bg-slate-50
                    hover:text-slate-900
                  "
                >

                  <div
                    className="
                      flex h-9 w-9
                      items-center justify-center
                      rounded-lg
                      bg-slate-100
                    "
                  >
                    <Settings size={18} />
                  </div>

                  <div className="flex-1">

                    <p>Account Settings</p>

                    <p className="mt-0.5 text-[11px] font-normal text-slate-400">
                      Manage your account
                    </p>

                  </div>

                </button>

              </div>

              {/* ACCOUNT STATUS */}

              <div className="border-t border-slate-100 px-4 py-3">

                <div className="flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  <span className="text-[11px] font-medium text-slate-500">
                    Administrator account active
                  </span>

                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}

export default AdminHeader;