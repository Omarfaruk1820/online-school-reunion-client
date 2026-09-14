import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiEye,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiHash,
  FiUser,
  FiBookOpen,
  FiX,
  FiMoreVertical,
} from "react-icons/fi";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hooks/axiosSecure";
import useAuth from "../../hooks/useAuth";

const Registrations = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // --------------------------------------------------
  // States
  // --------------------------------------------------

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [department, setDepartment] = useState("all");
  const [batch, setBatch] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;

  // --------------------------------------------------
  // Fetch registrations
  // --------------------------------------------------

  const {
    data: registrationResponse = {},
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [
      "reunion-registrations",
      search,
      status,
      department,
      batch,
      currentPage,
    ],

    queryFn: async () => {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (status !== "all") {
        params.append("status", status);
      }

      if (department !== "all") {
        params.append("department", department);
      }

      if (batch !== "all") {
        params.append("batch", batch);
      }

      params.append("page", currentPage);
      params.append("limit", itemsPerPage);

      const response = await axiosSecure.get(
        `/reunion-registrations?${params.toString()}`,
      );

      return response.data;
    },

    keepPreviousData: true,
  });

  // --------------------------------------------------
  // Normalize API response
  // --------------------------------------------------

  const registrations = registrationResponse?.registrations || [];
  const totalRegistrations =
    registrationResponse?.total || registrations.length;

  const totalPages =
    registrationResponse?.totalPages ||
    Math.ceil(totalRegistrations / itemsPerPage);

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------

  const statistics = useMemo(() => {
    return {
      total: registrationResponse?.statistics?.total || totalRegistrations,

      confirmed: registrationResponse?.statistics?.confirmed || 0,

      pending: registrationResponse?.statistics?.pending || 0,

      cancelled: registrationResponse?.statistics?.cancelled || 0,
    };
  }, [registrationResponse, totalRegistrations]);

  // --------------------------------------------------
  // Update registration status
  // --------------------------------------------------

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      const response = await axiosSecure.patch(
        `/reunion-registrations/${id}/status`,
        {
          status: newStatus,
        },
      );

      return response.data;
    },

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reunion-registrations"],
      });

      setSelectedRegistration(null);

      toast.success(
        `Registration ${
          variables.newStatus === "confirmed"
            ? "confirmed"
            : variables.newStatus === "cancelled"
              ? "cancelled"
              : "updated"
        } successfully`,
      );
    },

    onError: (error) => {
      console.error("Registration status update error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to update registration status",
      );
    },
  });

  // --------------------------------------------------
  // Handlers
  // --------------------------------------------------

  const handleStatusChange = (id, newStatus) => {
    if (!id || !newStatus) return;

    updateStatusMutation.mutate({
      id,
      newStatus,
    });
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (event) => {
    setStatus(event.target.value);
    setCurrentPage(1);
  };

  const handleDepartmentFilter = (event) => {
    setDepartment(event.target.value);
    setCurrentPage(1);
  };

  const handleBatchFilter = (event) => {
    setBatch(event.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setDepartment("all");
    setBatch("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search || status !== "all" || department !== "all" || batch !== "all";

  // --------------------------------------------------
  // Status helpers
  // --------------------------------------------------

  const getStatusBadge = (registrationStatus) => {
    const normalizedStatus = registrationStatus?.toLowerCase() || "pending";

    if (normalizedStatus === "confirmed") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
          <FiCheckCircle />
          Confirmed
        </span>
      );
    }

    if (normalizedStatus === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-error/10 px-3 py-1 text-xs font-semibold text-error">
          <FiXCircle />
          Cancelled
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
        <FiClock />
        Pending
      </span>
    );
  };

  // --------------------------------------------------
  // Loading skeleton
  // --------------------------------------------------

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-base-300" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-base-300"
            />
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100">
          <div className="h-16 animate-pulse bg-base-300" />

          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-20 animate-pulse border-t border-base-300 bg-base-200"
            />
          ))}
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (
    <div className="min-h-full space-y-6 pb-10">
      {/* ================================================
          PAGE HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <FiUsers />
            Reunion Management
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
            Registrations
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-base-content/60 sm:text-base">
            Manage and monitor all student and alumni registrations for the
            school reunion.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn btn-outline btn-primary w-full sm:w-auto"
        >
          <FiRefreshCw className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ================================================
          STATISTICS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-base-content/60">
                Total Registrations
              </p>

              <h2 className="mt-2 text-3xl font-bold">{statistics.total}</h2>

              <p className="mt-1 text-xs text-base-content/50">
                All reunion registrations
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl text-primary">
              <FiUsers />
            </div>
          </div>
        </div>

        {/* Confirmed */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-base-content/60">
                Confirmed
              </p>

              <h2 className="mt-2 text-3xl font-bold text-success">
                {statistics.confirmed}
              </h2>

              <p className="mt-1 text-xs text-base-content/50">
                Confirmed participants
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-xl text-success">
              <FiCheckCircle />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-base-content/60">
                Pending
              </p>

              <h2 className="mt-2 text-3xl font-bold text-warning">
                {statistics.pending}
              </h2>

              <p className="mt-1 text-xs text-base-content/50">
                Awaiting confirmation
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 text-xl text-warning">
              <FiClock />
            </div>
          </div>
        </div>

        {/* Cancelled */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-base-content/60">
                Cancelled
              </p>

              <h2 className="mt-2 text-3xl font-bold text-error">
                {statistics.cancelled}
              </h2>

              <p className="mt-1 text-xs text-base-content/50">
                Cancelled registrations
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error/10 text-xl text-error">
              <FiXCircle />
            </div>
          </div>
        </div>
      </div>

      {/* ================================================
          SEARCH & FILTER
      ================================================= */}

      <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" />

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by name, email, phone or registration ID..."
              className="input input-bordered w-full pl-11"
            />
          </div>

          {/* Mobile filter button */}
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="btn btn-outline lg:hidden"
          >
            <FiFilter />
            Filters
          </button>

          {/* Desktop filters */}
          <div
            className={`grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex lg:w-auto ${
              showFilters ? "grid" : "hidden lg:flex"
            }`}
          >
            {/* Status */}
            <select
              value={status}
              onChange={handleStatusFilter}
              className="select select-bordered min-w-36"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Department */}
            <select
              value={department}
              onChange={handleDepartmentFilter}
              className="select select-bordered min-w-40"
            >
              <option value="all">All Departments</option>
              <option value="science">Science</option>
              <option value="commerce">Commerce</option>
              <option value="humanities">Humanities</option>
              <option value="vocational">Vocational</option>
              <option value="technical">Technical</option>
            </select>

            {/* Batch */}
            <select
              value={batch}
              onChange={handleBatchFilter}
              className="select select-bordered min-w-32"
            >
              <option value="all">All Batches</option>
              <option value="ssc">SSC</option>
              <option value="hsc">HSC</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-ghost"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================================================
          ERROR STATE
      ================================================= */}

      {isError && (
        <div className="rounded-2xl border border-error/20 bg-error/5 p-6 text-center">
          <FiXCircle className="mx-auto text-3xl text-error" />

          <h3 className="mt-3 font-semibold">Unable to load registrations</h3>

          <p className="mt-1 text-sm text-base-content/60">
            Something went wrong while loading reunion registrations.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-error btn-sm mt-4"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ================================================
          DESKTOP TABLE
      ================================================= */}

      {!isError && (
        <div className="hidden overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm lg:block">
          {/* Table Header */}
          <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
            <div>
              <h2 className="font-semibold">Registration List</h2>

              <p className="mt-0.5 text-xs text-base-content/50">
                Showing {registrations.length} of {totalRegistrations}{" "}
                registrations
              </p>
            </div>

            {isFetching && (
              <span className="loading loading-spinner loading-sm text-primary" />
            )}
          </div>

          {registrations.length === 0 ? (
            <EmptyState clearFilters={clearFilters} />
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr className="bg-base-200/50">
                    <th>Participant</th>
                    <th>Registration ID</th>
                    <th>Batch / Department</th>
                    <th>Registration Date</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {registrations.map((registration) => (
                    <RegistrationRow
                      key={registration._id}
                      registration={registration}
                      onView={() => setSelectedRegistration(registration)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {registrations.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {/* ================================================
          MOBILE / TABLET CARDS
      ================================================= */}

      {!isError && (
        <div className="space-y-4 lg:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Registration List</h2>

              <p className="text-xs text-base-content/50">
                {totalRegistrations} total registrations
              </p>
            </div>

            {isFetching && (
              <span className="loading loading-spinner loading-sm text-primary" />
            )}
          </div>

          {registrations.length === 0 ? (
            <EmptyState clearFilters={clearFilters} />
          ) : (
            <div className="space-y-3">
              {registrations.map((registration) => (
                <MobileRegistrationCard
                  key={registration._id}
                  registration={registration}
                  onView={() => setSelectedRegistration(registration)}
                />
              ))}
            </div>
          )}

          {registrations.length > 0 && (
            <div className="rounded-2xl border border-base-300 bg-base-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      {/* ================================================
          DETAILS MODAL
      ================================================= */}

      {selectedRegistration && (
        <RegistrationDetailsModal
          registration={selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
          onStatusChange={handleStatusChange}
          isUpdating={updateStatusMutation.isPending}
        />
      )}
    </div>
  );
};

// ======================================================
// Desktop Registration Row
// ======================================================

const RegistrationRow = ({ registration, onView }) => {
  const participantName =
    registration?.name ||
    registration?.fullName ||
    registration?.userName ||
    "Unknown Participant";

  const email = registration?.email || "No email";

  const registrationId =
    registration?.registrationId ||
    registration?._id?.slice(-8).toUpperCase() ||
    "N/A";

  const batch = registration?.batch || "N/A";

  const department = registration?.department || "General";

  const date = registration?.createdAt
    ? new Date(registration.createdAt).toLocaleDateString("en-BD", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  return (
    <tr className="hover:bg-base-200/40">
      {/* Participant */}
      <td>
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              {registration?.photo || registration?.photoURL ? (
                <img
                  src={registration.photo || registration.photoURL}
                  alt={participantName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <FiUser />
              )}
            </div>
          </div>

          <div>
            <p className="font-semibold">{participantName}</p>

            <p className="text-xs text-base-content/50">{email}</p>
          </div>
        </div>
      </td>

      {/* Registration ID */}
      <td>
        <span className="font-mono text-sm font-medium">#{registrationId}</span>
      </td>

      {/* Batch */}
      <td>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{batch}</span>

          <span className="text-xs capitalize text-base-content/50">
            {department}
          </span>
        </div>
      </td>

      {/* Date */}
      <td>
        <span className="text-sm text-base-content/70">{date}</span>
      </td>

      {/* Status */}
      <td>
        <StatusBadge status={registration?.status} />
      </td>

      {/* Action */}
      <td>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onView}
            className="btn btn-ghost btn-sm"
            aria-label={`View registration of ${participantName}`}
          >
            <FiEye />
            View
          </button>
        </div>
      </td>
    </tr>
  );
};

// ======================================================
// Mobile Registration Card
// ======================================================

const MobileRegistrationCard = ({ registration, onView }) => {
  const participantName =
    registration?.name ||
    registration?.fullName ||
    registration?.userName ||
    "Unknown Participant";

  const email = registration?.email || "No email";

  const registrationId =
    registration?.registrationId ||
    registration?._id?.slice(-8).toUpperCase() ||
    "N/A";

  const date = registration?.createdAt
    ? new Date(registration.createdAt).toLocaleDateString("en-BD", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="avatar placeholder shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              {registration?.photo || registration?.photoURL ? (
                <img
                  src={registration.photo || registration.photoURL}
                  alt={participantName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <FiUser />
              )}
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold">{participantName}</h3>

            <p className="truncate text-xs text-base-content/50">{email}</p>
          </div>
        </div>

        <StatusBadge status={registration?.status} />
      </div>

      <div className="my-4 grid grid-cols-2 gap-3 border-y border-base-300 py-3">
        <InfoItem
          icon={<FiHash />}
          label="Registration"
          value={`#${registrationId}`}
        />

        <InfoItem icon={<FiCalendar />} label="Registered" value={date} />

        <InfoItem
          icon={<FiBookOpen />}
          label="Batch"
          value={registration?.batch || "N/A"}
        />

        <InfoItem
          icon={<FiUsers />}
          label="Department"
          value={registration?.department || "General"}
        />
      </div>

      <button
        type="button"
        onClick={onView}
        className="btn btn-primary btn-sm w-full"
      >
        <FiEye />
        View Registration
      </button>
    </div>
  );
};

// ======================================================
// Status Badge
// ======================================================

const StatusBadge = ({ status }) => {
  const normalizedStatus = status?.toLowerCase() || "pending";

  if (normalizedStatus === "confirmed") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success sm:px-3 sm:text-xs">
        <FiCheckCircle />
        Confirmed
      </span>
    );
  }

  if (normalizedStatus === "cancelled") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-error/10 px-2.5 py-1 text-[11px] font-semibold text-error sm:px-3 sm:text-xs">
        <FiXCircle />
        Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-[11px] font-semibold text-warning sm:px-3 sm:text-xs">
      <FiClock />
      Pending
    </span>
  );
};

// ======================================================
// Info Item
// ======================================================

const InfoItem = ({ icon, label, value }) => {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[11px] text-base-content/45">
        {icon}
        {label}
      </div>

      <p className="mt-1 truncate text-sm font-medium capitalize">{value}</p>
    </div>
  );
};

// ======================================================
// Pagination
// ======================================================

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-base-300 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-base-content/50">
        Page {currentPage} of {totalPages}
      </p>

      <div className="join">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange((page) => Math.max(1, page - 1))}
          className="btn btn-sm join-item"
          aria-label="Previous page"
        >
          <FiChevronLeft />
        </button>

        {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
          let pageNumber;

          if (totalPages <= 5) {
            pageNumber = index + 1;
          } else if (currentPage <= 3) {
            pageNumber = index + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNumber = totalPages - 4 + index;
          } else {
            pageNumber = currentPage - 2 + index;
          }

          return (
            <button
              type="button"
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`btn btn-sm join-item ${
                currentPage === pageNumber ? "btn-primary" : ""
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange((page) => Math.min(totalPages, page + 1))}
          className="btn btn-sm join-item"
          aria-label="Next page"
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

// ======================================================
// Empty State
// ======================================================

const EmptyState = ({ clearFilters }) => {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-base-200 text-2xl text-base-content/40">
        <FiUsers />
      </div>

      <h3 className="mt-4 text-lg font-semibold">No registrations found</h3>

      <p className="mx-auto mt-1 max-w-md text-sm text-base-content/50">
        There are no reunion registrations matching your current search or
        filters.
      </p>

      <button
        type="button"
        onClick={clearFilters}
        className="btn btn-primary btn-sm mt-5"
      >
        Clear Filters
      </button>
    </div>
  );
};

// ======================================================
// Registration Details Modal
// ======================================================

const RegistrationDetailsModal = ({
  registration,
  onClose,
  onStatusChange,
  isUpdating,
}) => {
  const participantName =
    registration?.name ||
    registration?.fullName ||
    registration?.userName ||
    "Unknown Participant";

  const registrationId =
    registration?.registrationId ||
    registration?._id?.slice(-8).toUpperCase() ||
    "N/A";

  const currentStatus = registration?.status?.toLowerCase() || "pending";

  const createdDate = registration?.createdAt
    ? new Date(registration.createdAt).toLocaleString("en-BD", {
        dateStyle: "long",
        timeStyle: "short",
      })
    : "N/A";

  return (
    <dialog open className="modal modal-bottom sm:modal-middle">
      <div className="modal-box max-w-3xl p-0">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-base-300 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl text-primary">
              {registration?.photo || registration?.photoURL ? (
                <img
                  src={registration.photo || registration.photoURL}
                  alt={participantName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <FiUser />
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold sm:text-xl">
                {participantName}
              </h3>

              <p className="text-xs text-base-content/50">
                Registration #{registrationId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-circle btn-ghost btn-sm"
            aria-label="Close registration details"
          >
            <FiX />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[65vh] overflow-y-auto p-5 sm:p-6">
          {/* Status */}
          <div className="mb-6 rounded-xl bg-base-200/60 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-base-content/50">
                  Registration Status
                </p>

                <div className="mt-2">
                  <StatusBadge status={currentStatus} />
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs text-base-content/50">Registered on</p>

                <p className="mt-1 text-sm font-medium">{createdDate}</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <DetailsSection title="Participant Information">
            <DetailItem
              icon={<FiUser />}
              label="Full Name"
              value={participantName}
            />

            <DetailItem
              icon={<FiMail />}
              label="Email"
              value={registration?.email || "N/A"}
            />

            <DetailItem
              icon={<FiPhone />}
              label="Phone"
              value={registration?.phone || "N/A"}
            />

            <DetailItem
              icon={<FiMapPin />}
              label="Address"
              value={registration?.address || registration?.location || "N/A"}
            />
          </DetailsSection>

          {/* Academic Information */}
          <DetailsSection title="School Information">
            <DetailItem
              icon={<FiBookOpen />}
              label="Batch"
              value={registration?.batch || "N/A"}
            />

            <DetailItem
              icon={<FiUsers />}
              label="Department"
              value={registration?.department || "General"}
            />

            <DetailItem
              icon={<FiCalendar />}
              label="Year / Session"
              value={
                registration?.session || registration?.passingYear || "N/A"
              }
            />

            <DetailItem
              icon={<FiHash />}
              label="Registration ID"
              value={registrationId}
            />
          </DetailsSection>

          {/* Reunion Information */}
          <DetailsSection title="Reunion Information">
            <DetailItem
              label="Attendance"
              value={
                registration?.attendance || registration?.attending
                  ? "Will Attend"
                  : "Not specified"
              }
            />

            <DetailItem
              label="Guest Count"
              value={registration?.guestCount ?? registration?.guests ?? 0}
            />

            <DetailItem
              label="T-Shirt Size"
              value={
                registration?.tshirtSize || registration?.tShirtSize || "N/A"
              }
            />

            <DetailItem
              label="Gift Package"
              value={registration?.giftPackage || "Standard"}
            />
          </DetailsSection>

          {/* Additional Message */}
          {registration?.message && (
            <DetailsSection title="Additional Message">
              <div className="rounded-xl bg-base-200/60 p-4 text-sm leading-6 text-base-content/70">
                {registration.message}
              </div>
            </DetailsSection>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-base-300 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost order-3 sm:order-1"
              disabled={isUpdating}
            >
              Close
            </button>

            {currentStatus !== "cancelled" && (
              <button
                type="button"
                onClick={() => onStatusChange(registration._id, "cancelled")}
                disabled={isUpdating}
                className="btn btn-outline btn-error order-2"
              >
                {isUpdating ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <FiXCircle />
                )}
                Cancel
              </button>
            )}

            {currentStatus !== "confirmed" && (
              <button
                type="button"
                onClick={() => onStatusChange(registration._id, "confirmed")}
                disabled={isUpdating}
                className="btn btn-success order-1 sm:order-3"
              >
                {isUpdating ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <FiCheckCircle />
                )}
                Confirm Registration
              </button>
            )}
          </div>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button type="button">close</button>
      </form>
    </dialog>
  );
};

// ======================================================
// Details Section
// ======================================================

const DetailsSection = ({ title, children }) => {
  return (
    <section className="mb-6 last:mb-0">
      <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-base-content/50">
        {title}
      </h4>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
};

// ======================================================
// Detail Item
// ======================================================

const DetailItem = ({ icon, label, value }) => {
  return (
    <div className="rounded-xl border border-base-300 bg-base-100 p-3.5">
      <div className="flex items-center gap-2 text-xs text-base-content/45">
        {icon}
        <span>{label}</span>
      </div>

      <p className="mt-1.5 break-words text-sm font-medium">{value}</p>
    </div>
  );
};

export default Registrations;
