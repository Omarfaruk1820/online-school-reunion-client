import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiHeart,
  FiMapPin,
  FiStar,
  FiUsers,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| Fallback data
|--------------------------------------------------------------------------
| This keeps the page visually usable while the MongoDB API is being
| configured. Once the API is connected, MongoDB data will be used.
|--------------------------------------------------------------------------
*/

const FALLBACK_ABOUT = {
  schoolName: "Our Beloved School",
  shortName: "Our School",
  establishedYear: 1951,
  yearsOfLegacy: 76,

  heroTitle: "A Legacy Built on Learning, Friendship & Memories",
  heroDescription:
    "For generations, our school has been more than a place of education. It has been a place where friendships began, dreams took shape, and memories were created. The reunion is our opportunity to come together once again and celebrate that shared journey.",

  storyTitle: "More Than a School. A Part of Our Lives.",
  storyDescription:
    "Every school has classrooms, corridors, teachers and students. But a truly special school becomes part of the lives of the people who pass through its gates. Our school has carried generations of students toward new dreams while creating friendships and memories that remain long after graduation.",

  location: "School Campus, Bangladesh",

  stats: [
    {
      value: "76+",
      label: "Years of Legacy",
    },
    {
      value: "1000+",
      label: "Students & Alumni",
    },
    {
      value: "01",
      label: "School Family",
    },
    {
      value: "∞",
      label: "Memories",
    },
  ],

  journey: [
    {
      year: "1951",
      title: "The Beginning",
      description:
        "Our journey began with a vision to create a place where young minds could learn, grow and dream.",
    },
    {
      year: "1965",
      title: "Growing Together",
      description:
        "The school community continued to grow, creating stronger connections among students, teachers and families.",
    },
    {
      year: "1985",
      title: "A New Generation",
      description:
        "New generations of students became part of the school's continuing story and carried its values forward.",
    },
    {
      year: "2005",
      title: "A Wider Community",
      description:
        "Former students spread across different professions and places while remaining connected to their school.",
    },
    {
      year: "2027",
      title: "Coming Together Again",
      description:
        "The Grand School Reunion brings generations of students, teachers and friends together to celebrate our shared heritage.",
    },
  ],

  values: [
    {
      icon: "learning",
      title: "Learning",
      description:
        "Education remains at the heart of our school's identity and our commitment to future generations.",
    },
    {
      icon: "friendship",
      title: "Friendship",
      description:
        "The friendships formed here are among the most meaningful parts of the school experience.",
    },
    {
      icon: "community",
      title: "Community",
      description:
        "Students, teachers, alumni and families together form one continuing school community.",
    },
    {
      icon: "legacy",
      title: "Legacy",
      description:
        "We respect the past while building something meaningful for the generations that follow.",
    },
  ],
};

const About = () => {
  const [about, setAbout] = useState(FALLBACK_ABOUT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchAbout = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/about`, {
          timeout: 10000,
        });

        if (!mounted) return;

        if (response.data?.success && response.data?.data) {
          setAbout({
            ...FALLBACK_ABOUT,
            ...response.data.data,
          });
        }
      } catch (err) {
        if (!mounted) return;

        console.error("About page API error:", err);

        /*
         * We intentionally keep the fallback content visible.
         * In production you can replace this with a proper error state.
         */
        setError("Unable to load the latest school information.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchAbout();

    return () => {
      mounted = false;
    };
  }, []);

  const getValue = (value, fallback = "") => {
    return value || fallback;
  };

  const getValueIcon = (icon) => {
    switch (icon) {
      case "learning":
        return FiBookOpen;
      case "friendship":
        return FiHeart;
      case "community":
        return FiUsers;
      case "legacy":
        return FiAward;
      default:
        return FiStar;
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative isolate overflow-hidden bg-slate-950">
        {/* Background decoration */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute inset-0 opacity-[0.035]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-8 lg:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_.85fr]">
            {/* Hero content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-200 backdrop-blur">
                <FiAward className="text-blue-400" />
                {about.yearsOfLegacy}+ Years of Legacy
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.06] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                {getValue(
                  about.heroTitle,
                  "A Legacy Built on Learning, Friendship & Memories",
                )}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                {getValue(about.heroDescription)}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/reunionregister"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                >
                  Discover the Reunion
                  <FiArrowRight />
                </Link>

                <Link
                  to="/AlumniHighlights"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Meet Our Alumni
                  <FiUsers />
                </Link>
              </div>
            </div>

            {/* Hero legacy card */}
            <div className="relative">
              <div className="absolute -inset-5 rounded-[2rem] bg-blue-500/10 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                      Our Story
                    </p>

                    <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                      {getValue(about.shortName, "Our School")}
                    </h2>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl text-white">
                    <FiBookOpen />
                  </div>
                </div>

                <div className="my-7 h-px bg-white/10" />

                <div className="grid grid-cols-2 gap-3">
                  {about.stats?.slice(0, 4).map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <p className="text-2xl font-black text-white sm:text-3xl">
                        {stat.value}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-blue-400/10 bg-blue-500/10 p-5">
                  <div className="flex gap-3">
                    <FiHeart className="mt-1 shrink-0 text-blue-300" />

                    <p className="text-sm leading-6 text-slate-300">
                      A school may have buildings and classrooms, but its
                      greatest legacy lives in the people and memories it
                      creates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero bottom */}
          <div className="mt-16 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <FiCalendar className="text-blue-400" />

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Established
                </p>

                <p className="text-sm font-bold text-white">
                  {about.establishedYear}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FiMapPin className="text-blue-400" />

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Location
                </p>

                <p className="text-sm font-bold text-white">{about.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FiClock className="text-blue-400" />

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Reunion
                </p>

                <p className="text-sm font-bold text-white">
                  Grand Reunion 2027
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          INTRO / STORY
      ========================================================== */}
      <section className="py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
            {/* Large number */}
            <div className="relative">
              <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-blue-100 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-10">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                    Since
                  </p>

                  <FiAward className="text-2xl text-blue-600" />
                </div>

                <p className="mt-8 text-7xl font-black tracking-tighter text-slate-950 sm:text-8xl">
                  {about.establishedYear}
                </p>

                <div className="mt-7 h-px bg-slate-200" />

                <div className="mt-6">
                  <p className="text-lg font-black text-slate-900">
                    {about.yearsOfLegacy}+ years
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    of education, friendship, achievement and shared memories.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                    Learning
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                    Friendship
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                    Community
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                    Legacy
                  </span>
                </div>
              </div>
            </div>

            {/* Story */}
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                Our Story
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                {getValue(
                  about.storyTitle,
                  "More Than a School. A Part of Our Lives.",
                )}
              </h2>

              <p className="mt-6 text-base leading-8 text-slate-600">
                {getValue(about.storyDescription)}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FiBookOpen />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-950">
                    A Place to Learn
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Building knowledge, confidence and dreams for generations.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FiHeart />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-950">
                    A Place to Belong
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Creating friendships and memories that continue beyond
                    school.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          STATS
      ========================================================== */}
      <section className="border-y border-slate-200 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 sm:grid-cols-4 sm:divide-y-0">
            {about.stats?.map((stat) => (
              <div
                key={stat.label}
                className="px-4 py-5 text-center sm:px-6 sm:py-2"
              >
                <p className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          SCHOOL JOURNEY
      ========================================================== */}
      <section className="bg-slate-950 py-16 text-white sm:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-300">
              Our Journey
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Generations. Milestones. Memories.
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-400 sm:text-base">
              Every generation added another chapter to the story of our school.
              Here are some moments that represent the journey.
            </p>
          </div>

          {/* Desktop timeline */}
          <div className="relative mx-auto mt-16 hidden max-w-5xl md:block">
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/10" />

            <div className="space-y-14">
              {about.journey?.map((item, index) => {
                const isLeft = index % 2 === 0;

                return (
                  <div
                    key={`${item.year}-${item.title}`}
                    className="relative grid grid-cols-2 gap-16"
                  >
                    <div className={isLeft ? "text-right" : "col-start-2"}>
                      <div className={isLeft ? "ml-auto max-w-md" : "max-w-md"}>
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">
                          {item.year}
                        </p>

                        <h3 className="mt-2 text-xl font-black text-white">
                          {item.title}
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`absolute left-1/2 top-0 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-4 border-slate-950 bg-blue-600 shadow-lg shadow-blue-600/20`}
                    >
                      <span className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile timeline */}
          <div className="relative mt-12 md:hidden">
            <div className="absolute bottom-0 left-[17px] top-0 w-px bg-white/10" />

            <div className="space-y-10">
              {about.journey?.map((item) => (
                <div
                  key={`${item.year}-${item.title}`}
                  className="relative pl-12"
                >
                  <div className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border-4 border-slate-950 bg-blue-600">
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </div>

                  <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">
                    {item.year}
                  </p>

                  <h3 className="mt-2 text-xl font-black text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          VALUES
      ========================================================== */}
      <section className="py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-end gap-8 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                What defines us
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                The values that connect every generation.
              </h2>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-slate-500 lg:ml-auto">
              The school experience may be different for every generation, but
              some things remain constant. These values continue to connect
              students, teachers and alumni.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {about.values?.map((value, index) => {
              const Icon = getValueIcon(value.icon);

              return (
                <div
                  key={`${value.title}-${index}`}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Icon />
                  </div>

                  <h3 className="mt-6 text-lg font-black text-slate-950">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          STUDENT → ALUMNI JOURNEY
      ========================================================== */}
      <section className="pb-16 sm:pb-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-blue-600">
            <div className="grid lg:grid-cols-2">
              {/* Left */}
              <div className="relative overflow-hidden p-7 text-white sm:p-10 lg:p-14">
                <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                <div className="relative">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-100">
                    From Student to Alumni
                  </p>

                  <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
                    The school journey doesn&apos;t end at graduation.
                  </h2>

                  <p className="mt-5 text-sm leading-7 text-blue-100 sm:text-base">
                    Students may leave the school campus, but the connection
                    with the school can continue for a lifetime. The alumni
                    community keeps that connection alive.
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="bg-white p-7 sm:p-10 lg:p-14">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FiBookOpen />
                    </div>

                    <div>
                      <h3 className="font-black text-slate-950">
                        Student Years
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Learning, friendship, activities and the experiences
                        that shape our early years.
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FiArrowRight />
                    </div>

                    <div>
                      <h3 className="font-black text-slate-950">
                        Life Beyond School
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        New cities, universities, careers, families and
                        countless new chapters.
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FiUsers />
                    </div>

                    <div>
                      <h3 className="font-black text-slate-950">
                        Alumni Community
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Staying connected with classmates, teachers and the
                        school that brought everyone together.
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
          WHY REUNION
      ========================================================== */}
      <section className="bg-white py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                Why the Reunion Matters
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Some memories deserve to be lived again.
              </h2>

              <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                A reunion is more than an event on a calendar. It is an
                opportunity for old friends to meet again, teachers to reconnect
                with former students, and different generations to share the
                story of the school.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Reconnect with classmates and old friends",
                  "Meet alumni from different generations",
                  "Honor teachers and school memories",
                  "Celebrate the school's continuing legacy",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <FiCheckCircle className="mt-0.5 shrink-0 text-blue-600" />

                    <p className="text-sm font-semibold text-slate-700">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-5 rounded-[2rem] bg-blue-100/60 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl sm:p-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                      Grand School Reunion
                    </p>

                    <h3 className="mt-2 text-2xl font-black sm:text-3xl">
                      2027
                    </h3>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl">
                    <FiUsers />
                  </div>
                </div>

                <div className="my-8 h-px bg-white/10" />

                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                      <FiHeart />
                    </div>

                    <div>
                      <p className="font-bold">Reconnect</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        Find the people who shared your school years.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                      <FiAward />
                    </div>

                    <div>
                      <p className="font-bold">Celebrate</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        Celebrate the school and everyone who shaped its story.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                      <FiStar />
                    </div>

                    <div>
                      <p className="font-bold">Remember</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        Create new memories while remembering the old ones.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/reunionregister"
                  className="mt-9 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500"
                >
                  Register for the Reunion
                  <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          LOCATION
      ========================================================== */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-lg shadow-slate-200/50 sm:p-10 lg:p-12">
            <div className="grid items-center gap-8 md:grid-cols-[auto_1fr_auto]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                <FiMapPin />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  Our Home
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  The School Campus
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {about.location}
                </p>
              </div>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
              >
                Contact Us
                <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}
      <section className="bg-slate-950 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white">
            <FiHeart />
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-blue-300">
            One School. One Family.
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Our story continues with every generation.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            The reunion is another chapter in a story that began generations
            ago. Be part of the next chapter.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/reunionregister"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500"
            >
              Join the Reunion
              <FiArrowRight />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Small development indicator */}
      {loading && (
        <div className="fixed bottom-5 right-5 z-50 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-lg">
          Loading school information...
        </div>
      )}

      {error && !loading && (
        <div className="pointer-events-none fixed bottom-5 right-5 z-50 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700 shadow-lg">
          Using available school information
        </div>
      )}
    </main>
  );
};

export default About;
