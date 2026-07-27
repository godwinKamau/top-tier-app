import Image from "next/image";
import { Phone, Sparkles, Award } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ApplyForm } from "@/components/form/ApplyForm";
import { FadeIn } from "@/components/FadeIn";
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
        {/* Cinematic hero */}
        <section className="relative min-h-[85vh] overflow-hidden">
          {/* TODO: swap media — large cinematic Chicago / academic hero */}
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1c3260_0%,#070d1a_55%),linear-gradient(180deg,transparent_60%,#070d1a_100%)]"
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
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-ivory/75">
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
              Powered by {content.brand.system} — elite high-touch coaching for
              families who expect excellence.
            </p>
          </div>
        </section>

        <div className="border-y border-gold/30 bg-gradient-to-r from-navy via-[#1a2a4a] to-navy px-4 py-4 text-center">
          <p className="text-sm font-semibold tracking-wide text-gold-light">
            {content.urgency.banner}
          </p>
        </div>

        {/* Pillars */}
        <section id="pillars" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <FadeIn>
            <h2
              className="text-3xl font-bold sm:text-5xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {content.pillars.title}
            </h2>
            <div className="mt-4 h-px w-32 bg-gradient-to-r from-gold to-transparent" />
          </FadeIn>
          <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {content.pillars.items.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.06} as="li">
                <article className="group h-full border border-gold/20 bg-navy/50 p-6 transition hover:border-gold/50 hover:bg-navy-light/40">
                  <span className="flex size-12 items-center justify-center border border-gold/40 text-gold transition group-hover:bg-gold/10">
                    <PillarIcon name={item.icon} />
                  </span>
                  <h3
                    className="mt-5 text-xl font-semibold"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {item.title}
                  </h3>
                  <FormattedText className="mt-3 text-sm leading-relaxed text-ivory/65">
                    {item.description}
                  </FormattedText>
                </article>
              </FadeIn>
            ))}
          </ul>
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
