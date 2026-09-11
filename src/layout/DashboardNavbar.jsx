import { useEffect, useRef, useState } from "react";

import {
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiUser,
} from "react-icons/fi";

import { NavLink } from "react-router-dom";

import useAuth from "../hooks/useAuth";

const DashboardNavbar = () => {
  const { user, userLogout } = useAuth();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const userMenuRef = useRef(null);

  /* ----------------------------------------
     User Information
  ---------------------------------------- */

  const userName =
    user?.name?.trim() || user?.displayName?.trim() || "School Member";

  const userEmail = user?.email?.trim() || "No email";

  const userPhoto = user?.photo?.trim() || user?.photoURL?.trim() || "";

  const userRole = user?.role?.trim()?.toLowerCase() || "student";

  const formattedRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  const isAdmin = userRole === "admin";

  const dashboardPath = isAdmin ? "/dashboard/admin" : "/dashboard/student";

  const profilePath = "/dashboard/profile";

  const settingsPath = isAdmin
    ? "/dashboard/admin/settings"
    : "/dashboard/settings";

  /* ----------------------------------------
     Close User Menu
  ---------------------------------------- */

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

  /* ----------------------------------------
     Open Mobile Sidebar
  ---------------------------------------- */
  const openMobileSidebar = () => {
    const drawer = document.getElementById("dashboard-drawer");

    if (drawer) {
      drawer.checked = true;
    }
  };

  /* ----------------------------------------
     Logout
  ---------------------------------------- */

  const handleLogout = async () => {
    if (logoutLoading) {
      return;
    }

    try {
      setLogoutLoading(true);

      await userLogout();

      setIsUserMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  /* ----------------------------------------
     Outside Click + Escape
  ---------------------------------------- */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* ----------------------------------------
     Reset Image Error
  ---------------------------------------- */

  useEffect(() => {
    setImageError(false);
  }, [userPhoto]);

  /* ----------------------------------------
     User Avatar
  ---------------------------------------- */

  const UserAvatar = ({ size = "normal" }) => {
    const avatarSize = size === "small" ? "h-8 w-8" : "h-9 w-9 sm:h-10 sm:w-10";

    const iconSize = size === "small" ? "text-sm" : "text-base sm:text-lg";

    if (userPhoto && !imageError) {
      return (
        <img
          src={userPhoto}
          alt={`${userName}'s profile`}
          className={`${avatarSize} rounded-full object-cover`}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      );
    }

    return (
      <div
        className={`flex ${avatarSize} items-center justify-center rounded-full bg-primary text-primary-content`}
      >
        <FiUser className={iconSize} />
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-base-300 bg-base-100/95 backdrop-blur">
      <div className="flex h-16 w-full items-center gap-2 px-3 sm:px-5 lg:px-6 xl:px-8">
        {/* ========================================
            Mobile Menu Button
        ========================================= */}

        <button
          type="button"
          onClick={openMobileSidebar}
          className="btn btn-ghost btn-square flex shrink-0 lg:hidden"
          aria-label="Open dashboard menu"
        >
          <FiMenu className="text-xl sm:text-2xl" />
        </button>

        {/* ========================================
            Dashboard Brand
        ========================================= */}

        <div className="min-w-0 shrink">
          <h1 className="truncate text-base font-bold text-base-content sm:text-lg">
            School Reunion
          </h1>

          <p className="hidden text-xs text-base-content/60 sm:block">
            {formattedRole} Panel
          </p>
        </div>

        {/* ========================================
            Right Side
        ========================================= */}

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          {/* ----------------------------------------
              Notification Button
          ---------------------------------------- */}

          <button
            type="button"
            className="btn btn-ghost btn-circle btn-sm sm:btn-md"
            aria-label="Notifications"
            title="Notifications"
          >
            <FiBell className="text-lg sm:text-xl" />
          </button>

          {/* ----------------------------------------
              User Menu
          ---------------------------------------- */}

          <div ref={userMenuRef} className="relative">
            {/* User Button */}

            <button
              type="button"
              onClick={() => setIsUserMenuOpen((previous) => !previous)}
              className="flex items-center gap-1.5 rounded-xl px-1 py-1.5 transition-colors duration-200 hover:bg-base-200 sm:gap-3 sm:px-2"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
              aria-label="Open user menu"
              title={userName}
            >
              {/* Avatar */}

              <div className="relative shrink-0">
                <div className="avatar">
                  <div className="rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100">
                    <UserAvatar />
                  </div>
                </div>

                {/* Online Status */}

                <span
                  className="
                    absolute
                    bottom-0
                    right-0
                    h-2.5
                    w-2.5
                    rounded-full
                    border-2
                    border-base-100
                    bg-success
                  "
                />
              </div>

              {/* User Details */}

              <div className="hidden min-w-0 text-left sm:block">
                <p className="max-w-28 truncate text-sm font-semibold lg:max-w-36">
                  {userName}
                </p>

                <p className="max-w-32 truncate text-[11px] capitalize text-base-content/60 lg:max-w-40">
                  {formattedRole}
                </p>
              </div>

              {/* Dropdown Arrow */}

              <FiChevronDown
                className={`
                  hidden
                  shrink-0
                  text-base-content/60
                  transition-transform
                  duration-200
                  sm:block
                  ${isUserMenuOpen ? "rotate-180" : ""}
                `}
              />
            </button>

            {/* ========================================
                User Dropdown
            ========================================= */}

            {isUserMenuOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-full
                  z-50
                  mt-2
                  w-[calc(100vw-1.5rem)]
                  max-w-72
                  overflow-hidden
                  rounded-2xl
                  border
                  border-base-300
                  bg-base-100
                  shadow-2xl
                  sm:mt-3
                "
                role="menu"
              >
                {/* ------------------------------------
                    User Header
                ------------------------------------- */}

                <div className="border-b border-base-300 bg-base-200/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      <UserAvatar size="small" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{userName}</p>

                      <p className="truncate text-xs text-base-content/60">
                        {userEmail}
                      </p>

                      <span className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold capitalize text-primary">
                        {formattedRole}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------
                    Menu Links
                ------------------------------------- */}

                <div className="p-2">
                  {/* Dashboard */}

                  <NavLink
                    to={dashboardPath}
                    onClick={closeUserMenu}
                    className={({ isActive }) =>
                      `
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-sm
                      font-medium
                      transition-colors
                      ${
                        isActive
                          ? "bg-primary text-primary-content"
                          : "hover:bg-base-200"
                      }
                      `
                    }
                    role="menuitem"
                  >
                    <FiMenu className="shrink-0 text-lg" />

                    <span>Dashboard</span>
                  </NavLink>

                  {/* My Profile */}

                  <NavLink
                    to={profilePath}
                    onClick={closeUserMenu}
                    className={({ isActive }) =>
                      `
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-sm
                      font-medium
                      transition-colors
                      ${
                        isActive
                          ? "bg-primary text-primary-content"
                          : "hover:bg-base-200"
                      }
                      `
                    }
                    role="menuitem"
                  >
                    <FiUser className="shrink-0 text-lg" />

                    <span>My Profile</span>
                  </NavLink>

                  {/* Settings */}

                  <NavLink
                    to={settingsPath}
                    onClick={closeUserMenu}
                    className={({ isActive }) =>
                      `
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-sm
                      font-medium
                      transition-colors
                      ${
                        isActive
                          ? "bg-primary text-primary-content"
                          : "hover:bg-base-200"
                      }
                      `
                    }
                    role="menuitem"
                  >
                    <FiSettings className="shrink-0 text-lg" />

                    <span>Settings</span>
                  </NavLink>

                  {/* Divider */}

                  <div className="my-1 border-t border-base-300" />

                  {/* Logout */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      font-semibold
                      text-error
                      transition-colors
                      hover:bg-error/10
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                    role="menuitem"
                  >
                    {logoutLoading ? (
                      <span
                        className="
                          h-4
                          w-4
                          shrink-0
                          animate-spin
                          rounded-full
                          border-2
                          border-error/30
                          border-t-error
                        "
                      />
                    ) : (
                      <FiLogOut className="shrink-0 text-lg" />
                    )}

                    <span>{logoutLoading ? "Logging out..." : "Logout"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
