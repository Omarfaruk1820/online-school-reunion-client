import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiAward,
  FiCamera,
  FiCheckCircle,
  FiClock,
  FiCoffee,
  FiGift,
  FiHeart,
  FiMapPin,
  FiMic,
  FiMusic,
  FiUsers,
} from "react-icons/fi";

const scheduleItems = [
  {
    id: 1,
    time: "08:30 AM",
    endTime: "09:30 AM",
    title: "Registration & Welcome",
    description:
      "Participants arrive, complete check-in and receive their reunion materials and welcome package.",
    icon: FiCheckCircle,
    category: "Welcome",
    featured: true,
  },
  {
    id: 2,
    time: "09:30 AM",
    endTime: "10:00 AM",
    title: "Opening Ceremony",
    description:
      "The reunion officially begins with a warm welcome from the organizing committee and special guests.",
    icon: FiMic,
    category: "Ceremony",
  },
  {
    id: 3,
    time: "10:00 AM",
    endTime: "11:00 AM",
    title: "School Memories & Journey",
    description:
      "Travel through decades of school memories, achievements, stories and unforgettable moments.",
    icon: FiHeart,
    category: "Memories",
  },
  {
    id: 4,
    time: "11:00 AM",
    endTime: "11:30 AM",
    title: "Tea & Refreshments",
    description:
      "Take a short break, refresh yourself and reconnect with old classmates and friends.",
    icon: FiCoffee,
    category: "Refreshment",
  },
  {
    id: 5,
    time: "11:30 AM",
    endTime: "12:30 PM",
    title: "Teachers' Recognition",
    description:
      "A special moment to honor the teachers and mentors who helped shape generations of students.",
    icon: FiAward,
    category: "Recognition",
  },
  {
    id: 6,
    time: "12:30 PM",
    endTime: "01:30 PM",
    title: "Lunch & Alumni Gathering",
    description:
      "Enjoy lunch together while sharing stories, reconnecting with classmates and meeting new friends.",
    icon: FiUsers,
    category: "Gathering",
    featured: true,
  },
  {
    id: 7,
    time: "01:30 PM",
    endTime: "02:30 PM",
    title: "Cultural Program",
    description:
      "Experience music, performances and cultural presentations celebrating the spirit of our school.",
    icon: FiMusic,
    category: "Culture",
  },
  {
    id: 8,
    time: "02:30 PM",
    endTime: "03:15 PM",
    title: "Special Recognition",
    description:
      "Celebrate outstanding alumni, teachers and members of the school community.",
    icon: FiAward,
    category: "Recognition",
  },
  {
    id: 9,
    time: "03:15 PM",
    endTime: "04:00 PM",
    title: "Reunion Gifts",
    description:
      "Registered participants receive their commemorative reunion gifts and special keepsakes.",
    icon: FiGift,
    category: "Gifts",
  },
  {
    id: 10,
    time: "04:00 PM",
    endTime: "04:30 PM",
    title: "Group Photography",
    description:
      "Capture the memories of this historic gathering with batch-wise and school-wide group photographs.",
    icon: FiCamera,
    category: "Memories",
  },
  {
    id: 11,
    time: "04:30 PM",
    endTime: "05:00 PM",
    title: "Closing & Farewell",
    description:
      "End the celebration with gratitude, final remarks and a promise to meet again.",
    icon: FiHeart,
    category: "Farewell",
    featured: true,
  },
];

const EventSchedule = () => {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
      {/* ==================================================
          BACKGROUND DECORATION
      ================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-32 h-80 w-80 rounded-full bg-blue-50 blur-3xl" />

        <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-slate-100 blur-3xl" />

        <div className="absolute left-[6%] top-[20%] hidden h-20 w-20 rounded-full border border-blue-100 lg:block" />

        <div className="absolute bottom-[15%] right-[7%] hidden h-16 w-16 rounded-full border border-gray-200 lg:block" />
      </div>

      {/* ==================================================
          MAIN CONTAINER
      ================================================== */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ==================================================
            SECTION HEADER
        ================================================== */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-blue-600" />

            <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700 sm:text-sm">
              Event Schedule
            </span>

            <span className="h-px w-10 bg-blue-600" />
          </div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            A Day Filled With
            <span className="block text-blue-700">Memories & Moments</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
            From the first welcome in the morning to the final farewell, every
            moment of Reunion 2027 has been planned to make the day meaningful,
            enjoyable and memorable.
          </p>
        </div>

        {/* ==================================================
            EVENT HEADER CARD
        ================================================== */}
        <div className="mx-auto mt-12 max-w-6xl sm:mt-16">
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 shadow-2xl shadow-slate-200">
            {/* Decorative elements */}
            <div className="pointer-events-none absolute -right-32 -top-36 h-80 w-80 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -bottom-40 left-20 h-80 w-80 rounded-full border border-white/5" />

            <div className="relative grid lg:grid-cols-[1fr_auto] lg:items-center">
              {/* Content */}
              <div className="p-7 sm:p-10 lg:p-12">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-300">
                  <FiCalendarIcon />
                  Reunion Day
                </div>

                <h3 className="mt-5 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                  Grand School Reunion 2027
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
                  A full day of reconnecting, celebrating, remembering and
                  creating new memories with our school family.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
                    <FiClock className="text-blue-300" />

                    <span className="text-xs font-semibold text-gray-300 sm:text-sm">
                      08:30 AM – 05:00 PM
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
                    <FiMapPin className="text-blue-300" />

                    <span className="text-xs font-semibold text-gray-300 sm:text-sm">
                      School Campus
                    </span>
                  </div>
                </div>
              </div>

              {/* Year */}
              <div className="border-t border-white/10 px-7 py-8 sm:px-10 lg:border-l lg:border-t-0 lg:px-14">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-300">
                  Celebrating
                </p>

                <p className="mt-2 text-6xl font-black leading-none text-white sm:text-7xl">
                  76
                </p>

                <p className="mt-2 text-sm font-medium text-gray-400">
                  Years of Legacy
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            SCHEDULE
        ================================================== */}
        <div className="mx-auto mt-12 max-w-6xl sm:mt-16">
          {/* DESKTOP TIMELINE */}
          <div className="relative hidden lg:block">
            {/* Center line */}
            <div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-gray-200" />

            <div className="space-y-10">
              {scheduleItems.map((item, index) => {
                const Icon = item.icon;
                const isLeft = index % 2 === 0;

                return (
                  <div
                    key={item.id}
                    className="relative grid grid-cols-2 gap-16"
                  >
                    {/* Timeline point */}
                    <div className="absolute left-1/2 top-8 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-blue-700 text-white shadow-lg shadow-blue-100">
                      <span className="text-xs font-black">
                        {String(item.id).padStart(2, "0")}
                      </span>
                    </div>

                    {/* LEFT */}
                    <div
                      className={
                        isLeft ? "pr-8" : "pointer-events-none invisible pl-8"
                      }
                    >
                      {isLeft && (
                        <ScheduleCard item={item} Icon={Icon} align="right" />
                      )}
                    </div>

                    {/* RIGHT */}
                    <div
                      className={
                        !isLeft ? "pl-8" : "pointer-events-none invisible pr-8"
                      }
                    >
                      {!isLeft && (
                        <ScheduleCard item={item} Icon={Icon} align="left" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MOBILE / TABLET TIMELINE */}
          <div className="relative lg:hidden">
            {/* Vertical line */}
            <div className="absolute bottom-5 left-[19px] top-5 w-px bg-gray-200 sm:left-[23px]" />

            <div className="space-y-5 sm:space-y-6">
              {scheduleItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.id} className="relative flex gap-4 sm:gap-5">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white bg-blue-700 text-white shadow-md sm:h-12 sm:w-12">
                      <span className="text-[10px] font-black sm:text-xs">
                        {String(item.id).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Card */}
                    <ScheduleCard item={item} Icon={Icon} align="left" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==================================================
            DAY HIGHLIGHTS
        ================================================== */}
        <div className="mx-auto mt-16 max-w-6xl sm:mt-20">
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-slate-50 p-6 sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                <FiUsers />
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                Morning
              </p>

              <h3 className="mt-2 text-lg font-bold text-slate-950">
                Reconnect
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Begin the day by meeting classmates, friends, teachers and
                members of our school family.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-slate-50 p-6 sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                <FiAward />
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                Afternoon
              </p>

              <h3 className="mt-2 text-lg font-bold text-slate-950">
                Celebrate
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Honor teachers, celebrate achievements and enjoy cultural
                performances together.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-slate-50 p-6 sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                <FiCamera />
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                Closing
              </p>

              <h3 className="mt-2 text-lg font-bold text-slate-950">
                Remember
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Capture the day through group photographs, gifts and memories
                that will last for years.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            IMPORTANT NOTE
        ================================================== */}
        <div className="mx-auto mt-10 max-w-6xl">
          <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
              <FiClock />
            </div>

            <div>
              <p className="text-sm font-bold text-blue-950">
                Schedule may be updated
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-900/70 sm:text-sm">
                The organizing committee may adjust the program timing or
                activities when necessary. Please check the latest event updates
                before reunion day.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            CTA
        ================================================== */}
        <div className="mt-12 text-center sm:mt-14">
          <p className="text-sm text-gray-500">
            Don't miss your place in this special day.
          </p>

          <Link
            to="/reunion/register"
            className="group mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl sm:px-7"
          >
            Register for Reunion 2027
            <FiArrowRight className="text-lg transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ======================================================
   SCHEDULE CARD
====================================================== */

const ScheduleCard = ({ item, Icon, align = "left" }) => {
  const isRight = align === "right";

  return (
    <article
      className={`group relative rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/40 sm:p-6 ${
        item.featured ? "border-blue-100 bg-blue-50/30" : "border-gray-200"
      }`}
    >
      {/* Top row */}
      <div
        className={`flex items-start justify-between gap-4 ${
          isRight ? "flex-row-reverse" : ""
        }`}
      >
        {/* Icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-all duration-300 group-hover:bg-blue-700 group-hover:text-white">
          <Icon className="text-lg" />
        </div>

        {/* Time */}
        <div className={isRight ? "text-left" : "text-right"}>
          <p className="text-xs font-black uppercase tracking-wider text-blue-700">
            {item.time}
          </p>

          <p className="mt-1 text-[10px] font-medium text-gray-400">
            to {item.endTime}
          </p>
        </div>
      </div>

      {/* Category */}
      <div className={`mt-5 ${isRight ? "text-right" : ""}`}>
        <span className="rounded-full bg-gray-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
          {item.category}
        </span>
      </div>

      {/* Title */}
      <h3
        className={`mt-4 text-xl font-bold text-slate-950 ${
          isRight ? "text-right" : ""
        }`}
      >
        {item.title}
      </h3>

      {/* Description */}
      <p
        className={`mt-3 text-sm leading-6 text-gray-500 ${
          isRight ? "text-right" : ""
        }`}
      >
        {item.description}
      </p>

      {/* Featured badge */}
      {item.featured && (
        <div
          className={`mt-5 flex items-center gap-2 text-xs font-semibold text-blue-700 ${
            isRight ? "justify-end" : ""
          }`}
        >
          <FiCheckCircle />

          <span>Special moment of the day</span>
        </div>
      )}

      {/* Bottom accent */}
      <div
        className={`absolute bottom-0 h-1 w-0 bg-blue-700 transition-all duration-300 group-hover:w-full ${
          isRight ? "right-0 rounded-br-2xl" : "left-0 rounded-bl-2xl"
        }`}
      />
    </article>
  );
};

/* Small helper so the header icon stays clean */
const FiCalendarIcon = () => {
  return <FiClock />;
};

export default EventSchedule;
