import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiFacebook,
  FiInstagram,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiNavigation,
  FiPhone,
  FiSend,
  FiTwitter,
  FiUsers,
} from "react-icons/fi";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const contactInfo = [
    {
      icon: FiMapPin,
      title: "School Address",
      description: "Our Beloved School Campus",
      details: "School Road, Bangladesh",
    },
    {
      icon: FiPhone,
      title: "Contact Number",
      description: "+880 1XXX-XXXXXX",
      details: "Available during office hours",
    },
    {
      icon: FiMail,
      title: "Email Address",
      description: "reunion@ourschool.edu.bd",
      details: "We usually reply within 1–2 working days",
    },
    {
      icon: FiClock,
      title: "Office Hours",
      description: "Saturday – Thursday",
      details: "9:00 AM – 4:00 PM",
    },
  ];

  const faqs = [
    {
      question: "How can I register for the reunion?",
      answer:
        "Create an account, complete your school information, choose your T-shirt size, review your information, and submit the reunion registration form.",
    },
    {
      question: "Who can participate in the reunion?",
      answer:
        "Former students, current students, teachers, staff, and invited guests may participate according to the reunion committee's guidelines.",
    },
    {
      question: "What gifts will registered participants receive?",
      answer:
        "Registered participants will receive the official reunion gift package according to the package configured by the reunion organizers.",
    },
    {
      question: "How can I update my registration information?",
      answer:
        "Log in to your account and visit your reunion registration section. If editing is unavailable, contact the reunion organizing committee.",
    },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your name.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (formData.phone.trim() && !/^[0-9+\-\s()]{7,20}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Please enter a subject.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please write your message.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message should be at least 10 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    /*
      ============================================================
      MONGODB / API INTEGRATION READY

      Later you can replace this section with:

      await axiosSecure.post("/contact", formData);

      Your backend can save the message into:

      contactMessages collection

      Example document:

      {
        name,
        email,
        phone,
        subject,
        message,
        status: "unread",
        createdAt: new Date()
      }
      ============================================================
    */

    console.log("Contact form submitted:", formData);

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  const inputBaseClass =
    "w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* =========================================================
          HERO SECTION
      ========================================================== */}
      <section className="relative isolate overflow-hidden bg-slate-950">
        {/* Decorative background */}
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200 backdrop-blur">
              <FiMessageCircle className="text-blue-300" />
              We are here for you
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Let&apos;s stay
              <span className="block text-blue-400">connected.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Have a question about the reunion, registration, gifts, schedule,
              or anything related to our school community? Reach out to the
              reunion organizing team. We would love to hear from you.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#contact-form"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                Send a Message
                <FiArrowRight />
              </a>

              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
              >
                Explore Reunion
              </Link>
            </div>
          </div>

          {/* Hero bottom information */}
          <div className="mt-14 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                <FiUsers />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Community
                </p>
                <p className="text-sm font-semibold text-white">
                  One School. One Family.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                <FiMessageCircle />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Support
                </p>
                <p className="text-sm font-semibold text-white">
                  Reunion Committee
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                <FiCheckCircle />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Response
                </p>
                <p className="text-sm font-semibold text-white">
                  We&apos;ll get back to you
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONTACT INFORMATION
      ========================================================== */}
      <section className="relative py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
              Get in touch
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              We&apos;re only a message away.
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Whether you are an alumnus, current student, teacher, volunteer,
              or reunion guest, our team is ready to help.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {contactInfo.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Icon />
                  </div>

                  <h3 className="mt-5 text-base font-bold text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {item.description}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.details}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN CONTACT AREA
      ========================================================== */}
      <section id="contact-form" className="pb-16 sm:pb-20 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-[0.85fr_1.15fr]">
            {/* LEFT PANEL */}
            <div className="relative overflow-hidden bg-slate-950 p-7 text-white sm:p-10 lg:p-12">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-600/20 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

              <div className="relative">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-300">
                  Contact the team
                </p>

                <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
                  Tell us what you need.
                </h2>

                <p className="mt-5 text-sm leading-7 text-slate-300 sm:text-base">
                  We&apos;re building this reunion together. If you have an
                  idea, question, correction, suggestion, or need assistance
                  with registration, please let us know.
                </p>

                <div className="mt-9 space-y-5">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                      <FiMail />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Email
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        reunion@ourschool.edu.bd
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                      <FiPhone />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Phone
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        +880 1XXX-XXXXXX
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                      <FiMapPin />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Location
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        Our Beloved School Campus
                      </p>
                    </div>
                  </div>
                </div>

                <div className="my-9 h-px bg-white/10" />

                <div>
                  <p className="text-sm font-bold text-white">
                    Follow our reunion journey
                  </p>

                  <div className="mt-4 flex gap-3">
                    <a
                      href="#"
                      aria-label="Facebook"
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-blue-600 hover:text-white"
                    >
                      <FiFacebook />
                    </a>

                    <a
                      href="#"
                      aria-label="Instagram"
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-pink-600 hover:text-white"
                    >
                      <FiInstagram />
                    </a>

                    <a
                      href="#"
                      aria-label="Twitter"
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-sky-500 hover:text-white"
                    >
                      <FiTwitter />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="p-6 sm:p-10 lg:p-12">
              <div className="mb-8">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">
                  Send a message
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                  How can we help?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Fill out the form and the reunion team will get back to you.
                </p>
              </div>

              {submitted && (
                <div className="mb-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                  <FiCheckCircle className="mt-0.5 shrink-0 text-lg" />

                  <div>
                    <p className="text-sm font-bold">
                      Message sent successfully!
                    </p>
                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                      Thank you for reaching out. The reunion team will review
                      your message and get back to you.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  {/* NAME */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={`${inputBaseClass} ${
                        errors.name
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                          : "border-slate-200"
                      }`}
                    />

                    {errors.name && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={`${inputBaseClass} ${
                        errors.email
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                          : "border-slate-200"
                      }`}
                    />

                    {errors.email && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* PHONE */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+880 1XXX-XXXXXX"
                      className={`${inputBaseClass} ${
                        errors.phone
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                          : "border-slate-200"
                      }`}
                    />

                    {errors.phone && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* SUBJECT */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Subject <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`${inputBaseClass} ${
                        errors.subject
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                          : "border-slate-200"
                      }`}
                    >
                      <option value="">Select a subject</option>
                      <option value="Reunion Registration">
                        Reunion Registration
                      </option>
                      <option value="Registration Update">
                        Registration Update
                      </option>
                      <option value="Gift Package">Gift Package</option>
                      <option value="T-Shirt">T-Shirt</option>
                      <option value="Event Schedule">Event Schedule</option>
                      <option value="Alumni Information">
                        Alumni Information
                      </option>
                      <option value="Suggestion">Suggestion</option>
                      <option value="Other">Other</option>
                    </select>

                    {errors.subject && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* MESSAGE */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Your Message <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      rows="6"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Write your message here..."
                      className={`${inputBaseClass} resize-none ${
                        errors.message
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                          : "border-slate-200"
                      }`}
                    />

                    <div className="mt-1.5 flex items-center justify-between">
                      {errors.message ? (
                        <p className="text-xs font-medium text-red-500">
                          {errors.message}
                        </p>
                      ) : (
                        <span />
                      )}

                      <span className="text-xs text-slate-400">
                        {formData.message.length}/1000
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-md text-xs leading-5 text-slate-500">
                    Your information will only be used to respond to your
                    message and provide reunion-related support.
                  </p>

                  <button
                    type="submit"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
                  >
                    Send Message
                    <FiSend />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          LOCATION / MAP SECTION
      ========================================================== */}
      <section className="pb-16 sm:pb-20 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/50 lg:grid-cols-2">
            {/* Map Placeholder */}
            <div className="relative min-h-[320px] overflow-hidden bg-slate-200 lg:min-h-[430px]">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, rgba(148,163,184,.25) 25%, transparent 25%), linear-gradient(-45deg, rgba(148,163,184,.25) 25%, transparent 25%)",
                  backgroundSize: "30px 30px",
                }}
              />

              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="max-w-sm rounded-3xl border border-white/70 bg-white/90 p-7 text-center shadow-xl backdrop-blur">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-600/20">
                    <FiMapPin />
                  </div>

                  <h3 className="mt-4 text-lg font-black text-slate-950">
                    Our School Campus
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    The place where generations of memories began and where we
                    will come together again.
                  </p>

                  <a
                    href="https://www.google.com/maps"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
                  >
                    Open in Maps
                    <FiNavigation />
                  </a>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                Find us
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Back to the place we call home.
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                Our school campus is more than a location. It is where
                friendships began, lessons were learned, dreams were created,
                and countless memories were made.
              </p>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <FiMapPin />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      School Campus
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      Our Beloved School Campus
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      School Road, Bangladesh
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <FiClock className="text-lg text-blue-600" />

                  <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Office Hours
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    9:00 AM – 4:00 PM
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <FiPhone className="text-lg text-blue-600" />

                  <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Call Us
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    +880 1XXX-XXXXXX
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ SECTION
      ========================================================== */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
              Quick answers
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Frequently asked questions
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
              Some of the most common questions from students and alumni.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className={`overflow-hidden rounded-2xl border transition ${
                    isOpen
                      ? "border-blue-200 bg-blue-50/40"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6"
                  >
                    <span className="text-sm font-bold text-slate-900 sm:text-base">
                      {faq.question}
                    </span>

                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                        isOpen
                          ? "rotate-180 bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <FiChevronDown />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6">
                      <p className="max-w-3xl text-sm leading-7 text-slate-600">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}
      <section className="bg-slate-950 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-600/20">
            <FiUsers />
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-blue-300">
            One school. One family.
          </p>

          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            The reunion is about bringing our people together again.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Register for the reunion, reconnect with old friends, meet
            generations of alumni, and create new memories together.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/reunionregister"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500"
            >
              Register for Reunion
              <FiArrowRight />
            </Link>

            <Link
              to="/Details"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              View Reunion Details
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
