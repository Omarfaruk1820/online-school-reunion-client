import { useEffect, useMemo, useState } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiCamera,
  FiEdit3,
  FiSave,
  FiX,
  FiCheckCircle,
  FiUsers,
} from "react-icons/fi";
import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";
import axiosSecure from "../../hooks/axiosSecure";

const emptyProfile = {
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

const Profile = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState(emptyProfile);
  const [originalProfile, setOriginalProfile] = useState(emptyProfile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // =========================================================
  // Convert backend user data into frontend profile structure
  // =========================================================

  const mapUserToProfile = (userData) => {
    const userProfile = userData?.profile || {};

    return {
      name: userData?.name || user?.displayName || "",

      email: userData?.email || user?.email || "",

      phone: userData?.phone || "",

      photo: userData?.photo || user?.photoURL || user?.photo || "",

      batch: userProfile?.batch || "",

      className: userProfile?.className || "",

      department: userProfile?.department || "",

      profession: userProfile?.profession || "",

      organization: userProfile?.organization || "",

      address: userProfile?.address || "",

      bio: userProfile?.bio || "",
    };
  };

  // =========================================================
  // Load user profile
  // =========================================================

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);

        const response = await axiosSecure.get("/api/auth/me");

        const userData = response?.data?.user;

        if (!userData) {
          throw new Error("User information was not found.");
        }

        const mappedProfile = mapUserToProfile(userData);

        if (!isMounted) return;

        setProfile(mappedProfile);
        setOriginalProfile(mappedProfile);
      } catch (error) {
        console.error("Profile loading error:", error);

        if (!isMounted) return;

        toast.error(
          error?.response?.data?.message || "Failed to load profile.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (user) {
      loadProfile();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  // =========================================================
  // Input change
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // Start edit
  // =========================================================

  const handleEdit = () => {
    // Restore saved values before entering edit mode.
    // Therefore inputs will never start blank.
    setProfile({
      ...originalProfile,
    });

    setEditing(true);
  };

  // =========================================================
  // Cancel edit
  // =========================================================

  const handleCancel = () => {
    setProfile({
      ...originalProfile,
    });

    setEditing(false);
  };

  // =========================================================
  // Bangladesh phone validation
  // =========================================================

  const isValidBangladeshiPhone = (phone) => {
    return /^01[3-9]\d{8}$/.test(phone);
  };

  // =========================================================
  // Save profile
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    const name = profile.name.trim();
    const phone = profile.phone.trim();
    const photo = profile.photo.trim();

    // -------------------------------------------------------
    // Name validation
    // -------------------------------------------------------

    if (!name) {
      toast.error("Name is required.");
      return;
    }

    if (name.length > 100) {
      toast.error("Name must be 100 characters or less.");
      return;
    }

    // -------------------------------------------------------
    // Phone validation
    // -------------------------------------------------------

    if (!phone) {
      toast.error("Phone number is required.");
      return;
    }

    if (!isValidBangladeshiPhone(phone)) {
      toast.error("Enter a valid Bangladeshi phone number.");
      return;
    }

    // -------------------------------------------------------
    // Photo URL validation
    // -------------------------------------------------------

    if (photo) {
      try {
        new URL(photo);
      } catch {
        toast.error("Please enter a valid photo URL.");
        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        name,
        phone,
        photo,

        profile: {
          batch: profile.batch.trim(),

          className: profile.className.trim(),

          department: profile.department.trim(),

          profession: profile.profession.trim(),

          organization: profile.organization.trim(),

          address: profile.address.trim(),

          bio: profile.bio.trim(),
        },
      };

      const response = await axiosSecure.patch("/api/auth/me", payload);

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Profile update failed.");
      }

      const updatedUser = response?.data?.user;

      if (!updatedUser) {
        throw new Error("Updated user data was not returned.");
      }

      // -------------------------------------------------------
      // Immediately update UI with backend data
      // -------------------------------------------------------

      const updatedProfile = mapUserToProfile(updatedUser);

      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);

      setEditing(false);

      toast.success(response?.data?.message || "Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // Profile completion
  // =========================================================

  const completionFields = [
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

  const completedFields = completionFields.filter(
    (value) => String(value || "").trim().length > 0,
  ).length;

  const completionPercentage = useMemo(() => {
    return Math.round((completedFields / completionFields.length) * 100);
  }, [completedFields]);

  // =========================================================
  // Loading screen
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-primary"></span>

          <p className="text-sm text-base-content/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // Main component
  // =========================================================

  return (
    <div className="min-h-screen bg-base-200 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <div className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">My Profile</h1>

          <p className="mt-1 text-sm text-base-content/60">
            Manage your personal information and reunion profile.
          </p>
        </div>

        {/* =====================================================
            PROFILE HEADER CARD
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          {/* Cover */}

          <div className="h-32 bg-gradient-to-r from-primary via-primary to-secondary sm:h-40"></div>

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
              {/* =================================================
                  AVATAR
              ================================================== */}

              <div className="relative w-fit">
                <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-base-100 bg-base-200 shadow-lg sm:h-32 sm:w-32">
                  {profile.photo ? (
                    <img
                      src={profile.photo}
                      alt={profile.name || "Profile"}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FiUser className="text-5xl text-base-content/40" />
                    </div>
                  )}
                </div>

                {editing && (
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("profile-photo")?.focus()
                    }
                    className="btn btn-primary btn-circle btn-sm absolute bottom-1 right-1"
                    title="Change profile photo URL"
                  >
                    <FiCamera />
                  </button>
                )}
              </div>

              {/* =================================================
                  USER INFO
              ================================================== */}

              <div className="flex-1 sm:pb-1">
                <h2 className="text-xl font-bold sm:text-2xl">
                  {profile.name || "Student"}
                </h2>

                <p className="mt-1 text-sm text-base-content/60">
                  {profile.email || "No email available"}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="badge badge-primary badge-outline capitalize">
                    {user?.role || "student"}
                  </span>

                  <span className="badge badge-success badge-outline gap-1">
                    <FiCheckCircle />
                    Active
                  </span>
                </div>
              </div>

              {/* =================================================
                  EDIT BUTTON
              ================================================== */}

              {!editing && (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="btn btn-primary gap-2"
                >
                  <FiEdit3 />
                  Edit Profile
                </button>
              )}

              {editing && (
                <span className="badge badge-info badge-outline px-4 py-3">
                  Editing Profile
                </span>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid gap-6 lg:grid-cols-3"
        >
          {/* ===================================================
              LEFT / MAIN PROFILE FORM
          ==================================================== */}

          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6 lg:col-span-2">
            {/* Section Header */}

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FiUser />
              </div>

              <div>
                <h3 className="font-bold">Personal Information</h3>

                <p className="text-xs text-base-content/50">
                  Your basic account and reunion information
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* =================================================
                  NAME
              ================================================== */}

              <div className="form-control">
                <label htmlFor="profile-name" className="label">
                  <span className="label-text font-medium">Full Name</span>
                </label>

                <input
                  id="profile-name"
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  maxLength={100}
                  placeholder="Enter your full name"
                  className="input input-bordered w-full"
                />
              </div>

              {/* =================================================
                  EMAIL
              ================================================== */}

              <div className="form-control">
                <label htmlFor="profile-email" className="label">
                  <span className="label-text font-medium">Email Address</span>
                </label>

                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-base-content/40" />

                  <input
                    id="profile-email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="input input-bordered w-full pl-10"
                  />
                </div>

                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Email is managed by Firebase authentication.
                  </span>
                </label>
              </div>

              {/* =================================================
                  PHONE
              ================================================== */}

              <div className="form-control">
                <label htmlFor="profile-phone" className="label">
                  <span className="label-text font-medium">Phone Number</span>
                </label>

                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-base-content/40" />

                  <input
                    id="profile-phone"
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={!editing || saving}
                    maxLength={11}
                    placeholder="017XXXXXXXX"
                    className="input input-bordered w-full pl-10"
                  />
                </div>
              </div>

              {/* =================================================
                  PHOTO
              ================================================== */}

              <div className="form-control">
                <label htmlFor="profile-photo" className="label">
                  <span className="label-text font-medium">
                    Profile Photo URL
                  </span>
                </label>

                <input
                  id="profile-photo"
                  type="url"
                  name="photo"
                  value={profile.photo}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  placeholder="https://example.com/photo.jpg"
                  className="input input-bordered w-full"
                />
              </div>

              {/* =================================================
                  BATCH
              ================================================== */}

              <div className="form-control">
                <label htmlFor="profile-batch" className="label">
                  <span className="label-text font-medium">Batch</span>
                </label>

                <div className="relative">
                  <FiUsers className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-base-content/40" />

                  <input
                    id="profile-batch"
                    type="text"
                    name="batch"
                    value={profile.batch}
                    onChange={handleChange}
                    disabled={!editing || saving}
                    placeholder="Example: SSC 2010"
                    className="input input-bordered w-full pl-10"
                  />
                </div>
              </div>

              {/* =================================================
                  CLASS
              ================================================== */}

              <div className="form-control">
                <label htmlFor="profile-class" className="label">
                  <span className="label-text font-medium">Class</span>
                </label>

                <input
                  id="profile-class"
                  type="text"
                  name="className"
                  value={profile.className}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  placeholder="Example: Class 10"
                  className="input input-bordered w-full"
                />
              </div>

              {/* =================================================
                  DEPARTMENT
              ================================================== */}

              <div className="form-control">
                <label htmlFor="profile-department" className="label">
                  <span className="label-text font-medium">Department</span>
                </label>

                <select
                  id="profile-department"
                  name="department"
                  value={profile.department}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  className="select select-bordered w-full"
                >
                  <option value="">Select Department</option>

                  <option value="science">Science</option>

                  <option value="commerce">Commerce</option>

                  <option value="humanities">Humanities</option>

                  <option value="vocational">Vocational / Technical</option>

                  <option value="none">No Department</option>
                </select>
              </div>

              {/* =================================================
                  PROFESSION
              ================================================== */}

              <div className="form-control">
                <label htmlFor="profile-profession" className="label">
                  <span className="label-text font-medium">Profession</span>
                </label>

                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-base-content/40" />

                  <input
                    id="profile-profession"
                    type="text"
                    name="profession"
                    value={profile.profession}
                    onChange={handleChange}
                    disabled={!editing || saving}
                    placeholder="Example: Software Engineer"
                    className="input input-bordered w-full pl-10"
                  />
                </div>
              </div>

              {/* =================================================
                  ORGANIZATION
              ================================================== */}

              <div className="form-control sm:col-span-2">
                <label htmlFor="profile-organization" className="label">
                  <span className="label-text font-medium">
                    Current Organization
                  </span>
                </label>

                <input
                  id="profile-organization"
                  type="text"
                  name="organization"
                  value={profile.organization}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  placeholder="Company / Organization / Business"
                  className="input input-bordered w-full"
                />
              </div>

              {/* =================================================
                  ADDRESS
              ================================================== */}

              <div className="form-control sm:col-span-2">
                <label htmlFor="profile-address" className="label">
                  <span className="label-text font-medium">Address</span>
                </label>

                <div className="relative">
                  <FiMapPin className="absolute left-3 top-3 z-10 text-base-content/40" />

                  <textarea
                    id="profile-address"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    disabled={!editing || saving}
                    rows={3}
                    placeholder="Enter your current address"
                    className="textarea textarea-bordered w-full pl-10"
                  />
                </div>
              </div>

              {/* =================================================
                  BIO
              ================================================== */}

              <div className="form-control sm:col-span-2">
                <label htmlFor="profile-bio" className="label">
                  <span className="label-text font-medium">About Me</span>
                </label>

                <textarea
                  id="profile-bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  rows={4}
                  maxLength={1000}
                  placeholder="Write something about yourself..."
                  className="textarea textarea-bordered w-full"
                />

                {editing && (
                  <label className="label">
                    <span className="label-text-alt text-base-content/50">
                      {profile.bio.length}/1000
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* ==================================================
                SAVE / CANCEL
            =================================================== */}

            {editing && (
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-base-300 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="btn btn-ghost gap-2"
                >
                  <FiX />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary gap-2"
                >
                  {saving ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ===================================================
              RIGHT SIDEBAR
          ==================================================== */}

          <div className="space-y-6">
            {/* =================================================
                ACCOUNT INFORMATION
            ================================================== */}

            <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
              <h3 className="font-bold">Account Information</h3>

              <div className="mt-5 space-y-4">
                {/* Role */}

                <div className="flex items-center justify-between border-b border-base-300 pb-4">
                  <span className="text-sm text-base-content/60">Role</span>

                  <span className="badge badge-primary badge-outline capitalize">
                    {user?.role || "student"}
                  </span>
                </div>

                {/* Status */}

                <div className="flex items-center justify-between border-b border-base-300 pb-4">
                  <span className="text-sm text-base-content/60">Status</span>

                  <span className="badge badge-success gap-1">
                    <FiCheckCircle />
                    Active
                  </span>
                </div>

                {/* Email */}

                <div className="flex items-center justify-between border-b border-base-300 pb-4">
                  <span className="text-sm text-base-content/60">Email</span>

                  <span className="max-w-[170px] truncate text-sm font-medium">
                    {profile.email || "Not available"}
                  </span>
                </div>

                {/* Provider */}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-base-content/60">Provider</span>

                  <span className="text-sm font-medium capitalize">
                    {user?.provider || "Firebase"}
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                PROFILE COMPLETION
            ================================================== */}

            <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
              <h3 className="font-bold">Profile Completion</h3>

              <p className="mt-1 text-xs leading-5 text-base-content/60">
                Complete your profile so classmates can know more about you.
              </p>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {completionPercentage}% Complete
                  </span>

                  <span className="text-xs text-base-content/50">
                    {completedFields}/{completionFields.length}
                  </span>
                </div>

                <progress
                  className="progress progress-primary w-full"
                  value={completionPercentage}
                  max="100"
                ></progress>
              </div>
            </div>

            {/* =================================================
                PROFILE TIP
            ================================================== */}

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FiCheckCircle />
                </div>

                <div>
                  <h3 className="font-semibold">Keep your profile updated</h3>

                  <p className="mt-1 text-xs leading-5 text-base-content/60">
                    Your profile helps former classmates recognize and connect
                    with you during the school reunion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
