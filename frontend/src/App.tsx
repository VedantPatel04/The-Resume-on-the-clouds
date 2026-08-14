import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL?.trim();

function VisitorBadge() {
  const [count, setCount] = useState("···");

  useEffect(() => {
    const apiUrl = API_URL;
    if (!apiUrl) {
      setCount("—");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8_000);

    async function loadCount(endpoint: string) {
      try {
        const response = await fetch(endpoint, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);

        const data: unknown = await response.json();
        const count =
          typeof data === "object" &&
          data !== null &&
          "count" in data &&
          typeof data.count === "number" &&
          Number.isFinite(data.count) &&
          data.count >= 0
            ? Math.floor(data.count)
            : null;

        setCount(count === null ? "—" : count.toLocaleString());
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Could not load visit count:", error);
        }
        setCount("—");
      } finally {
        window.clearTimeout(timeout);
      }
    }

    void loadCount(apiUrl);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return (
    <span
      aria-live="polite"
      className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm text-foreground"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {count} visits
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </h2>
      <div className="mt-4 space-y-6 border-t border-border pt-5">{children}</div>
    </section>
  );
}

function Entry({
  heading,
  sub,
  meta,
  href,
  bullets,
}: {
  heading: string;
  sub?: string;
  meta?: string;
  href?: string;
  bullets?: string[];
}) {
  return (
    <article>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-display text-lg text-foreground">{heading}</h3>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-foreground transition-colors hover:bg-accent"
            >
              Link
            </a>
          ) : null}
        </div>
        {meta ? <span className="text-xs text-muted-foreground">{meta}</span> : null}
      </div>
      {sub ? <p className="mt-0.5 text-sm text-secondary-foreground">{sub}</p> : null}
      {bullets ? (
        <ul className="mt-3 space-y-2">
          {bullets.map((b) => (
            <li key={b} className="relative pl-5 text-sm leading-relaxed text-muted-foreground">
              <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
              {b}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-background font-sans">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <header className="rounded-3xl bg-card p-8 shadow-[0_1px_0_0_var(--color-border),0_24px_60px_-40px_var(--color-primary)] sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-primary to-secondary" />
            <VisitorBadge />
          </div>
          <h1 className="mt-6 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            Vedant Patel
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Los Angeles, CA · M.S. Computer Science
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <a
              href="mailto:vedanthp1@gmail.com"
              className="rounded-full bg-muted px-4 py-1.5 text-foreground transition-colors hover:bg-accent"
            >
              vedanthp1@gmail.com
            </a>
            <a
              href="tel:+16616449143"
              className="rounded-full bg-muted px-4 py-1.5 text-foreground transition-colors hover:bg-accent"
            >
              (661) 644-9143
            </a>
            <a
              href="https://linkedin.com/in/vedantpatel26"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-muted px-4 py-1.5 text-foreground transition-colors hover:bg-accent"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/VedantPatel04"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-muted px-4 py-1.5 text-foreground transition-colors hover:bg-accent"
            >
              GitHub
            </a>
          </div>
        </header>

        <Section title="Education">
          <Entry
            heading="California State University, Northridge"
            sub="M.S. Computer Science"
            meta="Expected May 2028"
          />
          <Entry
            heading="University of California, San Diego"
            sub="B.S. Computer Science"
            meta="Jun 2026"
            bullets={[
              "Relevant Coursework: Database Systems and Principles, Software Engineering, Advanced Data Structures and Algorithms, Systems Programming and Software Tools, Operating Systems Principles.",
            ]}
          />
        </Section>

        <Section title="Experience">
          <Entry
            heading="STEM Technical Instructor"
            sub="College of the Canyons"
            meta="Aug 2023 – Aug 2024"
            bullets={[
              "Elevated student exam performance in a data structures and algorithms course by an average of 25% through one-on-one debugging sessions and personalized practice problems curated based on past exam performance.",
              "Increased student exam performance by an average of 20% in integral and multivariable Calculus by hosting weekly review workshops for groups of 5–10 students covering homework and lecture notes.",
            ]}
          />
        </Section>

        <Section title="Projects">
          <Entry
            heading="Open Source Contributor (icalendar)"
            href="https://github.com/collective/icalendar/pull/1615"
            bullets={[
              "Expanded the RFC 5545 attachment API for icalendar, a Python library with 11M+ monthly downloads, by building accessors across 4 core calendar components (Alarm, Events, Todo, Journal).",
              "Enforced AUDIO alarm attachment limits and protected against invalid assignments by implementing a targeted test suite of 20 tests covering attachment validation edge cases.",
            ]}
          />
          <Entry
            heading="Open Source Contributor (BorgBackup)"
            href="https://github.com/borgbackup/borg/pull/10004"
            bullets={[
              "Added machine-readable JSON output to the borg version command for the BorgBackup project, enabling automation to consume stable client and server version fields without changing CLI output; reviewed and merged in v1.4.5.",
              "Preserved backward compatibility by authoring a test suite covering both output modes and updating documentation for the latest release.",
            ]}
          />
          <Entry
            heading="Credit Card Recommendation Platform"
            sub="Python, PostgreSQL, TypeScript, HTML/CSS"
            href="https://github.com/VedantPatel04/Cards"
            bullets={[
              "Built and deployed a full-stack credit card recommendation platform with JWT auth and data isolation across a 3-service production stack: Django Rest Framework and PostgreSQL on Supabase, Redis on Render, and React and TypeScript on Vercel.",
              "Engineered a credit card statement ingestion pipeline supporting 500 transactions per file with a multi-tier query resolution architecture resolving 49 reward metrics across 14 card options into 7 category buckets.",
              "Constructed a GitHub Actions CI/CD pipeline covering build checks and unit testing for the front and back end plus the Docker image to ensure safe data ingestion and protected user authentication and data isolation.",
            ]}
          />
          <Entry
            heading="Resume on the Cloud"
            sub="Python, TypeScript, HTML/CSS"
            href="https://github.com/VedantPatel04/The-Resume-on-the-clouds"
            bullets={[
              "Built and deployed a serverless React/TypeScript resume on AWS with live and concurrent visitor tracking via atomic DynamoDB updates and CORS-aware Lambda handling through CloudFront.",
              "Automated frontend and backend releases with GitHub Actions workflows covering type-checking, builds, S3 publishing, CloudFront invalidation, and Lambda deployment.",
            ]}
          />
        </Section>

        <Section title="Activities & Leadership">
          <Entry
            heading="ACM — College of the Canyons"
            sub="Lead Developer, Founder"
            meta="Mar 2023 – Jun 2024"
            bullets={[
              "Founded the College of the Canyons ACM chapter, growing it to 30 active members by leading weekly technical web development workshops and projects focused on building a digital platform for the chapter.",
            ]}
          />
        </Section>

        <Section title="Skills">
          <div className="space-y-4 text-sm">
            {[
              {
                label: "Languages",
                items: ["Python", "JavaScript", "TypeScript", "HTML/CSS"],
              },
              {
                label: "Backend & Databases",
                items: ["Django", "FastAPI", "PostgreSQL", "AWS S3", "Supabase"],
              },
              {
                label: "Frameworks",
                items: ["Django Rest Framework", "React", "Vitest"],
              },
              {
                label: "Developer Tools",
                items: [
                  "Docker",
                  "Redis",
                  "Render",
                  "Vercel",
                  "Swagger/OpenAPI",
                  "Postman",
                  "Cursor/Claude Code",
                ],
              },
            ].map((group) => (
              <div key={group.label}>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {group.label}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-accent px-3 py-1 text-accent-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </main>
  );
}
