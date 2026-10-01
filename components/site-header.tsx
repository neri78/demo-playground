"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";

// The wordmark is the link home, so a "Catalog" entry would just duplicate it.
const nav = [
  { href: "/demos", label: "Demos" },
  { href: "/skills", label: "Skills" },
  { href: "/presentations", label: "Presentations" },
];

function Mark() {
  return (
    <span
      aria-hidden
      className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-[linear-gradient(135deg,var(--signal),var(--accent)_55%,var(--accent-deep))] shadow-[0_0_20px_-4px_var(--accent)]"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
        <path
          d="M12 3l7 3v5.2c0 4.3-2.9 7.6-7 8.8-4.1-1.2-7-4.5-7-8.8V6l7-3z"
          stroke="white"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="10.5" r="1.9" fill="white" />
        <path d="M12 12.4v3" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-50 focus:rounded-[6px] focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-ink"
      >
        Skip to catalog
      </a>

      <div className="border-b border-line bg-bg/75 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <Mark />
            <span className="flex flex-col leading-none">
              <span className="text-[10px] font-medium tracking-[0.18em] text-accent-ink uppercase">
                Auth0 DevRel
              </span>
              <span className="mt-1 text-[15px] font-medium tracking-tight whitespace-nowrap text-ink">
                Demo Library
              </span>
            </span>
          </Link>

          <nav className="flex min-w-0 items-center gap-1" aria-label="Primary">
            <div className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {nav.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "relative shrink-0 px-2.5 py-2 text-[15px] transition-colors duration-150",
                      active ? "text-ink" : "text-ink-muted hover:text-ink",
                    ].join(" ")}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={[
                        "absolute inset-x-2.5 -bottom-px h-[2px] origin-left rounded-full",
                        "bg-[linear-gradient(90deg,var(--signal),var(--accent))]",
                        "transition-transform duration-200 ease-out",
                        active ? "scale-x-100" : "scale-x-0",
                      ].join(" ")}
                    />
                  </Link>
                );
              })}
            </div>
            <Link
              href="/submit"
              className="ml-2 inline-flex min-h-9 shrink-0 items-center rounded-[6px] bg-signal px-3 text-[15px] font-medium text-bg transition-[background-color,transform] duration-150 ease-out hover:bg-signal-hover active:scale-[0.98]"
            >
              Submit
            </Link>
          </nav>
        </div>
      </div>
      <div className="brand-rule" />
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-baseline sm:justify-between sm:px-6">
        <p className="max-w-lg text-[15px] text-ink-muted">
          Maintained by Auth0 Developer Advocacy. Official hello-world snippets live on{" "}
          <a
            className="text-accent-ink underline decoration-line-strong underline-offset-4 transition-colors duration-150 hover:text-ink hover:decoration-accent-ink"
            href={SITE.codeSamplesUrl}
          >
            developer.auth0.com
          </a>
          .
        </p>
        <p className="text-[13px] text-ink-faint">Not an official Auth0.com property</p>
      </div>
    </footer>
  );
}
