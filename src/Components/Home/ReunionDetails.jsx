import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiAward,
  FiCalendar,
  FiCheck,
  FiChevronRight,
  FiClock,
  FiGift,
  FiHeart,
  FiInfo,
  FiMapPin,
  FiShield,
  FiStar,
  FiUsers,
} from "react-icons/fi";

/*
|--------------------------------------------------------------------------
| DEMO EVENT DATA
|--------------------------------------------------------------------------
| UI development-এর জন্য এখন static data ব্যবহার করা হচ্ছে।
|
| Production:
| GET /api/reunion
|
| MongoDB থেকে এই data আসবে।
|--------------------------------------------------------------------------
*/

const reunion = {
  title: "Grand School Reunion 2027",
  shortTitle: "Grand Reunion 2027",
  edition: "76 Years Celebration",

  date: "22 February 2027",
  day: "Monday",

  startTime: "9:00 AM",
  endTime: "5:00 PM",

  venue: "School Campus",
  address: "Our Beloved School Campus",

  status: "Registration Open",

  description:
    "A special gathering of students, alumni, teachers and friends of our school to celebrate generations of memories, friendships, achievements and the journey we share.",

  registrationDeadline: "Registration deadline will be announced",

  registrationOpen: true,

  paymentRequired: false,
};

/*
|--------------------------------------------------------------------------
| EVENT HIGHLIGHTS
|--------------------------------------------------------------------------
*/

const highlights = [
  {
    icon: FiUsers,
    title: "Alumni Gathering",
    description:
      "Reconnect with classmates, friends and generations of alumni from across the country.",
  },
  {
    icon: FiAward,
    title: "Teachers' Recognition",
    description:
      "Come together to honour the teachers who helped shape generations of students.",
  },
  {
    icon: FiStar,
    title: "Cultural Program",
    description:
      "Enjoy performances, stories and activities prepared especially for the reunion.",
  },
  {
    icon: FiHeart,
    title: "Shared Memories",
    description:
      "Revisit school memories and create new moments with your school family.",
  },
];

/*
|--------------------------------------------------------------------------
| WHO CAN PARTICIPATE
|--------------------------------------------------------------------------
*/

const participants = [
  {
    number: "01",
    title: "Former Students",
    description:
      "Students who studied at the school and are now part of our alumni community.",
  },
  {
    number: "02",
    title: "Current Students",
    description:
      "Eligible current students who are included in the reunion program.",
  },
  {
    number: "03",
    title: "Teachers & Staff",
    description:
      "Current and former teachers and staff members connected with the school.",
  },
  {
    number: "04",
    title: "Invited Guests",
    description:
      "Special guests and members of the school community invited by the organizing committee.",
  },
];

/*
|--------------------------------------------------------------------------
| REGISTRATION STEPS
|--------------------------------------------------------------------------
*/

const registrationSteps = [
  {
    number: "01",
    title: "Create an Account",
    description:
      "Register or sign in to your account before submitting your reunion registration.",
  },
  {
    number: "02",
    title: "Provide School Information",
    description:
      "Add your class, batch and department information where applicable.",
  },
  {
    number: "03",
    title: "Choose T-Shirt Size",
    description:
      "Select your preferred reunion T-shirt size from the available options.",
  },
  {
    number: "04",
    title: "Confirm Registration",
    description:
      "Review your information and confirm your participation in the reunion.",
  },
];

/*
|--------------------------------------------------------------------------
| REUNION PACKAGE
|--------------------------------------------------------------------------
*/

const reunionGifts = [
  "Official reunion bag",
  "Commemorative mug",
  "Reunion pen",
  "School crest",
  "Official reunion T-shirt",
  "Additional gifts prepared by the organizing committee",
];

/*
|--------------------------------------------------------------------------
| T-SHIRT SIZES
|--------------------------------------------------------------------------
*/

const tshirtSizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

/*
|--------------------------------------------------------------------------
| IMPORTANT GUIDELINES
|--------------------------------------------------------------------------
*/

const guidelines = [
  "Provide accurate personal and school information during registration.",
  "T-shirt size should be selected carefully before confirming registration.",
  "Reunion package availability is subject to the official event policy.",
  "Registration confirmation and attendance are separate processes.",
  "Event rules and schedule may be updated by the organizing committee.",
  "Participants should follow the instructions of the event volunteers and organizers.",
];

const ReunionDetails = () => {
  return (
    <main className="bg-white">
      {/* =========================================================
          HERO SECTION
      ========================================================== */}
      <section className="relative overflow-hidden bg-slate-950">
        {/* Decorative Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full border border-white/10" />

          <div className="absolute -bottom-52 -right-40 h-[520px] w-[520px] rounded-full border border-white/10" />

          <div className="absolute left-1/2 top-0 h-px w-40 -translate-x-1/2 bg-blue-500/40" />

          <div className="absolute left-[10%] top-[35%] hidden h-20 w-20 rounded-full border border-blue-500/10 lg:block" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            {/* Hero Content */}
            <div>
              {/* Breadcrumb */}
              <div className="mb-7 flex items-center gap-2 text-xs text-gray-500">
                <Link to="/" className="transition hover:text-white">
                  Home
                </Link>

                <FiChevronRight className="text-gray-700" />

                <Link to="/reunion" className="transition hover:text-white">
                  Reunion
                </Link>

                <FiChevronRight className="text-gray-700" />

                <span className="text-gray-400">Details</span>
              </div>

              {/* Status */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                {reunion.status}
              </div>

              {/* Heading */}
              <h1 className="mt-7 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                {reunion.title}
              </h1>

              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-blue-400 sm:text-base">
                {reunion.edition}
              </p>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base sm:leading-8">
                {reunion.description}
              </p>

              {/* Hero CTA */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/reunion/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500"
                >
                  Register for Reunion
                  <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <a
                  href="#event-information"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold text-gray-200 transition hover:bg-white/10"
                >
                  Explore Event
                  <FiChevronRight />
                </a>
              </div>
            </div>

            {/* Hero Event Card */}
            <div className="relative">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-sm sm:p-8">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                    Event Information
                  </p>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                    <FiCalendar />
                  </div>
                </div>

                <div className="mt-7">
                  <p className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {reunion.date}
                  </p>

                  <p className="mt-2 text-sm font-semibold text-blue-300">
                    {reunion.day}
                  </p>
                </div>

                <div className="my-7 h-px bg-white/10" />

                <div className="space-y-5">
                  {/* Time */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blue-300">
                      <FiClock />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                        Time
                      </p>

                      <p className="mt-1 text-sm font-bold text-white">
                        {reunion.startTime} – {reunion.endTime}
                      </p>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blue-300">
                      <FiMapPin />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                        Venue
                      </p>

                      <p className="mt-1 text-sm font-bold text-white">
                        {reunion.venue}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {reunion.address}
                      </p>
                    </div>
                  </div>

                  {/* Registration */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blue-300">
                      <FiShield />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                        Registration
                      </p>

                      <p className="mt-1 text-sm font-bold text-white">
                        {reunion.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          EVENT INFORMATION
      ========================================================== */}
      <section
        id="event-information"
        className="relative overflow-hidden bg-slate-50 py-20 sm:py-24 lg:py-28"
      >
        <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start lg:gap-20">
            {/* Intro */}
            <div className="lg:sticky lg:top-8">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-blue-600" />

                <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
                  The Reunion
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                More Than an Event.
                <span className="block text-blue-700">
                  It's Our Shared Story.
                </span>
              </h2>

              <p className="mt-5 text-sm leading-7 text-gray-600 sm:text-base">
                This reunion is an opportunity for generations of our school
                family to return to the place where many of our journeys began.
              </p>

              <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-3xl font-black text-slate-950">76+</p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  Years of School Legacy
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Generations connected through education, friendship and
                  memories.
                </p>
              </div>
            </div>

            {/* Information Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <FiCalendar />
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                  Date
                </p>

                <p className="mt-2 text-xl font-bold text-slate-950">
                  {reunion.date}
                </p>

                <p className="mt-1 text-sm text-gray-500">{reunion.day}</p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <FiClock />
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                  Event Time
                </p>

                <p className="mt-2 text-xl font-bold text-slate-950">
                  {reunion.startTime} – {reunion.endTime}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Full-day celebration
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <FiMapPin />
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                  Venue
                </p>

                <p className="mt-2 text-xl font-bold text-slate-950">
                  {reunion.venue}
                </p>

                <p className="mt-1 text-sm text-gray-500">{reunion.address}</p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <FiUsers />
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                  Participants
                </p>

                <p className="mt-2 text-xl font-bold text-slate-950">
                  Students & Alumni
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Along with teachers, staff and invited guests
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          EVENT HIGHLIGHTS
      ========================================================== */}
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-blue-600" />

              <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
                Reunion Experience
              </span>

              <span className="h-px w-10 bg-blue-600" />
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              What Awaits You
              <span className="block text-blue-700">at the Reunion</span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
              A day filled with people, stories, recognition, celebration and
              the familiar feeling of being back at your school.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/30 sm:p-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                    <Icon className="text-xl" />
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    {item.description}
                  </p>

                  <div className="mt-6 h-px w-8 bg-blue-600 transition-all duration-300 group-hover:w-14" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          WHO CAN PARTICIPATE
      ========================================================== */}
      <section className="bg-slate-50 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            {/* Heading */}
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-blue-600" />

                <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
                  Who Can Join
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                There is a place
                <span className="block text-blue-700">
                  for every generation.
                </span>
              </h2>

              <p className="mt-5 text-sm leading-7 text-gray-600 sm:text-base">
                Our reunion is designed to bring together the wider school
                family and celebrate the people who have been part of its
                journey.
              </p>
            </div>

            {/* Participants */}
            <div className="grid gap-4 sm:grid-cols-2">
              {participants.map((item) => (
                <div
                  key={item.number}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-100 hover:shadow-lg sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-[0.18em] text-blue-700">
                      {item.number}
                    </span>

                    <FiArrowRight className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                  </div>

                  <h3 className="mt-7 text-lg font-bold text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          REUNION GIFT PACKAGE
      ========================================================== */}
      <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full border border-white/10" />

        <div className="pointer-events-none absolute -bottom-52 left-1/4 h-[500px] w-[500px] rounded-full border border-white/10" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
            {/* Intro */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                <FiGift />
                Reunion Package
              </div>

              <h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                A Small Gift
                <span className="block text-blue-400">From a Big Memory</span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
                Every registered participant will receive the official reunion
                package prepared according to the event's approved package
                configuration.
              </p>

              <div className="mt-7 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-blue-300">
                  <FiHeart />
                </div>

                <p className="text-sm font-semibold text-gray-300">
                  A keepsake to remember the day.
                </p>
              </div>
            </div>

            {/* Gift List */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:p-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white sm:text-2xl">
                  Included in the Package
                </h3>

                <FiGift className="text-xl text-blue-300" />
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {reunionGifts.map((gift) => (
                  <div
                    key={gift}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3.5"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-300">
                      <FiCheck className="text-xs" />
                    </span>

                    <span className="text-sm leading-5 text-gray-300">
                      {gift}
                    </span>
                  </div>
                ))}
              </div>

              {/* T-shirt */}
              <div className="mt-7 rounded-2xl border border-blue-500/10 bg-blue-500/5 p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                  Available T-Shirt Sizes
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {tshirtSizes.map((size) => (
                    <span
                      key={size}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-gray-300"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          REGISTRATION PROCESS
      ========================================================== */}
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-blue-600" />

              <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
                Registration Process
              </span>

              <span className="h-px w-10 bg-blue-600" />
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Your Journey to the Reunion
              <span className="block text-blue-700">Starts Here</span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
              Complete a few simple steps and secure your place at this special
              gathering.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {registrationSteps.map((step) => (
              <div
                key={step.number}
                className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7"
              >
                <span className="text-xs font-black tracking-[0.2em] text-blue-700">
                  STEP {step.number}
                </span>

                <h3 className="mt-5 text-lg font-bold text-slate-950">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  {step.description}
                </p>

                <div className="mt-6 h-px w-10 bg-blue-600" />
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/reunionregister"
              className="group inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-800"
            >
              Start Registration
              <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          IMPORTANT GUIDELINES
      ========================================================== */}
      <section className="bg-slate-50 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[0.7fr_1.3fr]">
              {/* Left */}
              <div className="bg-slate-950 p-7 sm:p-10 lg:p-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                  <FiInfo className="text-xl" />
                </div>

                <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                  Before You Register
                </p>

                <h2 className="mt-4 text-2xl font-bold leading-tight text-white sm:text-3xl">
                  A few things to keep in mind.
                </h2>

                <p className="mt-4 text-sm leading-7 text-gray-400">
                  Please review the event information and official guidelines
                  before submitting your registration.
                </p>
              </div>

              {/* Right */}
              <div className="p-7 sm:p-10 lg:p-12">
                <div className="space-y-4">
                  {guidelines.map((guideline, index) => (
                    <div key={guideline} className="flex items-start gap-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                        {index + 1}
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
        </div>
      </section>

      {/* =========================================================
          VENUE SECTION
      ========================================================== */}
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-blue-700 shadow-2xl shadow-blue-200/40">
            <div className="grid lg:grid-cols-[1fr_0.8fr]">
              {/* Venue Content */}
              <div className="p-7 sm:p-10 lg:p-14">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
                  <FiMapPin className="text-xl" />
                </div>

                <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
                  Return to Where It Began
                </p>

                <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                  {reunion.venue}
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100/80 sm:text-base">
                  {reunion.address}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-blue-700 transition hover:bg-gray-50"
                  >
                    Venue Information
                    <FiArrowRight />
                  </Link>
                </div>
              </div>

              {/* Venue Visual */}
              <div className="relative min-h-[260px] overflow-hidden border-t border-white/10 bg-blue-800/30 lg:min-h-0 lg:border-l lg:border-t-0">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-44 w-44 items-center justify-center rounded-full border border-white/10">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/10">
                      <FiMapPin className="text-3xl text-blue-100" />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-slate-950/20 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">
                    Event Venue
                  </p>

                  <p className="mt-1 text-sm font-bold text-white">
                    {reunion.venue}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL REGISTRATION CTA
      ========================================================== */}
      <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-px w-32 -translate-x-1/2 bg-blue-500/40" />

          <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full border border-white/10" />

          <div className="absolute -right-32 top-0 h-72 w-72 rounded-full border border-white/10" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300">
            <FiUsers className="text-2xl" />
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
            Your Place Is Waiting
          </p>

          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Come Back.
            <span className="block text-blue-400">Reconnect. Remember.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base sm:leading-8">
            Years may have passed, but the memories we created at school remain.
            Join us and make this reunion another chapter in our shared story.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/reunionregister"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-blue-950/40 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500"
            >
              Register for Reunion
              <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-bold text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              Back to Reunion
              <FiChevronRight />
            </Link>
          </div>

          <p className="mt-6 text-xs text-gray-600">
            {reunion.registrationDeadline}
          </p>
        </div>
      </section>
    </main>
  );
};

export default ReunionDetails;
