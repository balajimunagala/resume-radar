export default function SuggestionsList({ suggestions }) {
  return (
    <div className="card-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-ink">Rewrite suggestions</h3>
        <span className="label-eyebrow">{suggestions.length}</span>
      </div>
      {suggestions.length === 0 ? (
        <p className="text-sm text-ink/40">No suggestions — your resume is well aligned.</p>
      ) : (
        <ol className="space-y-3">
          {suggestions.map((tip, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink/80">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-ink/5 font-mono text-[11px] text-ink/50">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
