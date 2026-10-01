import Image from "next/image";
import heroImg from "@/public/images/hero.png";
import pencils from "@/public/images/pencils.png"
import paraLLaxImg1 from "@/public/images/parallax1.png"
import parent_portal1 from "@/public/images/parent-portal1.png"
import calendar from "@/public/images/calendar.png"
import founderLandscape from "@/public/images/founderLandscape.png";
import { Sparkles, Check, ClipboardList, ClockFading, Calendar, Star, MapPin } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ApplyForm } from "@/components/form/ApplyForm";
import { FadeIn } from "@/components/FadeIn";
import { Carousel } from "@/components/Carousel";
import { TopTierSolutions } from "@/components/TopTierSolutions";
import { PillarIcon } from "@/components/PillarIcon";
import { CredentialIcon } from "@/components/CredentialIcon";
import { PricingTiers } from "@/components/PricingTiers";
import { FormattedText } from "@/components/FormattedText";
import { Emphasis } from "@/components/Emphasis"
import { content } from "@/lib/content";

export default function Home() {
  return (
    <div
      className="min-h-screen bg-[#070d1a] text-ivory"
      style={{ fontFamily: "var(--font-manrope), system-ui, sans-serif" }}
    >
      <header className="sticky top-0 z-50 border-b border-gold/20 bg-[#F7FAF0]/90 text-navy backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a href="#top" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            <Logo variant="dark" size="sm" />
          </a>
          <nav className="hidden items-center gap-1 text-sm lg:flex" aria-label="Primary">
            {content.nav.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="transition p-2 rounded-md font-bold hover:text-black hover:bg-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <a
            href="#apply"
            className="inline-flex h-10 shrink-0 items-center rounded-sm border border-gold bg-gradient-to-r from-gold to-gold-light px-5 text-sm font-extrabold text-navy shadow-[0_0_24px_rgba(201,162,39,0.25)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
          >
            {content.nav.cta}
          </a>
        </div>
      </header>

      <main id="top">
        {/* <div id="top-banner" className="width-full bg-gold-light text-navy font-bold flex items-center justify-center min-h-[5vh]">“High-touch academic coaching for capable students who need better systems.”</div> */}
        {/* Cinematic hero */}
        <section className="relative min-h-[85vh] overflow-hidden">
          <Image
            src={heroImg}
            alt=""
            fill
            sizes="100vw"
            placeholder="blur"
            style={{ objectFit: "cover" }}
            className="opacity-45"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-linear-to-r from-navy from-30% via-transparent via-70% "
            aria-hidden
          />
          <div className="relative min-h-[85vh] py-24 sm:px-15 sm:ml-auto">
            <FadeIn className="grid grid-cols-4">
              <div className="col-span-3">
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.35em] text-gold">
                  <Sparkles className="size-3.5" aria-hidden />
                  {content.brand.city} · Est. {content.brand.established}
                </p>
                <h1
                  className="mt-6 max-w-4xl text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  <span className="bg-gradient-to-r from-gold-light via-gold to-[#a8841a] bg-clip-text text-transparent">
                    {content.hero.hookLine1}
                  </span>
                  <span className="mt-3 block text-ivory">
                    {content.hero.hookLine2}
                  </span>
                </h1>
                <h2 className="mt-8 max-w-2xl text-2xl leading-relaxed text-ivory/75">
                  {content.hero.reassurance}
                </h2>
                <a
                  href="#apply"
                  className="mt-10 inline-flex h-14 items-center font-bold rounded-sm bg-gradient-to-r from-gold to-gold-light px-10 text-sm font-bold uppercase tracking-[0.2em] text-navy shadow-[0_0_40px_rgba(201,162,39,0.35)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
                >
                  {content.hero.cta}
                </a>
              <p
                className="mt-16 text-base tracking-wide text-ivory/40"
                aria-label={content.hero.mediaAlt}
                >
                ORGANIZATION • ACCOUNTABILITY • ACADEMIC EXCELLENCE • REAL PROGRESS
              </p>
            </div>
            <Emphasis
              className="col-start-4 flex items-start" 
              accent="Students need systems."
              tone="dark"
              contentClassName="max-w-xs"
              tilt={-10}
              shade="rgb(250 246 238 / 0.55)"
            >
              It&apos;s not enough to be smart.
            </Emphasis>
          </FadeIn>
          </div>
        </section>

        <div className="border-y border-gold/30 bg-gradient-to-r from-navy via-[#1a2a4a] to-navy px-4 py-4 text-center">
          <p className="text-sm font-semibold tracking-wide text-gold-light">
            {content.urgency.banner}
          </p>
        </div>

        {/* Pain-Points */}
        <section id="pain-points" className="bg-[#F7FAF0]/90 py-12 text-navy sm:py-16">
          <FadeIn>
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-3 px-4 sm:px-6">
              <h2 
                className="text-2xl font-bold text-center sm:text-3xl"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Does this student sound familiar?
              </h2>
              <h3
                className="text-base text-center sm:text-lg"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Your student is capable, but something keeps getting in the way.
              </h3>
            </div>
            <ul className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:gap-6 sm:px-6 lg:grid lg:grid-cols-5 lg:overflow-x-visible lg:pb-0">
              <li className="flex w-60 shrink-0 snap-start flex-col items-center gap-3 border-l border-gold/50 pl-4 text-sm leading-relaxed text-navy sm:w-64 lg:w-auto lg:shrink">
                <ClipboardList 
                  className="h-10 w-12 shrink-0 rounded-sm bg-[#c9a227] px-1" 
                  aria-hidden 
                />
                <span
                  className="font-bold text-center"
                >
                  Misses assignments or turns them in late.
                </span>
              </li>
              <li className="flex w-60 shrink-0 snap-start flex-col items-center gap-3 border-l border-gold/50 pl-4 text-sm leading-relaxed text-navy sm:w-64 lg:w-auto lg:shrink">
                <ClockFading 
                  className="h-10 w-12 shrink-0 rounded-sm bg-[#c9a227] px-1" 
                  aria-hidden 
                />
                <span
                  className="font-bold text-center"
                >
                  Waits until the last minute to study.
                </span>
              </li>
              <li className="flex w-60 shrink-0 snap-start flex-col items-center gap-3 border-l border-gold/50 pl-4 text-sm leading-relaxed text-navy sm:w-64 lg:w-auto lg:shrink">
                <Calendar 
                  className="h-10 w-12 shrink-0 rounded-sm bg-[#c9a227] px-1" 
                  aria-hidden 
                />
                <span
                  className="font-bold text-center"
                >
                  Has a planner but rarely uses it.  
                </span>
              </li>
              <li className="flex w-60 shrink-0 snap-start flex-col items-center gap-3 border-l border-gold/50 pl-4 text-sm leading-relaxed text-navy sm:w-64 lg:w-auto lg:shrink">
                <Calendar 
                  className="h-10 w-12 shrink-0 rounded-sm bg-[#c9a227] px-1" 
                  aria-hidden 
                />
                <span
                  className="font-bold text-center"
                >
                  Can earn As but regularly settles for Bs or Cs because of organization. 
                </span>
              </li>
              <li className="flex w-60 shrink-0 snap-start flex-col items-center gap-3 border-l border-gold/50 pl-4 text-sm leading-relaxed text-navy sm:w-64 lg:w-auto lg:shrink">
                <Star
                  className="h-10 w-12 shrink-0 rounded-sm bg-[#c9a227] px-1" 
                  aria-hidden 
                />
                <span
                  className="font-bold text-center"
                >
                  Ambitious goals but inconsistent habits.
                </span>
              </li>
            </ul>
          </div>
          </FadeIn>
        </section>

        {/* Top-Tier Solutions */}
        <section
          id="top-tier-solutions"
          className="border-y border-gold/15 bg-navy/40"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <FadeIn>
              <h2 className="text-3xl font-bold sm:text-4xl">
                {content.topTierSolutions.title}
              </h2>
              <div className="mt-4 h-px w-32 bg-gradient-to-r from-gold to-transparent" />
              <h3
                className="mt-5 text-base leading-relaxed sm:text-lg"
              >
                <FormattedText>{content.topTierSolutions.subtitle}</FormattedText>
              </h3>
            </FadeIn>
            <FadeIn delay={0.08}>
              <TopTierSolutions items={content.topTierSolutions.items} />
            </FadeIn>
          </div>
        </section>
        
        {/* Parallax 1 */}
        <div
          className="h-100 w-full overflow-y-scroll bg-cover bg-fixed bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${paraLLaxImg1.src})` }}>
        </div>
        
        {/* Soar System */}
        <section
          id="soar-system"
          className="relative overflow-hidden border-y border-gold/25 bg-[#050a14] py-28"
        >
          {/* blueprint grid, faded out toward the edges */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #c9a227 1px, transparent 1px), linear-gradient(to bottom, #c9a227 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage:
                "radial-gradient(ellipse 75% 60% at 50% 40%, #000 35%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 75% 60% at 50% 40%, #000 35%, transparent 100%)",
            }}
            aria-hidden
          />
          {/* gold glow */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 55% 45% at 30% 30%, rgba(201,162,39,0.13) 0%, transparent 70%)",
            }}
            aria-hidden
          />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <FadeIn>
              <h2
                className="text-3xl font-bold text-balance sm:text-5xl"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                {content.soarSystem.title}
              </h2>
              <div className="mt-4 h-px w-32 bg-gradient-to-r from-gold to-transparent" />
            </FadeIn>

            <ul className="mt-14 grid gap-6 sm:grid-cols-2">
              {content.soarSystem.items.map((item, i) => {
                // Titles arrive as "S - Small Wins" / "O — Organization".
                // Split so the letter can carry the S.O.A.R. identity and the
                // separator renders consistently regardless of the source dash.
                const parsed = item.title.match(/^([A-Za-z])\s*[-—–]\s*(.+)$/);
                const letter = parsed ? parsed[1].toUpperCase() : null;
                const label = parsed ? parsed[2] : item.title;

                return (
                  <FadeIn key={item.title} delay={i * 0.1} as="li" className="h-full">
                    <article className="group relative flex h-full flex-col overflow-hidden border border-gold/20 bg-navy/50 p-6 transition-[border-color,background-color,box-shadow] duration-300 ease-out hover:border-gold/60 hover:bg-navy-light/40 hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7),0_0_44px_-16px_rgba(201,162,39,0.5)] sm:p-8">
                      {letter && (
                        <span
                          className="pointer-events-none absolute -top-8 right-1 select-none text-[8rem] font-bold leading-none text-gold/10 transition-colors duration-300 group-hover:text-gold/20"
                          style={{
                            fontFamily: "var(--font-playfair), Georgia, serif",
                          }}
                          aria-hidden
                        >
                          {letter}
                        </span>
                      )}
                      <span className="relative flex size-12 shrink-0 items-center justify-center border border-gold/40 text-gold transition-[background-color,border-color] duration-300 group-hover:border-gold/70 group-hover:bg-gold/10">
                        <PillarIcon name={item.icon} />
                      </span>
                      <h3
                        className="relative mt-5 text-xl font-semibold text-balance sm:text-2xl"
                        style={{
                          fontFamily: "var(--font-playfair), Georgia, serif",
                        }}
                      >
                        {letter && (
                          <>
                            <span className="text-gold">{letter}</span>
                            <span className="text-gold/40"> — </span>
                          </>
                        )}
                        {label}
                      </h3>
                      <FormattedText className="relative mt-3 text-sm leading-relaxed text-pretty text-ivory/65">
                        {item.description}
                      </FormattedText>
                    </article>
                  </FadeIn>
                );
              })}
            </ul>
          </div>
        </section>
        
        {/* Parallax 2 */}
        <div
          className="h-100 w-full overflow-y-scroll bg-cover bg-fixed bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${pencils.src})` }}>
        </div>

        {/* How it works */}
        <section id="how-it-works" className="border-y border-gold/25 bg-[#F7FAF0]/90 text-navy">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <FadeIn>
              <h2
                className="text-3xl font-bold text-balance sm:text-4xl"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                {content.howItWorks.title}
              </h2>
              <div className="mt-4 h-px w-32 bg-gradient-to-r from-gold to-transparent" />
              <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-pretty text-navy/70 sm:text-lg">
                {content.howItWorks.subtitle}
              </p>
            </FadeIn>

            <ol className="mt-14 grid gap-x-6 lg:grid-cols-5">
              {content.howItWorks.steps.map((step, i) => (
                <FadeIn
                  as="li"
                  key={step.title}
                  delay={i * 0.08}
                  y={16}
                  className="relative flex gap-4 lg:flex-col lg:gap-0"
                >
                  {/* Marker rail: vertical when stacked, horizontal at lg. */}
                  <div className="flex flex-col items-center lg:w-full lg:flex-row lg:items-center lg:gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#c9a227] text-sm font-semibold tabular-nums text-navy">
                      {i + 1}
                    </span>
                    {i < content.howItWorks.steps.length - 1 && (
                      <span
                        aria-hidden
                        className="mt-2 w-px flex-1 bg-gradient-to-b from-gold/70 to-gold/10 lg:mt-0 lg:h-px lg:w-auto lg:bg-gradient-to-r lg:from-gold/70 lg:to-gold/20"
                      />
                    )}
                  </div>
                  <div className="pb-10 lg:pb-0 lg:pt-5">
                    <h3
                      className="text-base font-semibold text-balance text-navy sm:text-lg"
                      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                    >
                      {step.title}
                    </h3>
                    {/* Body stays on the sans face and capped at ~34ch so the
                        line length holds up when the steps stack. */}
                    <p className="mt-2 max-w-[34ch] text-base leading-relaxed text-pretty text-navy/70">
                      {step.body}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </ol>
          </div>
        </section>

        {/* Highlights carousel */}
        <section
          id="parent-portal"
          className="border-y border-gold/15 bg-navy/40 py-20 sm:py-28"
        >
          <FadeIn className="mx-auto w-full max-w-[86rem] px-4 pb-12 sm:px-6 sm:pb-16">
            <h2
              className="text-4xl font-bold leading-[1.04] tracking-[-0.02em] text-balance sm:text-5xl lg:text-6xl"
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
              }}
            >
              See Your Student{" "}
              <span className="text-gold italic">Progress</span>
            </h2>
            <div
              className="mt-5 h-px w-32 bg-gradient-to-r from-gold to-transparent"
              aria-hidden
            />
            <p className="mt-6 text-base leading-relaxed text-pretty text-ivory/65 sm:text-lg">
              A look inside the parent portal — the screens that answer the
              Sunday night question before you have to ask it.
            </p>
          </FadeIn>
          <FadeIn delay={0.08}>
            <Carousel
              label={content.carousel.label}
              slides={[
                { ...content.carousel.slides[0], image: parent_portal1 },
                { ...content.carousel.slides[1], image: calendar },
              ]}
            />
          </FadeIn>
        </section>

        {/* Meet the founder */}
        <section
          id="founder"
          className="mx-auto grid max-w-80% grid-cols-1 gap-12 px-4 py-24 sm:px-6 lg:grid-cols-3 lg:gap-10"
        >
          {/* 1 — portrait */}
          <FadeIn>
            <figure className="mx-auto w-full max-w-xl border border-gold/30 p-3 lg:sticky lg:top-24 lg:max-w-none">
              {/* 3:2 matches the source file, so the frame crops nothing — the
                  subject fills the height and any wider ratio cuts the head. */}
              <div className="relative aspect-3/2 w-full bg-navy/50 outline-1 -outline-offset-1 outline-[oklch(1_0_0/0.1)]">
                <Image
                  src={founderLandscape}
                  alt={content.founder.portraitAlt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 36rem, 100vw"
                  placeholder="blur"
                  className="object-cover object-top"
                />
              </div>
            </figure>
          </FadeIn>

          {/* 2 — who he is */}
          <div className="overflow-scroll">
            <FadeIn delay={0.1}>
              <h2 className="text-[10px] font-bold tracking-[0.4em] text-gold uppercase">
                {content.founder.eyebrow}
              </h2>
              <p
                className="mt-4 text-3xl font-bold text-balance sm:text-4xl"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                {content.founder.name}
              </p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-gold-light/80">
                {content.founder.title}
              </p>
              <div className="mt-6 space-y-4">
                {content.founder.bio.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-pretty leading-relaxed text-ivory/70"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* 3 — what he stands for, and the ask */}
          <div>
            <div className="lg:sticky lg:top-24 lg:max-w-none">
            <FadeIn delay={0.2}>
              <Emphasis
                className="flex items-start"
                accent={content.founder.belief2}
                tone="dark"
                scale="aside"
                tilt={-10}
                shade="rgb(250 246 238 / 0.55)"
              >
                {content.founder.belief}
              </Emphasis>
            </FadeIn>

            <FadeIn delay={0.3} className="mt-8">
              <ul className="space-y-2 text-sm text-ivory/60">
                {content.founder.credentials.map((credential) => (
                  <li
                    key={credential.label}
                    className="flex gap-2 border-t border-gold/15 pt-2"
                  >
                    <CredentialIcon
                      name={credential.icon}
                      className="h-6 w-7 shrink-0 rounded-sm bg-[#c9a227] px-1"
                    />
                    {credential.label}
                  </li>
                ))}
              </ul>
              <a
                href="#apply"
                className="mt-8 inline-flex h-12 items-center justify-center border border-gold bg-gradient-to-r from-gold to-gold-light px-8 text-sm font-bold tracking-wider text-navy uppercase transition-[filter,scale] duration-200 ease-out hover:brightness-110 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
              >
                {content.founder.ctaLabel}
              </a>
            </FadeIn>
            </div>
          </div>
        </section>
        

        {/* Pricing */}
        <section
          id="pricing"
          className="border-y border-gold/25 bg-[#F7FAF0]/90 text-navy"
        >
          <div className="mx-auto max-w-[86rem] px-4 py-24 sm:px-6">
            {/* Stacked everywhere up to xl, where there is finally room for the
                comp's three tracks: lede, tiers, inclusions. */}
            <div className="grid gap-x-10 gap-y-12 xl:grid-cols-[13rem_minmax(0,1fr)_14rem]">
              <FadeIn>
                <h2
                  className="text-3xl font-bold text-balance sm:text-4xl xl:text-3xl"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {content.pricing.title}
                </h2>
                <div className="mt-4 h-px w-32 bg-gradient-to-r from-gold to-transparent" />
                <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-pretty text-navy/70">
                  {content.pricing.subtitle}
                </p>
              </FadeIn>

              <PricingTiers
                tiers={content.pricing.tiers}
                badge={content.pricing.badge}
              />

              <FadeIn delay={0.24} as="div">
                <h3 className="text-xs font-bold tracking-[0.22em] text-navy/70 uppercase">
                  {content.pricing.includesTitle}
                </h3>
                <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1">
                  {content.pricing.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span
                        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-gold"
                        aria-hidden
                      >
                        <Check className="size-2.5 stroke-[3] text-navy" />
                      </span>
                      <span className="text-sm leading-snug text-navy/80">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 max-w-[48ch] border-t border-navy/10 pt-4 text-xs leading-relaxed text-pretty text-navy/70">
                  {content.pricing.note}
                </p>
              </FadeIn>
            </div>
          </div>
        </section>

        <div className="px-4 py-12 text-center">
          <p
            className="bg-gradient-to-r from-gold-light via-gold to-gold-light bg-clip-text text-2xl font-bold italic text-transparent sm:text-4xl"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            “{content.urgency.tagline}”
          </p>
        </div>

        <section
          id="apply"
          className="border-t border-gold/25 bg-navy"
        >
          <div className="mx-auto max-w-[86rem] px-4 py-24 sm:px-6">
            <div className="grid gap-x-10 gap-y-12 lg:grid-cols-12">
              <FadeIn className="lg:col-span-5 xl:col-span-3">
                <h2
                  className="text-3xl font-bold text-balance sm:text-4xl lg:text-3xl"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {content.apply.title}
                </h2>
                <div className="mt-4 h-px w-32 bg-gradient-to-r from-gold to-transparent" />
                <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-pretty text-ivory/65">
                  {content.apply.subtitle}
                </p>
              </FadeIn>

              {/* What happens after they hit submit, before they hit submit. */}
              <div className="lg:col-span-7 lg:border-l lg:border-gold/15 lg:pl-10 xl:col-span-3">
                <ol className="space-y-7">
                  {content.apply.steps.map((step, i) => (
                    <FadeIn as="li" key={step.title} delay={0.1 + i * 0.08} y={16}>
                      <div className="flex gap-3.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#c9a227] text-sm font-semibold tabular-nums text-navy">
                          {i + 1}
                        </span>
                        <div>
                          <h3 className="text-base font-semibold text-balance text-ivory">
                            {step.title}
                          </h3>
                          <p className="mt-1.5 max-w-[38ch] text-sm leading-relaxed text-pretty text-ivory/60">
                            {step.body}
                          </p>
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </ol>
              </div>

              <FadeIn delay={0.16} className="lg:col-span-12 xl:col-span-6">
                <ApplyForm className="lg:max-w-3xl xl:max-w-none" />
              </FadeIn>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gold/25 bg-[#050910]">
        <div className="mx-auto flex max-w-[86rem] flex-col items-center gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:gap-10">
          <a
            href="#top"
            className="shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label={`${content.brand.name} — back to top`}
          >
            <Logo variant="light" size="md" />
          </a>

          <div className="lg:flex-1">
            <nav aria-label="Footer">
              {/* Driven off the same list as the header so the two can never
                  drift apart. */}
              <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start lg:gap-x-3">
                {content.nav.links.map((l, i) => (
                  <li key={l.href} className="flex items-center gap-3">
                    {/* A real hairline rather than a pipe character, and only
                        where the row is known to hold one line. */}
                    {i > 0 && (
                      <span className="hidden h-3 w-px bg-ivory/20 lg:block" aria-hidden />
                    )}
                    <a
                      href={l.href}
                      className="text-[13px] text-ivory/75 transition-colors duration-200 hover:text-gold focus-visible:rounded-sm focus-visible:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <p className="mt-3 text-center text-xs text-ivory/50 lg:text-left">
              {content.footer.copyright}
            </p>
          </div>

          <p className="flex shrink-0 items-center gap-2 text-[13px] text-ivory/75">
            <MapPin className="size-4 text-gold" aria-hidden />
            {content.footer.location}
          </p>
        </div>
      </footer>
    </div>
  );
}
