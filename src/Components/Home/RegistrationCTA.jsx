import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiClock,
  FiGift,
  FiMapPin,
  FiShield,
  FiUsers,
} from "react-icons/fi";

/*
|--------------------------------------------------------------------------
| DEMO EVENT DATA
|--------------------------------------------------------------------------
| These values are currently static for UI development.
|
| Later these should come from MongoDB:
|
| GET /api/reunion
|
|--------------------------------------------------------------------------
*/

const eventInfo = {
  title: "Grand School Reunion 2027",
  date: "22 February 2027",
  day: "Monday",
  time: "9:00 AM – 5:00 PM",
  venue: "School Campus",
  location: "Our Beloved School Campus",
  registrationDeadline: "Registration deadline will be announced",
};

/*
|--------------------------------------------------------------------------
| REUNION BENEFITS
|--------------------------------------------------------------------------
*/

const registrationBenefits = [
  "Official reunion registration",
  "Reunion T-shirt",
  "Commemorative gift package",
  "Bag, mug, pen & school crest",
  "Access to reunion activities",
  "Alumni community connection",
];

/*
|--------------------------------------------------------------------------
| EVENT STATS
|--------------------------------------------------------------------------
| Later these can be calculated from MongoDB.
|--------------------------------------------------------------------------
*/

const eventStats = [
  {
    value: "76+",
    label: "Years of Legacy",
  },
  {
    value: "01",
    label: "Special Reunion",
  },
  {
    value: "∞",
    label: "Memories to Share",
  },
];

const RegistrationCTA = () => {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
      {/* =========================================================
          BACKGROUND DECORATIONS
      ========================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-slate-200/70 blur-3xl" />

        <div className="absolute left-[7%] top-[14%] hidden h-20 w-20 rounded-full border border-blue-200 lg:block" />

        <div className="absolute bottom-[18%] right-[7%] hidden h-16 w-16 rounded-full border border-slate-300 lg:block" />

        <div className="absolute left-1/2 top-0 hidden h-px w-32 -translate-x-1/2 bg-blue-200 lg:block" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =========================================================
            SECTION INTRO
        ========================================================== */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-blue-600" />

            <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700 sm:text-sm">
              Reunion Registration
            </span>

            <span className="h-px w-10 bg-blue-600" />
          </div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Come Back to Where
            <span className="block text-blue-700">Your Story Began</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
            After years apart, generations of students, teachers and alumni will
            come together again to celebrate friendship, memories and the legacy
            of our beloved school.
          </p>
        </div>

        {/* =========================================================
            MAIN CTA CARD
        ========================================================== */}
        <div className="mx-auto mt-12 max-w-6xl sm:mt-16">
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 shadow-2xl shadow-slate-300/40">
            {/* Decorative rings */}
            <div className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -bottom-48 left-1/3 h-[500px] w-[500px] rounded-full border border-white/10" />

            <div className="pointer-events-none absolute right-[20%] top-[35%] hidden h-24 w-24 rounded-full border border-blue-500/10 lg:block" />

            <div className="relative grid lg:grid-cols-[1.05fr_0.95fr]">
              {/* =====================================================
                  LEFT CONTENT
              ====================================================== */}
              <div className="p-7 sm:p-10 lg:p-14">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                  <FiUsers />
                  Everyone Has a Place Here
                </div>

                {/* Heading */}
                <h3 className="mt-6 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Be Part of the
                  <span className="block text-blue-400">Reunion Story</span>
                </h3>

                <p className="mt-5 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
                  Whether you were a student yesterday or decades ago, this is
                  your opportunity to return to the school, reconnect with old
                  friends and create new memories together.
                </p>

                {/* Event Information */}
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {/* Date */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                        <FiCalendar />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
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
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                        <FiClock />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                          Time
                        </p>

                        <p className="mt-1 text-sm font-bold text-white">
                          {eventInfo.time}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                          Full Day Event
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:col-span-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                        <FiMapPin />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
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

                {/* Main CTA */}
                <div className="mt-9">
                  <Link
                    to="/reunion/register"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl sm:w-auto"
                  >
                    Register for the Reunion
                    <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>

                {/* Security / Info */}
                <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-gray-500">
                  <FiShield className="mt-0.5 shrink-0 text-blue-400" />

                  <span>
                    Your registration information will be handled securely and
                    used for reunion coordination.
                  </span>
                </div>
              </div>

              {/* =====================================================
                  RIGHT SIDE — REGISTRATION PACKAGE
              ====================================================== */}
              <div className="relative border-t border-white/10 bg-white/[0.03] p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-14">
                {/* Gift Badge */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-300">
                    <FiGift className="text-blue-300" />
                    Reunion Package
                  </div>

                  <span className="text-xs font-semibold text-blue-300">
                    Included
                  </span>
                </div>

                <h4 className="mt-7 text-2xl font-bold text-white sm:text-3xl">
                  Your Reunion Experience
                </h4>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Registered participants will receive the official reunion
                  package prepared by the organizing committee.
                </p>

                {/* Benefits */}
                <div className="mt-7 space-y-3">
                  {registrationBenefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.06]"
                    >
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-300">
                        <FiCheck className="text-xs" />
                      </div>

                      <span className="text-sm text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* T-shirt note */}
                <div className="mt-7 rounded-2xl border border-blue-500/10 bg-blue-500/5 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                    T-Shirt
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    Select your preferred T-shirt size during registration.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((size) => (
                      <span
                        key={size}
                        className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] font-bold text-gray-400"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            EVENT STATS
        ========================================================== */}
        <div className="mx-auto mt-8 max-w-6xl">
          <div className="grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:grid-cols-3">
            {eventStats.map((stat, index) => (
              <div
                key={stat.label}
                className={`p-6 text-center sm:p-7 ${
                  index !== eventStats.length - 1
                    ? "border-b border-gray-100 sm:border-b-0 sm:border-r"
                    : ""
                }`}
              >
                <p className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================
            REGISTRATION STEPS
        ========================================================== */}
        <div className="mx-auto mt-16 max-w-6xl sm:mt-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            {/* Intro */}
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-700" />

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                  Simple Registration
                </p>
              </div>

              <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Three steps to join the celebration
              </h3>

              <p className="mt-4 max-w-md text-sm leading-7 text-gray-500 sm:text-base">
                Registration is designed to be simple. Provide your school
                information, select your T-shirt size and confirm your
                participation.
              </p>

              <Link
                to="/reunion/register"
                className="group mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition hover:text-blue-800"
              >
                Start registration
                <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Steps */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Step 1 */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">
                  01
                </div>

                <h4 className="mt-5 text-base font-bold text-slate-950">
                  Your Details
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Tell us who you are and your connection with the school.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">
                  02
                </div>

                <h4 className="mt-5 text-base font-bold text-slate-950">
                  T-Shirt Size
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Choose the T-shirt size you would like for the reunion.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">
                  03
                </div>

                <h4 className="mt-5 text-base font-bold text-slate-950">
                  Confirm
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Review your information and confirm your reunion
                  participation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            FINAL MESSAGE
        ========================================================== */}
        <div className="mt-16 text-center sm:mt-20">
          <div className="mx-auto max-w-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <FiUsers className="text-xl" />
            </div>

            <p className="mt-5 text-sm leading-7 text-gray-500 sm:text-base">
              Generations apart. One school. One family.
              <span className="font-semibold text-slate-800">
                {" "}
                Let's make this reunion unforgettable.
              </span>
            </p>

            <Link
              to="/reunion/register"
              className="group mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700"
            >
              Register today
              <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationCTA;
