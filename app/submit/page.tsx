import type { Metadata } from "next";
import { issueTemplateUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Submit",
  description: "Propose a demo or skill for Auth0 Showcase via a GitHub issue.",
};

const options = [
  {
    template: "submit-demo.yml",
    kind: "Demo",
    title: "Runnable experience",
    body: "Repo, live URL, Auth0 requirements, and docs/architecture.png.",
  },
  {
    template: "submit-skill.yml",
    kind: "Skill",
    title: "Agent skill",
    body: "Install targets and the stories it covers. One package can host several.",
  },
  {
    template: "submit-presentation.yml",
    kind: "Presentation",
    title: "Talk track",
    body: "Google Slides link (shared to the org), talk track, and how long it takes.",
  },
] as const;

export default function SubmitPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="eyebrow">Contribute</p>
      <h1 className="h1 mt-4">Submit an entry</h1>
      <p className="mt-5 text-lg leading-8 text-ink-muted">
        Open a GitHub issue with the matching template. A maintainer turns a complete issue
        into a content file.
      </p>
      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {options.map((option) => (
          <a
            key={option.template}
            href={issueTemplateUrl(option.template)}
            className="rounded-[12px] border border-line bg-bg-card p-5 transition-colors duration-200 hover:border-line-strong hover:bg-bg-elevated"
          >
            <p className="text-[13px] text-accent-ink">{option.kind}</p>
            <p className="mt-2 text-xl font-medium tracking-[-0.015em] text-ink">
              {option.title}
            </p>
            <p className="mt-2 text-[15px] leading-6 text-ink-muted">{option.body}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
