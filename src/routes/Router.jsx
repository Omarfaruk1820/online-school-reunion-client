import { createBrowserRouter } from "react-router-dom";

import Main from "../layout/Main";
import NotFound from "../Components/Home/NotFound";
import Home from "../Components/Home/Home";
import EventSchedule from "../Components/Home/EventSchedule";
import AlumniHighlights from "../Components/Home/AlumniHighlights";
import GalleryPreview from "../Components/Home/GalleryPreview";
import SponsorsPreview from "../Components/Home/SponsorsPreview";
import ReunionDetails from "../Components/Home/ReunionDetails";
import ReunionRegister from "../Components/Home/ReunionRegister";
import Contact from "../Components/Home/Contact";
import About from "../Components/Home/About";

import UserLogin from "../Auth/UserLogin";
import UserRegister from "../Auth/UserRegister";

// Dashboard Layout
import DashBoardLayOut from "../layout/DashBoardLayOut";

// Route Guards
import PrivateRoute from "../routes/PrivateRoute";
import AdminRoute from "../routes/AdminRoute";
import StudentRoute from "../routes/StudentRoute";

// Dashboard Pages
import AdminDashboard from "../dashboard/Admin/AdminDashBoard";
import StudentDashboard from "../dashboard/User/StudentDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },

      {
        path: "login",
        element: <UserLogin />,
      },

      {
        path: "register",
        element: <UserRegister />,
      },

      {
        path: "about",
        element: <About />,
      },

      {
        path: "EventSchedule",
        element: <EventSchedule />,
      },

      {
        path: "AlumniHighlights",
        element: <AlumniHighlights />,
      },

      {
        path: "GalleryPreview",
        element: <GalleryPreview />,
      },

      {
        path: "sponsors",
        element: <SponsorsPreview />,
      },

      {
        path: "Details",
        element: <ReunionDetails />,
      },

      {
        path: "reunionregister",
        element: <ReunionRegister />,
      },

      {
        path: "contact",
        element: <Contact />,
      },
    ],
  },

  // =====================================================
  // Dashboard
  // =====================================================

  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashBoardLayOut />
      </PrivateRoute>
    ),
    children: [
      // Admin Dashboard
      {
        path: "admin",
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },

      // Student Dashboard
      {
        path: "student",
        element: (
          <StudentRoute>
            <StudentDashboard />
          </StudentRoute>
        ),
      },
    ],
  },
]);

export default router;
