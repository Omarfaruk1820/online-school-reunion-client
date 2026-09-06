import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiGift,
  FiHeart,
  FiMapPin,
  FiShield,
  FiStar,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";

const eventInfo = {
  title: "Grand School Reunion 2027",
  date: "22 February 2027",
  day: "Monday",
  time: "9:00 AM – 5:00 PM",
  venue: "School Campus",
  location: "Our Beloved School Campus",
};

const participationPoints = [
  "Former students and alumni of the school",
  "Current students and invited members",
  "Teachers, former teachers and respected guests",
  "Registered participants with a valid reunion registration",
];

const giftItems = [
  "Reunion Bag",
  "Commemorative Mug",
  "Souvenir Pen",
  "School Crest",
  "Reunion T-Shirt",
  "Special Reunion Gifts",
];

const guidelines = [
  "Complete your registration with accurate information.",
  "Select your T-shirt size carefully during registration.",
  "Bring your registration confirmation or QR code on reunion day.",
  "Follow the event schedule and instructions from the organizing team.",
];

const ReunionInformation = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24 lg:py-28">
      {/* ==================================================
          BACKGROUND DECORATION
      ================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-slate-200/70 blur-3xl" />

        <div className="absolute left-[7%] top-[18%] hidden h-20 w-20 rounded-full border border-blue-200 lg:block" />

        <div className="absolute bottom-[18%] right-[7%] hidden h-16 w-16 rounded-full border border-slate-300 lg:block" />
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
              Reunion Information
            </span>

            <span className="h-px w-10 bg-blue-600" />
          </div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Everything You Need to Know
            <span className="block text-blue-700">About Reunion 2027</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
            From event details and participation guidelines to reunion gifts and
            registration information, everything you need for this special
            celebration is right here.
          </p>
        </div>

        {/* ==================================================
            EVENT OVERVIEW
        ================================================== */}
        <div className="mx-auto mt-12 max-w-6xl sm:mt-16">
          <div className="overflow-hidden rounded-3xl bg-slate-950 shadow-2xl shadow-slate-300/40">
            <div className="grid lg:grid-cols-[1fr_0.85fr]">
              {/* LEFT CONTENT */}
              <div className="relative p-7 sm:p-10 lg:p-14">
                {/* Decorative circle */}
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10" />

                <div className="pointer-events-none absolute bottom-[-120px] left-[-80px] h-64 w-64 rounded-full border border-blue-400/10" />

                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-300">
                    <FiStar />
                    Grand Reunion 2027
                  </div>

                  <h3 className="mt-6 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                    One Day.
                    <span className="block text-blue-400">
                      A Lifetime of Memories.
                    </span>
                  </h3>

                  <p className="mt-5 max-w-xl text-sm leading-7 text-gray-400 sm:text-base sm:leading-8">
                    A special gathering for generations of students, teachers,
                    alumni and members of our school family to reconnect,
                    celebrate achievements and create new memories together.
                  </p>

                  {/* Event Details */}
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {/* Date */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                          <FiCalendar />
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
                            Date
                          </p>

                          <p className="mt-1 text-sm font-bold text-white">
                            {eventInfo.date}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {eventInfo.day}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                          <FiClock />
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
                            Time
                          </p>

                          <p className="mt-1 text-sm font-bold text-white">
                            {eventInfo.time}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            Full day celebration
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:col-span-2">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                          <FiMapPin />
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
                            Venue
                          </p>

                          <p className="mt-1 text-sm font-bold text-white">
                            {eventInfo.venue}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {eventInfo.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT VISUAL */}
              <div className="relative flex min-h-[330px] items-center justify-center overflow-hidden border-t border-white/10 bg-gradient-to-br from-blue-700 via-blue-900 to-slate-950 p-8 lg:min-h-full lg:border-l lg:border-t-0">
                {/* Rings */}
                <div className="absolute h-64 w-64 rounded-full border border-white/10 sm:h-80 sm:w-80" />

                <div className="absolute h-48 w-48 rounded-full border border-white/10 sm:h-60 sm:w-60" />

                <div className="relative text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-200">
                    Save the Date
                  </p>

                  <p className="mt-4 text-7xl font-black leading-none tracking-tight text-white sm:text-8xl">
                    2027
                  </p>

                  <div className="mx-auto mt-5 h-px w-16 bg-blue-300" />

                  <p className="mt-4 text-sm font-medium text-blue-100">
                    One School • One Family
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-sm">
                    <FiHeart className="text-blue-200" />

                    <span className="text-xs font-semibold text-white">
                      Celebrate Together
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            THREE INFORMATION CARDS
        ================================================== */}
        <div className="mt-8 grid gap-5 md:grid-cols-3 lg:mt-10">
          {/* WHO CAN JOIN */}
          <article className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/40 sm:p-7">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition duration-300 group-hover:bg-blue-700 group-hover:text-white">
                <FiUsers className="text-xl" />
              </div>

              <span className="text-xs font-black text-gray-200">01</span>
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-950">
              Who Can Participate?
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              The reunion welcomes members of our school community from
              different generations.
            </p>

            <div className="mt-5 space-y-3">
              {participationPoints.map((point) => (
                <div key={point} className="flex items-start gap-2.5">
                  <FiCheckCircle className="mt-0.5 shrink-0 text-blue-600" />

                  <span className="text-sm leading-6 text-gray-600">
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </article>

          {/* REGISTRATION */}
          <article className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/40 sm:p-7">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition duration-300 group-hover:bg-blue-700 group-hover:text-white">
                <FiUserCheck className="text-xl" />
              </div>

              <span className="text-xs font-black text-gray-200">02</span>
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-950">
              Registration
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Registration is required for participation and preparation of your
              reunion package.
            </p>

            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                  1
                </span>

                <p className="text-sm leading-6 text-gray-600">
                  Create or sign in to your account.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                  2
                </span>

                <p className="text-sm leading-6 text-gray-600">
                  Provide your school and contact information.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                  3
                </span>

                <p className="text-sm leading-6 text-gray-600">
                  Select your T-shirt size and submit registration.
                </p>
              </div>
            </div>
          </article>

          {/* GIFTS */}
          <article className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/40 sm:p-7">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition duration-300 group-hover:bg-blue-700 group-hover:text-white">
                <FiGift className="text-xl" />
              </div>

              <span className="text-xs font-black text-gray-200">03</span>
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-950">
              Your Reunion Package
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Every registered participant will receive a commemorative package
              prepared by the reunion organizers.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {giftItems.map((gift) => (
                <div
                  key={gift}
                  className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="shrink-0 text-sm text-blue-600" />

                    <span className="text-xs font-semibold text-gray-600">
                      {gift}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* ==================================================
            T-SHIRT / PARTICIPANT HIGHLIGHT
        ================================================== */}
        <div className="mx-auto mt-8 max-w-6xl lg:mt-10">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
              {/* LEFT VISUAL */}
              <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-slate-950 p-8 sm:min-h-[360px]">
                <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full border border-white/10" />

                <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full border border-blue-500/10" />

                <div className="relative text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10">
                    <FiGift className="text-4xl text-blue-300" />
                  </div>

                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-blue-300">
                    Commemorative
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                    Reunion T-Shirt
                  </h3>

                  <p className="mt-3 text-sm text-gray-400">
                    A special keepsake for registered participants.
                  </p>
                </div>
              </div>

              {/* RIGHT CONTENT */}
              <div className="p-7 sm:p-10 lg:p-12">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <FiStar />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
                      Participant Benefit
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      Wear the memories
                    </p>
                  </div>
                </div>

                <h3 className="mt-6 text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
                  Your reunion T-shirt is part of the celebration.
                </h3>

                <p className="mt-4 text-sm leading-7 text-gray-500 sm:text-base">
                  Registered participants can select their preferred T-shirt
                  size during registration. The final package and available
                  sizes will be managed by the reunion organizing team.
                </p>

                {/* Sizes */}
                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Available Sizes
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((size) => (
                      <span
                        key={size}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-600"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-7 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <FiShield className="mt-0.5 shrink-0 text-blue-700" />

                  <p className="text-xs leading-5 text-blue-900">
                    Please choose your T-shirt size carefully. Final
                    distribution will be based on the registration information
                    submitted by each participant.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            GUIDELINES
        ================================================== */}
        <div className="mx-auto mt-8 max-w-6xl lg:mt-10">
          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
              {/* HEADER */}
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <FiShield className="text-xl" />
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                  Important
                </p>

                <h3 className="mt-3 text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
                  A few things to remember before reunion day.
                </h3>

                <p className="mt-4 text-sm leading-7 text-gray-500">
                  A little preparation helps us create a smooth, organized and
                  memorable experience for everyone.
                </p>
              </div>

              {/* GUIDELINE LIST */}
              <div className="space-y-3">
                {guidelines.map((guideline, index) => (
                  <div
                    key={guideline}
                    className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 transition duration-300 hover:border-blue-100 hover:bg-blue-50/40"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black text-blue-700 shadow-sm">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <p className="text-sm leading-6 text-gray-600">
                      {guideline}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            VENUE INFORMATION
        ================================================== */}
        <div className="mx-auto mt-8 max-w-6xl lg:mt-10">
          <div className="relative overflow-hidden rounded-3xl bg-blue-700 p-7 sm:p-10 lg:p-12">
            {/* Decoration */}
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full border border-white/10" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100">
                  <FiMapPin />
                  Reunion Venue
                </div>

                <h3 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
                  Returning to the place where our stories began.
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100/80 sm:text-base">
                  Our school campus will once again become the meeting place for
                  generations of students, teachers, friends and alumni.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                    <FiMapPin className="text-blue-100" />

                    <span className="text-sm font-semibold text-white">
                      {eventInfo.venue}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                    <FiCalendar className="text-blue-100" />

                    <span className="text-sm font-semibold text-white">
                      {eventInfo.date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Venue Icon */}
              <div className="hidden h-32 w-32 items-center justify-center rounded-full border border-white/20 bg-white/10 lg:flex">
                <FiMapPin className="text-5xl text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            REGISTRATION CTA
        ================================================== */}
        <div className="mt-12 text-center sm:mt-14">
          <p className="text-sm text-gray-500">
            Ready to become part of this historic gathering?
          </p>

          <Link
            to="/reunionregister"
            className="group mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200/50 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl sm:px-7"
          >
            Register for Reunion 2027
            <FiArrowRight className="text-lg transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <p className="mt-3 text-xs text-gray-400">
            Registration details and event information may be updated by the
            organizing committee.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ReunionInformation;
