import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { PresentationPlaceholder } from "@/components/presentation-placeholder";
import { TopicChip } from "@/components/topic-chip";
import { TrackedLink } from "@/components/tracked-link";
import { getCatalogItems, getPresentation, getPresentations } from "@/lib/content";
import { githubUserUrl } from "@/lib/github";
import { btnBrand, inlineLink } from "@/lib/ui";

export function generateStaticParams() {
  return getPresentations().map((presentation) => ({ slug: presentation.slug }));
}

type PresentationParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PresentationParams) {
  const { slug } = await params;
  const presentation = getPresentation(slug);
  if (!presentation) return {};
  return { title: presentation.title, description: presentation.oneLiner };
}

export default async function PresentationPage({ params }: PresentationParams) {
  const { slug } = await params;
  const presentation = getPresentation(slug);
  if (!presentation) notFound();

  const catalogItems = getCatalogItems();
  const related = presentation.seeAlso
    .map((relatedSlug) => catalogItems.find((item) => item.slug === relatedSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="eyebrow">Presentation</p>
      <h1 className="h1 mt-4">{presentation.title}</h1>
      <p className="mt-5 text-lg leading-8 text-ink-muted">{presentation.oneLiner}</p>

      <p className="mt-6 text-[15px] text-ink-faint">
        By{" "}
        <a className={inlineLink} href={githubUserUrl(presentation.author.github)}>
          {presentation.author.name}
        </a>
        {presentation.seenAt.length > 0 ? ` · Seen at ${presentation.seenAt.join(", ")}` : null}
      </p>

      <p className="mt-2 text-[15px] text-ink-faint">🔒 Slides: internal-only</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {presentation.topics.map((topic) => (
          <TopicChip key={topic} topic={topic} href={`/?topic=${topic}`} />
        ))}
      </div>

      <div className="mt-12">
        <TrackedLink
          href={presentation.slidesUrl}
          event="cta_slides"
          data={{ slug: presentation.slug }}
          className={btnBrand}
        >
          Open slides (internal-only)
        </TrackedLink>
        <p className="mt-5 text-[15px] text-ink-faint">
          Opens in Google Slides. Requires signing in with your work Google account — if you land
          on a request-access screen, ask {presentation.author.name} to confirm your access.
        </p>
      </div>

      {presentation.thumbnail ? (
        <div className="relative mt-12 aspect-[16/10] overflow-hidden rounded-[12px] border border-line bg-bg-sunken">
          <Image
            src={presentation.thumbnail}
            alt={`${presentation.title} title slide`}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover object-top"
          />
        </div>
      ) : (
        <PresentationPlaceholder className="mt-12 rounded-[12px] border border-line" />
      )}

      <section className="mt-20">
        <h2 className="h2">Duration</h2>
        <p className="mt-4 text-[15px] text-ink-muted">{presentation.timeToComplete}</p>
      </section>

      <section className="mt-20">
        <h2 className="h2">Talk track</h2>
        <div className="mt-4">
          <Markdown>{presentation.talkTrack}</Markdown>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mt-20 border-t border-line pt-10">
          <h2 className="h2">See also</h2>
          <ul className="mt-5 space-y-2.5 text-[15px]">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={item.href} className={inlineLink}>
                  {item.title}
                </Link>
                <span className="text-ink-faint"> — {item.oneLiner}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
