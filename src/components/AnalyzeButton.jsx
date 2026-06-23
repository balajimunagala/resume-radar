export default function AnalyzeButton({ onClick, disabled, isLoading }) {
  return (
    <button onClick={onClick} disabled={disabled || isLoading} className="btn-primary w-full sm:w-auto">
      {isLoading ? (
        <>
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-paper [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-paper [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-paper" />
          </span>
          Scanning resume
        </>
      ) : (
        <>
          Run analysis
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </>
      )}
    </button>
  );
}
