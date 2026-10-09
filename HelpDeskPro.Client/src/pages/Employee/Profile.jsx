import { useEffect, useState } from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleCheck,
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  Ticket,
  User,
  UserRoundCheck,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function Profile() {
  const { user } = useAuth();

  // =====================================================
  // PROFILE STATE
  // =====================================================

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  // =====================================================
  // EDIT PROFILE STATE
  // =====================================================

  const [showEditModal, setShowEditModal] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);

  // =====================================================
  // PASSWORD STATE
  // =====================================================

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get(
        "/EmployeeProfile"
      );

      setProfile(response.data);
    } catch (err) {
      console.error(
        "Employee profile loading error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to access this profile."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.title ||
            err.message ||
            "Unable to load your profile."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // PROFILE VALUES
  // =====================================================

  const fullName =
    profile?.fullName ||
    user?.fullName ||
    "Employee";

  const email =
    profile?.email ||
    user?.email ||
    "Not available";

  const role =
    profile?.role ||
    user?.role ||
    "Employee";

  const employeeId =
    profile?.id ||
    user?.userId ||
    "N/A";

  const isActive =
    profile?.isActive ?? true;

  // =====================================================
  // INITIALS
  // =====================================================

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((name) =>
      name.charAt(0).toUpperCase()
    )
    .slice(0, 2)
    .join("");

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  // =====================================================
  // EDIT PROFILE
  // =====================================================

  const openEditModal = () => {
    setEditForm({
      fullName: fullName,
      email: email,
    });

    setError("");

    setSuccessMessage("");

    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (savingProfile) {
      return;
    }

    setShowEditModal(false);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();

    setError("");

    setSuccessMessage("");

    const trimmedName =
      editForm.fullName.trim();

    const trimmedEmail =
      editForm.email.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (trimmedName.length < 2) {
      setError(
        "Full name must contain at least 2 characters."
      );
      return;
    }

    if (!trimmedEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    try {
      setSavingProfile(true);

      const response = await api.put(
        "/EmployeeProfile",
        {
          fullName: trimmedName,
          email: trimmedEmail,
        }
      );

      // Backend returns:
      // {
      //   message: "...",
      //   profile: {...}
      // }

      if (response.data?.profile) {
        setProfile(response.data.profile);
      } else {
        await loadProfile();
      }

      // Update local user information if possible.
      // This keeps other parts of the frontend
      // synchronized with the new name/email.
      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser =
            JSON.parse(storedUser);

          const updatedUser = {
            ...parsedUser,
            fullName: trimmedName,
            email: trimmedEmail,
          };

          localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
          );
        } catch (storageError) {
          console.error(
            "Unable to update local user data:",
            storageError
          );
        }
      }

      setShowEditModal(false);

      setSuccessMessage(
        response.data?.message ||
          "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Unable to update your profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const openPasswordModal = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowCurrentPassword(false);

    setShowNewPassword(false);

    setShowConfirmPassword(false);

    setError("");

    setSuccessMessage("");

    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    if (changingPassword) {
      return;
    }

    setShowPasswordModal(false);
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();

    setError("");

    setSuccessMessage("");

    if (!passwordForm.currentPassword) {
      setError(
        "Please enter your current password."
      );
      return;
    }

    if (!passwordForm.newPassword) {
      setError(
        "Please enter your new password."
      );
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setError(
        "New password and confirmation password do not match."
      );
      return;
    }

    if (
      passwordForm.currentPassword ===
      passwordForm.newPassword
    ) {
      setError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await api.put(
        "/EmployeeProfile/password",
        passwordForm
      );

      setShowPasswordModal(false);

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowCurrentPassword(false);

      setShowNewPassword(false);

      setShowConfirmPassword(false);

      setSuccessMessage(
        response.data?.message ||
          "Password changed successfully."
      );
    } catch (err) {
      console.error(
        "Password change error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Unable to change your password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">

        <div className="flex min-h-[500px] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">

              <RefreshCw
                size={26}
                className="animate-spin text-blue-600"
              />

            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              Loading your profile
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Please wait while we load your account details.
            </p>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR SCREEN
  // =====================================================

  if (error && !profile) {
    return (
      <div className="mx-auto max-w-6xl">

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100">

              <AlertCircle
                size={21}
                className="text-red-600"
              />

            </div>

            <div className="flex-1">

              <h2 className="font-semibold text-red-900">
                Unable to load profile
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() => loadProfile()}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <RefreshCw size={16} />
                Try Again
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN PROFILE
  // =====================================================

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <p className="text-sm font-medium text-blue-600">
            Account
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your personal information and account details.
          </p>

        </div>

        <div className="flex flex-wrap gap-2">

          {/* Refresh */}

          <button
            type="button"
            onClick={() => loadProfile(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh

          </button>

          {/* Edit */}

          <button
            type="button"
            onClick={openEditModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >

            <Edit3 size={17} />

            Edit Profile

          </button>

        </div>

      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">

          <CircleCheck
            size={20}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div className="flex-1">

            <p className="text-sm font-semibold text-emerald-800">
              Success
            </p>

            <p className="mt-0.5 text-sm text-emerald-700">
              {successMessage}
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X size={18} />
          </button>

        </div>
      )}

      {/* =====================================================
          GENERAL ERROR
      ====================================================== */}

      {error && profile && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">

          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div className="flex-1">

            <p className="text-sm font-semibold text-red-800">
              Something went wrong
            </p>

            <p className="mt-0.5 text-sm text-red-700">
              {error}
            </p>

          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-600 hover:text-red-800"
          >
            <X size={18} />
          </button>

        </div>
      )}

      {/* =====================================================
          PROFILE HERO
      ====================================================== */}

      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        {/* Background */}

        <div className="relative h-40 overflow-hidden bg-slate-950">

          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700" />

          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/10" />

          <div className="absolute -right-8 -top-20 h-56 w-56 rounded-full border border-white/10" />

          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />

          <div className="absolute right-20 top-8 h-20 w-20 rounded-full bg-blue-400/10 blur-2xl" />

        </div>

        {/* Content */}

        <div className="relative px-6 pb-7 sm:px-8">

          <div className="-mt-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">

              {/* Avatar */}

              <div className="relative">

                <div className="flex h-32 w-32 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-blue-500 to-blue-700 text-4xl font-bold text-white shadow-xl">

                  {initials || "U"}

                </div>

                <div
                  className={`absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white ${
                    isActive
                      ? "bg-emerald-500"
                      : "bg-slate-400"
                  }`}
                >

                  <CheckCircle2
                    size={13}
                    className="text-white"
                  />

                </div>

              </div>

              {/* Identity */}

              <div className="pb-1">

                <div className="flex flex-wrap items-center gap-3">

                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    {fullName}
                  </h2>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {role}
                  </span>

                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">

                  <span className="flex items-center gap-2">
                    <Mail size={15} />
                    {email}
                  </span>

                  <span className="flex items-center gap-2">
                    <UserRoundCheck size={15} />
                    Employee Account
                  </span>

                </div>

              </div>

            </div>

            {/* Status */}

            <div
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                isActive
                  ? "border-emerald-100 bg-emerald-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >

              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  isActive
                    ? "bg-emerald-100"
                    : "bg-slate-200"
                }`}
              >

                <CheckCircle2
                  size={18}
                  className={
                    isActive
                      ? "text-emerald-600"
                      : "text-slate-500"
                  }
                />

              </div>

              <div>

                <p
                  className={`text-xs font-medium ${
                    isActive
                      ? "text-emerald-600"
                      : "text-slate-500"
                  }`}
                >
                  Account Status
                </p>

                <p
                  className={`text-sm font-bold ${
                    isActive
                      ? "text-emerald-800"
                      : "text-slate-700"
                  }`}
                >
                  {isActive
                    ? "Active"
                    : "Inactive"}
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          TICKET STATISTICS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

        {/* Total */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Ticket size={20} />
            </div>

            <span className="text-xs font-medium text-slate-400">
              TOTAL
            </span>

          </div>

          <p className="mt-5 text-2xl font-bold text-slate-900">
            {profile?.totalTickets ?? 0}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            All tickets
          </p>

        </div>

        {/* Open */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock3 size={20} />
            </div>

            <span className="text-xs font-medium text-slate-400">
              OPEN
            </span>

          </div>

          <p className="mt-5 text-2xl font-bold text-slate-900">
            {profile?.openTickets ?? 0}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Awaiting support
          </p>

        </div>

        {/* In Progress */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Clock3 size={20} />
            </div>

            <span className="text-xs font-medium text-slate-400">
              IN PROGRESS
            </span>

          </div>

          <p className="mt-5 text-2xl font-bold text-slate-900">
            {profile?.inProgressTickets ?? 0}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Being handled
          </p>

        </div>

        {/* Resolved */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CircleCheck size={20} />
          </div>

          <p className="mt-5 text-2xl font-bold text-slate-900">
            {profile?.resolvedTickets ?? 0}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Resolved tickets
          </p>

        </div>

        {/* Closed */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <CheckCircle2 size={20} />
          </div>

          <p className="mt-5 text-2xl font-bold text-slate-900">
            {profile?.closedTickets ?? 0}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Closed tickets
          </p>

        </div>

      </div>

      {/* =====================================================
          MAIN INFORMATION
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Personal Information */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">

          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

            <div>

              <h2 className="text-lg font-semibold text-slate-900">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Information associated with your account.
              </p>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <User size={19} />
            </div>

          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-7 p-6 sm:grid-cols-2">

            {/* Full Name */}

            <div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Full Name
              </p>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <User size={17} />
                </div>

                <p className="text-sm font-semibold text-slate-800">
                  {fullName}
                </p>

              </div>

            </div>

            {/* Email */}

            <div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </p>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Mail size={17} />
                </div>

                <p className="truncate text-sm font-semibold text-slate-800">
                  {email}
                </p>

              </div>

            </div>

            {/* Role */}

            <div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                System Role
              </p>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <ShieldCheck size={17} />
                </div>

                <p className="text-sm font-semibold text-slate-800">
                  {role}
                </p>

              </div>

            </div>

            {/* Employee ID */}

            <div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Employee ID
              </p>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <UserRoundCheck size={17} />
                </div>

                <p className="text-sm font-semibold text-slate-800">
                  #{employeeId}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* Account Security */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck size={19} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Account Security
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Manage your password and account security.
            </p>

          </div>

          <div className="space-y-4 p-6">

            {/* Password */}

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

              <div>

                <p className="text-sm font-semibold text-slate-800">
                  Password
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Protected account credential
                </p>

              </div>

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">

                <CheckCircle2
                  size={16}
                  className="text-emerald-600"
                />

              </span>

            </div>

            {/* Authentication */}

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

              <div>

                <p className="text-sm font-semibold text-slate-800">
                  Authentication
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  JWT secured session
                </p>

              </div>

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">

                <CheckCircle2
                  size={16}
                  className="text-emerald-600"
                />

              </span>

            </div>

            {/* Change Password */}

            <button
              type="button"
              onClick={openPasswordModal}
              className="group flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
            >

              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 group-hover:text-blue-700">

                <KeyRound size={16} />

                Change Password

              </span>

              <ChevronRight
                size={17}
                className="text-slate-400 group-hover:text-blue-600"
              />

            </button>

          </div>

        </section>

      </div>

      {/* =====================================================
          ACCOUNT DETAILS
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <CalendarDays size={19} />
            </div>

            <div>

              <h2 className="text-lg font-semibold text-slate-900">
                Account Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Additional information about your HelpDeskPro account.
              </p>

            </div>

          </div>

        </div>

        <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

          {/* Account ID */}

          <div className="p-6">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Account ID
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              HDP-{String(employeeId).padStart(4, "0")}
            </p>

          </div>

          {/* Joined */}

          <div className="p-6">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Joined
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              {formatDate(profile?.createdAt)}
            </p>

          </div>

          {/* Status */}

          <div className="p-6">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Current Status
            </p>

            <p
              className={`mt-2 flex items-center gap-2 text-sm font-bold ${
                isActive
                  ? "text-emerald-600"
                  : "text-slate-500"
              }`}
            >

              <span
                className={`h-2 w-2 rounded-full ${
                  isActive
                    ? "bg-emerald-500"
                    : "bg-slate-400"
                }`}
              />

              {isActive
                ? "Active"
                : "Inactive"}

            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          EDIT PROFILE MODAL
      ====================================================== */}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Edit3 size={19} />
                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-slate-900">
                      Edit Profile
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Update your personal information.
                    </p>

                  </div>

                </div>

              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={savingProfile}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={19} />
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleProfileUpdate}
              className="space-y-5 p-6"
            >

              {/* Full Name */}

              <div>

                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full Name
                </label>

                <div className="relative">

                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={editForm.fullName}
                    onChange={handleEditChange}
                    disabled={savingProfile}
                    autoComplete="name"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                    placeholder="Enter your full name"
                  />

                </div>

              </div>

              {/* Email */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    disabled={savingProfile}
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                    placeholder="Enter your email address"
                  />

                </div>

              </div>

              {/* Protected information */}

              <div className="rounded-2xl bg-slate-50 p-4">

                <div className="flex items-center gap-2">

                  <ShieldCheck
                    size={17}
                    className="text-slate-500"
                  />

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Protected Information
                  </p>

                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">

                  <div>

                    <p className="text-xs text-slate-500">
                      Employee ID
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      #{employeeId}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-slate-500">
                      Role
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {role}
                    </p>

                  </div>

                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Employee ID and system role cannot be changed from your profile.
                </p>

              </div>

              {/* Buttons */}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={savingProfile}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {savingProfile ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />

                      Save Changes
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          CHANGE PASSWORD MODAL
      ====================================================== */}

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <LockKeyhole size={20} />
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Change Password
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Update your account password securely.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closePasswordModal}
                disabled={changingPassword}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={19} />
              </button>

            </div>

            {/* Password Form */}

            <form
              onSubmit={handlePasswordUpdate}
              className="space-y-5 p-6"
            >

              {/* Current Password */}

              <div>

                <label
                  htmlFor="currentPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Current Password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="currentPassword"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    name="currentPassword"
                    value={
                      passwordForm.currentPassword
                    }
                    onChange={handlePasswordChange}
                    disabled={changingPassword}
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                    placeholder="Enter current password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    disabled={changingPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 disabled:opacity-50"
                    aria-label={
                      showCurrentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* New Password */}

              <div>

                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  New Password
                </label>

                <div className="relative">

                  <KeyRound
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="newPassword"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    name="newPassword"
                    value={
                      passwordForm.newPassword
                    }
                    onChange={handlePasswordChange}
                    disabled={changingPassword}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                    placeholder="Enter new password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    disabled={changingPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 disabled:opacity-50"
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Minimum 8 characters.
                </p>

              </div>

              {/* Confirm Password */}

              <div>

                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Confirm New Password
                </label>

                <div className="relative">

                  <KeyRound
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={
                      passwordForm.confirmPassword
                    }
                    onChange={handlePasswordChange}
                    disabled={changingPassword}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                    placeholder="Confirm new password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    disabled={changingPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 disabled:opacity-50"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* Security Note */}

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">

                <div className="flex items-start gap-3">

                  <ShieldCheck
                    size={19}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div>

                    <p className="text-sm font-semibold text-blue-900">
                      Password security
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      Your new password is securely hashed before it is stored.
                    </p>

                  </div>

                </div>

              </div>

              {/* Buttons */}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={changingPassword}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {changingPassword ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />

                      Updating...
                    </>
                  ) : (
                    <>
                      <LockKeyhole size={17} />

                      Change Password
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Profile;