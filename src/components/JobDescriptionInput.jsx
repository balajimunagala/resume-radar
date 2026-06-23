const MIN_CHARS = 30;
const MAX_CHARS = 8000;

export default function JobDescriptionInput({ value, onChange }) {
  const count = value.length;
  const tooShort = count > 0 && count < MIN_CHARS;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-ink">2. Paste the job description</h2>
        <span className={`label-eyebrow font-mono ${count > MAX_CHARS ? 'text-coral-600' : ''}`}>
          {count.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
        placeholder="Paste the full job posting here — responsibilities, requirements, and preferred qualifications all help the match."
        className="h-44 w-full resize-none rounded-2xl border border-line bg-white p-4 text-sm leading-relaxed text-ink placeholder:text-ink/35 focus:border-teal-500"
      />
      {tooShort && (
        <p className="mt-2 text-xs text-ink/40">Add a bit more detail for an accurate match.</p>
      )}
    </div>
  );
}
