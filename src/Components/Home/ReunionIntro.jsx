import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiHeart,
  FiUsers,
} from "react-icons/fi";

import schoolImage from "../../assets/logo.jpg";

const ReunionIntro = () => {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-28">
      {/* =========================================================
          BACKGROUND DECORATION
      ========================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-50/80 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-slate-100 blur-3xl" />

        <div className="absolute right-[10%] top-[30%] hidden h-20 w-20 rounded-full border border-blue-100 lg:block" />

        <div className="absolute bottom-[18%] left-[8%] hidden h-12 w-12 rounded-full border border-slate-200 lg:block" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =======================================================
            MAIN CONTENT
        ======================================================== */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* =====================================================
              LEFT — IMAGE
          ====================================================== */}
          <div className="relative">
            {/* Main image */}
            <div className="relative mx-auto max-w-xl">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-slate-200/80">
                <img
                  src={schoolImage}
                  alt="School memories and reunion"
                  className="h-[360px] w-full object-cover sm:h-[430px] lg:h-[500px]"
                />

                {/* Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                {/* Image bottom content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                    Since 1951
                  </p>

                  <h3 className="mt-2 max-w-md text-2xl font-bold leading-tight text-white sm:text-3xl">
                    A legacy built across generations.
                  </h3>
                </div>
              </div>

              {/* 76 Years Floating Badge */}
              <div className="absolute -bottom-7 -right-3 flex h-28 w-28 flex-col items-center justify-center rounded-full border-8 border-white bg-blue-700 text-center text-white shadow-xl sm:-right-6 sm:h-36 sm:w-36">
                <span className="text-3xl font-extrabold leading-none sm:text-4xl">
                  76+
                </span>

                <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-100 sm:text-xs">
                  Years
                </span>
              </div>

              {/* Decorative card */}
              <div className="absolute -left-4 -top-5 hidden rounded-xl border border-gray-100 bg-white p-4 shadow-xl sm:block lg:-left-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <FiAward className="text-xl" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Celebrating
                    </p>

                    <p className="text-sm font-bold text-slate-900">76 Years</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              RIGHT — CONTENT
          ====================================================== */}
          <div className="lg:pl-2">
            {/* Section label */}
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-blue-600" />

              <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700 sm:text-sm">
                Our Reunion Story
              </span>
            </div>

            {/* Heading */}
            <h2 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              One School.
              <br />
              <span className="text-blue-700">One Family.</span>
              <br />
              Generations of Memories.
            </h2>

            {/* Description */}
            <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
              For 76 years, our school has been more than a place of learning.
              It has been a place where friendships were formed, dreams began,
              teachers inspired generations, and unforgettable memories were
              created.
            </p>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
              Now, students and alumni from different batches, professions,
              districts and generations are coming together once again to
              celebrate the journey we all share.
            </p>

            {/* =================================================
                HIGHLIGHTS
            ================================================== */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {/* Students */}
              <div className="group rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition duration-300 hover:-translate-y-1 hover:border-blue-100 hover:bg-white hover:shadow-lg hover:shadow-blue-100/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                  <FiUsers className="text-lg" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  Generations
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Students and alumni from different generations.
                </p>
              </div>

              {/* Education */}
              <div className="group rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition duration-300 hover:-translate-y-1 hover:border-blue-100 hover:bg-white hover:shadow-lg hover:shadow-blue-100/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                  <FiBookOpen className="text-lg" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  Our Legacy
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Decades of education, achievement and inspiration.
                </p>
              </div>

              {/* Friendship */}
              <div className="group rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition duration-300 hover:-translate-y-1 hover:border-blue-100 hover:bg-white hover:shadow-lg hover:shadow-blue-100/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                  <FiHeart className="text-lg" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  Friendship
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Reconnect with friends and cherished memories.
                </p>
              </div>
            </div>

            {/* =================================================
                CTA
            ================================================== */}
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                to="/history"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-200"
              >
                Discover Our Story
                <FiArrowRight className="text-lg transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                to="/reunion"
                className="group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-blue-700 transition duration-300 hover:bg-blue-50"
              >
                About Reunion 2027
                <FiArrowRight className="text-lg transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* =======================================================
            STATISTICS
        ======================================================== */}
        <div className="mt-20 border-t border-gray-100 pt-10 sm:mt-24 sm:pt-12">
          <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:divide-x sm:divide-gray-100">
            {/* 76 Years */}
            <div className="px-4 text-center sm:px-6 lg:px-8">
              <p className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                76+
              </p>

              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 sm:text-sm">
                Years of Legacy
              </p>
            </div>

            {/* Alumni */}
            <div className="px-4 text-center sm:px-6 lg:px-8">
              <p className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                1000+
              </p>

              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 sm:text-sm">
                Alumni & Students
              </p>
            </div>

            {/* Batches */}
            <div className="px-4 text-center sm:px-6 lg:px-8">
              <p className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                50+
              </p>

              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 sm:text-sm">
                Generations
              </p>
            </div>

            {/* Reunion */}
            <div className="px-4 text-center sm:px-6 lg:px-8">
              <p className="text-3xl font-extrabold tracking-tight text-blue-700 sm:text-4xl">
                2027
              </p>

              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 sm:text-sm">
                Grand Reunion
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReunionIntro;
