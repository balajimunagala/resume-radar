export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-ink/40 sm:flex-row">
        <p>ResumeRadar — resume parsing happens in your browser, nothing is stored.</p>
        <p className="font-mono">v1.0</p>
      </div>
    </footer>
  );
}
