"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { PresentationPlaceholder } from "@/components/presentation-placeholder";
import type { CatalogItem } from "@/lib/types";
import { TOPIC_LABELS, TOPICS, isTopic, type Topic } from "@/lib/topics";

const KIND_LABELS: Record<CatalogItem["kind"], string> = {
  demo: "Demo",
  skill: "Skill",
  presentation: "Presentation",
};

const chipBase =
  "min-h-9 rounded-full border px-3 text-[13px] transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.98]";

// Purple means "you narrowed something". The default resting state stays neutral.
function chip(state: "on" | "resting" | "off") {
  const skin = {
    on: "border-accent bg-accent-soft text-ink",
    resting: "border-line-strong bg-bg-elevated text-ink",
    off: "border-line text-ink-muted hover:border-line-strong hover:text-ink",
  }[state];
  return `${chipBase} ${skin}`;
}

export function Catalog({ items }: { items: CatalogItem[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const topicParam = searchParams.get("topic");
  const topic = topicParam && isTopic(topicParam) ? topicParam : null;

  function select(next: Topic | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("topic", next);
    else params.delete("topic");

    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  const filtered = topic
    ? items.filter((item) => item.topics.includes(topic))
    : items;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => select(null)}
          aria-pressed={topic === null}
          className={chip(topic === null ? "resting" : "off")}
        >
          Any topic
        </button>
        {TOPICS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => select(topic === item ? null : item)}
            aria-pressed={topic === item}
            className={chip(topic === item ? "on" : "off")}
          >
            {TOPIC_LABELS[item]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-ink-muted">Nothing under that topic yet.</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {filtered.map((item, index) => (
            <li
              key={`${item.kind}-${item.slug}`}
              className="rise"
              style={{ animationDelay: `${Math.min(index, 7) * 40}ms` }}
            >
              <CatalogCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CatalogCard({ item }: { item: CatalogItem }) {
  const isDemo = item.kind === "demo";
  const isPresentation = item.kind === "presentation";
  return (
    <Link
      href={item.href}
      className="group flex h-full flex-col overflow-hidden rounded-[12px] border border-line bg-bg-card transition-colors duration-200 hover:border-line-strong"
    >
      {item.thumbnail ? (
        <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-bg-sunken">
          <Image
            src={item.thumbnail}
            alt=""
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
      ) : isPresentation ? (
        <PresentationPlaceholder className="border-b border-line" />
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-2 text-[13px] text-accent-ink">
          <span>{KIND_LABELS[item.kind]}</span>
          {isPresentation ? (
            <span className="text-ink-faint">🔒 Slides: internal-only</span>
          ) : null}
        </p>
        <h2 className="mt-2 text-xl font-medium tracking-[-0.015em] text-ink">
          {item.title}
        </h2>
        <p className="mt-2 flex-1 text-[15px] leading-6 text-ink-muted">
          {item.oneLiner}
        </p>
        <p className="mt-5 flex items-center gap-2 text-[13px] text-ink-faint">
          {item.liveUrl ? (
            <>
              <span aria-hidden className="size-1.5 rounded-full bg-mint" />
              <span>Live</span>
              <span aria-hidden>·</span>
            </>
          ) : null}
          <span>
            {item.timeToStandUp ?? (isDemo ? "Runnable app" : isPresentation ? "Talk + slides" : "Agent skill")}
          </span>
        </p>
      </div>
    </Link>
  );
}
