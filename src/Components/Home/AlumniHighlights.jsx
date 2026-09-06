import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBriefcase,
  FiChevronRight,
  FiMapPin,
  FiMessageCircle,
  FiStar,
  FiUsers,
} from "react-icons/fi";

const featuredAlumni = {
  name: "Featured Alumni",
  batch: "SSC Batch 2005",
  profession: "Community & Professional Leader",
  location: "Dhaka, Bangladesh",
  quote:
    "Our school gave us more than education. It gave us friendships, values and memories that continue to shape our journey.",
  image:
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80",
};

const alumniList = [
  {
    id: 1,
    name: "Rahim Ahmed",
    batch: "SSC 2005",
    profession: "Business Professional",
    location: "Dhaka",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 2,
    name: "Nusrat Jahan",
    batch: "SSC 2008",
    profession: "Education Professional",
    location: "Chattogram",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 3,
    name: "Mahmud Hasan",
    batch: "SSC 2010",
    profession: "Technology Professional",
    location: "Dhaka",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 4,
    name: "Sadia Rahman",
    batch: "SSC 2012",
    profession: "Healthcare Professional",
    location: "Rajshahi",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=500&q=80",
  },
];

const AlumniHighlights = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24 lg:py-28">
      {/* ==================================================
          BACKGROUND DECORATION
      ================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-slate-200/70 blur-3xl" />

        <div className="absolute left-[7%] top-[15%] hidden h-20 w-20 rounded-full border border-blue-200 lg:block" />

        <div className="absolute bottom-[18%] right-[7%] hidden h-16 w-16 rounded-full border border-slate-300 lg:block" />

        <div className="absolute left-1/2 top-0 hidden h-px w-32 -translate-x-1/2 bg-blue-200 lg:block" />
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
              Our Alumni
            </span>

            <span className="h-px w-10 bg-blue-600" />
          </div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            The People Who Carry
            <span className="block text-blue-700">Our School Forward</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
            Our alumni are part of a growing community connected by shared
            classrooms, friendships, teachers and memories. Their journeys
            continue the story of our school far beyond the campus.
          </p>
        </div>

        {/* ==================================================
            FEATURED ALUMNI
        ================================================== */}
        <div className="mx-auto mt-12 max-w-6xl sm:mt-16">
          <div className="overflow-hidden rounded-3xl bg-slate-950 shadow-2xl shadow-slate-300/40">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              {/* IMAGE */}
              <div className="relative min-h-[360px] overflow-hidden sm:min-h-[430px] lg:min-h-[520px]">
                <img
                  src={featuredAlumni.image}
                  alt={featuredAlumni.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-105"
                />

                {/* Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Featured badge */}
                <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md sm:left-7 sm:top-7">
                  <FiStar className="text-blue-300" />
                  Featured Alumni
                </div>

                {/* Bottom image info */}
                <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                    {featuredAlumni.batch}
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                    {featuredAlumni.name}
                  </h3>
                </div>
              </div>

              {/* CONTENT */}
              <div className="relative flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                {/* Decorative circle */}
                <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full border border-white/10" />

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                    <FiMessageCircle className="text-xl" />
                  </div>

                  <p className="mt-7 max-w-xl text-xl font-medium leading-9 text-white sm:text-2xl sm:leading-10">
                    “{featuredAlumni.quote}”
                  </p>

                  <div className="mt-8 h-px w-16 bg-blue-500" />

                  <div className="mt-6 space-y-4">
                    {/* Profession */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-blue-300">
                        <FiBriefcase />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          Profession
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-gray-200">
                          {featuredAlumni.profession}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-blue-300">
                        <FiMapPin />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          Based In
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-gray-200">
                          {featuredAlumni.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/alumni"
                    className="group mt-9 inline-flex items-center gap-2 text-sm font-bold text-blue-300 transition hover:text-white"
                  >
                    Explore our alumni community
                    <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            COMMUNITY INTRO
        ================================================== */}
        <div className="mx-auto mt-12 max-w-6xl sm:mt-16">
          <div className="grid gap-5 sm:grid-cols-3">
            {/* Alumni */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <FiUsers />
              </div>

              <p className="mt-5 text-3xl font-black tracking-tight text-slate-950">
                1000+
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                Alumni Community
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Former students connected through a shared school story.
              </p>
            </div>

            {/* Batches */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <FiStar />
              </div>

              <p className="mt-5 text-3xl font-black tracking-tight text-slate-950">
                40+
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                Generations
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Multiple generations sharing one campus, one identity and one
                family.
              </p>
            </div>

            {/* Locations */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <FiMapPin />
              </div>

              <p className="mt-5 text-3xl font-black tracking-tight text-slate-950">
                64+
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                Districts & Cities
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Our school family continues to grow across Bangladesh and
                beyond.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            ALUMNI DIRECTORY PREVIEW
        ================================================== */}
        <div className="mt-16 sm:mt-20">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-700" />

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                  Alumni Spotlight
                </p>
              </div>

              <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Meet members of our school family
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                A glimpse of the people who continue to represent our school in
                different professions and communities.
              </p>
            </div>

            <Link
              to="/alumni"
              className="group inline-flex w-fit items-center gap-2 text-sm font-bold text-blue-700 transition hover:text-blue-800"
            >
              View all alumni
              <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* ==================================================
              ALUMNI CARDS
          ================================================== */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {alumniList.map((alumni) => (
              <article
                key={alumni.id}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/40"
              >
                {/* Photo */}
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src={alumni.image}
                    alt={alumni.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  {/* Image overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/70 to-transparent opacity-80" />

                  {/* Batch badge */}
                  <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-slate-950/70 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">
                    {alumni.batch}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h4 className="text-lg font-bold text-slate-950">
                    {alumni.name}
                  </h4>

                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <FiBriefcase className="shrink-0 text-blue-600" />

                    <span>{alumni.profession}</span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <FiMapPin className="shrink-0 text-blue-600" />

                    <span>{alumni.location}</span>
                  </div>

                  <Link
                    to={`/alumni/${alumni.id}`}
                    className="group/link mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-bold text-blue-700"
                  >
                    <span>View profile</span>

                    <FiChevronRight className="transition-transform duration-300 group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ==================================================
            ALUMNI COMMUNITY MESSAGE
        ================================================== */}
        <div className="mx-auto mt-12 max-w-6xl sm:mt-16">
          <div className="relative overflow-hidden rounded-3xl bg-blue-700 p-7 sm:p-10 lg:p-12">
            {/* Decoration */}
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full border border-white/10" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100">
                  <FiUsers />
                  Stay Connected
                </div>

                <h3 className="mt-5 max-w-2xl text-2xl font-bold leading-tight text-white sm:text-3xl">
                  Your school journey didn't end at graduation.
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100/80 sm:text-base">
                  It continues through the people you met, the values you
                  learned and the memories you created. Join our alumni
                  community and reconnect with your school family.
                </p>
              </div>

              <Link
                to="/alumni"
                className="group inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-blue-700 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-xl"
              >
                Explore Alumni Directory
                <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* ==================================================
            BOTTOM LINE
        ================================================== */}
        <div className="mt-12 text-center sm:mt-14">
          <p className="text-sm text-gray-500 sm:text-base">
            Different generations. Different journeys.
            <span className="font-semibold text-slate-800">
              {" "}
              One school family.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default AlumniHighlights;
