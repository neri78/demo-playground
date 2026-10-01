import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { isTopic, type Topic } from "./topics";
import type { CatalogItem, Demo, Presentation, Screenshot, Skill } from "./types";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const SHOTS_ROOT = path.join(process.cwd(), "public", "shots");

// Filenames are `01-the-game-library.webp`: the prefix orders them, the rest is
// the caption. Adding a screenshot means dropping a file in, nothing else.
function screenshotsFor(slug: string): Screenshot[] {
  const dir = path.join(SHOTS_ROOT, slug);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".webp"))
    .sort()
    .map((file) => {
      const stem = file.replace(/\.webp$/, "").replace(/^\d+-/, "");
      const words = stem.replace(/-/g, " ");
      return {
        src: `/shots/${slug}/${file}`,
        label: words.charAt(0).toUpperCase() + words.slice(1),
      };
    });
}

// One optional image per presentation at public/shots/presentations/<slug>.<ext>. Namespaced so a
// presentation never collides with a same-slug demo (shoot-demos.mjs wipes public/shots/<slug>).
function presentationThumbnailFor(slug: string): string | undefined {
  for (const ext of ["webp", "png", "jpg"]) {
    if (fs.existsSync(path.join(SHOTS_ROOT, "presentations", `${slug}.${ext}`))) {
      return `/shots/presentations/${slug}.${ext}`;
    }
  }
  return undefined;
}

function readMdFiles(dir: string) {
  const full = path.join(CONTENT_ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(full, file), "utf8");
      const parsed = matter(raw);
      return { slug: file.replace(/\.md$/, ""), data: parsed.data, body: parsed.content.trim() };
    });
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asTopics(value: unknown): Topic[] {
  return asStringArray(value).filter(isTopic);
}

// `draft: true` hides an entry on the real production deploy while still
// showing it in `next dev` and on Vercel preview deploys — lets a maintainer
// stage unfinished content (no real deck/repo yet) for review before launch.
// VERCEL_ENV is "production" only on the real deploy and "preview" on PR/
// branch deploys; NODE_ENV alone can't tell those apart, since both run
// `next build`. Off Vercel, VERCEL_ENV is never set, so fall back to NODE_ENV
// (which can only distinguish dev from any build, not preview from prod).
function isVisible(data: Record<string, unknown>): boolean {
  if (!data.draft) return true;
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv) return vercelEnv !== "production";
  return process.env.NODE_ENV !== "production";
}

function splitSections(body: string) {
  const experienceMatch = body.match(/^## experience\s*\n([\s\S]*?)(?=^## )/m);
  const setupMatch = body.match(/^## setup\s*\n([\s\S]*)$/m);
  return {
    experience: (experienceMatch?.[1] ?? body).trim(),
    setup: (setupMatch?.[1] ?? "").trim(),
  };
}

function parseDemo(slug: string, data: Record<string, unknown>, body: string): Demo {
  const author = (data.author as { name?: string; github?: string }) ?? {};
  const { experience, setup } = splitSections(body);
  return {
    kind: "demo",
    slug,
    title: String(data.title ?? slug),
    oneLiner: String(data.oneLiner ?? ""),
    topics: asTopics(data.topics),
    author: { name: String(author.name ?? "Unknown"), github: String(author.github ?? "") },
    repo: String(data.repo ?? ""),
    liveUrl: data.liveUrl ? String(data.liveUrl) : undefined,
    blogUrl: data.blogUrl ? String(data.blogUrl) : undefined,
    videoUrl: data.videoUrl ? String(data.videoUrl) : undefined,
    timeToStandUp: String(data.timeToStandUp ?? "Unknown"),
    auth0Requirements: asStringArray(data.auth0Requirements),
    otherRequirements: asStringArray(data.otherRequirements),
    talkTrack: asStringArray(data.talkTrack),
    seenAt: asStringArray(data.seenAt),
    relatedRepos: Array.isArray(data.relatedRepos)
      ? (data.relatedRepos as { label?: string; url?: string }[])
          .filter((item) => item.label && item.url)
          .map((item) => ({ label: String(item.label), url: String(item.url) }))
      : [],
    seeAlso: asStringArray(data.seeAlso),
    architecture: String(data.architecture ?? "docs/architecture.png"),
    screenshots: screenshotsFor(slug),
    stack: asStringArray(data.stack),
    experience,
    setup,
  };
}

function parseSkill(slug: string, data: Record<string, unknown>, body: string): Skill {
  const author = (data.author as { name?: string; github?: string }) ?? {};
  const install = (data.install as Record<string, string>) ?? {};
  const stories = Array.isArray(data.stories)
    ? (data.stories as { title?: string; body?: string }[])
        .filter((item) => item.title && item.body)
        .map((item) => ({ title: String(item.title), body: String(item.body) }))
    : [];
  return {
    kind: "skill",
    slug,
    title: String(data.title ?? slug),
    oneLiner: String(data.oneLiner ?? ""),
    topics: asTopics(data.topics),
    author: { name: String(author.name ?? "Unknown"), github: String(author.github ?? "") },
    repo: String(data.repo ?? ""),
    install: {
      cursor: String(install.cursor ?? ""),
      claude: String(install.claude ?? ""),
      chatgpt: String(install.chatgpt ?? ""),
      any: String(install.any ?? ""),
    },
    stories,
    whenToUse: asStringArray(data.whenToUse),
    synopsis: body,
  };
}

// Fails the build on a "Publish to web"/embed link (decks must be org-shared, not public) and,
// for non-drafts, on an empty or placeholder URL. Drafts may keep the placeholder.
function assertValidSlidesUrl(slug: string, slidesUrl: string, draft: boolean) {
  if (/\/pub\b|\/embed\b/.test(slidesUrl)) {
    throw new Error(
      `[presentations] ${slug}: slidesUrl is a "Publish to web"/embed link (${slidesUrl}). ` +
        `Share the deck to the org and use the normal /edit link.`,
    );
  }
  if (!draft && (!slidesUrl || slidesUrl.includes("REPLACE_ME"))) {
    throw new Error(`[presentations] ${slug}: slidesUrl is empty or still a placeholder.`);
  }
}

function parsePresentation(
  slug: string,
  data: Record<string, unknown>,
  body: string,
): Presentation {
  const author = (data.author as { name?: string; github?: string }) ?? {};
  const slidesUrl = String(data.slidesUrl ?? "");
  assertValidSlidesUrl(slug, slidesUrl, Boolean(data.draft));
  return {
    kind: "presentation",
    slug,
    title: String(data.title ?? slug),
    oneLiner: String(data.oneLiner ?? ""),
    topics: asTopics(data.topics),
    author: { name: String(author.name ?? "Unknown"), github: String(author.github ?? "") },
    draft: Boolean(data.draft),
    thumbnail: presentationThumbnailFor(slug),
    timeToComplete: String(data.timeToComplete ?? "Unknown"),
    seenAt: asStringArray(data.seenAt),
    seeAlso: asStringArray(data.seeAlso),
    slidesUrl,
    talkTrack: body,
  };
}

export function getDemos(): Demo[] {
  return readMdFiles("demos")
    .map((file) => parseDemo(file.slug, file.data as Record<string, unknown>, file.body))
    .toSorted((a, b) => a.title.localeCompare(b.title));
}

export function getDemo(slug: string) {
  return getDemos().find((demo) => demo.slug === slug);
}

export function getSkills(): Skill[] {
  return readMdFiles("skills")
    .map((file) => parseSkill(file.slug, file.data as Record<string, unknown>, file.body))
    .toSorted((a, b) => a.title.localeCompare(b.title));
}

export function getSkill(slug: string) {
  return getSkills().find((skill) => skill.slug === slug);
}

export function getPresentations(): Presentation[] {
  return readMdFiles("presentations")
    .filter((file) => isVisible(file.data as Record<string, unknown>))
    .map((file) => parsePresentation(file.slug, file.data as Record<string, unknown>, file.body))
    .toSorted((a, b) => a.title.localeCompare(b.title));
}

export function getPresentation(slug: string) {
  return getPresentations().find((presentation) => presentation.slug === slug);
}

export function getCatalogItems(): CatalogItem[] {
  const demos = getDemos().map(
    (demo): CatalogItem => ({
      kind: "demo",
      slug: demo.slug,
      title: demo.title,
      oneLiner: demo.oneLiner,
      topics: demo.topics,
      href: `/demos/${demo.slug}`,
      timeToStandUp: demo.timeToStandUp,
      liveUrl: demo.liveUrl,
      thumbnail: demo.screenshots[0]?.src,
    }),
  );
  const skills = getSkills().map(
    (skill): CatalogItem => ({
      kind: "skill",
      slug: skill.slug,
      title: skill.title,
      oneLiner: skill.oneLiner,
      topics: skill.topics,
      href: `/skills/${skill.slug}`,
    }),
  );
  const presentations = getPresentations().map(
    (presentation): CatalogItem => ({
      kind: "presentation",
      slug: presentation.slug,
      title: presentation.title,
      oneLiner: presentation.oneLiner,
      topics: presentation.topics,
      href: `/presentations/${presentation.slug}`,
      timeToStandUp: presentation.timeToComplete,
      thumbnail: presentation.thumbnail,
    }),
  );
  return [...demos, ...skills, ...presentations];
}
