import {
  Bell,
  Headphones,
  CheckCheck,
  Ticket,
  X,
  UserCircle,
  ChevronDown,
  Settings,
  ExternalLink,
  ShieldCheck,
  Check,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";

function AgentHeader() {
  const { user } = useAuth();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // =====================================================
  // USER INITIALS
  // =====================================================

  const initials = user?.fullName
    ? user.fullName
        .trim()
        .split(/\s+/)
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AG";

  // =====================================================
  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =====================================================
  // FORMAT NOTIFICATION TIME
  // =====================================================

  const formatNotificationTime = (date) => {
    if (!date) {
      return "";
    }

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) {
      return "";
    }

    const now = new Date();

    const difference =
      now.getTime() -
      notificationDate.getTime();

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min${
        minutes === 1 ? "" : "s"
      } ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hour${
        hours === 1 ? "" : "s"
      } ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days} day${
        days === 1 ? "" : "s"
      } ago`;
    }

    return notificationDate.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // HANDLE NOTIFICATION CLICK
  // =====================================================

  const handleNotificationClick = async (
    notification
  ) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }

      setShowNotifications(false);

      if (notification.ticketId) {
        navigate(
          `/agent/tickets/${notification.ticketId}`
        );
      }
    } catch (error) {
      console.error(
        "Failed to handle notification:",
        error
      );
    }
  };

  // =====================================================
  // MARK ALL NOTIFICATIONS AS READ
  // =====================================================

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      await markAllAsRead();
    } catch (error) {
      console.error(
        "Failed to mark notifications as read:",
        error
      );
    }
  };

  // =====================================================
  // OPEN PROFILE
  // =====================================================

  const openProfile = () => {
    setShowProfileMenu(false);
    navigate("/agent/profile");
  };

  // =====================================================
  // OPEN SETTINGS
  // =====================================================

  const openSettings = () => {
    setShowProfileMenu(false);
    navigate("/agent/profile");
  };

  // =====================================================
  // RETURN UI
  // =====================================================

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">

      {/* =================================================
          LEFT SECTION
      ================================================= */}

      <div className="min-w-0">

        <div className="flex items-center gap-2">

          <div className="hidden h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white sm:flex">
            <Headphones size={16} />
          </div>

          <div className="min-w-0">

            <p className="truncate text-xs font-medium uppercase tracking-wider text-slate-400">
              Support Center
            </p>

            <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
              Agent Workspace
            </h2>

          </div>

        </div>

      </div>

      {/* =================================================
          RIGHT SECTION
      ================================================= */}

      <div className="flex items-center gap-2 sm:gap-4">

        {/* =================================================
            AGENT STATUS
        ================================================= */}

        <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 sm:flex">

          <span className="relative flex h-2 w-2">

            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />

          </span>

          <span className="text-xs font-medium text-emerald-700">
            Online
          </span>

        </div>

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <div
          ref={notificationRef}
          className="relative"
        >

          <button
            type="button"
            onClick={() => {
              setShowNotifications(
                (previous) => !previous
              );

              setShowProfileMenu(false);
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >

            <Bell size={19} />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}

          </button>

          {/* =================================================
              NOTIFICATION DROPDOWN
          ================================================= */}

          {showNotifications && (
            <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">

              {/* Header */}

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">

                <div>

                  <div className="flex items-center gap-2">

                    <h3 className="text-sm font-semibold text-slate-900">
                      Notifications
                    </h3>

                    {unreadCount > 0 && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        {unreadCount} new
                      </span>
                    )}

                  </div>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {unreadCount > 0
                      ? "You have unread updates"
                      : "You're all caught up"}
                  </p>

                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <CheckCheck size={14} />

                    Mark all read
                  </button>
                )}

              </div>

              {/* Notification List */}

              <div className="max-h-[430px] overflow-y-auto">

                {notifications.length === 0 ? (

                  <div className="flex flex-col items-center justify-center px-6 py-14 text-center">

                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">

                      <Bell
                        size={24}
                        className="text-slate-400"
                      />

                    </div>

                    <p className="text-sm font-semibold text-slate-800">
                      No notifications
                    </p>

                    <p className="mt-1 max-w-[240px] text-xs leading-5 text-slate-500">
                      New ticket assignments and updates will appear here.
                    </p>

                  </div>

                ) : (

                  notifications.map(
                    (notification) => (

                      <button
                        key={notification.id}
                        type="button"
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                        className={`group flex w-full gap-3 border-b border-slate-100 px-4 py-4 text-left transition-all duration-150 hover:bg-slate-50 ${
                          !notification.isRead
                            ? "bg-blue-50/50"
                            : "bg-white"
                        }`}
                      >

                        {/* Notification Icon */}

                        <div
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                            !notification.isRead
                              ? "bg-blue-100 text-blue-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Ticket size={17} />
                        </div>

                        {/* Content */}

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-3">

                            <p
                              className={`truncate text-sm ${
                                !notification.isRead
                                  ? "font-semibold text-slate-900"
                                  : "font-medium text-slate-700"
                              }`}
                            >
                              {notification.title}
                            </p>

                            {!notification.isRead && (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                            )}

                          </div>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                            {notification.message}
                          </p>

                          <div className="mt-2 flex items-center justify-between">

                            <p className="text-[11px] font-medium text-slate-400">
                              {formatNotificationTime(
                                notification.createdAt
                              )}
                            </p>

                            {notification.ticketId && (
                              <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600 opacity-0 transition group-hover:opacity-100">
                                View ticket
                                <ExternalLink size={11} />
                              </span>
                            )}

                          </div>

                        </div>

                      </button>

                    )
                  )

                )}

              </div>

              {/* Footer */}

              {notifications.length > 0 && (
                <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">

                  <button
                    type="button"
                    onClick={() =>
                      setShowNotifications(false)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900"
                  >
                    <X size={14} />

                    Close notifications
                  </button>

                </div>
              )}

            </div>
          )}

        </div>

        {/* =================================================
            DIVIDER
        ================================================= */}

        <div className="hidden h-9 w-px bg-slate-200 sm:block" />

        {/* =================================================
            AGENT PROFILE
        ================================================= */}

        <div
          ref={profileRef}
          className="relative"
        >

          <button
            type="button"
            onClick={() => {
              setShowProfileMenu(
                (previous) => !previous
              );

              setShowNotifications(false);
            }}
            className="group flex items-center gap-2 rounded-xl p-1.5 transition-all duration-200 hover:bg-slate-50 sm:gap-3"
            aria-label="Open profile menu"
            aria-expanded={showProfileMenu}
          >

            {/* Avatar */}

            <div className="relative">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white shadow-sm ring-2 ring-white transition group-hover:bg-slate-800">
                {initials}
              </div>

              {/* Online indicator */}

              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />

            </div>

            {/* User information */}

            <div className="hidden text-left md:block">

              <p className="max-w-[150px] truncate text-sm font-semibold text-slate-900">
                {user?.fullName || "Support Agent"}
              </p>

              <div className="mt-0.5 flex items-center gap-1.5">

                <ShieldCheck
                  size={12}
                  className="text-blue-600"
                />

                <span className="text-xs text-slate-500">
                  IT Support Agent
                </span>

              </div>

            </div>

            <ChevronDown
              size={16}
              className={`hidden text-slate-400 transition-transform duration-200 md:block ${
                showProfileMenu
                  ? "rotate-180"
                  : ""
              }`}
            />

          </button>

          {/* =================================================
              PROFILE DROPDOWN
          ================================================= */}

          {showProfileMenu && (
            <div className="absolute right-0 top-14 z-50 w-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">

              {/* Profile Summary */}

              <div className="border-b border-slate-100 bg-slate-50/70 p-4">

                <div className="flex items-center gap-3">

                  <div className="relative shrink-0">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                      {initials}
                    </div>

                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />

                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-slate-900">
                      {user?.fullName ||
                        "Support Agent"}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {user?.email ||
                        "agent@helpdeskpro.com"}
                    </p>

                  </div>

                </div>

                {/* Role Badge */}

                <div className="mt-3 flex items-center gap-2">

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">

                    <Headphones size={12} />

                    IT Support Agent

                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">

                    <Check size={11} />

                    Active

                  </span>

                </div>

              </div>

              {/* Menu Items */}

              <div className="p-2">

                <button
                  type="button"
                  onClick={openProfile}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
                >

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <UserCircle size={18} />
                  </div>

                  <div className="flex-1">

                    <p className="text-sm font-medium text-slate-800">
                      My Profile
                    </p>

                    <p className="text-[11px] text-slate-500">
                      View and manage your profile
                    </p>

                  </div>

                  <ExternalLink
                    size={14}
                    className="text-slate-400"
                  />

                </button>

                <button
                  type="button"
                  onClick={openSettings}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
                >

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Settings size={18} />
                  </div>

                  <div className="flex-1">

                    <p className="text-sm font-medium text-slate-800">
                      Account Settings
                    </p>

                    <p className="text-[11px] text-slate-500">
                      Manage account preferences
                    </p>

                  </div>

                  <ExternalLink
                    size={14}
                    className="text-slate-400"
                  />

                </button>

              </div>

              {/* Footer */}

              <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3">

                <div className="flex items-center gap-2 text-[11px] text-slate-500">

                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">

                    <Check
                      size={12}
                      className="text-emerald-600"
                    />

                  </div>

                  <span>
                    Your account is active and secure
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

export default AgentHeader;
