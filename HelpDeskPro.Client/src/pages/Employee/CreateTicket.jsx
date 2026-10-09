import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  FileText,
  Loader2,
  Send,
  Tag,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import ticketService from "../../services/ticketService";

function CreateTicket() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    categoryId: "",
  });

  const [categories, setCategories] = useState([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] =
    useState({});

  /* =====================================================
     LOAD CATEGORIES
  ====================================================== */

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      setError("");

      const data =
        await ticketService.getCategories();

      const activeCategories = Array.isArray(data)
        ? data.filter(
            (category) => category.isActive !== false
          )
        : [];

      setCategories(activeCategories);
    } catch (error) {
      console.error(
        "Failed to load categories:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load categories."
      );
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /* =====================================================
     INPUT HANDLER
  ====================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setError("");
  };

  /* =====================================================
     VALIDATION
  ====================================================== */

  const validateForm = () => {
    const errors = {};

    const title = formData.title.trim();
    const description =
      formData.description.trim();

    if (!title) {
      errors.title = "Title is required.";
    } else if (title.length < 3) {
      errors.title =
        "Title must be at least 3 characters.";
    } else if (title.length > 150) {
      errors.title =
        "Title cannot exceed 150 characters.";
    }

    if (!description) {
      errors.description =
        "Description is required.";
    } else if (description.length < 10) {
      errors.description =
        "Description must be at least 10 characters.";
    } else if (description.length > 2000) {
      errors.description =
        "Description cannot exceed 2000 characters.";
    }

    if (!formData.priority) {
      errors.priority =
        "Priority is required.";
    }

    if (!formData.categoryId) {
      errors.categoryId =
        "Please select a category.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* =====================================================
     SUBMIT
  ====================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const ticketData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        categoryId: Number(formData.categoryId),
      };

      const createdTicket =
        await ticketService.createTicket(
          ticketData
        );

      const newTicketId =
        createdTicket?.id ||
        createdTicket?.ticketId;

      if (newTicketId) {
        navigate(`/tickets/${newTicketId}`, {
          replace: true,
        });
      } else {
        navigate("/tickets", {
          replace: true,
        });
      }
    } catch (error) {
      console.error(
        "Failed to create ticket:",
        error
      );

      const apiMessage =
        error.response?.data?.message;

      const validationErrors =
        error.response?.data?.errors;

      if (validationErrors) {
        const formattedErrors = {};

        Object.keys(validationErrors).forEach(
          (key) => {
            const normalizedKey =
              key.charAt(0).toLowerCase() +
              key.slice(1);

            const value =
              validationErrors[key];

            formattedErrors[normalizedKey] =
              Array.isArray(value)
                ? value[0]
                : String(value);
          }
        );

        setFieldErrors(formattedErrors);
      }

      setError(
        apiMessage ||
          "Unable to create the ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     CHARACTER COUNTS
  ====================================================== */

  const titleLength =
    formData.title.length;

  const descriptionLength =
    formData.description.length;

  /* =====================================================
     UI
  ====================================================== */

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* =================================================
          HEADER
      ================================================== */}

      <div>
        <button
          type="button"
          onClick={() => navigate("/tickets")}
          className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to My Tickets
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <FileText size={21} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create Support Ticket
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Describe your issue and our IT support
              team will assist you.
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <XCircle
            size={19}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to create ticket
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* =================================================
          FORM
      ================================================== */}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white shadow-sm"
      >

        {/* Form Header */}

        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Ticket Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Provide enough information so the support
            team can understand your issue.
          </p>
        </div>

        {/* Form Body */}

        <div className="space-y-6 p-6">

          {/* =================================================
              TITLE
          ================================================== */}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="title"
                className="text-sm font-semibold text-slate-800"
              >
                Issue Title
              </label>

              <span className="text-xs text-slate-400">
                {titleLength}/150
              </span>
            </div>

            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              maxLength={150}
              placeholder="e.g. Laptop is not connecting to Wi-Fi"
              className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                fieldErrors.title
                  ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
              }`}
            />

            {fieldErrors.title && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle size={14} />
                {fieldErrors.title}
              </p>
            )}
          </div>

          {/* =================================================
              DESCRIPTION
          ================================================== */}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="description"
                className="text-sm font-semibold text-slate-800"
              >
                Description
              </label>

              <span className="text-xs text-slate-400">
                {descriptionLength}/2000
              </span>
            </div>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={2000}
              rows={7}
              placeholder="Describe what happened, when it started, and any error messages you received..."
              className={`w-full resize-none rounded-xl border px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                fieldErrors.description
                  ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
              }`}
            />

            {fieldErrors.description && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle size={14} />
                {fieldErrors.description}
              </p>
            )}
          </div>

          {/* =================================================
              CATEGORY + PRIORITY
          ================================================== */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            {/* Category */}

            <div>
              <label
                htmlFor="categoryId"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Category
              </label>

              <div className="relative">
                <Tag
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  disabled={loadingCategories}
                  className={`w-full appearance-none rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:ring-4 ${
                    fieldErrors.categoryId
                      ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                  } ${
                    loadingCategories
                      ? "cursor-not-allowed bg-slate-50"
                      : ""
                  }`}
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : "Select a category"}
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {fieldErrors.categoryId && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle size={14} />
                  {fieldErrors.categoryId}
                </p>
              )}
            </div>

            {/* Priority */}

            <div>
              <label
                htmlFor="priority"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Priority
              </label>

              <div className="relative">
                <AlertCircle
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={`w-full appearance-none rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:ring-4 ${
                    fieldErrors.priority
                      ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                  }`}
                >
                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>

                  <option value="Critical">
                    Critical
                  </option>
                </select>
              </div>

              {fieldErrors.priority && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle size={14} />
                  {fieldErrors.priority}
                </p>
              )}
            </div>
          </div>

          {/* =================================================
              INFORMATION BOX
          ================================================== */}

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <FileText
                size={18}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Before submitting
                </p>

                <p className="mt-1 text-sm leading-6 text-blue-700">
                  Please provide clear details about your
                  issue. Include any error messages,
                  affected devices, and steps you have
                  already tried.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            FORM FOOTER
        ================================================== */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/tickets")}
            disabled={submitting}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              submitting ||
              loadingCategories
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Creating Ticket...
              </>
            ) : (
              <>
                <Send size={17} />
                Submit Ticket
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTicket;