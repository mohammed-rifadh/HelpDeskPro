import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import {
  User,
  Mail,
  ShieldCheck,
  CalendarDays,
  Users,
  UserRoundCheck,
  Ticket,
  Pencil,
  LockKeyhole,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UserCog,
  Activity,
  KeyRound,
  ChevronRight,
  Sparkles,
  Check,
} from "lucide-react";

import api from "../../services/api";

function Profile() {
  const { updateUser } = useAuth();

  // =====================================================
  // STATE
  // =====================================================

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [editLoading, setEditLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  const fetchProfile = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/AdminProfile");

      const profileData = response.data;

      setProfile(profileData);

      setEditForm({
        fullName: profileData.fullName || "",
        email: profileData.email || "",
      });
    } catch (err) {
      console.error("Profile loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load admin profile."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchProfile();
  }, []);

  // =====================================================
  // SUCCESS MESSAGE AUTO HIDE
  // =====================================================

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 4500);

    return () => clearTimeout(timer);
  }, [successMessage]);

  // =====================================================
  // FORM HANDLERS
  // =====================================================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // EDIT PROFILE
  // =====================================================

  const openEditModal = () => {
    setError("");

    setEditForm({
      fullName: profile?.fullName || "",
      email: profile?.email || "",
    });

    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (!editLoading) {
      setShowEditModal(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");

    const fullName = editForm.fullName.trim();
    const email = editForm.email.trim();

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!fullName) {
      setError("Full name is required.");
      return;
    }

    if (fullName.length < 2) {
      setError(
        "Full name must contain at least 2 characters."
      );
      return;
    }

    if (!email) {
      setError("Email address is required.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    // ===================================================
    // UPDATE PROFILE
    // ===================================================

    try {
      setEditLoading(true);

      const response = await api.put(
        "/AdminProfile",
        {
          fullName,
          email,
        }
      );

      const updatedProfile =
        response.data.profile;

      // Update profile page
      setProfile(updatedProfile);

      // IMPORTANT:
      // Update AuthContext + localStorage.
      // This immediately updates AdminHeader.
      updateUser({
        fullName: updatedProfile.fullName,
        email: updatedProfile.email,
      });

      // Close modal
      setShowEditModal(false);

      setSuccessMessage(
        "Profile information updated successfully."
      );
    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update profile."
      );
    } finally {
      setEditLoading(false);
    }
  };

  // =====================================================
  // PASSWORD
  // =====================================================

  const openPasswordModal = () => {
    setError("");

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    if (!passwordLoading) {
      setShowPasswordModal(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");

    const {
      currentPassword,
      newPassword,
      confirmNewPassword,
    } = passwordForm;

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!currentPassword) {
      setError(
        "Current password is required."
      );
      return;
    }

    if (!newPassword) {
      setError(
        "New password is required."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (!confirmNewPassword) {
      setError(
        "Please confirm your new password."
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError(
        "New passwords do not match."
      );
      return;
    }

    // ===================================================
    // CHANGE PASSWORD
    // ===================================================

    try {
      setPasswordLoading(true);

      await api.put(
        "/AdminProfile/password",
        {
          currentPassword,
          newPassword,
          confirmNewPassword,
        }
      );

      setShowPasswordModal(false);

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      setSuccessMessage(
        "Password changed successfully."
      );
    } catch (err) {
      console.error(
        "Password update error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const getInitials = (name) => {
    if (!name) {
      return "AD";
    }

    const words = name
      .trim()
      .split(/\s+/);

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  const getAccountAge = (date) => {
    if (!date) {
      return "—";
    }

    const created = new Date(date);
    const now = new Date();

    const difference =
      now.getTime() - created.getTime();

    const days = Math.floor(
      difference /
        (1000 * 60 * 60 * 24)
    );

    if (days < 1) {
      return "Today";
    }

    if (days === 1) {
      return "1 day";
    }

    if (days < 30) {
      return `${days} days`;
    }

    const months = Math.floor(
      days / 30
    );

    if (months === 1) {
      return "1 month";
    }

    if (months < 12) {
      return `${months} months`;
    }

    const years = Math.floor(
      months / 12
    );

    return years === 1
      ? "1 year"
      : `${years} years`;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="px-6 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <RefreshCw
              size={26}
              className="animate-spin text-blue-600"
            />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            Loading your profile
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Please wait while we retrieve your
            account information.
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR / PROFILE UNAVAILABLE
  // =====================================================

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">

        <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center">

          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle
                size={26}
                className="text-red-600"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Profile unavailable
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error ||
                "We could not retrieve your administrator profile."}
            </p>

            <button
              onClick={() => fetchProfile()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <RefreshCw size={17} />
              Try Again
            </button>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">

        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-indigo-100/50 blur-3xl" />

        <div className="relative px-6 py-8 lg:px-8 lg:py-10">

          <div className="mx-auto max-w-7xl">

            {/* BREADCRUMB */}

            <div className="mb-7 flex items-center gap-2 text-xs font-medium text-slate-400">

              <span>
                Administration
              </span>

              <ChevronRight size={14} />

              <span className="font-semibold text-blue-600">
                Profile
              </span>

            </div>

            {/* HERO CONTENT */}

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              {/* IDENTITY */}

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                {/* AVATAR */}

                <div className="relative">

                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-600 text-2xl font-bold text-white shadow-xl shadow-blue-200 ring-8 ring-blue-50">
                    {getInitials(
                      profile.fullName
                    )}
                  </div>

                  <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-emerald-500">
                    <Check
                      size={13}
                      strokeWidth={3}
                      className="text-white"
                    />
                  </div>

                </div>

                {/* DETAILS */}

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                      {profile.fullName}
                    </h1>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                      <ShieldCheck size={14} />
                      Administrator
                    </span>

                  </div>

                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <Mail size={16} />
                    {profile.email}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">

                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      Joined{" "}
                      {formatDate(
                        profile.createdAt
                      )}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Activity size={14} />
                      Account active for{" "}
                      {getAccountAge(
                        profile.createdAt
                      )}
                    </span>

                  </div>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="flex flex-wrap gap-3">

                <button
                  onClick={() =>
                    fetchProfile(true)
                  }
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                    : "Refresh"}
                </button>

                <button
                  onClick={openEditModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
                >
                  <Pencil size={17} />
                  Edit Profile
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="px-6 py-8 lg:px-8">

        <div className="mx-auto max-w-7xl space-y-8">

          {/* =================================================
              ALERTS
          ================================================= */}

          {successMessage && (
            <AlertMessage
              type="success"
              message={successMessage}
            />
          )}

          {error && (
            <AlertMessage
              type="error"
              message={error}
            />
          )}

          {/* =================================================
              ACCOUNT OVERVIEW
          ================================================= */}

          <section>

            <div className="mb-5 flex items-end justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  Account Overview
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Administrator Information
                </h2>

              </div>

              <span className="hidden text-xs font-medium text-slate-400 sm:block">
                Account ID #{profile.id}
              </span>

            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              <OverviewCard
                icon={UserCog}
                title="Admin ID"
                value={`#${profile.id}`}
                description="Unique administrator ID"
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
              />

              <OverviewCard
                icon={ShieldCheck}
                title="Access Level"
                value={profile.role}
                description="System administrator"
                iconBg="bg-violet-50"
                iconColor="text-violet-600"
              />

              <OverviewCard
                icon={CheckCircle2}
                title="Account Status"
                value={
                  profile.isActive
                    ? "Active"
                    : "Inactive"
                }
                description={
                  profile.isActive
                    ? "Full access enabled"
                    : "Access restricted"
                }
                iconBg={
                  profile.isActive
                    ? "bg-emerald-50"
                    : "bg-red-50"
                }
                iconColor={
                  profile.isActive
                    ? "text-emerald-600"
                    : "text-red-600"
                }
              />

              <OverviewCard
                icon={CalendarDays}
                title="Joined"
                value={formatDate(
                  profile.createdAt
                )}
                description="Account creation date"
                iconBg="bg-orange-50"
                iconColor="text-orange-600"
              />

            </div>

          </section>

          {/* =================================================
              PLATFORM ANALYTICS
          ================================================= */}

          <section>

            <div className="mb-5">

              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Platform Analytics
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                HelpDeskPro Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                A real-time snapshot of your
                support platform.
              </p>

            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <MetricCard
                icon={Users}
                label="Total Users"
                value={profile.totalUsers}
                description="Registered accounts"
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
              />

              <MetricCard
                icon={UserRoundCheck}
                label="Employees"
                value={profile.totalEmployees}
                description="Active employee accounts"
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
              />

              <MetricCard
                icon={UserCog}
                label="Support Agents"
                value={profile.totalAgents}
                description="Technical support team"
                iconBg="bg-violet-50"
                iconColor="text-violet-600"
              />

              <MetricCard
                icon={Ticket}
                label="Total Tickets"
                value={profile.totalTickets}
                description="Support requests"
                iconBg="bg-orange-50"
                iconColor="text-orange-600"
              />

            </div>

          </section>

          {/* =================================================
              PROFILE + SECURITY
          ================================================= */}

          <section className="grid gap-6 xl:grid-cols-3">

            {/* PERSONAL INFORMATION */}

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                <div>

                  <h3 className="font-bold text-slate-900">
                    Personal Information
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Your administrator account details.
                  </p>

                </div>

                <button
                  onClick={openEditModal}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                  title="Edit profile"
                >
                  <Pencil size={17} />
                </button>

              </div>

              <div className="grid gap-0 sm:grid-cols-2">

                <DetailRow
                  icon={User}
                  label="Full Name"
                  value={profile.fullName}
                />

                <DetailRow
                  icon={Mail}
                  label="Email Address"
                  value={profile.email}
                />

                <DetailRow
                  icon={ShieldCheck}
                  label="Role"
                  value={profile.role}
                  badge
                />

                <DetailRow
                  icon={CalendarDays}
                  label="Joined Date"
                  value={formatDate(
                    profile.createdAt
                  )}
                />

              </div>

            </div>

            {/* SECURITY */}

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <LockKeyhole size={19} />
                  </div>

                  <div>

                    <h3 className="font-bold text-slate-900">
                      Security
                    </h3>

                    <p className="text-xs text-slate-500">
                      Protect your account
                    </p>

                  </div>

                </div>

              </div>

              <div className="p-6">

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">

                  <div className="flex items-start gap-3">

                    <CheckCircle2
                      size={19}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <div>

                      <p className="text-sm font-semibold text-emerald-800">
                        Account protected
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-700/80">
                        Your password is securely
                        managed using encrypted
                        password hashing.
                      </p>

                    </div>

                  </div>

                </div>

                <button
                  onClick={openPasswordModal}
                  className="mt-5 flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <KeyRound size={18} />
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-slate-900">
                        Change Password
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Update your account password
                      </p>

                    </div>

                  </div>

                  <ChevronRight
                    size={18}
                    className="text-slate-400"
                  />

                </button>

              </div>

            </div>

          </section>

          {/* =================================================
              ADMIN CONTROL CENTER
          ================================================= */}

          <section className="overflow-hidden rounded-3xl bg-slate-900 shadow-xl">

            <div className="relative p-6 lg:p-8">

              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-blue-300">
                    <Sparkles size={22} />
                  </div>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
                      Administrator Control Center
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-white">
                      Your HelpDeskPro account is ready.
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                      Manage your identity,
                      security and platform
                      access from one centralized
                      profile.
                    </p>

                  </div>

                </div>

                <button
                  onClick={openEditModal}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                >
                  <Pencil size={17} />
                  Manage Profile
                </button>

              </div>

            </div>

          </section>

        </div>

      </main>

      {/* =====================================================
          EDIT PROFILE MODAL
      ===================================================== */}

      {showEditModal && (
        <ModalOverlay>

          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">

            <ModalHeader
              icon={User}
              title="Edit Profile"
              description="Update your administrator information."
              onClose={closeEditModal}
              disabled={editLoading}
            />

            <form
              onSubmit={handleUpdateProfile}
              className="space-y-5 p-6"
            >

              <FormInput
                label="Full Name"
                icon={User}
                name="fullName"
                value={editForm.fullName}
                onChange={handleEditChange}
                placeholder="Enter your full name"
                disabled={editLoading}
              />

              <FormInput
                label="Email Address"
                icon={Mail}
                name="email"
                type="email"
                value={editForm.email}
                onChange={handleEditChange}
                placeholder="Enter your email address"
                disabled={editLoading}
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                <div className="flex items-center gap-3">

                  <ShieldCheck
                    size={18}
                    className="text-blue-600"
                  />

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Role
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {profile.role}
                    </p>

                  </div>

                  <span className="ml-auto rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Read only
                  </span>

                </div>

              </div>

              <ModalActions
                onCancel={closeEditModal}
                loading={editLoading}
                loadingText="Saving..."
                submitText="Save Changes"
              />

            </form>

          </div>

        </ModalOverlay>
      )}

      {/* =====================================================
          PASSWORD MODAL
      ===================================================== */}

      {showPasswordModal && (
        <ModalOverlay>

          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">

            <ModalHeader
              icon={LockKeyhole}
              title="Change Password"
              description="Secure your administrator account."
              onClose={closePasswordModal}
              disabled={passwordLoading}
            />

            <form
              onSubmit={handleChangePassword}
              className="space-y-5 p-6"
            >

              <PasswordInput
                label="Current Password"
                name="currentPassword"
                value={
                  passwordForm.currentPassword
                }
                onChange={handlePasswordChange}
                showPassword={
                  showCurrentPassword
                }
                setShowPassword={
                  setShowCurrentPassword
                }
                disabled={passwordLoading}
                placeholder="Enter current password"
              />

              <PasswordInput
                label="New Password"
                name="newPassword"
                value={
                  passwordForm.newPassword
                }
                onChange={handlePasswordChange}
                showPassword={showNewPassword}
                setShowPassword={
                  setShowNewPassword
                }
                disabled={passwordLoading}
                placeholder="Enter new password"
              />

              <PasswordInput
                label="Confirm New Password"
                name="confirmNewPassword"
                value={
                  passwordForm.confirmNewPassword
                }
                onChange={handlePasswordChange}
                showPassword={
                  showConfirmPassword
                }
                setShowPassword={
                  setShowConfirmPassword
                }
                disabled={passwordLoading}
                placeholder="Confirm new password"
              />

              {/* PASSWORD REQUIREMENTS */}

              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">

                <p className="text-xs font-bold text-blue-800">
                  Password requirements
                </p>

                <div className="mt-3 space-y-2">

                  <Requirement
                    valid={
                      passwordForm.newPassword
                        .length >= 8
                    }
                    text="At least 8 characters"
                  />

                  <Requirement
                    valid={
                      passwordForm.confirmNewPassword &&
                      passwordForm.newPassword ===
                        passwordForm.confirmNewPassword
                    }
                    text="Passwords match"
                  />

                </div>

              </div>

              <ModalActions
                onCancel={closePasswordModal}
                loading={passwordLoading}
                loadingText="Updating..."
                submitText="Update Password"
                icon={LockKeyhole}
              />

            </form>

          </div>

        </ModalOverlay>
      )}

    </div>
  );
}

// =======================================================
// OVERVIEW CARD
// =======================================================

function OverviewCard({
  icon: Icon,
  title,
  value,
  description,
  iconBg,
  iconColor,
}) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <p className="mt-3 truncate text-lg font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon
            size={20}
            className={iconColor}
          />
        </div>

      </div>

    </div>
  );
}

// =======================================================
// METRIC CARD
// =======================================================

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
  iconBg,
  iconColor,
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            {value ?? 0}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {description}
          </p>

        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}
        >
          <Icon
            size={22}
            className={iconColor}
          />
        </div>

      </div>

      <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100">

        <div
          className={`h-full w-2/3 rounded-full ${iconColor.replace(
            "text-",
            "bg-"
          )}`}
        />

      </div>

    </div>
  );
}

// =======================================================
// DETAIL ROW
// =======================================================

function DetailRow({
  icon: Icon,
  label,
  value,
  badge = false,
}) {
  return (
    <div className="border-b border-slate-100 p-6 last:border-b-0 sm:[&:nth-child(odd)]:border-r">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <Icon size={17} />
        </div>

        <div className="min-w-0">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          {badge ? (
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
              <ShieldCheck size={12} />
              {value}
            </span>
          ) : (
            <p
              className="mt-1 truncate text-sm font-semibold text-slate-800"
              title={value}
            >
              {value || "—"}
            </p>
          )}

        </div>

      </div>

    </div>
  );
}

// =======================================================
// ALERT
// =======================================================

function AlertMessage({
  type,
  message,
}) {
  const success = type === "success";

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-5 py-4 ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >

      {success ? (
        <CheckCircle2
          size={20}
          className="shrink-0 text-emerald-600"
        />
      ) : (
        <AlertCircle
          size={20}
          className="shrink-0 text-red-600"
        />
      )}

      <p className="text-sm font-semibold">
        {message}
      </p>

    </div>
  );
}

// =======================================================
// MODAL OVERLAY
// =======================================================

function ModalOverlay({ children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">

      <div className="absolute inset-0" />

      <div className="relative flex w-full items-center justify-center py-8">
        {children}
      </div>

    </div>
  );
}

// =======================================================
// MODAL HEADER
// =======================================================

function ModalHeader({
  icon: Icon,
  title,
  description,
  onClose,
  disabled,
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

      <div className="flex min-w-0 items-center gap-3">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={20} />
        </div>

        <div className="min-w-0">

          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            {description}
          </p>

        </div>

      </div>

      <button
        type="button"
        onClick={onClose}
        disabled={disabled}
        className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
        aria-label="Close modal"
      >
        <X size={19} />
      </button>

    </div>
  );
}

// =======================================================
// FORM INPUT
// =======================================================

function FormInput({
  label,
  icon: Icon,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">

        <Icon
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={
            type === "email"
              ? "email"
              : "name"
          }
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
        />

      </div>

    </div>
  );
}

// =======================================================
// PASSWORD INPUT
// =======================================================

function PasswordInput({
  label,
  name,
  value,
  onChange,
  showPassword,
  setShowPassword,
  disabled,
  placeholder,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">

        <LockKeyhole
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type={
            showPassword
              ? "text"
              : "password"
          }
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="new-password"
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword(
              !showPassword
            )
          }
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          aria-label={
            showPassword
              ? "Hide password"
              : "Show password"
          }
        >
          {showPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>

      </div>

    </div>
  );
}

// =======================================================
// PASSWORD REQUIREMENT
// =======================================================

function Requirement({
  valid,
  text,
}) {
  return (
    <div className="flex items-center gap-2">

      <div
        className={`flex h-4 w-4 items-center justify-center rounded-full ${
          valid
            ? "bg-emerald-500"
            : "bg-slate-200"
        }`}
      >

        {valid && (
          <Check
            size={10}
            strokeWidth={3}
            className="text-white"
          />
        )}

      </div>

      <span
        className={`text-xs ${
          valid
            ? "font-semibold text-emerald-700"
            : "text-slate-500"
        }`}
      >
        {text}
      </span>

    </div>
  );
}

// =======================================================
// MODAL ACTIONS
// =======================================================

function ModalActions({
  onCancel,
  loading,
  loadingText,
  submitText,
  icon: SubmitIcon = CheckCircle2,
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >

        {loading ? (
          <>
            <RefreshCw
              size={17}
              className="animate-spin"
            />

            {loadingText}
          </>
        ) : (
          <>
            <SubmitIcon size={17} />

            {submitText}
          </>
        )}

      </button>

    </div>
  );
}

export default Profile;