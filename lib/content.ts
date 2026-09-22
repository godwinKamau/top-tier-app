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
      { label: "Our Focus", href: "#soar-system" },
      { label: "Ideal Student", href: "#ideal-student" },
      { label: "Framework", href: "#framework" },
      { label: "Guarantee", href: "#guarantee" },
      { label: "Apply", href: "#apply" },
    ],
    cta: "Apply For Coaching",
  },
  hero: {
    hookLine1: "It's Sunday Night…",
    hookLine2: "DO YOU KNOW YOUR STUDENT'S GRADES?",
    reassurance:
      "Relax. We've managed the deadlines so your only job is to be the parent.",
    cta: "Apply For Coaching",
    mediaAlt:
      "Placeholder for Chicago skyline and academic success imagery",
  },
  soarSystem: {
    title: "Powered by the S.O.A.R. System",
    items: [
      {
        icon: "graduationCap" as const,
        title: "S - Small Wins",
        description:
          "Consistent progress starts with attainable weekly goals. Each small success builds the confidence and momentum students need to take on bigger challenges.",
      },
      {
        icon: "brain" as const,
        title: "O — Organization",
        description:
          "Every part of academic life has a system: calendars, gradebooks, deadlines, materials, and study routines, all structured to keep students prepared and in control.",
      },
      {
        icon: "clipboardCheck" as const,
        title: "A — Accountability",
        description:
          "We monitor progress and follow up consistently, so assignments and commitments are completed rather than overlooked.",
      },
      {
        icon: "school" as const,
        title: "R — Rigor",
        description:
          "We prepare students to meet increasingly demanding academic expectations, developing the skills and habits that higher-level coursework requires.",
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
  topTierSolutions: {
    title: "Top Tier is the System Behind Your Student's Success.",
    // TODO: placeholder copy — replace with real TTSS questions
    // (pricing, session cadence, HSAT timelines, parent reporting)
    items: [
      {
        q: "Know exactly where things stand",
        a: 'We track grades and missing assignments so nothing slips through the cracks and there are no surprises at progress reports or report cards.',
      },
      {
        q: "Stay ahead of every deadline",
        a: 'We keep a running view of due dates, tests, and upcoming assessments, so your student is preparing early instead of scrambling at the last minute.',
      },
      {
        q: "Start every week with a plan",
        a: 'Together, we build a clear weekly academic plan that turns a long to-do list into manageable, realistic steps.',
      },
      {
        q: "Focus on what matters most",
        a: 'We teach students to prioritize assignments and responsibilities, so the most important work gets done first and nothing critical is left for the night before.',
      },
      {
        q: "Build systems that actually work",
        a: 'We help students set up organization systems for their materials, notes, and digital files that they can maintain on their own.',
      },
      {
        q: "Get support when they're stuck",
        a: "Tutoring and study support are built right in, so when a student needs help understanding the material or preparing for an exam, it's already part of the plan.",
      },
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
    title: "Join Our Mailing List",
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
    failMessage:
      "Something went wrong. Please try again shortly."
    
  },
  footer: {
    ctaLabel: "Apply Now",
    copyright: `© ${new Date().getFullYear()} Top-Tier Scholar Systems. All rights reserved.`,
  },
} as const;

export type SiteContent = typeof content;
