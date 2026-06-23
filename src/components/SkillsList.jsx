const VARIANTS = {
  match: {
    icon: (
      <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    ),
    pill: 'bg-teal-50 text-teal-700 border-teal-100',
  },
  missing: {
    icon: <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />,
    pill: 'bg-coral-50 text-coral-600 border-coral-100',
  },
};

export default function SkillsList({ title, skills, variant, emptyText }) {
  const config = VARIANTS[variant];

  return (
    <div className="card-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
        <span className="label-eyebrow">{skills.length}</span>
      </div>
      {skills.length === 0 ? (
        <p className="text-sm text-ink/40">{emptyText}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <li
              key={`${skill}-${i}`}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${config.pill}`}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                {config.icon}
              </svg>
              {skill}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
