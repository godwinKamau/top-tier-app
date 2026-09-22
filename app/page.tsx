import Image from "next/image";
import heroImg from "@/public/images/hero.png";
import studentImg from "@/public/images/student.png"
import paraLLaxImg from "@/public/images/parallax.png";
import { Phone, Sparkles, Award } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ApplyForm } from "@/components/form/ApplyForm";
import { FadeIn } from "@/components/FadeIn";
import { TopTierSolutions } from "@/components/TopTierSolutions";
import { PillarIcon } from "@/components/PillarIcon";
import { FormattedText } from "@/components/FormattedText";
import { content } from "@/lib/content";

export default function Home() {
  return (
    <div
      className="min-h-screen bg-[#070d1a] text-ivory"
      style={{ fontFamily: "var(--font-manrope), system-ui, sans-serif" }}
    >
      <header className="sticky top-0 z-50 border-b border-gold/20 bg-[#070d1a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a href="#top" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            <Logo variant="light" size="sm" />
          </a>
          <nav className="hidden items-center gap-6 text-sm text-ivory/70 lg:flex" aria-label="Primary">
            {content.nav.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="transition p-2 rounded-md hover:text-black hover:bg-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a
              href={`tel:${content.brand.phone}`}
              className="hidden items-center gap-1.5 text-sm font-semibold text-gold sm:inline-flex"
            >
              <Phone className="size-3.5" aria-hidden />
              {content.brand.phone}
            </a>
            <a
              href="#apply"
              className="inline-flex h-10 items-center rounded-sm border border-gold bg-gradient-to-r from-gold to-gold-light px-5 text-sm font-bold text-navy shadow-[0_0_24px_rgba(201,162,39,0.25)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
            >
              {content.nav.cta}
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        <div id="top-banner" className="width-full bg-gold-light text-navy font-bold flex items-center justify-center min-h-[5vh]">“High-touch academic coaching for capable students who need better systems.”</div>
        {/* Cinematic hero */}
        <section className="relative min-h-[85vh] overflow-hidden">
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1c3260_0%,#070d1a_55%),linear-gradient(180deg,transparent_60%,#070d1a_100%)]"
            aria-hidden
          />
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
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(120deg, transparent 40%, #c9a22722 50%, transparent 60%), radial-gradient(circle at 70% 30%, #c9a22733 0%, transparent 35%)",
            }}
            aria-hidden
          />
          <div className="relative mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center px-4 py-24 sm:px-6">
            <FadeIn>
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
              <p className="mt-8 max-w-4xl text-lg leading-relaxed text-ivory/75">
                {content.hero.reassurance}
              </p>
              <a
                href="#apply"
                className="mt-10 inline-flex h-14 items-center rounded-sm bg-gradient-to-r from-gold to-gold-light px-10 text-sm font-bold uppercase tracking-[0.2em] text-navy shadow-[0_0_40px_rgba(201,162,39,0.35)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
              >
                {content.hero.cta}
              </a>
            </FadeIn>
            <p
              className="mt-16 max-w-md text-sm tracking-wide text-ivory/40"
              aria-label={content.hero.mediaAlt}
            >
              It’s not enough to be smart anymore. Students need systems.
            </p>
          </div>
        </section>

        <div className="border-y border-gold/30 bg-gradient-to-r from-navy via-[#1a2a4a] to-navy px-4 py-4 text-center">
          <p className="text-sm font-semibold tracking-wide text-gold-light">
            {content.urgency.banner}
          </p>
        </div>

        {/* Pain-Points */}
        <section id="pain-points" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <FadeIn>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <Image
                src={studentImg}
                alt=""
                sizes="50vw"
                placeholder="blur"
                style={{ 
                  objectFit: "cover"
                }}
                className="opacity-45"
                aria-hidden
              />
            </div>
            <div>
              <h2 
                className="text-3xl font-bold sm:text-4xl pb-5"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Does this student sound familiar?
              </h2>
              <ul className="space-y-4">
                <li className="border-l border-gold/50 pl-5 text-sm leading-relaxed text-ivory/75">
                  Smart enough to do the work but doesn’t always turn it in
                </li>
                <li className="border-l border-gold/50 pl-5 text-sm leading-relaxed text-ivory/75">
                  Waits until the night before to study
                </li>
                <li className="border-l border-gold/50 pl-5 text-sm leading-relaxed text-ivory/75">
                  Has a planner but rarely uses it  
                </li>
                <li className="border-l border-gold/50 pl-5 text-sm leading-relaxed text-ivory/75">
                  Waits until the night before to study
                </li>
                <li className="border-l border-gold/50 pl-5 text-sm leading-relaxed text-ivory/75">
                  Can earn As but regularly settles for Bs or Cs because of organization
                </li>
                <li className="border-l border-gold/50 pl-5 text-sm font-bold leading-relaxed text-ivory/75">
                  Has ambitious high-school or college goals but inconsistent habits
                </li>
              </ul>

            </div>
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
              <h2 className="text-3xl font-bold text-center sm:text-4xl">
                {content.topTierSolutions.title}
              </h2>
              <div className="mt-4 h-px w-32 bg-gradient-to-r from-gold to-transparent" />
            </FadeIn>
            <FadeIn delay={0.08}>
              <TopTierSolutions items={content.topTierSolutions.items} />
            </FadeIn>
          </div>
        </section>

        
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
        
        {/* Parallax */}
        <div
          className="h-100 w-full overflow-y-scroll bg-contain bg-fixed bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${paraLLaxImg.src})` }}>
        </div>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl border-y border-gold/25 px-4 py-24 sm:px-6">
          <FadeIn>

            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              How It Works
            </h2>

          </FadeIn>
        </section>

        {/* Ideal student */}
        <section id="ideal-student" className="border-y border-gold/15 bg-navy/40">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-2">
              <FadeIn>
                <h2
                  className="text-3xl font-bold sm:text-4xl"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {content.idealStudent.title}
                </h2>
                <p className="mt-4 text-lg text-gold-light/90">
                  {content.idealStudent.intro}
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <ul className="space-y-4">
                  {content.idealStudent.bullets.map((b) => (
                    <li
                      key={b}
                      className="border-l border-gold/50 pl-5 text-sm leading-relaxed text-ivory/75"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Framework */}
        <section id="framework" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <FadeIn className="text-center">
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {content.framework.title}
            </h2>
            <p className="mt-3 text-ivory/55">{content.framework.subtitle}</p>
          </FadeIn>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {content.framework.deliverables.map((d, i) => (
              <FadeIn key={d.title} delay={i * 0.1}>
                <article className="relative overflow-hidden border border-gold/25 p-8">
                  <div
                    className="absolute -right-6 -top-6 size-24 rounded-full bg-gold/5"
                    aria-hidden
                  />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
                    {d.cadence}
                  </p>
                  <h3
                    className="mt-4 text-2xl font-semibold"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {d.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-ivory/65">
                    {d.description}
                  </p>
                </article>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Guarantee — gold foil seal */}
        <section id="guarantee" className="px-4 py-20 sm:px-6">
          <FadeIn className="mx-auto max-w-3xl">
            <div className="relative border border-gold/50 bg-gradient-to-b from-navy-light/80 to-[#070d1a] p-10 sm:p-14">
              <div className="absolute inset-2 border border-gold/20 pointer-events-none" aria-hidden />
              <div className="relative text-center">
                <Award className="mx-auto size-12 text-gold" aria-hidden />
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.4em] text-gold">
                  {content.guarantee.sealText}
                </p>
                <h2
                  className="mt-4 text-2xl font-bold sm:text-3xl"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {content.guarantee.title}
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-ivory/75">
                  {content.guarantee.body}
                </p>
                <ul className="mx-auto mt-8 max-w-md space-y-2 text-left text-xs text-ivory/60">
                  {content.guarantee.expectations.map((e) => (
                    <li key={e} className="flex gap-2 border-t border-gold/15 pt-2">
                      <span className="text-gold">◆</span>
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>
        </section>

        <div className="px-4 py-12 text-center">
          <p
            className="bg-gradient-to-r from-gold-light via-gold to-gold-light bg-clip-text text-2xl font-bold italic text-transparent sm:text-4xl"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            “{content.urgency.tagline}”
          </p>
        </div>

        <section id="apply" className="mx-auto max-w-2xl px-4 pb-24 sm:px-6">
          <FadeIn className="text-center">
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {content.apply.title}
            </h2>
            <p className="mt-3 text-ivory/55">{content.apply.subtitle}</p>
          </FadeIn>
          <FadeIn delay={0.1} className="mt-10">
            <ApplyForm variant="dark" className="rounded-sm border-gold/40" />
          </FadeIn>
        </section>
      </main>

      <footer className="border-t border-gold/20 bg-[#050910]">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <Logo variant="light" size="sm" />
            <p className="mt-3 text-sm text-ivory/50">{content.brand.address}</p>
            <p className="mt-1 font-semibold text-gold">{content.brand.phone}</p>
            <p className="text-sm text-ivory/50">{content.brand.email}</p>
          </div>
          <a
            href="#apply"
            className="inline-flex h-12 items-center justify-center border border-gold bg-gradient-to-r from-gold to-gold-light px-8 text-sm font-bold uppercase tracking-wider text-navy hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {content.footer.ctaLabel}
          </a>
        </div>
        <div className="border-t border-gold/10 py-4 text-center text-xs text-ivory/30">
          {content.footer.copyright}
        </div>
      </footer>
    </div>
  );
}
