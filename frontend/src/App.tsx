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
            meta="Aug. 2026 – Dec. 2027 (Expected)"
          />
          <Entry
            heading="University of California, San Diego"
            sub="B.S. Computer Science"
            meta="Sept. 2024 – June 2026"
            bullets={[
              "Relevant Coursework: Advanced Data Structures, Algorithm Analysis, Database Systems, Software Engineering, Operating Systems, Machine Learning Algorithms, Computer Architecture.",
            ]}
          />
        </Section>

        <Section title="Experience">
          <Entry
            heading="Software Engineer Intern"
            sub="SciQuel"
            meta="Remote · July 2026 – Sept. 2026"
            bullets={[
              "Cut latency for article fetches by 34% (350ms → 230ms) by removing redundant text parsing from a Markdown rendering pipeline.",
              "Added tag-based cache invalidation to profile fetches, making updates visible in 500ms (down from 60s).",
              "Integrated Storybook and Mock Service Worker into a reusable UI testing environment, enabling React component review without a live backend.",
            ]}
          />
          <Entry
            heading="STEM Technical Instructor"
            sub="College of the Canyons"
            meta="Valencia, CA · Aug. 2023 – Aug. 2024"
            bullets={[
              "Improved average exam performance by 25% for 12 students in a data structures and algorithms course through one-on-one debugging sessions and personally curated practice problems.",
            ]}
          />
        </Section>

        <Section title="Projects">
          <Entry
            heading="NewCardForMe"
            sub="Django, React, Docker, PostgreSQL"
            href="https://github.com/VedantPatel04/Cards"
            bullets={[
              "Cut merchant categorization latency by 75% by consolidating Postgresql lookups to a single batched query.",
              "Added a dedicated database-write pipeline for new statement imports, increasing throughput for concurrent uploads by 32%.",
              "Achieved 91% savings-estimation accuracy across 5000 transactions via addition of a spending threshold to the card-scoring service.",
            ]}
          />
          <Entry
            heading="iCalendar (Open Source Contributor)"
            sub="Python"
            href="https://github.com/collective/icalendar/pull/1615"
            bullets={[
              "Increased attachment-handling success by 40% across 20 test cases by automating file encoding for the ALARM attachments property.",
              "Enforced audio alarm attachment limits through setter validation, rejecting 100% of invalid configurations across 10 test cases.",
            ]}
          />
          <Entry
            heading="Resume on the Cloud"
            sub="AWS (S3, Lambda, CloudFront), Python, TypeScript"
            href="https://github.com/VedantPatel04/The-Resume-on-the-clouds"
            bullets={[
              "Deployed serverless resume infrastructure on AWS with S3, Lambda functions and CloudFront with live visitor-count tracking via atomic DynamoDB updates for concurrency.",
              "Automated deploys with a GitHub Actions CI/CD pipeline covering build-checks, unit tests, and linting.",
            ]}
          />
        </Section>

        <Section title="Skills">
          <div className="space-y-4 text-sm">
            {[
              {
                label: "Languages",
                items: ["Python", "TypeScript", "JavaScript", "HTML/CSS", "SQL"],
              },
              {
                label: "Tools & Frameworks",
                items: [
                  "Django",
                  "Next.js",
                  "FastAPI",
                  "React",
                  "Git",
                  "Docker",
                  "CI/CD",
                  "AWS (Lambda, S3, DynamoDB)",
                  "Agile (Jira)",
                  "Alembic",
                  "Codex/Claude Code",
                ],
              },
              {
                label: "Libraries & Databases",
                items: [
                  "PostgreSQL",
                  "MongoDB",
                  "Google Cloud",
                  "Authentication (OAuth, JWT)",
                  "SQLAlchemy",
                  "Prisma",
                  "Pydantic",
                  "Pytest",
                  "Storybook",
                  "Vite",
                  "Vitest",
                  "Pandas",
                  "Numpy",
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
