export default function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="#F6F5F1" strokeWidth="1.4" />
              <circle cx="8" cy="8" r="2.4" fill="#0F9D8C" />
              <path d="M8 1.5V3" stroke="#F6F5F1" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Resume<span className="text-teal-600">Radar</span>
          </span>
        </div>
        <a
          href="https://github.com/balajimunagala/resume-radar"
          target="_blank"
          rel="noreferrer"
          className="label-eyebrow hidden items-center gap-1.5 transition-colors hover:text-ink sm:flex"
        >
          Built with Groq
        </a>
      </div>
    </header>
  );
}
