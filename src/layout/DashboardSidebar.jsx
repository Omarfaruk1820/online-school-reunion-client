import {
  FiActivity,
  FiBell,
  FiCalendar,
  FiClipboard,
  FiGift,
  FiGrid,
  FiImage,
  FiLogOut,
  FiMail,
  FiSettings,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { NavLink } from "react-router-dom";

import useAuth from "../hooks/useAuth";

const adminMenu = [
  {
    label: "Dashboard",
    path: "/dashboard/admin",
    icon: FiGrid,
  },
  {
    label: "Users",
    path: "/dashboard/admin/users",
    icon: FiUsers,
  },
  {
    label: "Students",
    path: "/dashboard/admin/students",
    icon: FiUsers,
  },
  {
    label: "Alumni",
    path: "/dashboard/admin/alumni",
    icon: FiUsers,
  },
  {
    label: "Events",
    path: "/dashboard/admin/events",
    icon: FiCalendar,
  },
  {
    label: "Registrations",
    path: "/dashboard/admin/registrations",
    icon: FiClipboard,
  },
  {
    label: "Attendance",
    path: "/dashboard/admin/attendance",
    icon: FiActivity,
  },
  {
    label: "Batches",
    path: "/dashboard/admin/batches",
    icon: FiUsers,
  },
  {
    label: "Departments",
    path: "/dashboard/admin/departments",
    icon: FiGrid,
  },
  {
    label: "Schedules",
    path: "/dashboard/admin/schedules",
    icon: FiCalendar,
  },
  {
    label: "Announcements",
    path: "/dashboard/admin/announcements",
    icon: FiBell,
  },
  {
    label: "Gallery",
    path: "/dashboard/admin/gallery",
    icon: FiImage,
  },
  {
    label: "Gift Packages",
    path: "/dashboard/admin/gift-packages",
    icon: FiGift,
  },
  {
    label: "Gifts",
    path: "/dashboard/admin/gifts",
    icon: FiGift,
  },
  {
    label: "Sponsors",
    path: "/dashboard/admin/sponsors",
    icon: FiUsers,
  },
  {
    label: "Messages",
    path: "/dashboard/admin/messages",
    icon: FiMail,
  },
  {
    label: "Settings",
    path: "/dashboard/admin/settings",
    icon: FiSettings,
  },
];

const studentMenu = [
  {
    label: "Dashboard",
    path: "/dashboard/student",
    icon: FiGrid,
  },
  {
    label: "My Profile",
    path: "/dashboard/profile",
    icon: FiUsers,
  },
  {
    label: "Reunion Events",
    path: "/dashboard/events",
    icon: FiCalendar,
  },
  {
    label: "My Registrations",
    path: "/dashboard/registrations",
    icon: FiClipboard,
  },
  {
    label: "My Attendance",
    path: "/dashboard/attendance",
    icon: FiActivity,
  },
  {
    label: "Event Schedule",
    path: "/dashboard/schedule",
    icon: FiCalendar,
  },
  {
    label: "Gift Packages",
    path: "/dashboard/gift-packages",
    icon: FiGift,
  },
  {
    label: "My Gifts",
    path: "/dashboard/gifts",
    icon: FiGift,
  },
  {
    label: "Announcements",
    path: "/dashboard/announcements",
    icon: FiBell,
  },
  {
    label: "Gallery",
    path: "/dashboard/gallery",
    icon: FiImage,
  },
  {
    label: "Alumni Directory",
    path: "/dashboard/alumni",
    icon: FiUsers,
  },
  {
    label: "Sponsors",
    path: "/dashboard/sponsors",
    icon: FiUsers,
  },
  {
    label: "Settings",
    path: "/dashboard/settings",
    icon: FiSettings,
  },
];

const DashboardSidebar = ({ isMobileOpen, onClose }) => {
  const { user, userLogout } = useAuth();

  const userRole = user?.role?.trim()?.toLowerCase() || "student";

  const isAdmin = userRole === "admin";

  const menuItems = isAdmin ? adminMenu : studentMenu;

  const userName =
    user?.name?.trim() || user?.displayName?.trim() || "School Member";

  const userEmail = user?.email?.trim() || "No email";

  const userPhoto = user?.photo?.trim() || user?.photoURL?.trim() || "";

  const formattedRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  const handleNavigation = () => {
    onClose?.();
  };

  const handleLogout = async () => {
    try {
      onClose?.();

      await userLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const UserAvatar = () => {
    if (userPhoto) {
      return (
        <>
          <img
            src={userPhoto}
            alt={`${userName}'s profile`}
            className="h-11 w-11 rounded-full object-cover"
            referrerPolicy="no-referrer"
            onError={(event) => {
              event.currentTarget.style.display = "none";

              const fallback = event.currentTarget.nextElementSibling;

              if (fallback) {
                fallback.classList.remove("hidden");
              }
            }}
          />

          <div className="hidden h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-content">
            <FiUsers className="text-lg" />
          </div>
        </>
      );
    }

    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-content">
        <FiUsers className="text-lg" />
      </div>
    );
  };

  const menuContent = (
    <div className="flex h-full min-h-0 flex-col bg-base-100">
      {/* =========================================
          HEADER
      ========================================== */}

      <div className="flex min-h-16 shrink-0 items-center justify-between border-b border-base-300 px-4 sm:px-5">
        <div className="min-w-0">
          <h2 className="truncate text-base font-extrabold text-primary sm:text-lg">
            School Reunion
          </h2>

          <p className="truncate text-[11px] text-base-content/60 sm:text-xs">
            {isAdmin ? "Admin Panel" : "Student Panel"}
          </p>
        </div>

        {/* Mobile Close Button */}

        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-circle btn-sm lg:hidden"
          aria-label="Close dashboard sidebar"
        >
          <FiX className="text-xl" />
        </button>
      </div>

      {/* =========================================
          USER INFORMATION
      ========================================== */}

      <div className="shrink-0 border-b border-base-300 p-3 sm:p-4">
        <div className="flex items-center gap-3 rounded-xl bg-base-200 p-3">
          <div className="avatar shrink-0">
            <div className="relative overflow-hidden rounded-full">
              <UserAvatar />

              <span
                className="
                  absolute
                  bottom-0
                  right-0
                  h-3
                  w-3
                  rounded-full
                  border-2
                  border-base-200
                  bg-success
                "
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{userName}</p>

            <p className="truncate text-xs text-base-content/60">{userEmail}</p>

            <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {formattedRole}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================
          NAVIGATION
      ========================================== */}

      <nav
        className="min-h-0 flex-1 overflow-y-auto p-3"
        aria-label="Dashboard navigation"
      >
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-base-content/50 sm:text-xs">
          Menu
        </p>

        <ul className="menu w-full gap-1 p-0">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isDashboardRoute =
              item.path === "/dashboard/admin" ||
              item.path === "/dashboard/student";

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={isDashboardRoute}
                  onClick={handleNavigation}
                  className={({ isActive }) =>
                    [
                      "flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                      "transition-all duration-200",

                      isActive
                        ? "bg-primary text-primary-content shadow-sm"
                        : "text-base-content/75 hover:bg-base-200 hover:text-base-content",
                    ].join(" ")
                  }
                >
                  <Icon className="shrink-0 text-lg" />

                  <span className="truncate">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* =========================================
          LOGOUT
      ========================================== */}

      <div className="shrink-0 border-t border-base-300 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-2.5
            text-sm
            font-medium
            text-error
            transition-colors
            duration-200
            hover:bg-error/10
          "
        >
          <FiLogOut className="shrink-0 text-lg" />

          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* =========================================
          DESKTOP SIDEBAR
          1024px and above
      ========================================== */}

      <aside
        className="
          hidden
          w-64
          shrink-0
          border-r
          border-base-300
          bg-base-100
          lg:block
          xl:w-72
        "
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          {menuContent}
        </div>
      </aside>

      {/* =========================================
          MOBILE / TABLET DRAWER
          Below 1024px
      ========================================== */}

      {isMobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Overlay */}

          <button
            type="button"
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-black/50"
            aria-label="Close dashboard sidebar"
          />

          {/* Drawer */}

          <aside
            className="
              absolute
              left-0
              top-0
              h-full
              w-[min(82vw,18rem)]
              max-w-[18rem]
              overflow-hidden
              bg-base-100
              shadow-2xl
            "
          >
            {menuContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default DashboardSidebar;
