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
import UserLogin from "../Auth/UserLogin";
import UserRegister from "../Auth/UserRegister";
import About from "../Components/Home/About";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main></Main>,
    errorElement: <NotFound></NotFound>,
    children: [
      {
        path: "/",
        element: <Home></Home>,
      },
      {
        path: "login",
        element: <UserLogin></UserLogin>,
      },
      {
        path: "register",
        element: <UserRegister></UserRegister>,
      },
      {
        path: "/about",
        element: <About></About>,
      },
      {
        path: "EventSchedule",
        element: <EventSchedule></EventSchedule>,
      },
      {
        path: "AlumniHighlights",
        element: <AlumniHighlights></AlumniHighlights>,
      },
      {
        path: "GalleryPreview",
        element: <GalleryPreview></GalleryPreview>,
      },
      {
        path: "sponsors",
        element: <SponsorsPreview></SponsorsPreview>,
      },
      {
        path: "Details",
        element: <ReunionDetails></ReunionDetails>,
      },
      {
        path: "reunionregister",
        element: <ReunionRegister></ReunionRegister>,
      },
      {
        path: "contact",
        element: <Contact></Contact>,
      },
    ],
  },
]);
export default router;
