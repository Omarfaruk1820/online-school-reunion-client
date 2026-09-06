import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCalendar,
  FiChevronDown,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";

const BannerHero = () => {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950">
      {/* =========================================================
          BACKGROUND IMAGE
      ========================================================== */}
      <div className="absolute inset-0 -z-20">
        <img
          src="/images/reunion-hero.jpg"
          alt="School reunion"
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* =========================================================
          DARK OVERLAY
      ========================================================== */}
      <div className="absolute inset-0 -z-10 bg-slate-950/70" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/30" />

      {/* Bottom Fade */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-slate-950 to-transparent" />

      {/* =========================================================
          DECORATIVE CIRCLES
      ========================================================== */}
      <div className="absolute -right-24 top-20 -z-10 h-72 w-72 rounded-full border border-white/10" />

      <div className="absolute -right-12 top-32 -z-10 h-48 w-48 rounded-full border border-white/10" />

      <div className="absolute bottom-10 left-10 -z-10 hidden h-24 w-24 rounded-full border border-white/10 lg:block" />

      {/* =========================================================
          HERO CONTENT
      ========================================================== */}
      <div className="mx-auto flex min-h-[680px] max-w-7xl items-center px-4 py-20 sm:px-6 md:min-h-[720px] lg:px-8">
        <div className="grid w-full grid-cols-1 items-center gap-14 lg:grid-cols-12">
          {/* =====================================================
              LEFT CONTENT
          ====================================================== */}
          <div className="max-w-3xl lg:col-span-8">
            {/* Heritage Badge */}
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                76
              </span>

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/90 sm:text-sm">
                Years of Legacy & Excellence
              </span>
            </div>

            {/* Small Heading */}
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300 sm:text-base">
              Grand School Reunion 2027
            </p>

            {/* Main Heading */}
            <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Once a student,
              <span className="block text-blue-300">
                always a part of our family.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-2xl text-base leading-7 text-gray-200 sm:text-lg sm:leading-8">
              Years may pass, but the memories we created at our school remain
              forever. Come back, reconnect with old friends, meet your teachers
              and celebrate our shared journey.
            </p>

            {/* =====================================================
                CTA BUTTONS
            ====================================================== */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="reunionregister"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
              >
                Register for Reunion
                <FiArrowRight className="text-lg transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <Link
                to="/reunion"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition duration-200 hover:bg-white/20"
              >
                Explore Reunion
              </Link>
            </div>

            {/* =====================================================
                EVENT QUICK INFO
            ====================================================== */}
            <div className="mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Date */}
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-300">
                  <FiCalendar className="text-lg" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Event
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-white">
                    Reunion 2027
                  </p>
                </div>
              </div>

              {/* Venue */}
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-300">
                  <FiMapPin className="text-lg" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Venue
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-white">
                    School Campus
                  </p>
                </div>
              </div>

              {/* Participants */}
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-300">
                  <FiUsers className="text-lg" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Welcome
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-white">
                    Students & Alumni
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              RIGHT SIDE — HERITAGE CARD
          ====================================================== */}
          <div className="hidden justify-end lg:col-span-4 lg:flex">
            <div className="w-full max-w-sm">
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-xl">
                {/* Decorative Circle */}
                <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full border border-white/10" />

                {/* Card Content */}
                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                    Our Journey
                  </p>

                  <div className="mt-5 flex items-end gap-3">
                    <span className="text-7xl font-black leading-none text-white">
                      76
                    </span>

                    <div className="pb-1">
                      <p className="text-sm font-semibold text-white">Years</p>

                      <p className="text-xs text-gray-400">of memories</p>
                    </div>
                  </div>

                  <div className="my-6 h-px bg-white/10" />

                  <p className="text-sm leading-6 text-gray-300">
                    From classrooms to careers, generations of students have
                    carried the values, friendships and memories of this school
                    into the world.
                  </p>

                  {/* Mini Stats */}
                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-black/20 p-4">
                      <p className="text-2xl font-bold text-white">2027</p>

                      <p className="mt-1 text-xs text-gray-400">Reunion Year</p>
                    </div>

                    <div className="rounded-xl bg-black/20 p-4">
                      <p className="text-2xl font-bold text-white">∞</p>

                      <p className="mt-1 text-xs text-gray-400">Memories</p>
                    </div>
                  </div>

                  <Link
                    to="/history"
                    className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-blue-300"
                  >
                    Discover our history
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          SCROLL INDICATOR
      ========================================================== */}
      <div className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center text-white/50 md:flex">
        <span className="mb-1 text-[10px] font-medium uppercase tracking-[0.2em]">
          Discover
        </span>

        <FiChevronDown className="animate-bounce text-lg" />
      </div>
    </section>
  );
};

export default BannerHero;
