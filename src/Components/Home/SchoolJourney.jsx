import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCalendar,
  FiFlag,
  FiHeart,
  FiHome,
  FiStar,
  FiUsers,
} from "react-icons/fi";

const journeyData = [
  {
    year: "1951",
    title: "The Beginning",
    description:
      "Our journey began with a simple but powerful vision — to create a place where young minds could learn, grow and build a better future.",
    icon: FiFlag,
    side: "left",
    featured: false,
  },
  {
    year: "1965",
    title: "Growing Together",
    description:
      "As the school community grew, new generations of students became part of a tradition built on education, discipline, friendship and shared values.",
    icon: FiUsers,
    side: "right",
    featured: false,
  },
  {
    year: "1985",
    title: "Building Our Legacy",
    description:
      "Through decades of dedication from teachers, students, alumni and the community, the school continued to build a lasting legacy.",
    icon: FiAward,
    side: "left",
    featured: false,
  },
  {
    year: "2005",
    title: "A New Era",
    description:
      "A new generation brought fresh ideas, achievements and opportunities while keeping alive the traditions and values of our school.",
    icon: FiBookOpen,
    side: "right",
    featured: false,
  },
  {
    year: "2020",
    title: "Stronger Together",
    description:
      "Even as the world changed, the bond between our school family remained strong. Alumni and students continued to stay connected.",
    icon: FiHeart,
    side: "left",
    featured: false,
  },
  {
    year: "2027",
    title: "Grand Reunion",
    description:
      "After 76 years of memories, achievements and friendships, generations of students and alumni come together to celebrate the school we all call home.",
    icon: FiStar,
    side: "right",
    featured: true,
  },
];

const SchoolJourney = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24 lg:py-28">
      {/* =========================================================
          BACKGROUND DECORATION
      ========================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-slate-200/60 blur-3xl" />

        <div className="absolute right-[12%] top-[15%] hidden h-24 w-24 rounded-full border border-blue-100 lg:block" />

        <div className="absolute bottom-[12%] left-[10%] hidden h-16 w-16 rounded-full border border-gray-200 lg:block" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =======================================================
            SECTION HEADER
        ======================================================== */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-blue-600" />

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700 sm:text-sm">
              Our School Journey
            </span>

            <span className="h-px w-10 bg-blue-600" />
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            76 Years of
            <span className="text-blue-700"> Memories & Legacy</span>
          </h2>

          <p className="mt-5 text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
            Every generation has added a new chapter to our story. From the
            early days of our school to the Grand Reunion of 2027, our journey
            has been shaped by students, teachers, alumni and a community that
            continues to grow together.
          </p>
        </div>

        {/* =======================================================
            JOURNEY INTRO CARD
        ======================================================== */}
        <div className="mx-auto mt-12 max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="grid items-center lg:grid-cols-[1.1fr_1fr]">
              {/* Left content */}
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <FiHome className="text-xl" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                      Since 1951
                    </p>

                    <h3 className="mt-0.5 text-lg font-bold text-slate-950">
                      More Than a School
                    </h3>
                  </div>
                </div>

                <p className="mt-6 text-sm leading-7 text-gray-600 sm:text-base">
                  For generations, this institution has been a second home for
                  thousands of students. The classrooms, playgrounds, corridors,
                  teachers and friendships have become part of memories that
                  stay with us long after graduation.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-500">
                  Today, those memories bring us back together.
                </p>

                <Link
                  to="/history"
                  className="group mt-7 inline-flex items-center gap-2 text-sm font-bold text-blue-700"
                >
                  Explore Our History
                  <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Right visual */}
              <div className="relative min-h-[280px] overflow-hidden bg-slate-900 lg:min-h-[320px]">
                {/* Decorative visual instead of requiring an image */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950" />

                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />

                <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border border-white/10" />

                <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
                      A Legacy of
                    </p>

                    <p className="mt-3 text-6xl font-black tracking-tight text-white sm:text-7xl">
                      76
                    </p>

                    <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-gray-300">
                      Years
                    </p>

                    <div className="mx-auto mt-5 h-px w-16 bg-blue-500" />

                    <p className="mt-4 text-sm text-gray-400">
                      Learning • Friendship • Achievement
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =======================================================
            TIMELINE
        ======================================================== */}
        <div className="relative mx-auto mt-20 max-w-6xl sm:mt-24">
          {/* Desktop center line */}
          <div className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-gray-200 lg:block" />

          {/* Mobile / Tablet left line */}
          <div className="absolute bottom-0 left-[23px] top-0 w-px bg-gray-200 lg:hidden" />

          <div className="space-y-10 sm:space-y-12 lg:space-y-16">
            {journeyData.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.year}
                  className={`relative grid items-center lg:grid-cols-2 ${
                    item.side === "left" ? "lg:text-right" : "lg:text-left"
                  }`}
                >
                  {/* =================================================
                      LEFT CONTENT
                  ================================================== */}
                  <div
                    className={`pl-14 lg:pl-0 ${
                      item.side === "left" ? "lg:pr-20" : "lg:order-2 lg:pl-20"
                    }`}
                  >
                    <div
                      className={`rounded-2xl border p-6 transition duration-300 sm:p-7 ${
                        item.featured
                          ? "border-blue-200 bg-blue-700 shadow-xl shadow-blue-100"
                          : "border-gray-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-lg"
                      }`}
                    >
                      {/* Year */}
                      <div
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                          item.featured
                            ? "bg-white/15 text-blue-100"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        <FiCalendar />

                        {item.year}
                      </div>

                      {/* Title */}
                      <h3
                        className={`mt-4 text-xl font-bold sm:text-2xl ${
                          item.featured ? "text-white" : "text-slate-950"
                        }`}
                      >
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p
                        className={`mt-3 text-sm leading-7 sm:text-base ${
                          item.featured ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {item.description}
                      </p>

                      {/* Current event CTA */}
                      {item.featured && (
                        <Link
                          to="/reunion"
                          className="group mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-gray-50"
                        >
                          Discover Reunion 2027
                          <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* =================================================
                      CENTER ICON
                  ================================================== */}
                  <div
                    className={`absolute left-[23px] top-6 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-slate-50 shadow-md lg:left-1/2 lg:top-1/2 lg:h-14 lg:w-14 ${
                      item.featured
                        ? "bg-blue-700 text-white"
                        : "bg-white text-blue-700"
                    }`}
                  >
                    <Icon className="text-lg sm:text-xl" />
                  </div>

                  {/* =================================================
                      EMPTY SIDE / YEAR MARKER
                  ================================================== */}
                  <div
                    className={`hidden lg:block ${
                      item.side === "left"
                        ? "lg:order-2 lg:pl-20"
                        : "lg:order-1 lg:pr-20"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-4 ${
                        item.side === "left" ? "justify-start" : "justify-end"
                      }`}
                    >
                      <span
                        className={`text-5xl font-black tracking-tight ${
                          item.featured ? "text-blue-100" : "text-gray-200"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div
                        className={`h-px w-16 ${
                          item.featured ? "bg-blue-200" : "bg-gray-200"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =======================================================
            BOTTOM MEMORY CARD
        ======================================================== */}
        <div className="mx-auto mt-20 max-w-5xl sm:mt-24">
          <div className="relative overflow-hidden rounded-2xl bg-slate-950 px-6 py-10 text-center shadow-xl sm:px-10 sm:py-12">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full border border-white/10" />

            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/10 text-blue-400">
                <FiHeart className="text-xl" />
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
                The Story Continues
              </p>

              <h3 className="mx-auto mt-3 max-w-2xl text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                The next chapter of our story starts with you.
              </h3>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
                Whether you graduated decades ago or are still part of our
                school community, your memories and experiences are part of this
                journey.
              </p>

              <Link
                to="/reunionregister"
                className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-500"
              >
                Be Part of Reunion 2027
                <FiArrowRight className="text-lg transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SchoolJourney;
