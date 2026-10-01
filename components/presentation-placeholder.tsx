export function PresentationPlaceholder({ className }: { className: string }) {
  return (
    <div
      className={`relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-bg-sunken ${className}`}
    >
      <svg viewBox="0 0 64 40" className="h-10 w-16 text-ink-faint" aria-hidden>
        <rect x="4" y="4" width="48" height="27" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="12" y="9" width="48" height="27" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );
}
