import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  FiChevronDown,
  FiLogIn,
  FiLogOut,
  FiMenu,
  FiShield,
  FiUser,
  FiX,
} from "react-icons/fi";

import logo from "../../assets/logo.jpg";
import useAuth from "../../hooks/useAuth";

const Navbar = () => {
  const { user, loading, userLogout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReunionOpen, setIsReunionOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const userMenuRef = useRef(null);

  /*
   * ----------------------------------------
   * Navigation Classes
   * ----------------------------------------
   */

  const navLinkClass = ({ isActive }) =>
    `relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive ? "text-blue-700" : "text-gray-700 hover:text-blue-700"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block rounded-lg px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-gray-700 hover:bg-gray-50 hover:text-blue-700"
    }`;

  /*
   * ----------------------------------------
   * User Data
   * ----------------------------------------
   */

  const userName = user?.name?.trim() || user?.displayName?.trim() || "User";

  const userEmail = user?.email?.trim() || "No email";

  const userPhoto = user?.photo?.trim() || user?.photoURL?.trim() || "";

  const userRole = user?.role?.trim()?.toLowerCase() || "student";

  const formattedRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  /*
   * ----------------------------------------
   * Close Menus
   * ----------------------------------------
   */

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setIsReunionOpen(false);
  };

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

  /*
   * ----------------------------------------
   * Logout
   * ----------------------------------------
   */

  const handleLogout = async () => {
    if (logoutLoading) {
      return;
    }

    try {
      setLogoutLoading(true);

      await userLogout();

      setIsUserMenuOpen(false);
      closeMobileMenu();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  /*
   * ----------------------------------------
   * Close User Dropdown When Clicking Outside
   * ----------------------------------------
   */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*
   * ----------------------------------------
   * Close Menus On Route / Resize
   * ----------------------------------------
   */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /*
   * ----------------------------------------
   * User Avatar
   * ----------------------------------------
   */

  const UserAvatar = ({ mobile = false }) => {
    if (userPhoto) {
      return (
        <img
          src={userPhoto}
          alt={`${userName}'s profile`}
          className={`rounded-full object-cover ${
            mobile ? "h-10 w-10" : "h-10 w-10"
          }`}
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.style.display = "none";
            event.currentTarget.nextElementSibling?.classList.remove("hidden");
          }}
        />
      );
    }

    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 ${
          mobile ? "h-10 w-10 text-sm" : "h-10 w-10 text-sm"
        }`}
        aria-hidden="true"
      >
        {userName.charAt(0).toUpperCase()}
      </div>
    );
  };

  /*
   * ----------------------------------------
   * Loading State
   * ----------------------------------------
   */

  const authResolved = !loading;

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* ======================================
          Top Information Bar
      ======================================= */}

      <div className="hidden border-b border-gray-100 bg-slate-950 text-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs sm:px-6 lg:px-8">
          <p className="text-gray-300">
            Celebrating 76 Years of Excellence & Memories
          </p>

          <div className="flex items-center gap-5 text-gray-300">
            <span>Grand Reunion 2027</span>

            <span className="h-3 w-px bg-gray-600" />

            <span>All Alumni Welcome</span>
          </div>
        </div>
      </div>

      {/* ======================================
          Main Navbar
      ======================================= */}

      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-3 sm:px-5 lg:px-7">
          {/* ==================================
              Logo
          =================================== */}

          <NavLink
            to="/"
            onClick={closeMobileMenu}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm">
              <img
                src={logo}
                alt="School Logo"
                className="h-full w-full object-contain p-1"
              />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold leading-tight text-slate-900 sm:text-lg">
                Our School
              </h1>

              <p className="hidden text-[11px] font-medium tracking-wide text-gray-500 sm:block">
                76 YEARS OF EXCELLENCE
              </p>
            </div>
          </NavLink>

          {/* ==================================
              Desktop Navigation
          =================================== */}

          <div className="hidden items-center lg:flex">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>

            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>

            <NavLink to="/history" className={navLinkClass}>
              History
            </NavLink>

            {/* Reunion Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsReunionOpen((prev) => !prev)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-700"
                aria-expanded={isReunionOpen}
                aria-haspopup="menu"
              >
                Reunion 2027
                <FiChevronDown
                  className={`transition-transform duration-200 ${
                    isReunionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isReunionOpen && (
                <div className="absolute left-1/2 top-full mt-3 w-56 -translate-x-1/2 rounded-xl border border-gray-100 bg-white p-2 shadow-xl">
                  <NavLink
                    to="/Details"
                    onClick={() => setIsReunionOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    Reunion Details
                  </NavLink>

                  <NavLink
                    to="/EventSchedule"
                    onClick={() => setIsReunionOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    Event Schedule
                  </NavLink>

                  <NavLink
                    to="/reunionregister"
                    onClick={() => setIsReunionOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    Register for Reunion →
                  </NavLink>
                </div>
              )}
            </div>

            <NavLink to="/AlumniHighlights" className={navLinkClass}>
              Alumni
            </NavLink>

            <NavLink to="/GalleryPreview" className={navLinkClass}>
              Gallery
            </NavLink>

            <NavLink to="/sponsors" className={navLinkClass}>
              Sponsors
            </NavLink>

            <NavLink to="/contact" className={navLinkClass}>
              Contact
            </NavLink>
          </div>

          {/* ==================================
              Desktop Authentication Area
          =================================== */}

          {authResolved && (
            <div className="hidden items-center lg:flex">
              {!user ? (
                /* -----------------------------
                   Logged Out
                ------------------------------ */

                <div className="flex items-center gap-3">
                  <NavLink
                    to="/login"
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-blue-700"
                  >
                    <FiLogIn />

                    <span>Login</span>
                  </NavLink>

                  <NavLink
                    to="/register"
                    className="flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 hover:shadow-md"
                  >
                    <FiUser />

                    <span>Register</span>
                  </NavLink>
                </div>
              ) : (
                /* -----------------------------
                   Logged In
                ------------------------------ */

                <div ref={userMenuRef} className="relative ml-4">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-1.5 transition hover:border-blue-200 hover:bg-gray-50"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="menu"
                  >
                    {/* User Photo */}
                    <div className="relative">
                      <UserAvatar />

                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
                    </div>

                    {/* User Information */}
                    <div className="hidden min-w-0 text-left xl:block">
                      <p className="max-w-[130px] truncate text-sm font-semibold text-slate-900">
                        {userName}
                      </p>

                      <p className="max-w-[150px] truncate text-[11px] text-gray-500">
                        {userEmail}
                      </p>
                    </div>

                    <FiChevronDown
                      className={`text-gray-500 transition-transform duration-200 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                      {/* User Header */}
                      <div className="border-b border-gray-100 bg-gray-50 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {userName}
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              {userEmail}
                            </p>

                            {/* Role */}
                            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                              <FiShield className="text-xs" />

                              <span>{formattedRole}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* User Menu Links */}
                      <div className="p-2">
                        <NavLink
                          to="/dashboard/profile"
                          onClick={closeUserMenu}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                        >
                          <FiUser />

                          <span>My Profile</span>
                        </NavLink>

                        {userRole === "admin" && (
                          <NavLink
                            to="/dashboard/admin"
                            onClick={closeUserMenu}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                          >
                            <FiShield />

                            <span>Admin Dashboard</span>
                          </NavLink>
                        )}

                        <button
                          type="button"
                          onClick={handleLogout}
                          disabled={logoutLoading}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {logoutLoading ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                          ) : (
                            <FiLogOut />
                          )}

                          <span>
                            {logoutLoading ? "Logging out..." : "Logout"}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==================================
              Mobile Menu Button
          =================================== */}

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="rounded-lg p-2 text-2xl text-gray-700 transition hover:bg-gray-100 lg:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* ====================================
            Mobile Navigation
        ===================================== */}

        {isMenuOpen && (
          <div className="border-t border-gray-100 bg-white lg:hidden">
            <div className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
              {/* Mobile User Information */}
              {authResolved && user && (
                <div className="mb-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar mobile />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {userName}
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        {userEmail}
                      </p>

                      <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        <FiShield />

                        <span>{formattedRole}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Home */}
              <NavLink
                to="/"
                onClick={closeMobileMenu}
                className={mobileLinkClass}
              >
                Home
              </NavLink>

              {/* About */}
              <NavLink
                to="/about"
                onClick={closeMobileMenu}
                className={mobileLinkClass}
              >
                About
              </NavLink>

              {/* History */}
              <NavLink
                to="/history"
                onClick={closeMobileMenu}
                className={mobileLinkClass}
              >
                History
              </NavLink>

              {/* Mobile Reunion */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsReunionOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  aria-expanded={isReunionOpen}
                >
                  <span>Reunion 2027</span>

                  <FiChevronDown
                    className={`transition-transform duration-200 ${
                      isReunionOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isReunionOpen && (
                  <div className="ml-3 mt-1 space-y-1 border-l-2 border-blue-100 pl-3">
                    <NavLink
                      to="/Details"
                      onClick={closeMobileMenu}
                      className={mobileLinkClass}
                    >
                      Reunion Details
                    </NavLink>

                    <NavLink
                      to="/EventSchedule"
                      onClick={closeMobileMenu}
                      className={mobileLinkClass}
                    >
                      Event Schedule
                    </NavLink>

                    <NavLink
                      to="/reunionregister"
                      onClick={closeMobileMenu}
                      className={mobileLinkClass}
                    >
                      Register for Reunion
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Alumni */}
              <NavLink
                to="/AlumniHighlights"
                onClick={closeMobileMenu}
                className={mobileLinkClass}
              >
                Alumni
              </NavLink>

              {/* Gallery */}
              <NavLink
                to="/GalleryPreview"
                onClick={closeMobileMenu}
                className={mobileLinkClass}
              >
                Gallery
              </NavLink>

              {/* Sponsors */}
              <NavLink
                to="/sponsors"
                onClick={closeMobileMenu}
                className={mobileLinkClass}
              >
                Sponsors
              </NavLink>

              {/* Contact */}
              <NavLink
                to="/contact"
                onClick={closeMobileMenu}
                className={mobileLinkClass}
              >
                Contact
              </NavLink>

              {/* ==================================
                  Mobile Authentication
              =================================== */}

              {authResolved && (
                <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                  {!user ? (
                    <>
                      <NavLink
                        to="/login"
                        onClick={closeMobileMenu}
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <FiLogIn />

                        <span>Login</span>
                      </NavLink>

                      <NavLink
                        to="/register"
                        onClick={closeMobileMenu}
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                      >
                        <FiUser />

                        <span>Register</span>
                      </NavLink>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/dashboard/profile"
                        onClick={closeMobileMenu}
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <FiUser />

                        <span>Profile</span>
                      </NavLink>

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {logoutLoading ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-white" />
                        ) : (
                          <FiLogOut />
                        )}

                        <span>
                          {logoutLoading ? "Logging out..." : "Logout"}
                        </span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
