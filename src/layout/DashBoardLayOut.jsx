import { useState } from "react";
import { Outlet } from "react-router-dom";

import DashboardNavbar from "../layout/DashboardNavbar";
import DashboardSidebar from "../layout/DashboardSidebar";
import DashboardFooter from "../layout/DashboardFooter";

const DashBoardLayOut = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState(false);

  const openMobileSidebar = () => {
    setIsMobileSidebarOpen(true);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-base-200">

      <div className="flex min-h-screen w-full">

        {/* =========================================
            SIDEBAR
        ========================================== */}

        <DashboardSidebar
          isMobileOpen={isMobileSidebarOpen}
          onClose={closeMobileSidebar}
        />

        {/* =========================================
            RIGHT SIDE
        ========================================== */}

        <div className="flex min-w-0 flex-1 flex-col">

          {/* Navbar */}

          <DashboardNavbar
            onMenuClick={openMobileSidebar}
          />

          {/* Main Content */}

          <main className="min-w-0 flex-1 p-3 sm:p-5 lg:p-6 xl:p-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>

          {/* Footer */}

          <DashboardFooter />

        </div>
      </div>
    </div>
  );
};

export default DashBoardLayOut;