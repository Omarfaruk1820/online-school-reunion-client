import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FiAlertCircle,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiEdit3,
  FiGlobe,
  FiHome,
  FiLoader,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSave,
  FiShield,
  FiUser,
  FiX,
} from "react-icons/fi";

import useAuth from "../../hooks/useAuth";
import axiosSecure from "../../hooks/axiosSecure";

const EMPTY_PROFILE = {
  name: "",
  email: "",
  phone: "",
  photo: "",
  batch: "",
  className: "",
  department: "",
  profession: "",
  organization: "",
  address: "",
  bio: "",
};

const MAX_LENGTHS = {
  name: 100,
  phone: 11,
  photo: 2000,
  batch: 50,
  className: 50,
  department: 50,
  profession: 100,
  organization: 150,
  address: 300,
  bio: 1000,
};

const DEPARTMENTS = [
  { value: "", label: "Select Department" },
  { value: "science", label: "Science" },
  { value: "commerce", label: "Commerce" },
  { value: "humanities", label: "Humanities" },
  { value: "vocational", label: "Vocational / Technical" },
  { value: "none", label: "No Department" },
];

const normalizeString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const getNestedValue = (object, path, fallback = "") => {
  const value = path.reduce((current, key) => {
    return current?.[key];
  }, object);

  return value ?? fallback;
};

/**
 * Build frontend profile.
 *
 * Priority:
 * 1. Existing MongoDB user profile
 * 2. Reunion registration data
 * 3. Firebase authenticated user
 */
const buildProfileFromData = (userData, registrationInfo, authUser) => {
  const userProfile = userData?.profile || {};

  const registration = registrationInfo?.registration || null;

  const participant = registration?.participant || {};

  const schoolInfo = registration?.schoolInfo || {};

  const registrationAddress = [
    normalizeString(participant?.district),
    normalizeString(participant?.city),
  ]
    .filter(Boolean)
    .join(", ");

  const batchYear =
    schoolInfo?.batchYear !== undefined && schoolInfo?.batchYear !== null
      ? String(schoolInfo.batchYear)
      : "";

  const classLevel = normalizeString(schoolInfo?.classLevel);

  return {
    name:
      normalizeString(userData?.name) ||
      normalizeString(participant?.name) ||
      normalizeString(authUser?.displayName),

    email:
      normalizeString(userData?.email) ||
      normalizeString(participant?.email) ||
      normalizeString(authUser?.email),

    phone:
      normalizeString(userData?.phone) || normalizeString(participant?.phone),

    photo:
      normalizeString(userData?.photo) || normalizeString(authUser?.photoURL),

    batch: normalizeString(userProfile?.batch) || batchYear,

    className:
      normalizeString(userProfile?.className) ||
      (classLevel ? `Class ${classLevel}` : ""),

    department:
      normalizeString(userProfile?.department) ||
      normalizeString(schoolInfo?.department),

    profession: normalizeString(userProfile?.profession),

    organization: normalizeString(userProfile?.organization),

    address: normalizeString(userProfile?.address) || registrationAddress,

    bio: normalizeString(userProfile?.bio),
  };
};

const formatDepartment = (department) => {
  if (!department) return "Not specified";

  const departmentMap = {
    science: "Science",
    commerce: "Commerce",
    humanities: "Humanities",
    vocational: "Vocational / Technical",
    none: "No Department",
  };

  return (
    departmentMap[department] ||
    department.charAt(0).toUpperCase() + department.slice(1)
  );
};

const formatStudentType = (type) => {
  if (!type) return "Not specified";

  if (type === "current") return "Current Student";
  if (type === "alumni") return "Alumni";

  return type;
};

const formatPaymentStatus = (status) => {
  if (!status || status === "not-required") {
    return "Not Required";
  }

  if (status === "paid") return "Paid";
  if (status === "pending") return "Pending";
  if (status === "failed") return "Failed";

  return status;
};

const formatRegistrationStatus = (status) => {
  if (!status) return "Unknown";

  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getStatusClasses = (status) => {
  if (status === "confirmed") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "cancelled") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (status === "pending") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-slate-50 text-slate-700 border-slate-200";
};

function FieldLabel({ icon: Icon, children, required = false }) {
  return (
    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
      <Icon className="text-slate-500" size={16} />
      <span>{children}</span>

      {required && <span className="text-red-500">*</span>}
    </label>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-slate-700">
          {value || "Not specified"}
        </p>
      </div>
    </div>
  );
}

export default function MyProfile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(EMPTY_PROFILE);

  const [originalProfile, setOriginalProfile] = useState(EMPTY_PROFILE);

  const [registrationData, setRegistrationData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const registration = registrationData?.registration || null;

  const event = registrationData?.event || null;

  const giftPackage = registrationData?.giftPackage || null;

  const participant = registration?.participant || {};

  const schoolInfo = registration?.schoolInfo || {};

  const reunion = registration?.reunion || {};

  /**
   * Profile completion calculation.
   */
  const profileCompletion = useMemo(() => {
    const fields = [
      profile.name,
      profile.email,
      profile.phone,
      profile.photo,
      profile.batch,
      profile.className,
      profile.department,
      profile.profession,
      profile.organization,
      profile.address,
      profile.bio,
    ];

    const completed = fields.filter((field) => normalizeString(field)).length;

    return Math.round((completed / fields.length) * 100);
  }, [profile]);

  /**
   * Load MongoDB profile + reunion registration.
   */
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadProfileData = async () => {
      setLoading(true);

      try {
        const [profileResponse, registrationResponse] = await Promise.all([
          axiosSecure.get("/api/auth/me"),

          axiosSecure
            .get("/api/registrations/my-registration")
            .catch((error) => {
              /**
               * 404 simply means the user has not
               * registered for the reunion yet.
               */
              if (error?.response?.status === 404) {
                return null;
              }

              throw error;
            }),
        ]);

        if (!isMounted) return;

        const userData = profileResponse?.data?.user || null;

        let registrationInfo = null;

        if (
          registrationResponse?.data?.success &&
          registrationResponse?.data?.data
        ) {
          registrationInfo = {
            registration: registrationResponse.data.data,

            event: registrationResponse.data.event || null,

            giftPackage: registrationResponse.data.giftPackage || null,
          };
        }

        setRegistrationData(registrationInfo);

        const mappedProfile = buildProfileFromData(
          userData,
          registrationInfo,
          user,
        );

        setProfile(mappedProfile);
        setOriginalProfile(mappedProfile);
      } catch (error) {
        console.error("Failed to load profile data:", error);

        if (!isMounted) return;

        toast.error(
          error?.response?.data?.message ||
            "Failed to load profile information.",
        );

        /**
         * Even if API loading fails, show Firebase
         * information instead of an empty screen.
         */
        const fallbackProfile = buildProfileFromData(
          {
            name: user?.displayName || "",
            email: user?.email || "",
            photo: user?.photoURL || "",
            profile: {},
          },
          null,
          user,
        );

        setProfile(fallbackProfile);
        setOriginalProfile(fallbackProfile);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setEditing(false);
  };

  const validateProfile = () => {
    const name = normalizeString(profile.name);
    const phone = normalizeString(profile.phone);
    const photo = normalizeString(profile.photo);
    const batch = normalizeString(profile.batch);
    const className = normalizeString(profile.className);
    const department = normalizeString(profile.department);
    const profession = normalizeString(profile.profession);
    const organization = normalizeString(profile.organization);
    const address = normalizeString(profile.address);
    const bio = normalizeString(profile.bio);

    if (!name) {
      toast.error("Full name is required.");
      return false;
    }

    if (name.length > MAX_LENGTHS.name) {
      toast.error(`Name cannot exceed ${MAX_LENGTHS.name} characters.`);
      return false;
    }

    if (phone && !/^01[3-9]\d{8}$/.test(phone)) {
      toast.error("Please enter a valid Bangladesh phone number.");
      return false;
    }

    if (phone.length > MAX_LENGTHS.phone) {
      toast.error(
        `Phone number cannot exceed ${MAX_LENGTHS.phone} characters.`,
      );
      return false;
    }

    if (photo.length > MAX_LENGTHS.photo) {
      toast.error("Photo URL is too long.");
      return false;
    }

    if (batch.length > MAX_LENGTHS.batch) {
      toast.error(`Batch cannot exceed ${MAX_LENGTHS.batch} characters.`);
      return false;
    }

    if (className.length > MAX_LENGTHS.className) {
      toast.error(`Class cannot exceed ${MAX_LENGTHS.className} characters.`);
      return false;
    }

    if (department.length > MAX_LENGTHS.department) {
      toast.error(
        `Department cannot exceed ${MAX_LENGTHS.department} characters.`,
      );
      return false;
    }

    if (profession.length > MAX_LENGTHS.profession) {
      toast.error(
        `Profession cannot exceed ${MAX_LENGTHS.profession} characters.`,
      );
      return false;
    }

    if (organization.length > MAX_LENGTHS.organization) {
      toast.error(
        `Organization cannot exceed ${MAX_LENGTHS.organization} characters.`,
      );
      return false;
    }

    if (address.length > MAX_LENGTHS.address) {
      toast.error(`Address cannot exceed ${MAX_LENGTHS.address} characters.`);
      return false;
    }

    if (bio.length > MAX_LENGTHS.bio) {
      toast.error(`Bio cannot exceed ${MAX_LENGTHS.bio} characters.`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateProfile()) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: normalizeString(profile.name),

        phone: normalizeString(profile.phone) || null,

        photo: normalizeString(profile.photo) || null,

        profile: {
          batch: normalizeString(profile.batch),

          className: normalizeString(profile.className),

          department: normalizeString(profile.department),

          profession: normalizeString(profile.profession),

          organization: normalizeString(profile.organization),

          address: normalizeString(profile.address),

          bio: normalizeString(profile.bio),
        },
      };

      const response = await axiosSecure.patch("/api/auth/me", payload);

      const updatedUser = response?.data?.user || null;

      /**
       * Rebuild profile after save.
       *
       * Registration data remains fallback data,
       * while saved MongoDB profile values get priority.
       */
      const updatedProfile = buildProfileFromData(
        updatedUser,
        registrationData,
        user,
      );

      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      setEditing(false);

      toast.success(response?.data?.message || "Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error);

      toast.error(
        error?.response?.data?.message || "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <FiLoader className="mx-auto animate-spin text-slate-600" size={34} />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                <FiUser size={16} />
                <span>My Account</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                My Profile
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Manage your personal information, reunion details, and account
                profile.
              </p>
            </div>

            {!editing ? (
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <FiEdit3 size={17} />
                Edit Profile
              </button>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiX size={17} />
                  Cancel
                </button>

                <button
                  type="submit"
                  form="profile-form"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <FiLoader className="animate-spin" size={17} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave size={17} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Registration Notice */}
        {registration && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <FiCheckCircle size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-emerald-900">
                  Reunion registration found
                </h2>

                <p className="mt-1 text-sm leading-6 text-emerald-800">
                  Your profile has been pre-filled using your account and
                  reunion registration information.
                </p>
              </div>
            </div>
          </div>
        )}

        {!registration && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <FiAlertCircle size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-amber-900">
                  No reunion registration found
                </h2>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Your profile can still be updated. Reunion information will
                  appear here after you complete registration.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Profile Form */}
          <div className="lg:col-span-2">
            <form
              id="profile-form"
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Profile Header */}
              <div className="border-b border-slate-200 px-5 py-6 sm:px-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative">
                    {profile.photo ? (
                      <img
                        src={profile.photo}
                        alt={profile.name || "Profile"}
                        className="h-24 w-24 rounded-2xl border border-slate-200 object-cover shadow-sm"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                        <FiUser size={38} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-slate-900">
                      {profile.name || "Your Profile"}
                    </h2>

                    <p className="mt-1 break-all text-sm text-slate-500">
                      {profile.email || user?.email || "No email"}
                    </p>

                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      <FiShield size={13} />
                      {user?.emailVerified ? "Verified Account" : "Account"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="space-y-8 p-5 sm:p-7">
                {/* Personal Information */}
                <section>
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-slate-900">
                      Personal Information
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Keep your personal information accurate and up to date.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Name */}
                    <div>
                      <FieldLabel icon={FiUser} required>
                        Full Name
                      </FieldLabel>

                      <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        disabled={!editing}
                        maxLength={MAX_LENGTHS.name}
                        placeholder="Enter your full name"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600"
                      />

                      {registration?.participant?.name && (
                        <p className="mt-1.5 text-xs text-slate-400">
                          Pre-filled from your account and reunion registration.
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <FieldLabel icon={FiMail}>Email Address</FieldLabel>

                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        disabled
                        readOnly
                        placeholder="Your email address"
                        className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
                      />

                      <p className="mt-1.5 text-xs text-slate-400">
                        Email is managed by your authentication provider.
                      </p>
                    </div>

                    {/* Phone */}
                    <div>
                      <FieldLabel icon={FiPhone}>Phone Number</FieldLabel>

                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        disabled={!editing}
                        maxLength={MAX_LENGTHS.phone}
                        placeholder="01XXXXXXXXX"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600"
                      />

                      {participant?.phone && (
                        <p className="mt-1.5 text-xs text-slate-400">
                          Pre-filled from your reunion registration.
                        </p>
                      )}
                    </div>

                    {/* Photo URL */}
                    <div>
                      <FieldLabel icon={FiGlobe}>Photo URL</FieldLabel>

                      <input
                        type="url"
                        name="photo"
                        value={profile.photo}
                        onChange={handleChange}
                        disabled={!editing}
                        maxLength={MAX_LENGTHS.photo}
                        placeholder="https://example.com/photo.jpg"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>
                  </div>
                </section>

                {/* School Information */}
                <section className="border-t border-slate-100 pt-8">
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-slate-900">
                      School Information
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Your school and reunion-related information.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Batch */}
                    <div>
                      <FieldLabel icon={FiCalendar}>
                        Batch / Passing Year
                      </FieldLabel>

                      <input
                        type="text"
                        name="batch"
                        value={profile.batch}
                        onChange={handleChange}
                        disabled={!editing}
                        maxLength={MAX_LENGTHS.batch}
                        placeholder="e.g. 2013"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600"
                      />

                      {schoolInfo?.batchYear && (
                        <p className="mt-1.5 text-xs text-slate-400">
                          Pre-filled from your reunion registration.
                        </p>
                      )}
                    </div>

                    {/* Class */}
                    <div>
                      <FieldLabel icon={FiUser}>Class</FieldLabel>

                      <input
                        type="text"
                        name="className"
                        value={profile.className}
                        onChange={handleChange}
                        disabled={!editing}
                        maxLength={MAX_LENGTHS.className}
                        placeholder="e.g. Class 10"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600"
                      />

                      {schoolInfo?.classLevel && (
                        <p className="mt-1.5 text-xs text-slate-400">
                          Pre-filled from your reunion registration.
                        </p>
                      )}
                    </div>

                    {/* Department */}
                    <div>
                      <FieldLabel icon={FiBriefcase}>Department</FieldLabel>

                      <select
                        name="department"
                        value={profile.department}
                        onChange={handleChange}
                        disabled={!editing}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600"
                      >
                        {DEPARTMENTS.map((department) => (
                          <option
                            key={department.value}
                            value={department.value}
                          >
                            {department.label}
                          </option>
                        ))}
                      </select>

                      {schoolInfo?.department && (
                        <p className="mt-1.5 text-xs text-slate-400">
                          Pre-filled from your reunion registration.
                        </p>
                      )}
                    </div>

                    {/* Student Type - Read Only */}
                    <div>
                      <FieldLabel icon={FiUser}>Student Type</FieldLabel>

                      <input
                        type="text"
                        value={formatStudentType(schoolInfo?.studentType)}
                        disabled
                        readOnly
                        className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
                      />

                      <p className="mt-1.5 text-xs text-slate-400">
                        Based on your reunion registration.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Professional Information */}
                <section className="border-t border-slate-100 pt-8">
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-slate-900">
                      Professional Information
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Tell other reunion members about your current professional
                      journey.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Profession */}
                    <div>
                      <FieldLabel icon={FiBriefcase}>Profession</FieldLabel>

                      <input
                        type="text"
                        name="profession"
                        value={profile.profession}
                        onChange={handleChange}
                        disabled={!editing}
                        maxLength={MAX_LENGTHS.profession}
                        placeholder="e.g. Software Engineer"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>

                    {/* Organization */}
                    <div>
                      <FieldLabel icon={FiHome}>
                        Current Organization
                      </FieldLabel>

                      <input
                        type="text"
                        name="organization"
                        value={profile.organization}
                        onChange={handleChange}
                        disabled={!editing}
                        maxLength={MAX_LENGTHS.organization}
                        placeholder="Company / Organization"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>
                  </div>
                </section>

                {/* Location */}
                <section className="border-t border-slate-100 pt-8">
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-slate-900">
                      Location
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Your current address or location.
                    </p>
                  </div>

                  <div>
                    <FieldLabel icon={FiMapPin}>Address</FieldLabel>

                    <textarea
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      disabled={!editing}
                      maxLength={MAX_LENGTHS.address}
                      rows={3}
                      placeholder="Enter your current address"
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600"
                    />

                    {registration?.participant?.district && (
                      <p className="mt-1.5 text-xs text-slate-400">
                        Pre-filled from your reunion registration location.
                      </p>
                    )}
                  </div>
                </section>

                {/* Bio */}
                <section className="border-t border-slate-100 pt-8">
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-slate-900">
                      About You
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      A short introduction about yourself.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Bio
                    </label>

                    <textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleChange}
                      disabled={!editing}
                      maxLength={MAX_LENGTHS.bio}
                      rows={5}
                      placeholder="Write something about yourself..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600"
                    />

                    <div className="mt-2 flex justify-end">
                      <span className="text-xs text-slate-400">
                        {profile.bio.length}/{MAX_LENGTHS.bio}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Save button for mobile / bottom */}
                {editing && (
                  <div className="border-t border-slate-100 pt-6">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <FiX size={17} />
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <FiLoader className="animate-spin" size={17} />
                            Saving...
                          </>
                        ) : (
                          <>
                            <FiSave size={17} />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Profile Completion
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Keep your profile complete.
                  </p>
                </div>

                <span className="text-lg font-bold text-slate-900">
                  {profileCompletion}%
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-800 transition-all duration-500"
                  style={{
                    width: `${profileCompletion}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                {profileCompletion === 100
                  ? "Your profile is complete."
                  : "Complete the remaining fields to make your profile more useful."}
              </p>
            </div>

            {/* Reunion Information */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="font-bold text-slate-900">
                  Reunion Information
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Your registration snapshot.
                </p>
              </div>

              {registration ? (
                <div className="space-y-5 p-5">
                  {/* Registration ID */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Registration ID
                    </p>

                    <p className="mt-1 break-all font-mono text-sm font-bold text-slate-800">
                      {registration.registrationId || "N/A"}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Status
                    </p>

                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                        registration.status,
                      )}`}
                    >
                      {formatRegistrationStatus(registration.status)}
                    </span>
                  </div>

                  {/* Event */}
                  <InfoItem
                    icon={FiCalendar}
                    label="Event"
                    value={
                      event?.title ||
                      reunion?.eventTitle ||
                      "Grand School Reunion 2027"
                    }
                  />

                  {/* Student Type */}
                  <InfoItem
                    icon={FiUser}
                    label="Student Type"
                    value={formatStudentType(schoolInfo?.studentType)}
                  />

                  {/* Batch */}
                  <InfoItem
                    icon={FiCalendar}
                    label="Batch"
                    value={
                      schoolInfo?.batchYear
                        ? String(schoolInfo.batchYear)
                        : "Not specified"
                    }
                  />

                  {/* Class */}
                  <InfoItem
                    icon={FiUser}
                    label="Class"
                    value={
                      schoolInfo?.classLevel
                        ? `Class ${schoolInfo.classLevel}`
                        : "Not specified"
                    }
                  />

                  {/* Department */}
                  <InfoItem
                    icon={FiBriefcase}
                    label="Department"
                    value={formatDepartment(schoolInfo?.department)}
                  />

                  {/* T-Shirt */}
                  <InfoItem
                    icon={FiUser}
                    label="T-Shirt Size"
                    value={reunion?.tShirt?.size || "Not specified"}
                  />

                  {/* Payment */}
                  <InfoItem
                    icon={FiShield}
                    label="Payment"
                    value={formatPaymentStatus(registration.paymentStatus)}
                  />
                </div>
              ) : (
                <div className="p-5">
                  <div className="rounded-xl bg-slate-50 p-4 text-center">
                    <FiAlertCircle
                      className="mx-auto text-slate-400"
                      size={26}
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No registration yet
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your reunion registration information will appear here
                      after registration.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Gift Package */}
            {registration && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-slate-900">Reunion Package</h3>

                <p className="mt-1 text-xs text-slate-500">
                  Your registered gift package.
                </p>

                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-800">
                    {giftPackage?.name ||
                      reunion?.packageName ||
                      "General Reunion Package"}
                  </p>

                  {Array.isArray(giftPackage?.items) &&
                    giftPackage.items.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {giftPackage.items.map((item, index) => (
                          <li
                            key={`${item}-${index}`}
                            className="flex items-start gap-2 text-xs text-slate-600"
                          >
                            <FiCheckCircle
                              className="mt-0.5 shrink-0 text-emerald-500"
                              size={14}
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                  {reunion?.tShirt?.size && (
                    <div className="mt-4 border-t border-slate-200 pt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">T-Shirt Size</span>

                        <span className="font-bold text-slate-800">
                          {reunion.tShirt.size}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Account Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-slate-900">Account Information</h3>

              <div className="mt-4 space-y-4">
                <InfoItem
                  icon={FiMail}
                  label="Email"
                  value={profile.email || user?.email}
                />

                <InfoItem
                  icon={FiShield}
                  label="Email Status"
                  value={user?.emailVerified ? "Verified" : "Not verified"}
                />

                {user?.providerId && (
                  <InfoItem
                    icon={FiGlobe}
                    label="Provider"
                    value={user.providerId}
                  />
                )}
              </div>
            </div>

            {/* Profile Tip */}
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <FiCheckCircle size={18} />
                </div>

                <div>
                  <h3 className="font-semibold">Profile Tip</h3>

                  <p className="mt-1.5 text-xs leading-5 text-slate-300">
                    Keep your phone number, profession, organization and address
                    updated so reunion organizers can maintain accurate records.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
