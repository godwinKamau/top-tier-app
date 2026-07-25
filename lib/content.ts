export const content = {
  brand: {
    name: "Top-Tier Scholar Systems",
    shortName: "TTSS",
    tagline:
      "It's not enough to be smart anymore. Students need systems.",
    city: "Chicago",
    established: 2026,
    system: "The S.O.A.R. System™",
    // TODO: Replace with real phone number
    phone: "(TODO: PHONE)",
    // TODO: Replace with real email
    email: "(TODO: EMAIL)",
    // TODO: Replace with real address
    address: "Chicago, IL (TODO: ADDRESS)",
    description:
      "An elite academic consulting & strategic accountability program. Not just tutoring — structural support, executive-functioning development, grade tracking, and high-stakes test prep.",
  },
  nav: {
    links: [
      { label: "Our Focus", href: "#pillars" },
      { label: "Ideal Student", href: "#ideal-student" },
      { label: "Framework", href: "#framework" },
      { label: "Guarantee", href: "#guarantee" },
      { label: "Apply", href: "#apply" },
    ],
    cta: "Apply Now",
  },
  hero: {
    hookLine1: "It's Sunday Night…",
    hookLine2: "DO YOU KNOW YOUR STUDENT'S GRADES?",
    reassurance:
      "Relax. We've managed the deadlines so your only job is to be the parent.",
    cta: "Apply Today",
    // TODO: swap media — replace hero background with final Chicago skyline / academic imagery
    mediaAlt:
      "Placeholder for Chicago skyline and academic success imagery",
  },
  pillars: {
    title: "Our Focus — The 5 Pillars",
    subtitle: `Powered by ${"The S.O.A.R. System™"}`,
    items: [
      {
        icon: "graduationCap" as const,
        title: "Academic Excellence",
        description:
          "Rigorous **coursework support** that turns *A-potential* into *A-performance* across every class.",
      },
      {
        icon: "brain" as const,
        title: "Executive Functioning",
        description:
          "**Systems** for planning, prioritization, and follow-through — skills that *compound for life*.",
      },
      {
        icon: "clipboardCheck" as const,
        title: "Accountability Systems",
        description:
          "**Weekly study logs**, deadline monitoring, and structured check-ins so *nothing slips*.",
      },
      {
        icon: "school" as const,
        title: "Admission Prep (CPS HSAT)",
        description:
          "Targeted prep for **CPS Selective Enrollment / HSAT, ISEE, and ACT** with strategy that *sticks*.",
      },
      {
        icon: "users" as const,
        title: "Family Partnerships",
        description:
          "**High-touch coaching** for busy parents — clear updates, *calm Sundays*, shared ownership.",
      },
    ],
  },
  idealStudent: {
    title: "Ideal Student Profile",
    intro: "Perfect for students who are:",
    bullets: [
      "Ambitious — with clear goals for selective high schools or competitive colleges",
      "Have A potential but C habits — capable minds who need structure, not lectures",
      "Navigating Selective Enrollment — CPS HSAT pathways and high-stakes timelines",
      "Struggling with executive function — bright students who lose track of deadlines",
      "Attending charter or underserved schools — families seeking elite-level support",
      "Ready for partnership — students and parents willing to commit to the system",
    ],
  },
  framework: {
    title: "Our Framework & Deliverables",
    subtitle: "High-touch mechanics that keep academics on track",
    deliverables: [
      {
        title: "Weekly Study Logs",
        description:
          "Structured logs that capture what was studied, what was due, and what's next — building ownership and visibility.",
        cadence: "Weekly",
      },
      {
        title: "Gradebook Deadline Monitoring",
        description:
          "We watch portals, track assignments, and flag risks early so Sundays stop being a scramble.",
        cadence: "Ongoing",
      },
      {
        title: "Monthly Strategy Meetings",
        description:
          "Family strategy sessions to review progress, adjust plans, and align on the next academic milestone.",
        cadence: "Monthly",
      },
    ],
  },
  guarantee: {
    title: "Program Expectations & Our Guarantee",
    // TODO: final guarantee text — client copy was incomplete; replace with approved legal/marketing language
    body: "We commit to measurable academic growth and executive-function development through consistent systems, transparent grade tracking, and high-touch family partnership. When families engage fully with The S.O.A.R. System™, students build the habits and outcomes that selective pathways demand.",
    sealText: "Official Program Commitment",
    expectations: [
      "Consistent student engagement with weekly study systems",
      "Parent partnership through monthly strategy meetings",
      "Transparent communication on grades and deadlines",
      "Focused preparation for high-stakes assessments",
    ],
  },
  urgency: {
    banner:
      "Limited Availability for the 2026 Chicago Selective Enrollment Cycle.",
    tagline:
      "It's not enough to be smart anymore. Students need systems.",
  },
  apply: {
    title: "Apply Now",
    subtitle:
      "Tell us about your student. We'll follow up to discuss fit and next steps.",
    fields: {
      parentName: "Parent / Guardian Name",
      email: "Email",
      phone: "Phone",
      studentName: "Student Name",
      grade: "Current Grade",
      message: "Tell us briefly about your goals",
    },
    submitLabel: "Submit Application",
    successMessage:
      "Thank you — your application has been received. We'll be in touch soon.",
    // TODO: Wire to a real backend / email / CRM when ready (currently UI-only)
  },
  footer: {
    ctaLabel: "Apply Now",
    copyright: `© ${new Date().getFullYear()} Top-Tier Scholar Systems. All rights reserved.`,
  },
} as const;

export type SiteContent = typeof content;
