import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiAward,
  FiCamera,
  FiGift,
  FiHeart,
  FiMic,
  FiMusic,
  FiUsers,
} from "react-icons/fi";

const highlights = [
  {
    number: "01",
    icon: FiUsers,
    title: "Alumni Gathering",
    description:
      "Reconnect with classmates, old friends and alumni from different generations in one memorable gathering.",
    tag: "Reconnect",
  },
  {
    number: "02",
    icon: FiMic,
    title: "Teachers' Recognition",
    description:
      "Celebrate the teachers and mentors whose dedication helped shape generations of students.",
    tag: "Honor",
  },
  {
    number: "03",
    icon: FiMusic,
    title: "Cultural Program",
    description:
      "Enjoy an evening filled with music, performances, memories and cultural moments from our school family.",
    tag: "Celebrate",
  },
  {
    number: "04",
    icon: FiCamera,
    title: "Memories & Photography",
    description:
      "Capture new memories while revisiting old moments through photographs, stories and shared experiences.",
    tag: "Remember",
  },
  {
    number: "05",
    icon: FiGift,
    title: "Reunion Gifts",
    description:
      "Every registered participant will receive a special reunion gift package prepared to commemorate this milestone.",
    tag: "Cherish",
  },
  {
    number: "06",
    icon: FiAward,
    title: "Special Recognition",
    description:
      "Recognize inspiring alumni, teachers and members of our school community for their achievements and contribution.",
    tag: "Inspire",
  },
];

const ReunionHighlights = () => {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
      {/* =========================================================
          BACKGROUND DECORATION
      ========================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-blue-50 blur-3xl" />

        <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-slate-100 blur-3xl" />

        <div className="absolute left-[7%] top-[18%] hidden h-20 w-20 rounded-full border border-blue-100 lg:block" />

        <div className="absolute bottom-[20%] right-[8%] hidden h-14 w-14 rounded-full border border-gray-200 lg:block" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =======================================================
            SECTION HEADER
        ======================================================== */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-blue-600" />

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700 sm:text-sm">
              Reunion Highlights
            </span>

            <span className="h-px w-10 bg-blue-600" />
          </div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            A Day to
            <span className="text-blue-700"> Remember</span>
          </h2>

          <p className="mt-5 text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
            From meeting old friends to honoring our teachers and celebrating
            decades of memories, Reunion 2027 is designed to bring our entire
            school family together.
          </p>
        </div>

        {/* =======================================================
            FEATURED INTRO BANNER
        ======================================================== */}
        <div className="mx-auto mt-12 max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 shadow-2xl shadow-slate-200">
            {/* Background decoration */}
            <div className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -bottom-40 left-10 h-96 w-96 rounded-full border border-white/5" />

            <div className="pointer-events-none absolute right-[35%] top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-blue-600/10 blur-2xl" />

            <div className="relative grid items-center lg:grid-cols-[1.15fr_0.85fr]">
              {/* Left content */}
              <div className="p-7 sm:p-10 lg:p-12">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-300">
                  <FiHeart />
                  More Than an Event
                </div>

                <h3 className="mt-5 max-w-2xl text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                  Reconnect with the people and moments that made school
                  unforgettable.
                </h3>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
                  This is more than a gathering. It is a celebration of
                  friendships, teachers, achievements, memories and the
                  generations that have been part of our school story.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <span className="rounded-full bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300">
                    Reconnect
                  </span>

                  <span className="rounded-full bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300">
                    Celebrate
                  </span>

                  <span className="rounded-full bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300">
                    Remember
                  </span>

                  <span className="rounded-full bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300">
                    Inspire
                  </span>
                </div>
              </div>

              {/* Right visual */}
              <div className="relative min-h-[270px] overflow-hidden border-t border-white/10 lg:min-h-[330px] lg:border-l lg:border-t-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-700/80 via-blue-900/50 to-slate-950" />

                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-200">
                      Grand Reunion
                    </p>

                    <p className="mt-3 text-7xl font-black tracking-tight text-white sm:text-8xl">
                      2027
                    </p>

                    <div className="mx-auto mt-4 h-px w-16 bg-blue-300" />

                    <p className="mt-4 text-sm text-blue-100">
                      One School • One Family
                    </p>
                  </div>
                </div>

                {/* Small floating badge */}
                <div className="absolute bottom-5 right-5 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-200">
                    Celebrating
                  </p>

                  <p className="mt-1 text-sm font-bold text-white">76 Years</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =======================================================
            HIGHLIGHTS GRID
        ======================================================== */}
        <div className="mt-16 sm:mt-20">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.number}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/40 sm:p-7"
                >
                  {/* Number */}
                  <div className="absolute right-5 top-5 text-4xl font-black tracking-tight text-gray-100 transition duration-300 group-hover:text-blue-50">
                    {item.number}
                  </div>

                  {/* Icon */}
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition duration-300 group-hover:bg-blue-700 group-hover:text-white">
                    <Icon className="text-xl" />
                  </div>

                  {/* Tag */}
                  <div className="mt-6">
                    <span className="rounded-full bg-gray-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
                      {item.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-4 text-xl font-bold text-slate-950">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-sm leading-7 text-gray-500">
                    {item.description}
                  </p>

                  {/* Bottom line */}
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-700">
                    <span>Be part of it</span>

                    <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                  </div>

                  {/* Hover accent */}
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-blue-700 transition-all duration-300 group-hover:w-full" />
                </article>
              );
            })}
          </div>
        </div>

        {/* =======================================================
            EXPERIENCE STRIP
        ======================================================== */}
        <div className="mx-auto mt-16 max-w-6xl sm:mt-20">
          <div className="rounded-2xl border border-gray-200 bg-slate-50 p-5 sm:p-7">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:divide-x sm:divide-gray-200">
              {/* Reconnect */}
              <div className="flex items-center gap-4 sm:px-6 sm:first:pl-2">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                  <FiUsers />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Reconnect
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    Meet old friends
                  </p>
                </div>
              </div>

              {/* Celebrate */}
              <div className="flex items-center gap-4 sm:px-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                  <FiMusic />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Celebrate
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    Enjoy the program
                  </p>
                </div>
              </div>

              {/* Remember */}
              <div className="flex items-center gap-4 sm:px-6 sm:last:pr-2">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                  <FiCamera />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Remember
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    Create new memories
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =======================================================
            BOTTOM CTA
        ======================================================== */}
        <div className="mt-14 text-center sm:mt-16">
          <p className="text-sm text-gray-500">
            Your place in our school story is waiting.
          </p>

          <Link
            to="/reunion/register"
            className="group mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-800"
          >
            Register for Reunion 2027
            <FiArrowRight className="text-lg transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ReunionHighlights;
