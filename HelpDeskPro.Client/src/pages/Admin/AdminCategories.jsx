import React, { useEffect, useState } from "react";
import api from "../../services/api";

const AdminCategories = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add Category Modal
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);

  // =====================================================
  // GET ALL CATEGORIES
  // =====================================================

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/Categories");

      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD CATEGORIES WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    fetchCategories();
  }, []);

  // =====================================================
  // SEARCH + STATUS FILTER
  // =====================================================

  const filteredCategories = categories.filter((category) => {
    const name = category.name || "";
    const description = category.description || "";

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" &&
        category.isActive === true) ||
      (statusFilter === "Inactive" &&
        category.isActive === false);

    return matchesSearch && matchesStatus;
  });

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalCategories = categories.length;

  const activeCategories = categories.filter(
    (category) => category.isActive === true
  ).length;

  const inactiveCategories = categories.filter(
    (category) => category.isActive === false
  ).length;

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // OPEN ADD CATEGORY MODAL
  // =====================================================

  const openAddModal = () => {
    setFormData({
      name: "",
      description: "",
    });

    setShowAddModal(true);
  };

  // =====================================================
  // CLOSE ADD CATEGORY MODAL
  // =====================================================

  const closeAddModal = () => {
    if (submitting) {
      return;
    }

    setShowAddModal(false);

    setFormData({
      name: "",
      description: "",
    });
  };

  // =====================================================
  // CREATE CATEGORY
  // =====================================================

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a category name.");
      return;
    }

    try {
      setSubmitting(true);

      // Matches CreateCategoryDto exactly
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      };

      console.log("Creating category:", categoryData);

      await api.post("/Categories", categoryData);

      alert("Category created successfully.");

      // Close modal
      setShowAddModal(false);

      // Reset form
      setFormData({
        name: "",
        description: "",
      });

      // Refresh categories
      await fetchCategories();
    } catch (err) {
      console.error("Error creating category:", err);

      alert(
        err.response?.data?.message ||
          "Failed to create category."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // TOGGLE CATEGORY STATUS
  // =====================================================

  const handleToggleStatus = async (category) => {
    const action = category.isActive
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.patch(
        `/Categories/${category.id}/status`
      );

      await fetchCategories();
    } catch (err) {
      console.error(
        "Error updating category status:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to update category status."
      );
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Category Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage ticket categories and their status.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
        >
          <span className="text-lg">+</span>
          Add Category
        </button>

      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* Total */}
        <div className="rounded-xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Categories
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-800">
                {totalCategories}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl">
              📁
            </div>

          </div>

        </div>

        {/* Active */}
        <div className="rounded-xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Active Categories
              </p>

              <h2 className="mt-2 text-2xl font-bold text-green-600">
                {activeCategories}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
              ✓
            </div>

          </div>

        </div>

        {/* Inactive */}
        <div className="rounded-xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Inactive Categories
              </p>

              <h2 className="mt-2 text-2xl font-bold text-red-600">
                {inactiveCategories}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl">
              !
            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          SEARCH + FILTER
      ================================================= */}

      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-4 md:flex-row">

          {/* Search */}
          <div className="flex-1">

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search categories..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* Status Filter */}
          <div className="md:w-48">

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >

              <option value="All">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* =================================================
          CATEGORY TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[750px]">

            <thead className="border-b bg-gray-50">

              <tr>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Category
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Description
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {/* Loading */}
              {loading && (
                <tr>

                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Loading categories...
                  </td>

                </tr>
              )}

              {/* No Categories */}
              {!loading &&
                filteredCategories.length === 0 && (
                  <tr>

                    <td
                      colSpan="4"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No categories found.
                    </td>

                  </tr>
                )}

              {/* Categories */}
              {!loading &&
                filteredCategories.map((category) => (

                  <tr
                    key={category.id}
                    className="transition hover:bg-gray-50"
                  >

                    {/* Category */}
                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 font-semibold text-blue-600">
                          {category.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <p className="font-medium text-gray-800">
                            {category.name}
                          </p>

                          <p className="text-xs text-gray-400">
                            ID: {category.id}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* Description */}
                    <td className="px-6 py-4 text-sm text-gray-600">

                      {category.description ||
                        "No description"}

                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">

                      {category.isActive ? (

                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>

                      ) : (

                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          Inactive
                        </span>

                      )}

                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">

                      <div className="flex justify-end">

                        <button
                          onClick={() =>
                            handleToggleStatus(category)
                          }
                          className={
                            category.isActive
                              ? "rounded-lg border border-orange-200 px-3 py-1.5 text-sm font-medium text-orange-600 transition hover:bg-orange-50"
                              : "rounded-lg border border-green-200 px-3 py-1.5 text-sm font-medium text-green-600 transition hover:bg-green-50"
                          }
                        >
                          {category.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          ADD CATEGORY MODAL
      ================================================= */}

      {showAddModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  Add New Category
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create a new ticket category.
                </p>

              </div>

              <button
                onClick={closeAddModal}
                disabled={submitting}
                className="text-2xl text-gray-400 transition hover:text-gray-600 disabled:cursor-not-allowed"
              >
                ×
              </button>

            </div>

            {/* Form */}
            <form
              onSubmit={handleAddCategory}
              className="space-y-5 p-6"
            >

              {/* Category Name */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Hardware"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />

              </div>

              {/* Description */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter category description"
                  rows="4"
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t pt-5">

                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={submitting}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Creating..."
                    : "Create Category"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default AdminCategories;