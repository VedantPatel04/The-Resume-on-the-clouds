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
  bullets,
}: {
  heading: string;
  sub?: string;
  meta?: string;
  bullets?: string[];
}) {
  return (
    <article>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-display text-lg text-foreground">{heading}</h3>
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
              href="mailto:vhp001@ucsd.edu"
              className="rounded-full bg-muted px-4 py-1.5 text-foreground transition-colors hover:bg-accent"
            >
              vhp001@ucsd.edu
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
            meta="Sept 2024 – Jun 2026"
            bullets={[
              "Coursework: Database Systems, Software Engineering, Advanced Data Structures & Algorithms, Systems Programming, Operating Systems.",
            ]}
          />
        </Section>

        <Section title="Experience">
          <Entry
            heading="STEM Technical Instructor"
            sub="College of the Canyons"
            meta="Aug 2023 – Aug 2024"
            bullets={[
              "Boosted exam performance in data structures and algorithms courses by an average of 25% across 50 students through one-on-one debugging sessions and personalized practice problems.",
              "Raised testing performance by an average of 20% in Integral Calculus through workshops and exam performance reviews.",
            ]}
          />
          <Entry
            heading="Code Instructor"
            sub="Code Ninjas"
            meta="Jun 2023 – Aug 2023"
            bullets={[
              "Increased average project accuracy scores by 30% across 25 students with hands-on game development lessons in Unity, C#, and MakeCode.",
            ]}
          />
        </Section>

        <Section title="Projects">
          <Entry
            heading="Personalized Credit Card Recommendation Platform"
            sub="Python · PostgreSQL · Django · JWT · React"
            bullets={[
              "Built a full-stack platform covering registration, CSV upload, spending analysis, and card rankings across 5 protected React pages and 11 REST endpoints.",
              "Delivered top-3 recommendations with O(1) database reads per request by replacing per-category scans with a single PostgreSQL GROUP BY aggregation.",
              "Processed 300–700 transaction rows per upload into 9 spending categories with a validating CSV parsing service.",
            ]}
          />
          <Entry
            heading="GitHub Analytics Dashboard"
            sub="Python · Django REST Framework · PostgreSQL · Docker · Swagger"
            bullets={[
              "Eliminated GitHub API dependency for analytics reads with a sync-and-store pipeline persisting repos, commits, and language data across 5 models.",
              "Strengthened API security with JWT authentication and per-user data scoping.",
            ]}
          />
        </Section>

        <Section title="Leadership">
          <Entry
            heading="ACM — College of the Canyons"
            sub="Founder, Lead Developer"
            meta="Mar 2023 – Jun 2024"
            bullets={[
              "Founded the chapter and grew it to 30 active members through weekly web development workshops and a chapter digital platform.",
            ]}
          />
        </Section>

        <Section title="Skills & Certifications">
          <div className="space-y-4 text-sm">
            {[
              { label: "Languages", items: ["Python", "JavaScript", "Java"] },
              { label: "Frameworks", items: ["Django REST Framework", "Django", "React"] },
              {
                label: "Tools",
                items: ["PostgreSQL", "Docker", "GitHub Actions CI/CD", "Swagger", "Postman"],
              },
              { label: "Certifications", items: ["Jovian Data Analysis with Python"] },
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

        <footer className="mt-14 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vedant Patel
        </footer>
      </div>
    </main>
  );
}
