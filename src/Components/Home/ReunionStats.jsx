import {
  FiArrowUpRight,
  FiAward,
  FiCalendar,
  FiCamera,
  FiHeart,
  FiUsers,
} from "react-icons/fi";

const stats = [
  {
    id: 1,
    value: "76+",
    label: "Years of Legacy",
    description:
      "A proud journey of education, friendship, achievement and memories.",
    icon: FiAward,
  },
  {
    id: 2,
    value: "1000+",
    label: "Alumni Community",
    description:
      "Former students connected across generations and around the country.",
    icon: FiUsers,
  },
  {
    id: 3,
    value: "01",
    label: "Grand Reunion",
    description:
      "One special day bringing our school family together once again.",
    icon: FiCalendar,
  },
  {
    id: 4,
    value: "∞",
    label: "Memories",
    description:
      "Countless stories, friendships and moments that continue to live on.",
    icon: FiHeart,
  },
];

const ReunionStats = () => {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
      {/* --------------------------------------------------
          BACKGROUND DECORATION
      -------------------------------------------------- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-blue-50 blur-3xl" />

        <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-slate-100 blur-3xl" />

        <div className="absolute left-[8%] top-[12%] hidden h-24 w-24 rounded-full border border-blue-100 lg:block" />

        <div className="absolute bottom-[15%] right-[8%] hidden h-16 w-16 rounded-full border border-gray-200 lg:block" />

        <div className="absolute left-1/2 top-0 hidden h-px w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-200 to-transparent lg:block" />
      </div>

      {/* --------------------------------------------------
          MAIN CONTAINER
      -------------------------------------------------- */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* --------------------------------------------------
            SECTION HEADER
        -------------------------------------------------- */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-blue-600" />

            <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700 sm:text-sm">
              Our Reunion in Numbers
            </span>

            <span className="h-px w-10 bg-blue-600" />
          </div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            More Than Numbers.
            <span className="block text-blue-700">A Legacy We Share.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
            Every number represents a chapter of our school's story — the
            students, teachers, friendships and memories that have shaped
            generations of our school family.
          </p>
        </div>

        {/* --------------------------------------------------
            FEATURED STAT AREA
        -------------------------------------------------- */}
        <div className="mx-auto mt-12 max-w-6xl sm:mt-16">
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 shadow-2xl shadow-slate-200">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -bottom-48 left-10 h-[28rem] w-[28rem] rounded-full border border-white/5" />

            <div className="pointer-events-none absolute left-[45%] top-1/2 hidden h-40 w-40 -translate-y-1/2 rounded-full bg-blue-600/10 blur-3xl lg:block" />

            <div className="relative grid lg:grid-cols-[0.9fr_1.1fr]">
              {/* LEFT */}
              <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden border-b border-white/10 p-8 sm:min-h-[420px] sm:p-12 lg:border-b-0 lg:border-r">
                {/* Inner circle */}
                <div className="absolute h-64 w-64 rounded-full border border-white/10 sm:h-80 sm:w-80" />

                <div className="absolute h-48 w-48 rounded-full border border-blue-400/10 sm:h-60 sm:w-60" />

                <div className="relative text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-300 sm:text-sm">
                    Celebrating
                  </p>

                  <div className="mt-2 text-8xl font-black leading-none tracking-tight text-white sm:text-9xl">
                    76
                  </div>

                  <div className="mx-auto mt-3 h-px w-16 bg-blue-400" />

                  <p className="mt-4 text-sm font-medium text-gray-300 sm:text-base">
                    Years of Excellence
                  </p>
                </div>

                {/* Small badge */}
                <div className="absolute bottom-6 left-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm sm:bottom-8 sm:left-8">
                  <FiAward className="text-blue-300" />

                  <span className="text-xs font-semibold text-gray-300">
                    A Proud Legacy
                  </span>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-300">
                  <FiHeart />
                  One School • One Family
                </div>

                <h3 className="mt-6 max-w-xl text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                  Generations connected by one unforgettable school journey.
                </h3>

                <p className="mt-5 max-w-xl text-sm leading-7 text-gray-400 sm:text-base sm:leading-8">
                  From the classroom to the wider world, every generation has
                  added something meaningful to our school's story. Reunion 2027
                  is a celebration of that shared journey.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-5">
                    <p className="text-2xl font-black text-white sm:text-3xl">
                      76+
                    </p>

                    <p className="mt-1 text-xs font-medium text-gray-400 sm:text-sm">
                      Years of legacy
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-5">
                    <p className="text-2xl font-black text-white sm:text-3xl">
                      2027
                    </p>

                    <p className="mt-1 text-xs font-medium text-gray-400 sm:text-sm">
                      Grand reunion
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------
            STAT CARDS
        -------------------------------------------------- */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/40 sm:p-7"
              >
                {/* Number watermark */}
                <div className="pointer-events-none absolute -right-2 -top-5 text-7xl font-black tracking-tight text-gray-50 transition-colors duration-300 group-hover:text-blue-50">
                  {stat.id}
                </div>

                {/* Icon */}
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-all duration-300 group-hover:bg-blue-700 group-hover:text-white">
                  <Icon className="text-xl" />
                </div>

                {/* Number */}
                <div className="relative mt-7">
                  <p className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                    {stat.value}
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-800">
                    {stat.label}
                  </p>
                </div>

                {/* Description */}
                <p className="mt-3 text-sm leading-6 text-gray-500">
                  {stat.description}
                </p>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-blue-700 transition-all duration-300 group-hover:w-full" />
              </article>
            );
          })}
        </div>

        {/* --------------------------------------------------
            MEMORY STRIP
        -------------------------------------------------- */}
        <div className="mx-auto mt-8 max-w-6xl sm:mt-10">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-slate-50">
            <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x sm:divide-gray-200">
              {/* Item 1 */}
              <div className="group flex items-center gap-4 p-5 sm:p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm transition duration-300 group-hover:scale-105">
                  <FiUsers />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Together
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    Generations of students
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="group flex items-center gap-4 border-t border-gray-200 p-5 sm:border-t-0 sm:p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm transition duration-300 group-hover:scale-105">
                  <FiCamera />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Memories
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    Countless moments
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="group flex items-center gap-4 border-t border-gray-200 p-5 sm:border-t-0 sm:p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm transition duration-300 group-hover:scale-105">
                  <FiHeart />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Forever
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    One school family
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------
            BOTTOM MESSAGE
        -------------------------------------------------- */}
        <div className="mx-auto mt-12 max-w-3xl text-center sm:mt-14">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-700" />

            <span>Every generation has a story</span>

            <FiArrowUpRight className="text-base" />
          </div>

          <p className="mt-3 text-sm leading-7 text-gray-500 sm:text-base">
            And in 2027, we come together to write another chapter.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ReunionStats;
