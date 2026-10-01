"use client";

import { track } from "@vercel/analytics";
import type { ReactNode } from "react";

type TrackedLinkProps = {
  href: string;
  event: string;
  children: ReactNode;
  className?: string;
  title?: string;
  data?: Record<string, string>;
};

export function TrackedLink({ href, event, children, className, title, data }: TrackedLinkProps) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className={className}
      title={title}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={() => {
        track(event, data ?? { href });
      }}
    >
      {children}
    </a>
  );
}
