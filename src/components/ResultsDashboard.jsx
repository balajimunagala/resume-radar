import ScoreGauge from './ScoreGauge.jsx';
import SkillsList from './SkillsList.jsx';
import SuggestionsList from './SuggestionsList.jsx';

function EmptyState() {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line px-6 text-center">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-ink/25">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <p className="font-display text-sm font-semibold text-ink/60">Scan results appear here</p>
      <p className="max-w-[26ch] text-sm text-ink/40">
        Upload a resume and a job description, then run the analysis to see your ATS score.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-white">
      <div className="relative h-40 w-40 rounded-full border-[14px] border-line">
        <div className="absolute inset-0 animate-spin rounded-full border-[14px] border-transparent border-t-teal-500 [animation-duration:1.1s]" />
      </div>
      <p className="label-eyebrow">cross-referencing keywords…</p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-3 rounded-2xl border border-coral-100 bg-coral-50 px-6 text-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-coral-600">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
        <path d="M12 7.5v6M12 16.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <p className="font-display text-sm font-semibold text-coral-700">Analysis failed</p>
      <p className="max-w-[34ch] text-sm text-coral-600/80">{message}</p>
    </div>
  );
}

export default function ResultsDashboard({ status, result, error }) {
  if (status === 'idle') return <EmptyState />;
  if (status === 'loading') return <LoadingState />;
  if (status === 'error') return <ErrorState message={error} />;
  if (status !== 'done' || !result) return <EmptyState />;

  return (
    <div className="animate-fade-up space-y-5">
      <div className="card-surface flex flex-col items-center gap-2 p-8">
        <ScoreGauge score={result.atsScore} summary={result.scoreSummary} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SkillsList
          title="Matching skills"
          skills={result.matchingSkills}
          variant="match"
          emptyText="No overlapping skills detected."
        />
        <SkillsList
          title="Missing skills"
          skills={result.missingSkills}
          variant="missing"
          emptyText="Nothing significant missing — nice work."
        />
      </div>

      <SuggestionsList suggestions={result.suggestions} />
    </div>
  );
}
