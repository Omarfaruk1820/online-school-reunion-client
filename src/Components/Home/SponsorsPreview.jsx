import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiAward,
  FiBriefcase,
  FiChevronRight,
  FiExternalLink,
  FiHeart,
  FiStar,
  FiUsers,
} from "react-icons/fi";

/*
|--------------------------------------------------------------------------
| DEMO SPONSOR DATA
|--------------------------------------------------------------------------
| Later these data will come from MongoDB.
|
| Suggested API:
| GET /api/sponsors?active=true
|--------------------------------------------------------------------------
*/

const featuredSponsor = {
  id: "featured-1",
  name: "Your Main Sponsor",
  logo: "https://placehold.co/500x220/0f172a/ffffff?text=MAIN+SPONSOR",
  sponsorshipType: "Title Sponsor",
  description:
    "Proudly supporting the celebration that brings generations of students, teachers and alumni together.",
  website: "#",
};

const sponsors = [
  {
    id: 1,
    name: "Sponsor One",
    logo: "https://placehold.co/400x180/ffffff/0f172a?text=SPONSOR+ONE",
    sponsorshipType: "Gold Sponsor",
    description: "Supporting our school community and reunion celebration.",
    website: "#",
  },
  {
    id: 2,
    name: "Sponsor Two",
    logo: "https://placehold.co/400x180/ffffff/0f172a?text=SPONSOR+TWO",
    sponsorshipType: "Gold Sponsor",
    description: "Helping create memorable experiences for our alumni.",
    website: "#",
  },
  {
    id: 3,
    name: "Sponsor Three",
    logo: "https://placehold.co/400x180/ffffff/0f172a?text=SPONSOR+THREE",
    sponsorshipType: "Silver Sponsor",
    description: "Supporting the next chapter of our school family.",
    website: "#",
  },
  {
    id: 4,
    name: "Sponsor Four",
    logo: "https://placehold.co/400x180/ffffff/0f172a?text=SPONSOR+FOUR",
    sponsorshipType: "Event Partner",
    description: "A valued partner in making the reunion possible.",
    website: "#",
  },
];

const sponsorCategories = [
  {
    title: "Title Sponsors",
    description: "Our leading partners supporting the reunion celebration.",
    icon: FiAward,
  },
  {
    title: "Gold & Silver Sponsors",
    description: "Organizations contributing to the success of the event.",
    icon: FiStar,
  },
  {
    title: "Event Partners",
    description: "Partners helping us deliver a memorable reunion experience.",
    icon: FiBriefcase,
  },
];

const SponsorsPreview = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24 lg:py-28">
      {/* =========================================================
          DECORATIVE BACKGROUND
      ========================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-10 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-slate-200/70 blur-3xl" />

        <div className="absolute left-[8%] top-[16%] hidden h-16 w-16 rounded-full border border-blue-200 lg:block" />

        <div className="absolute bottom-[20%] right-[8%] hidden h-20 w-20 rounded-full border border-slate-300 lg:block" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =========================================================
            SECTION HEADER
        ========================================================== */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-blue-600" />

            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-700 sm:text-sm">
              <FiHeart />
              Our Partners
            </span>

            <span className="h-px w-10 bg-blue-600" />
          </div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Proudly Supported By
            <span className="block text-blue-700">Our Valued Partners</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
            A successful reunion is made possible by the people and
            organizations who believe in the strength of our school community.
            We are grateful to every partner supporting this special
            celebration.
          </p>
        </div>

        {/* =========================================================
            FEATURED / TITLE SPONSOR
        ========================================================== */}
        <div className="mx-auto mt-12 max-w-6xl sm:mt-16">
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 shadow-2xl shadow-slate-300/40">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full border border-white/10" />

            <div className="relative grid lg:grid-cols-[0.85fr_1.15fr]">
              {/* Left Content */}
              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">
                  <FiAward />
                  {featuredSponsor.sponsorshipType}
                </div>

                <h3 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {featuredSponsor.name}
                </h3>

                <p className="mt-5 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
                  {featuredSponsor.description}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    to="/sponsors"
                    className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500"
                  >
                    Meet Our Sponsors
                    <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>

                  {featuredSponsor.website !== "#" && (
                    <a
                      href={featuredSponsor.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-bold text-gray-200 transition hover:bg-white/10"
                    >
                      Visit Website
                      <FiExternalLink />
                    </a>
                  )}
                </div>
              </div>

              {/* Logo Area */}
              <div className="relative flex min-h-[260px] items-center justify-center border-t border-white/10 bg-white/[0.03] p-7 sm:min-h-[320px] sm:p-10 lg:min-h-[380px] lg:border-l lg:border-t-0">
                <div className="absolute left-6 top-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Presented With Support
                </div>

                <div className="relative flex w-full max-w-md items-center justify-center rounded-2xl border border-white/10 bg-white p-8 shadow-2xl sm:p-10">
                  <img
                    src={featuredSponsor.logo}
                    alt={`${featuredSponsor.name} logo`}
                    className="max-h-28 w-full object-contain sm:max-h-32"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            SPONSOR CATEGORIES
        ========================================================== */}
        <div className="mx-auto mt-14 max-w-6xl sm:mt-16">
          <div className="grid gap-4 md:grid-cols-3">
            {sponsorCategories.map((category) => {
              const Icon = category.icon;

              return (
                <div
                  key={category.title}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/30 sm:p-7"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Icon className="text-lg" />
                  </div>

                  <h4 className="mt-5 text-lg font-bold text-slate-950">
                    {category.title}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {category.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            SPONSOR GRID
        ========================================================== */}
        <div className="mx-auto mt-16 max-w-6xl sm:mt-20">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-700" />

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                  Our Supporting Partners
                </p>
              </div>

              <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Together, we make the celebration possible
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                We sincerely appreciate the organizations and partners who stand
                beside our school community.
              </p>
            </div>

            <Link
              to="/sponsors"
              className="group inline-flex w-fit items-center gap-2 text-sm font-bold text-blue-700 transition hover:text-blue-800"
            >
              View all sponsors
              <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {sponsors.map((sponsor) => (
              <article
                key={sponsor.id}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/30"
              >
                {/* Logo */}
                <div className="relative flex h-44 items-center justify-center overflow-hidden border-b border-gray-100 bg-gray-50 p-6">
                  <div className="absolute left-4 top-4 rounded-full border border-blue-100 bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-700">
                    {sponsor.sponsorshipType}
                  </div>

                  <img
                    src={sponsor.logo}
                    alt={`${sponsor.name} logo`}
                    loading="lazy"
                    className="max-h-24 w-full object-contain transition duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h4 className="text-lg font-bold text-slate-950">
                    {sponsor.name}
                  </h4>

                  <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
                    {sponsor.sponsorshipType}
                  </p>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
                    {sponsor.description}
                  </p>

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    {sponsor.website !== "#" ? (
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noreferrer"
                        className="group/link inline-flex items-center gap-2 text-xs font-bold text-blue-700"
                      >
                        Visit Sponsor
                        <FiExternalLink className="transition-transform group-hover/link:translate-x-0.5" />
                      </a>
                    ) : (
                      <Link
                        to="/sponsors"
                        className="group/link inline-flex items-center gap-2 text-xs font-bold text-blue-700"
                      >
                        View Sponsor
                        <FiChevronRight className="transition-transform group-hover/link:translate-x-0.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* =========================================================
            COMMUNITY SUPPORT MESSAGE
        ========================================================== */}
        <div className="mx-auto mt-16 max-w-6xl sm:mt-20">
          <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-blue-50 p-7 sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-blue-200/60" />

            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full border border-blue-200/50" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
                  <FiUsers />
                  One School Family
                </div>

                <h3 className="mt-5 max-w-2xl text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
                  Every contribution helps us celebrate our shared legacy.
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
                  Our sponsors and partners help bring generations together,
                  preserve memories and create a meaningful reunion experience
                  for everyone who returns to our school.
                </p>
              </div>

              <Link
                to="/sponsors"
                className="group inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl"
              >
                Explore Our Partners
                <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================
            FOOTNOTE
        ========================================================== */}
        <div className="mt-12 text-center sm:mt-14">
          <p className="text-sm leading-7 text-gray-500 sm:text-base">
            To every organization supporting our journey,
            <span className="font-semibold text-slate-800">
              {" "}
              thank you for being part of our story.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default SponsorsPreview;
