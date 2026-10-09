import { useEffect, useState } from "react";

import {
  User,
  Mail,
  ShieldCheck,
  Headphones,
  CalendarDays,
  Edit3,
  CheckCircle2,
  Ticket,
  XCircle,
  TrendingUp,
  Award,
  Zap,
  Activity,
  LockKeyhole,
  ChevronRight,
  BriefcaseBusiness,
  Loader2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Save,
  KeyRound,
  CircleCheck,
  Info
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const Profile = () => {
  const { user } = useAuth();

  // =====================================================
  // PROFILE STATE
  // =====================================================

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // EDIT PROFILE STATE
  // =====================================================

  const [showEditModal, setShowEditModal] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: "",
    email: ""
  });

  const [editErrors, setEditErrors] = useState({});

  const [savingProfile, setSavingProfile] = useState(false);

  const [profileSuccess, setProfileSuccess] = useState("");

  const [profileError, setProfileError] = useState("");

  // =====================================================
  // CHANGE PASSWORD STATE
  // =====================================================

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [passwordErrors, setPasswordErrors] = useState({});

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [passwordSuccess, setPasswordSuccess] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  // =====================================================
  // LOAD AGENT PROFILE
  // =====================================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/AgentProfile");

      console.log(
        "✅ Agent profile:",
        response.data
      );

      setProfile(response.data);
    } catch (error) {
      console.error(
        "❌ Failed to load agent profile:",
        error
      );

      if (error.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (error.response?.status === 403) {
        setError(
          "You do not have permission to access this profile."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Unable to load your profile. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadProfile();
  }, []);

  // =====================================================
  // HELPERS
  // =====================================================

  const getInitials = (name) => {
    if (!name) {
      return "AG";
    }

    return name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric"
      }
    );
  };

  // =====================================================
  // OPEN EDIT PROFILE
  // =====================================================

  const openEditProfile = () => {
    setEditForm({
      fullName: profile.fullName || "",
      email: profile.email || ""
    });

    setEditErrors({});
    setProfileError("");
    setProfileSuccess("");

    setShowEditModal(true);
  };

  // =====================================================
  // CLOSE EDIT PROFILE
  // =====================================================

  const closeEditProfile = () => {
    if (savingProfile) {
      return;
    }

    setShowEditModal(false);
    setEditErrors({});
    setProfileError("");
  };

  // =====================================================
  // EDIT INPUT CHANGE
  // =====================================================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value
    }));

    setEditErrors((previous) => ({
      ...previous,
      [name]: ""
    }));

    setProfileError("");
  };

  // =====================================================
  // VALIDATE PROFILE
  // =====================================================

  const validateProfile = () => {
    const errors = {};

    const fullName = editForm.fullName.trim();

    const email = editForm.email.trim();

    if (!fullName) {
      errors.fullName = "Full name is required.";
    } else if (fullName.length < 2) {
      errors.fullName =
        "Full name must contain at least 2 characters.";
    } else if (fullName.length > 100) {
      errors.fullName =
        "Full name cannot exceed 100 characters.";
    }

    if (!email) {
      errors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      errors.email =
        "Please enter a valid email address.";
    } else if (email.length > 150) {
      errors.email =
        "Email cannot exceed 150 characters.";
    }

    setEditErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    setProfileSuccess("");
    setProfileError("");

    if (!validateProfile()) {
      return;
    }

    try {
      setSavingProfile(true);

      const response = await api.put(
        "/AgentProfile",
        {
          fullName: editForm.fullName.trim(),
          email: editForm.email.trim()
        }
      );

      console.log(
        "✅ Profile updated:",
        response.data
      );

      if (response.data.profile) {
        setProfile(response.data.profile);
      } else {
        await loadProfile();
      }

      setProfileSuccess(
        response.data.message ||
          "Profile updated successfully."
      );

      setShowEditModal(false);

      // -------------------------------------------------
      // Update localStorage user
      // -------------------------------------------------

      try {
        const storedUser =
          localStorage.getItem("user");

        if (storedUser) {
          const parsedUser = JSON.parse(
            storedUser
          );

          const updatedUser = {
            ...parsedUser,
            fullName:
              response.data.profile?.fullName ||
              editForm.fullName.trim(),
            email:
              response.data.profile?.email ||
              editForm.email.trim()
          };

          localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
          );
        }
      } catch (storageError) {
        console.warn(
          "Could not update local user:",
          storageError
        );
      }
    } catch (error) {
      console.error(
        "❌ Failed to update profile:",
        error
      );

      if (error.response?.status === 400) {
        setProfileError(
          error.response?.data?.message ||
            "Unable to update your profile."
        );
      } else if (
        error.response?.status === 401
      ) {
        setProfileError(
          "Your session has expired. Please login again."
        );
      } else if (
        error.response?.status === 403
      ) {
        setProfileError(
          "You do not have permission to update this profile."
        );
      } else {
        setProfileError(
          error.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // =====================================================
  // OPEN CHANGE PASSWORD
  // =====================================================

  const openPasswordModal = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });

    setPasswordErrors({});
    setPasswordSuccess("");
    setPasswordError("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setShowPasswordModal(true);
  };

  // =====================================================
  // CLOSE CHANGE PASSWORD
  // =====================================================

  const closePasswordModal = () => {
    if (changingPassword) {
      return;
    }

    setShowPasswordModal(false);

    setPasswordErrors({});
    setPasswordError("");
  };

  // =====================================================
  // PASSWORD INPUT CHANGE
  // =====================================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value
    }));

    setPasswordErrors((previous) => ({
      ...previous,
      [name]: ""
    }));

    setPasswordError("");
  };

  // =====================================================
  // VALIDATE PASSWORD
  // =====================================================

  const validatePassword = () => {
    const errors = {};

    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = passwordForm;

    if (!currentPassword) {
      errors.currentPassword =
        "Current password is required.";
    }

    if (!newPassword) {
      errors.newPassword =
        "New password is required.";
    } else if (newPassword.length < 8) {
      errors.newPassword =
        "New password must contain at least 8 characters.";
    } else if (newPassword.length > 100) {
      errors.newPassword =
        "New password cannot exceed 100 characters.";
    }

    if (!confirmPassword) {
      errors.confirmPassword =
        "Please confirm your new password.";
    } else if (
      newPassword !== confirmPassword
    ) {
      errors.confirmPassword =
        "Passwords do not match.";
    }

    if (
      currentPassword &&
      newPassword &&
      currentPassword === newPassword
    ) {
      errors.newPassword =
        "New password must be different from your current password.";
    }

    setPasswordErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordSuccess("");
    setPasswordError("");

    if (!validatePassword()) {
      return;
    }

    try {
      setChangingPassword(true);

      const response = await api.put(
        "/AgentProfile/password",
        {
          currentPassword:
            passwordForm.currentPassword,
          newPassword:
            passwordForm.newPassword,
          confirmPassword:
            passwordForm.confirmPassword
        }
      );

      console.log(
        "✅ Password changed:",
        response.data
      );

      setPasswordSuccess(
        response.data.message ||
          "Password changed successfully."
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      // Close after short delay so user can see success
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess("");
      }, 1500);
    } catch (error) {
      console.error(
        "❌ Failed to change password:",
        error
      );

      if (error.response?.status === 400) {
        setPasswordError(
          error.response?.data?.message ||
            "Unable to change password."
        );
      } else if (
        error.response?.status === 401
      ) {
        setPasswordError(
          "Your session has expired. Please login again."
        );
      } else if (
        error.response?.status === 403
      ) {
        setPasswordError(
          "You do not have permission to change this password."
        );
      } else {
        setPasswordError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setChangingPassword(false);
    }
  };

  // =====================================================
  // PERFORMANCE
  // =====================================================

  const performance = [
    {
      title: "Assigned Tickets",
      value: profile?.assignedTickets ?? 0,
      icon: Ticket,
      description: "Total assigned",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "In Progress",
      value: profile?.inProgressTickets ?? 0,
      icon: Activity,
      description: "Currently working",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600"
    },
    {
      title: "Resolved",
      value: profile?.resolvedTickets ?? 0,
      icon: CheckCircle2,
      description: "Successfully resolved",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600"
    },
    {
      title: "Closed",
      value: profile?.closedTickets ?? 0,
      icon: XCircle,
      description: "Completed tickets",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600"
    }
  ];

  // =====================================================
  // SKILLS
  // =====================================================

  const skills = [
    "Technical Support",
    "Network Troubleshooting",
    "Hardware Support",
    "Software Support",
    "Windows Administration",
    "System Troubleshooting"
  ];

  // =====================================================
  // ACHIEVEMENTS
  // =====================================================

  const achievements = [
    {
      title: "High Resolution Rate",
      description:
        "Maintaining an excellent ticket completion rate.",
      icon: TrendingUp
    },
    {
      title: "Reliable Support",
      description:
        "Successfully managing assigned support requests.",
      icon: Award
    },
    {
      title: "Active Agent",
      description:
        "Currently active and available for support.",
      icon: Zap
    }
  ];

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={36}
            className="animate-spin text-blue-600"
          />

          <p className="text-sm text-slate-500">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !profile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle
              size={28}
              className="text-red-500"
            />
          </div>

          <h2 className="text-lg font-semibold text-slate-800">
            Profile unavailable
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            {error ||
              "Agent profile could not be loaded."}
          </p>

          <button
            onClick={loadProfile}
            className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <>
      <div className="space-y-6 pb-10">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              My Profile
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Manage your professional profile and
              support performance.
            </p>
          </div>

          <button
            type="button"
            onClick={openEditProfile}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              px-4
              py-2.5
              rounded-xl
              bg-blue-600
              text-white
              text-sm
              font-medium
              hover:bg-blue-700
              active:bg-blue-800
              transition
              shadow-sm
            "
          >
            <Edit3 size={16} />

            Edit Profile
          </button>

        </div>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {profileSuccess && (
          <div className="
            flex
            items-center
            gap-3
            rounded-xl
            border
            border-emerald-200
            bg-emerald-50
            px-4
            py-3
            text-sm
            text-emerald-700
          ">
            <CircleCheck size={18} />

            <span>{profileSuccess}</span>
          </div>
        )}

        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-sm">

          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl" />

          <div className="relative p-6 md:p-8">

            <div className="flex flex-col lg:flex-row lg:items-center gap-6">

              {/* Avatar */}

              <div className="
                w-24
                h-24
                rounded-2xl
                bg-gradient-to-br
                from-blue-500
                to-indigo-600
                flex
                items-center
                justify-center
                text-white
                text-3xl
                font-bold
                shadow-lg
                shrink-0
              ">
                {getInitials(profile.fullName)}
              </div>

              {/* Information */}

              <div className="flex-1">

                <div className="flex flex-wrap items-center gap-3">

                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    {profile.fullName}
                  </h2>

                  {profile.isActive && (
                    <span className="
                      inline-flex
                      items-center
                      gap-1.5
                      px-3
                      py-1
                      rounded-full
                      bg-emerald-500/15
                      border
                      border-emerald-400/20
                      text-emerald-300
                      text-xs
                      font-medium
                    ">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />

                      Active
                    </span>
                  )}

                </div>

                <p className="text-slate-300 mt-1">
                  IT Support Agent
                </p>

                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-slate-400">

                  <div className="flex items-center gap-2">
                    <ShieldCheck size={15} />

                    Agent ID: #{profile.id}
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail size={15} />

                    {profile.email}
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays size={15} />

                    Joined {formatDate(profile.createdAt)}
                  </div>

                </div>

              </div>

              {/* Role */}

              <div className="
                hidden
                lg:flex
                flex-col
                items-end
                text-right
              ">

                <span className="text-xs text-slate-400">
                  ROLE
                </span>

                <span className="mt-1 text-white font-semibold">
                  {profile.role}
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            PERFORMANCE
        ================================================= */}

        <div>

          <div className="flex items-center justify-between mb-4">

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Support Performance
              </h2>

              <p className="text-sm text-slate-500">
                Your current ticket performance.
              </p>
            </div>

            <div className="
              flex
              items-center
              gap-2
              text-sm
              font-medium
              text-emerald-600
            ">
              <TrendingUp size={17} />

              {profile.resolutionRate}% resolution rate
            </div>

          </div>

          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-4
            gap-4
          ">

            {performance.map((item) => {

              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="
                    bg-white
                    border
                    border-slate-200
                    rounded-2xl
                    p-5
                    shadow-sm
                    hover:shadow-md
                    transition
                  "
                >

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm text-slate-500">
                        {item.title}
                      </p>

                      <p className="text-3xl font-bold text-slate-800 mt-2">
                        {item.value}
                      </p>

                    </div>

                    <div
                      className={`
                        w-11
                        h-11
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        ${item.iconBg}
                      `}
                    >
                      <Icon
                        size={21}
                        className={item.iconColor}
                      />
                    </div>

                  </div>

                  <p className="text-xs text-slate-400 mt-4">
                    {item.description}
                  </p>

                </div>
              );
            })}

          </div>

        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* PERFORMANCE OVERVIEW */}

          <div className="
            xl:col-span-2
            bg-white
            border
            border-slate-200
            rounded-2xl
            shadow-sm
            p-6
          ">

            <div className="flex items-center gap-3 mb-6">

              <div className="
                w-10
                h-10
                rounded-xl
                bg-blue-50
                flex
                items-center
                justify-center
              ">
                <Activity
                  size={20}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  Performance Overview
                </h3>

                <p className="text-sm text-slate-500">
                  Ticket completion summary
                </p>
              </div>

            </div>

            {/* Resolution Rate */}

            <div className="mb-7">

              <div className="flex items-center justify-between mb-2">

                <span className="text-sm font-medium text-slate-700">
                  Resolution Rate
                </span>

                <span className="text-sm font-bold text-blue-600">
                  {profile.resolutionRate}%
                </span>

              </div>

              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">

                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      profile.resolutionRate,
                      100
                    )}%`
                  }}
                />

              </div>

            </div>

            {/* Ticket Breakdown */}

            <div className="space-y-5">

              {/* Assigned */}

              <div>

                <div className="flex justify-between text-sm mb-2">

                  <span className="text-slate-600">
                    Assigned
                  </span>

                  <span className="font-semibold text-slate-800">
                    {profile.assignedTickets}
                  </span>

                </div>

                <div className="h-2 bg-slate-100 rounded-full">

                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width:
                        profile.assignedTickets > 0
                          ? "100%"
                          : "0%"
                    }}
                  />

                </div>

              </div>

              {/* In Progress */}

              <div>

                <div className="flex justify-between text-sm mb-2">

                  <span className="text-slate-600">
                    In Progress
                  </span>

                  <span className="font-semibold text-slate-800">
                    {profile.inProgressTickets}
                  </span>

                </div>

                <div className="h-2 bg-slate-100 rounded-full">

                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width:
                        profile.assignedTickets > 0
                          ? `${Math.min(
                              (profile.inProgressTickets /
                                profile.assignedTickets) *
                                100,
                              100
                            )}%`
                          : "0%"
                    }}
                  />

                </div>

              </div>

              {/* Resolved */}

              <div>

                <div className="flex justify-between text-sm mb-2">

                  <span className="text-slate-600">
                    Resolved
                  </span>

                  <span className="font-semibold text-slate-800">
                    {profile.resolvedTickets}
                  </span>

                </div>

                <div className="h-2 bg-slate-100 rounded-full">

                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width:
                        profile.assignedTickets > 0
                          ? `${Math.min(
                              (profile.resolvedTickets /
                                profile.assignedTickets) *
                                100,
                              100
                            )}%`
                          : "0%"
                    }}
                  />

                </div>

              </div>

              {/* Closed */}

              <div>

                <div className="flex justify-between text-sm mb-2">

                  <span className="text-slate-600">
                    Closed
                  </span>

                  <span className="font-semibold text-slate-800">
                    {profile.closedTickets}
                  </span>

                </div>

                <div className="h-2 bg-slate-100 rounded-full">

                  <div
                    className="h-full bg-slate-600 rounded-full"
                    style={{
                      width:
                        profile.assignedTickets > 0
                          ? `${Math.min(
                              (profile.closedTickets /
                                profile.assignedTickets) *
                                100,
                              100
                            )}%`
                          : "0%"
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

          {/* SKILLS */}

          <div className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            shadow-sm
            p-6
          ">

            <div className="flex items-center gap-3 mb-5">

              <div className="
                w-10
                h-10
                rounded-xl
                bg-indigo-50
                flex
                items-center
                justify-center
              ">
                <BriefcaseBusiness
                  size={20}
                  className="text-indigo-600"
                />
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  Professional Skills
                </h3>

                <p className="text-sm text-slate-500">
                  Technical expertise
                </p>
              </div>

            </div>

            <div className="flex flex-wrap gap-2">

              {skills.map((skill) => (
                <span
                  key={skill}
                  className="
                    px-3
                    py-2
                    rounded-lg
                    bg-slate-50
                    border
                    border-slate-200
                    text-sm
                    text-slate-600
                  "
                >
                  {skill}
                </span>
              ))}

            </div>

          </div>

        </div>

        {/* =================================================
            LOWER CONTENT
        ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* PROFESSIONAL INFORMATION */}

          <div className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            shadow-sm
            p-6
          ">

            <div className="flex items-center gap-3 mb-6">

              <div className="
                w-10
                h-10
                rounded-xl
                bg-slate-100
                flex
                items-center
                justify-center
              ">
                <User
                  size={20}
                  className="text-slate-600"
                />
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  Professional Information
                </h3>

                <p className="text-sm text-slate-500">
                  Account and role details
                </p>
              </div>

            </div>

            <div className="space-y-4">

              {/* Department */}

              <div className="
                flex
                items-center
                justify-between
                py-3
                border-b
                border-slate-100
                gap-4
              ">

                <div className="flex items-center gap-3">

                  <Headphones
                    size={18}
                    className="text-slate-400"
                  />

                  <span className="text-sm text-slate-500">
                    Department
                  </span>

                </div>

                <span className="text-sm font-medium text-slate-800 text-right">
                  Information Technology
                </span>

              </div>

              {/* Role */}

              <div className="
                flex
                items-center
                justify-between
                py-3
                border-b
                border-slate-100
                gap-4
              ">

                <div className="flex items-center gap-3">

                  <ShieldCheck
                    size={18}
                    className="text-slate-400"
                  />

                  <span className="text-sm text-slate-500">
                    Role
                  </span>

                </div>

                <span className="text-sm font-medium text-slate-800">
                  {profile.role}
                </span>

              </div>

              {/* Email */}

              <div className="
                flex
                items-center
                justify-between
                py-3
                border-b
                border-slate-100
                gap-4
              ">

                <div className="flex items-center gap-3">

                  <Mail
                    size={18}
                    className="text-slate-400"
                  />

                  <span className="text-sm text-slate-500">
                    Email
                  </span>

                </div>

                <span className="text-sm font-medium text-slate-800 text-right break-all">
                  {profile.email}
                </span>

              </div>

              {/* Joined */}

              <div className="
                flex
                items-center
                justify-between
                py-3
                gap-4
              ">

                <div className="flex items-center gap-3">

                  <CalendarDays
                    size={18}
                    className="text-slate-400"
                  />

                  <span className="text-sm text-slate-500">
                    Joined
                  </span>

                </div>

                <span className="text-sm font-medium text-slate-800 text-right">
                  {formatDate(profile.createdAt)}
                </span>

              </div>

            </div>

          </div>

          {/* ACHIEVEMENTS */}

          <div className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            shadow-sm
            p-6
          ">

            <div className="flex items-center gap-3 mb-6">

              <div className="
                w-10
                h-10
                rounded-xl
                bg-amber-50
                flex
                items-center
                justify-center
              ">
                <Award
                  size={20}
                  className="text-amber-600"
                />
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  Achievements
                </h3>

                <p className="text-sm text-slate-500">
                  Performance highlights
                </p>
              </div>

            </div>

            <div className="space-y-4">

              {achievements.map((achievement) => {

                const Icon = achievement.icon;

                return (
                  <div
                    key={achievement.title}
                    className="
                      flex
                      items-center
                      gap-4
                      p-4
                      rounded-xl
                      bg-slate-50
                      border
                      border-slate-100
                    "
                  >

                    <div className="
                      w-10
                      h-10
                      rounded-xl
                      bg-white
                      flex
                      items-center
                      justify-center
                      shadow-sm
                      shrink-0
                    ">

                      <Icon
                        size={19}
                        className="text-amber-500"
                      />

                    </div>

                    <div className="flex-1">

                      <h4 className="text-sm font-semibold text-slate-800">
                        {achievement.title}
                      </h4>

                      <p className="text-xs text-slate-500 mt-1">
                        {achievement.description}
                      </p>

                    </div>

                    <ChevronRight
                      size={17}
                      className="text-slate-300"
                    />

                  </div>
                );
              })}

            </div>

          </div>

        </div>

        {/* =================================================
            SECURITY
        ================================================= */}

        <div className="
          bg-white
          border
          border-slate-200
          rounded-2xl
          shadow-sm
          p-6
        ">

          <div className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
          ">

            <div className="flex items-center gap-4">

              <div className="
                w-11
                h-11
                rounded-xl
                bg-emerald-50
                flex
                items-center
                justify-center
              ">

                <LockKeyhole
                  size={21}
                  className="text-emerald-600"
                />

              </div>

              <div>

                <h3 className="font-semibold text-slate-800">
                  Account Security
                </h3>

                <p className="text-sm text-slate-500">
                  Keep your account secure and up to date.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={openPasswordModal}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                border
                border-slate-200
                text-sm
                font-medium
                text-slate-700
                hover:bg-slate-50
                hover:border-slate-300
                transition
              "
            >
              Change Password

              <ChevronRight size={16} />
            </button>

          </div>

        </div>

      </div>

      {/* =====================================================
          EDIT PROFILE MODAL
      ===================================================== */}

      {showEditModal && (
        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          p-4
        ">

          {/* Backdrop */}

          <div
            className="
              absolute
              inset-0
              bg-slate-950/50
              backdrop-blur-sm
            "
            onClick={closeEditProfile}
          />

          {/* Modal */}

          <div className="
            relative
            w-full
            max-w-lg
            bg-white
            rounded-2xl
            shadow-2xl
            overflow-hidden
          ">

            {/* Header */}

            <div className="
              flex
              items-center
              justify-between
              px-6
              py-5
              border-b
              border-slate-100
            ">

              <div className="flex items-center gap-3">

                <div className="
                  w-10
                  h-10
                  rounded-xl
                  bg-blue-50
                  flex
                  items-center
                  justify-center
                ">
                  <Edit3
                    size={19}
                    className="text-blue-600"
                  />
                </div>

                <div>

                  <h2 className="text-lg font-semibold text-slate-800">
                    Edit Profile
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Update your personal information
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeEditProfile}
                disabled={savingProfile}
                className="
                  w-9
                  h-9
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-600
                  transition
                  disabled:opacity-50
                "
              >
                <X size={19} />
              </button>

            </div>

            {/* Body */}

            <form
              onSubmit={handleSaveProfile}
              className="p-6"
            >

              {/* Error */}

              {profileError && (
                <div className="
                  flex
                  items-start
                  gap-3
                  mb-5
                  p-3.5
                  rounded-xl
                  bg-red-50
                  border
                  border-red-200
                  text-sm
                  text-red-700
                ">
                  <AlertCircle
                    size={18}
                    className="shrink-0 mt-0.5"
                  />

                  <span>{profileError}</span>
                </div>
              )}

              {/* Full Name */}

              <div className="mb-5">

                <label
                  htmlFor="fullName"
                  className="
                    block
                    text-sm
                    font-medium
                    text-slate-700
                    mb-2
                  "
                >
                  Full Name
                </label>

                <div className="relative">

                  <User
                    size={18}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={editForm.fullName}
                    onChange={handleEditChange}
                    disabled={savingProfile}
                    placeholder="Enter your full name"
                    className={`
                      w-full
                      rounded-xl
                      border
                      ${
                        editErrors.fullName
                          ? "border-red-300 focus:ring-red-100"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                      }
                      bg-white
                      py-3
                      pl-11
                      pr-4
                      text-sm
                      text-slate-800
                      outline-none
                      focus:ring-4
                      transition
                      disabled:bg-slate-50
                      disabled:cursor-not-allowed
                    `}
                  />

                </div>

                {editErrors.fullName && (
                  <p className="
                    flex
                    items-center
                    gap-1.5
                    mt-1.5
                    text-xs
                    text-red-600
                  ">
                    <AlertCircle size={13} />

                    {editErrors.fullName}
                  </p>
                )}

              </div>

              {/* Email */}

              <div className="mb-6">

                <label
                  htmlFor="email"
                  className="
                    block
                    text-sm
                    font-medium
                    text-slate-700
                    mb-2
                  "
                >
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    disabled={savingProfile}
                    placeholder="Enter your email address"
                    className={`
                      w-full
                      rounded-xl
                      border
                      ${
                        editErrors.email
                          ? "border-red-300 focus:ring-red-100"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                      }
                      bg-white
                      py-3
                      pl-11
                      pr-4
                      text-sm
                      text-slate-800
                      outline-none
                      focus:ring-4
                      transition
                      disabled:bg-slate-50
                      disabled:cursor-not-allowed
                    `}
                  />

                </div>

                {editErrors.email && (
                  <p className="
                    flex
                    items-center
                    gap-1.5
                    mt-1.5
                    text-xs
                    text-red-600
                  ">
                    <AlertCircle size={13} />

                    {editErrors.email}
                  </p>
                )}

              </div>

              {/* Read Only Information */}

              <div className="
                rounded-xl
                bg-slate-50
                border
                border-slate-100
                p-4
                mb-6
              ">

                <div className="flex items-start gap-3">

                  <Info
                    size={17}
                    className="text-slate-400 mt-0.5 shrink-0"
                  />

                  <p className="text-xs leading-5 text-slate-500">
                    Your role, account status, Agent ID,
                    joining date, and performance statistics
                    cannot be changed from your profile.
                  </p>

                </div>

              </div>

              {/* Actions */}

              <div className="
                flex
                flex-col-reverse
                sm:flex-row
                sm:justify-end
                gap-3
              ">

                <button
                  type="button"
                  onClick={closeEditProfile}
                  disabled={savingProfile}
                  className="
                    px-5
                    py-2.5
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    text-sm
                    font-medium
                    text-slate-700
                    hover:bg-slate-50
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-5
                    py-2.5
                    rounded-xl
                    bg-blue-600
                    text-white
                    text-sm
                    font-medium
                    hover:bg-blue-700
                    transition
                    shadow-sm
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >

                  {savingProfile ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />

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
      ===================================================== */}

      {showPasswordModal && (
        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          p-4
        ">

          {/* Backdrop */}

          <div
            className="
              absolute
              inset-0
              bg-slate-950/50
              backdrop-blur-sm
            "
            onClick={closePasswordModal}
          />

          {/* Modal */}

          <div className="
            relative
            w-full
            max-w-lg
            bg-white
            rounded-2xl
            shadow-2xl
            overflow-hidden
          ">

            {/* Header */}

            <div className="
              flex
              items-center
              justify-between
              px-6
              py-5
              border-b
              border-slate-100
            ">

              <div className="flex items-center gap-3">

                <div className="
                  w-10
                  h-10
                  rounded-xl
                  bg-emerald-50
                  flex
                  items-center
                  justify-center
                ">
                  <KeyRound
                    size={19}
                    className="text-emerald-600"
                  />
                </div>

                <div>

                  <h2 className="text-lg font-semibold text-slate-800">
                    Change Password
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Protect your account with a new password
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closePasswordModal}
                disabled={changingPassword}
                className="
                  w-9
                  h-9
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-600
                  transition
                  disabled:opacity-50
                "
              >
                <X size={19} />
              </button>

            </div>

            {/* Body */}

            <form
              onSubmit={handleChangePassword}
              className="p-6"
            >

              {/* Success */}

              {passwordSuccess && (
                <div className="
                  flex
                  items-start
                  gap-3
                  mb-5
                  p-3.5
                  rounded-xl
                  bg-emerald-50
                  border
                  border-emerald-200
                  text-sm
                  text-emerald-700
                ">
                  <CheckCircle2
                    size={18}
                    className="shrink-0 mt-0.5"
                  />

                  <span>{passwordSuccess}</span>
                </div>
              )}

              {/* Error */}

              {passwordError && (
                <div className="
                  flex
                  items-start
                  gap-3
                  mb-5
                  p-3.5
                  rounded-xl
                  bg-red-50
                  border
                  border-red-200
                  text-sm
                  text-red-700
                ">
                  <AlertCircle
                    size={18}
                    className="shrink-0 mt-0.5"
                  />

                  <span>{passwordError}</span>
                </div>
              )}

              {/* Current Password */}

              <div className="mb-5">

                <label
                  htmlFor="currentPassword"
                  className="
                    block
                    text-sm
                    font-medium
                    text-slate-700
                    mb-2
                  "
                >
                  Current Password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={18}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      passwordForm.currentPassword
                    }
                    onChange={handlePasswordChange}
                    disabled={changingPassword}
                    placeholder="Enter your current password"
                    className={`
                      w-full
                      rounded-xl
                      border
                      ${
                        passwordErrors.currentPassword
                          ? "border-red-300 focus:ring-red-100"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                      }
                      bg-white
                      py-3
                      pl-11
                      pr-12
                      text-sm
                      text-slate-800
                      outline-none
                      focus:ring-4
                      transition
                      disabled:bg-slate-50
                    `}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (previous) => !previous
                      )
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                      hover:text-slate-600
                    "
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

                {passwordErrors.currentPassword && (
                  <p className="
                    flex
                    items-center
                    gap-1.5
                    mt-1.5
                    text-xs
                    text-red-600
                  ">
                    <AlertCircle size={13} />

                    {passwordErrors.currentPassword}
                  </p>
                )}

              </div>

              {/* New Password */}

              <div className="mb-5">

                <label
                  htmlFor="newPassword"
                  className="
                    block
                    text-sm
                    font-medium
                    text-slate-700
                    mb-2
                  "
                >
                  New Password
                </label>

                <div className="relative">

                  <KeyRound
                    size={18}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    id="newPassword"
                    name="newPassword"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      passwordForm.newPassword
                    }
                    onChange={handlePasswordChange}
                    disabled={changingPassword}
                    placeholder="Enter your new password"
                    className={`
                      w-full
                      rounded-xl
                      border
                      ${
                        passwordErrors.newPassword
                          ? "border-red-300 focus:ring-red-100"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                      }
                      bg-white
                      py-3
                      pl-11
                      pr-12
                      text-sm
                      text-slate-800
                      outline-none
                      focus:ring-4
                      transition
                      disabled:bg-slate-50
                    `}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (previous) => !previous
                      )
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                      hover:text-slate-600
                    "
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

                <p className="text-xs text-slate-400 mt-1.5">
                  Use at least 8 characters.
                </p>

                {passwordErrors.newPassword && (
                  <p className="
                    flex
                    items-center
                    gap-1.5
                    mt-1.5
                    text-xs
                    text-red-600
                  ">
                    <AlertCircle size={13} />

                    {passwordErrors.newPassword}
                  </p>
                )}

              </div>

              {/* Confirm Password */}

              <div className="mb-6">

                <label
                  htmlFor="confirmPassword"
                  className="
                    block
                    text-sm
                    font-medium
                    text-slate-700
                    mb-2
                  "
                >
                  Confirm New Password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={18}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      passwordForm.confirmPassword
                    }
                    onChange={handlePasswordChange}
                    disabled={changingPassword}
                    placeholder="Confirm your new password"
                    className={`
                      w-full
                      rounded-xl
                      border
                      ${
                        passwordErrors.confirmPassword
                          ? "border-red-300 focus:ring-red-100"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                      }
                      bg-white
                      py-3
                      pl-11
                      pr-12
                      text-sm
                      text-slate-800
                      outline-none
                      focus:ring-4
                      transition
                      disabled:bg-slate-50
                    `}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) => !previous
                      )
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                      hover:text-slate-600
                    "
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

                {passwordErrors.confirmPassword && (
                  <p className="
                    flex
                    items-center
                    gap-1.5
                    mt-1.5
                    text-xs
                    text-red-600
                  ">
                    <AlertCircle size={13} />

                    {passwordErrors.confirmPassword}
                  </p>
                )}

              </div>

              {/* Security Information */}

              <div className="
                rounded-xl
                bg-emerald-50
                border
                border-emerald-100
                p-4
                mb-6
              ">

                <div className="flex items-start gap-3">

                  <ShieldCheck
                    size={18}
                    className="text-emerald-600 mt-0.5 shrink-0"
                  />

                  <div>

                    <p className="text-xs font-semibold text-emerald-800">
                      Password security
                    </p>

                    <p className="text-xs text-emerald-700 mt-1 leading-5">
                      Your password is securely hashed
                      before it is stored in the database.
                    </p>

                  </div>

                </div>

              </div>

              {/* Actions */}

              <div className="
                flex
                flex-col-reverse
                sm:flex-row
                sm:justify-end
                gap-3
              ">

                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={changingPassword}
                  className="
                    px-5
                    py-2.5
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    text-sm
                    font-medium
                    text-slate-700
                    hover:bg-slate-50
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    changingPassword ||
                    !!passwordSuccess
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-5
                    py-2.5
                    rounded-xl
                    bg-emerald-600
                    text-white
                    text-sm
                    font-medium
                    hover:bg-emerald-700
                    transition
                    shadow-sm
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >

                  {changingPassword ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Updating...
                    </>
                  ) : (
                    <>
                      <KeyRound size={17} />

                      Update Password
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </>
  );
};

export default Profile;