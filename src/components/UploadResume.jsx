import { useRef, useState } from 'react';

const STATUS_COPY = {
  reading: 'Scanning document…',
  done: 'Text extracted',
  error: 'Could not read file',
};

export default function UploadResume({ file, status, error, charCount, onFileSelect, onClear }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (fileList) => {
    const picked = fileList?.[0];
    if (picked) onFileSelect(picked);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-ink">1. Upload your resume</h2>
        <span className="label-eyebrow">pdf only</span>
      </div>

      {!file && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors ${
            isDragging ? 'border-teal-500 bg-teal-50' : 'border-line bg-white hover:border-ink/30'
          }`}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-ink/40">
            <path
              d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm font-medium text-ink/70">
            Drop your resume here, or <span className="text-teal-600">browse</span>
          </p>
          <p className="text-xs text-ink/40">PDF, up to 8MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {file && (
        <div className="relative overflow-hidden rounded-2xl border border-line bg-white p-4">
          {status === 'reading' && (
            <div className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden">
              <div className="h-10 w-full animate-scanline bg-gradient-to-b from-transparent via-teal-100/80 to-transparent" />
            </div>
          )}
          <div className="relative flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink/5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 2h9l5 5v15a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z"
                  stroke="#161A23"
                  strokeOpacity="0.45"
                  strokeWidth="1.5"
                />
                <path d="M14 2v5h5" stroke="#161A23" strokeOpacity="0.45" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{file.name}</p>
              <p
                className={`mt-0.5 font-mono text-xs ${
                  status === 'error' ? 'text-coral-600' : 'text-ink/45'
                }`}
              >
                {status === 'done' && charCount
                  ? `${STATUS_COPY.done} · ${charCount.toLocaleString()} characters`
                  : STATUS_COPY[status] || ''}
              </p>
            </div>
            <button
              onClick={onClear}
              aria-label="Remove file"
              className="shrink-0 rounded-lg p-1.5 text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          {status === 'error' && error && (
            <p className="relative mt-3 rounded-lg bg-coral-50 px-3 py-2 text-xs text-coral-600">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
