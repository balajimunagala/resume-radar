import { useEffect, useState } from 'react';

const RADIUS = 84;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getScoreTone(score) {
  if (score >= 75) {
    return { stroke: '#0F9D8C', tint: 'text-teal-600', label: 'Strong match' };
  }
  if (score >= 50) {
    return { stroke: '#F2A516', tint: 'text-amber', label: 'Partial match' };
  }
  return { stroke: '#E5572A', tint: 'text-coral-600', label: 'Needs work' };
}

/**
 * Radial "scan readout" gauge — the signature visual element of ResumeRadar.
 * Animates its sweep on mount/score change.
 */
export default function ScoreGauge({ score = 0, summary }) {
  const [displayScore, setDisplayScore] = useState(0);
  const tone = getScoreTone(score);
  const offset = CIRCUMFERENCE * (1 - score / 100);

  useEffect(() => {
    setDisplayScore(0);
    const duration = 900;
    const start = performance.now();

    let frame;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(score * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-48 w-48">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="#DAD7CF"
            strokeWidth="14"
          />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke={tone.stroke}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.65,0,0.35,1), stroke 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-5xl font-semibold tabular-nums text-ink">
            {displayScore}
          </span>
          <span className="label-eyebrow mt-1">/ 100 ats score</span>
        </div>
      </div>
      <div className="text-center">
        <p className={`font-display text-sm font-semibold ${tone.tint}`}>{tone.label}</p>
        {summary && <p className="mt-1 max-w-xs text-sm text-ink/60">{summary}</p>}
      </div>
    </div>
  );
}
