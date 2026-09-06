import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowUp,
  FiCalendar,
  FiChevronRight,
  FiFacebook,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSend,
  FiTwitter,
  FiYoutube,
} from "react-icons/fi";

import logo from "../../assets/logo.jpg";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    setMessage("Thank you! You are subscribed for reunion updates.");
    setEmail("");
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-slate-950 text-white">
      {/* =========================================================
          REUNION CTA
      ========================================================== */}
      <div className="border-b border-white/10 bg-blue-700">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <FiCalendar className="text-xl" />

                <span className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                  Grand School Reunion 2027
                </span>
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Come back. Reconnect. Relive the memories.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Join thousands of students and alumni as we celebrate 76 years
                of friendship, education, memories and legacy.
              </p>
            </div>

            <Link
              to="/reunionregister"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-700 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-gray-50"
            >
              Register for Reunion
              <FiChevronRight className="text-lg" />
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN FOOTER
      ========================================================== */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          {/* =====================================================
              SCHOOL INFORMATION
          ====================================================== */}
          <div className="lg:col-span-4">
            <Link
              to="/"
              onClick={scrollToTop}
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white p-1 shadow-lg">
                <img
                  src={logo}
                  alt="School Logo"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Our School</h3>

                <p className="text-xs font-medium tracking-[0.15em] text-gray-400">
                  76 YEARS OF EXCELLENCE
                </p>
              </div>
            </Link>

            <p className="mt-6 max-w-md text-sm leading-7 text-gray-400">
              A place where generations learned, friendships began and lifelong
              memories were created. This reunion brings our school family
              together once again to celebrate our shared journey.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition duration-200 hover:-translate-y-1 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
              >
                <FiFacebook />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition duration-200 hover:-translate-y-1 hover:border-pink-500 hover:bg-pink-600 hover:text-white"
              >
                <FiInstagram />
              </a>

              <a
                href="#"
                aria-label="YouTube"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition duration-200 hover:-translate-y-1 hover:border-red-500 hover:bg-red-600 hover:text-white"
              >
                <FiYoutube />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition duration-200 hover:-translate-y-1 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
              >
                <FiLinkedin />
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition duration-200 hover:-translate-y-1 hover:border-sky-500 hover:bg-sky-600 hover:text-white"
              >
                <FiTwitter />
              </a>
            </div>
          </div>

          {/* =====================================================
              QUICK LINKS
          ====================================================== */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  to="/"
                  className="group inline-flex items-center text-sm text-gray-400 transition hover:text-white"
                >
                  <FiChevronRight className="mr-1 text-blue-500 transition-transform group-hover:translate-x-1" />
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="group inline-flex items-center text-sm text-gray-400 transition hover:text-white"
                >
                  <FiChevronRight className="mr-1 text-blue-500 transition-transform group-hover:translate-x-1" />
                  About School
                </Link>
              </li>

              <li>
                <Link
                  to="/history"
                  className="group inline-flex items-center text-sm text-gray-400 transition hover:text-white"
                >
                  <FiChevronRight className="mr-1 text-blue-500 transition-transform group-hover:translate-x-1" />
                  Our History
                </Link>
              </li>

              <li>
                <Link
                  to="/AlumniHighlights"
                  className="group inline-flex items-center text-sm text-gray-400 transition hover:text-white"
                >
                  <FiChevronRight className="mr-1 text-blue-500 transition-transform group-hover:translate-x-1" />
                  Alumni
                </Link>
              </li>

              <li>
                <Link
                  to="/GalleryPreview"
                  className="group inline-flex items-center text-sm text-gray-400 transition hover:text-white"
                >
                  <FiChevronRight className="mr-1 text-blue-500 transition-transform group-hover:translate-x-1" />
                  Gallery
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="group inline-flex items-center text-sm text-gray-400 transition hover:text-white"
                >
                  <FiChevronRight className="mr-1 text-blue-500 transition-transform group-hover:translate-x-1" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* =====================================================
              REUNION
          ====================================================== */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Reunion 2027
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  to="/Details"
                  className="group inline-flex items-center text-sm text-gray-400 transition hover:text-white"
                >
                  <FiChevronRight className="mr-1 text-blue-500 transition-transform group-hover:translate-x-1" />
                  Reunion Details
                </Link>
              </li>

              <li>
                <Link
                  to="EventSchedule"
                  className="group inline-flex items-center text-sm text-gray-400 transition hover:text-white"
                >
                  <FiChevronRight className="mr-1 text-blue-500 transition-transform group-hover:translate-x-1" />
                  Event Schedule
                </Link>
              </li>

              <li>
                <Link
                  to="/reunionregister"
                  className="group inline-flex items-center text-sm text-gray-400 transition hover:text-white"
                >
                  <FiChevronRight className="mr-1 text-blue-500 transition-transform group-hover:translate-x-1" />
                  Registration
                </Link>
              </li>

              <li>
                <Link
                  to="/reunion/gifts"
                  className="group inline-flex items-center text-sm text-gray-400 transition hover:text-white"
                >
                  <FiChevronRight className="mr-1 text-blue-500 transition-transform group-hover:translate-x-1" />
                  Reunion Gifts
                </Link>
              </li>

              <li>
                <Link
                  to="/sponsors"
                  className="group inline-flex items-center text-sm text-gray-400 transition hover:text-white"
                >
                  <FiChevronRight className="mr-1 text-blue-500 transition-transform group-hover:translate-x-1" />
                  Our Sponsors
                </Link>
              </li>
            </ul>
          </div>

          {/* =====================================================
              CONTACT
          ====================================================== */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Get in Touch
            </h3>

            <div className="mt-5 space-y-4">
              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-blue-400">
                  <FiMapPin />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    School Address
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-400">
                    School Road, Dhaka, Bangladesh
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-blue-400">
                  <FiPhone />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Phone
                  </p>

                  <a
                    href="tel:+8801000000000"
                    className="mt-1 block text-sm text-gray-400 transition hover:text-white"
                  >
                    +880 1XXX-XXXXXX
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-blue-400">
                  <FiMail />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Email
                  </p>

                  <a
                    href="mailto:reunion@ourschool.edu.bd"
                    className="mt-1 block break-all text-sm text-gray-400 transition hover:text-white"
                  >
                    reunion@ourschool.edu.bd
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =======================================================
            EVENT INFORMATION
        ======================================================== */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {/* Date */}
            <div className="flex items-center gap-4 p-5 sm:p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400">
                <FiCalendar className="text-xl" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Reunion Date
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  February 2027
                </p>
              </div>
            </div>

            {/* Venue */}
            <div className="flex items-center gap-4 p-5 sm:p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400">
                <FiMapPin className="text-xl" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Venue
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  School Campus
                </p>
              </div>
            </div>

            {/* Participants */}
            <div className="flex items-center gap-4 p-5 sm:p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400">
                <FiSend className="text-xl" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Registration
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  Open for Alumni & Students
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =======================================================
            NEWSLETTER
        ======================================================== */}
        <div className="mt-10 grid grid-cols-1 gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-blue-400">
              Stay Connected
            </p>

            <h3 className="mt-1 text-xl font-bold text-white">
              Get reunion updates in your inbox
            </h3>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
              Receive important announcements, event updates, schedule changes
              and reunion news.
            </p>
          </div>

          <div className="w-full lg:max-w-md">
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <div className="relative flex-1">
                <FiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  aria-label="Email address"
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-600 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition duration-200 hover:bg-blue-700 active:scale-[0.98]"
              >
                Subscribe
                <FiSend />
              </button>
            </form>

            {message && <p className="mt-2 text-xs text-gray-400">{message}</p>}
          </div>
        </div>
      </div>

      {/* =========================================================
          BOTTOM FOOTER
      ========================================================== */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="text-center text-xs text-gray-500 md:text-left">
            <p>
              © {new Date().getFullYear()} Our School Alumni & Reunion. All
              rights reserved.
            </p>

            <p className="mt-1">
              Celebrating 76 years of education, friendship and legacy.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 md:justify-end">
            <Link to="/privacy" className="transition hover:text-white">
              Privacy Policy
            </Link>

            <span className="h-3 w-px bg-white/10" />

            <Link to="/terms" className="transition hover:text-white">
              Terms & Conditions
            </Link>

            <span className="h-3 w-px bg-white/10" />

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 font-semibold text-gray-400 transition hover:text-white"
            >
              Back to top
              <FiArrowUp />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
