import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCamera,
  FiChevronRight,
  FiImage,
  FiPlay,
} from "react-icons/fi";

const galleryItems = [
  {
    id: 1,
    title: "A Day to Remember",
    category: "Reunion",
    year: "2027",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85",
    featured: true,
    size: "large",
  },
  {
    id: 2,
    title: "Together Again",
    category: "Alumni",
    year: "2027",
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=85",
    size: "small",
  },
  {
    id: 3,
    title: "Old Friends, New Memories",
    category: "Memories",
    year: "2027",
    image:
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=85",
    size: "small",
  },
  {
    id: 4,
    title: "Celebrating Our Teachers",
    category: "Teachers",
    year: "2027",
    image:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=85",
    size: "small",
  },
  {
    id: 5,
    title: "The School Family",
    category: "Community",
    year: "2027",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=85",
    size: "small",
  },
];

const memoryYears = [
  {
    year: "1951",
    label: "The Beginning",
  },
  {
    year: "1980",
    label: "Growing Together",
  },
  {
    year: "2000",
    label: "A New Generation",
  },
  {
    year: "2027",
    label: "Reunion",
  },
];

const GalleryPreview = () => {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-blue-50 blur-3xl" />

        <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-slate-100 blur-3xl" />

        <div className="absolute right-[8%] top-[12%] hidden h-20 w-20 rounded-full border border-blue-100 lg:block" />

        <div className="absolute bottom-[18%] left-[6%] hidden h-14 w-14 rounded-full border border-slate-200 lg:block" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =========================
            SECTION HEADER
        ========================== */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-blue-600" />

            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-700 sm:text-sm">
              <FiCamera />
              School Memories
            </span>

            <span className="h-px w-10 bg-blue-600" />
          </div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Moments That
            <span className="block text-blue-700">Stay With Us Forever</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
            From our earliest school days to the moments we share today, every
            photograph carries a piece of our shared journey, friendship and
            school family.
          </p>
        </div>

        {/* =========================
            FEATURED GALLERY
        ========================== */}
        <div className="mx-auto mt-12 max-w-6xl sm:mt-16">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            {/* Main Featured Image */}
            <div className="group relative min-h-[420px] overflow-hidden rounded-3xl bg-slate-900 shadow-xl shadow-slate-200 sm:min-h-[500px] lg:min-h-[620px]">
              <img
                src={galleryItems[0].image}
                alt={galleryItems[0].title}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />

              {/* Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              {/* Top Badge */}
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/70 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md sm:left-7 sm:top-7">
                <FiCamera className="text-blue-300" />
                Featured Memory
              </div>

              {/* Image Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {galleryItems[0].category}
                  </span>

                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                    {galleryItems[0].year}
                  </span>
                </div>

                <h3 className="mt-4 max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl">
                  {galleryItems[0].title}
                </h3>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-200 sm:text-base">
                  One gathering. Hundreds of stories. A lifetime of memories
                  brought together in one unforgettable day.
                </p>

                <Link
                  to="/gallery"
                  className="group/link mt-6 inline-flex items-center gap-2 text-sm font-bold text-white"
                >
                  Explore the gallery
                  <FiArrowRight className="transition-transform duration-300 group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Supporting Images */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
              {galleryItems.slice(1).map((item) => (
                <Link
                  to="/gallery"
                  key={item.id}
                  className="group relative min-h-[220px] overflow-hidden rounded-2xl bg-slate-900 sm:min-h-[240px] lg:min-h-0"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent opacity-90" />

                  {/* Hover Icon */}
                  <div className="absolute right-4 top-4 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full border border-white/20 bg-slate-950/60 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <FiArrowRight className="-rotate-45 text-sm" />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-300">
                      {item.category}
                    </span>

                    <h4 className="mt-1 text-sm font-bold leading-5 text-white sm:text-base">
                      {item.title}
                    </h4>

                    <p className="mt-1 text-[11px] text-gray-300">
                      {item.year}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* =========================
            MEMORY STATEMENT
        ========================== */}
        <div className="mx-auto mt-16 max-w-6xl sm:mt-20">
          <div className="overflow-hidden rounded-3xl bg-slate-950">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              {/* Left */}
              <div className="relative overflow-hidden p-7 sm:p-10 lg:p-12">
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10" />

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                    <FiImage className="text-xl" />
                  </div>

                  <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
                    76 Years
                  </p>

                  <h3 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl">
                    A journey captured
                    <span className="block text-gray-400">
                      one memory at a time.
                    </span>
                  </h3>

                  <p className="mt-5 max-w-md text-sm leading-7 text-gray-400">
                    Every generation has left behind moments worth remembering.
                    Our gallery brings those moments together so the story of
                    our school can continue to live on.
                  </p>

                  <Link
                    to="/gallery"
                    className="group mt-7 inline-flex items-center gap-2 text-sm font-bold text-blue-300 transition hover:text-white"
                  >
                    View all memories
                    <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Right - Timeline */}
              <div className="border-t border-white/10 p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
                <div className="grid gap-3 sm:grid-cols-2">
                  {memoryYears.map((item, index) => (
                    <div
                      key={item.year}
                      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-blue-500/30 hover:bg-white/[0.06]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black tracking-tight text-white">
                          {item.year}
                        </span>

                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-gray-500 transition group-hover:bg-blue-500/10 group-hover:text-blue-300">
                          <FiChevronRight />
                        </span>
                      </div>

                      <p className="mt-3 text-xs font-semibold text-gray-400">
                        {item.label}
                      </p>

                      <div className="mt-4 h-px w-8 bg-blue-500 transition-all duration-300 group-hover:w-14" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            GALLERY CATEGORIES
        ========================== */}
        <div className="mx-auto mt-16 max-w-6xl sm:mt-20">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-700" />

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                  Explore Memories
                </p>
              </div>

              <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Every chapter deserves to be remembered
              </h3>
            </div>

            <Link
              to="/gallery"
              className="group inline-flex w-fit items-center gap-2 text-sm font-bold text-blue-700 transition hover:text-blue-800"
            >
              Browse all photos
              <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Category Cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link
              to="/gallery?category=reunion"
              className="group relative overflow-hidden rounded-2xl bg-blue-700 p-6 sm:p-7"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/10" />

              <div className="relative">
                <FiCamera className="text-xl text-blue-100" />

                <h4 className="mt-10 text-xl font-bold text-white">
                  Reunion Moments
                </h4>

                <p className="mt-2 text-sm leading-6 text-blue-100/80">
                  Relive the smiles, gatherings and celebrations from our
                  reunion.
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-white">
                  Explore
                  <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>

            <Link
              to="/gallery?category=school"
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/30 sm:p-7"
            >
              <FiImage className="text-xl text-blue-700" />

              <h4 className="mt-10 text-xl font-bold text-slate-950">
                School Through Years
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Discover photographs from different chapters of our school's
                journey.
              </p>

              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-blue-700">
                Explore
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              to="/gallery?category=alumni"
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/30 sm:p-7"
            >
              <FiPlay className="text-xl text-blue-700" />

              <h4 className="mt-10 text-xl font-bold text-slate-950">
                Alumni Memories
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Stories, friendships and moments shared by generations of
                alumni.
              </p>

              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-blue-700">
                Explore
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>

        {/* =========================
            FINAL CTA
        ========================== */}
        <div className="mt-16 text-center sm:mt-20">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm leading-7 text-gray-500 sm:text-base">
              A photograph captures a moment.
              <span className="font-semibold text-slate-800">
                {" "}
                A memory keeps it alive.
              </span>
            </p>

            <Link
              to="/gallery"
              className="group mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700"
            >
              Visit the complete gallery
              <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GalleryPreview;
