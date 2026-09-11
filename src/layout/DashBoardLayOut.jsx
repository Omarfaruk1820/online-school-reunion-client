import { Outlet } from "react-router-dom";

import DashboardNavbar from "../layout/DashboardNavbar";
import DashboardSidebar from "../layout/DashboardSidebar";
import DashboardFooter from "../layout/DashboardFooter";
import About from './../Components/Pages/About';

const DashBoardLayOut = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-base-200">
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardNavbar />

          <main className="min-w-0 flex-1 p-3 sm:p-5 lg:p-6 xl:p-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>

          <DashboardFooter />
          
         
        </div>
      </div>
    </div>
  );
};

export default DashBoardLayOut;
