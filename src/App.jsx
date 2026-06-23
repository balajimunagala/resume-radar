import { useCallback, useState } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import UploadResume from './components/UploadResume.jsx';
import JobDescriptionInput from './components/JobDescriptionInput.jsx';
import AnalyzeButton from './components/AnalyzeButton.jsx';
import ResultsDashboard from './components/ResultsDashboard.jsx';
import { extractTextFromPdf, PdfExtractionError } from './utils/pdfExtractor.js';
import { analyzeResume, AnalysisError } from './utils/api.js';

const MIN_JD_CHARS = 30;

export default function App() {
  const [file, setFile] = useState(null);
  const [pdfStatus, setPdfStatus] = useState('idle'); // idle | reading | done | error
  const [pdfError, setPdfError] = useState('');
  const [resumeText, setResumeText] = useState('');

  const [jobDescription, setJobDescription] = useState('');

  const [analysisStatus, setAnalysisStatus] = useState('idle'); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  const handleFileSelect = useCallback(async (selected) => {
    setFile(selected);
    setPdfStatus('reading');
    setPdfError('');
    setResumeText('');
    // Reset any prior analysis once a new resume is chosen.
    setAnalysisStatus('idle');
    setResult(null);

    try {
      const text = await extractTextFromPdf(selected);
      setResumeText(text);
      setPdfStatus('done');
    } catch (err) {
      const message = err instanceof PdfExtractionError ? err.message : 'Unexpected error reading the PDF.';
      setPdfError(message);
      setPdfStatus('error');
    }
  }, []);

  const handleClearFile = useCallback(() => {
    setFile(null);
    setPdfStatus('idle');
    setPdfError('');
    setResumeText('');
  }, []);

  const handleAnalyze = useCallback(async () => {
    setAnalysisStatus('loading');
    setAnalysisError('');
    try {
      const data = await analyzeResume({ resumeText, jobDescription });
      setResult(data);
      setAnalysisStatus('done');
    } catch (err) {
      const message = err instanceof AnalysisError ? err.message : 'Unexpected error during analysis.';
      setAnalysisError(message);
      setAnalysisStatus('error');
    }
  }, [resumeText, jobDescription]);

  const canAnalyze =
    pdfStatus === 'done' &&
    resumeText.length > 0 &&
    jobDescription.trim().length >= MIN_JD_CHARS &&
    analysisStatus !== 'loading';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <section className="mb-12 max-w-2xl">
          <p className="label-eyebrow mb-3">ai resume analyzer</p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            See exactly why your resume gets filtered.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink/55">
            Upload a resume and a job description. ResumeRadar scans both with Gemini and returns
            an ATS score, matched and missing skills, and specific lines to rewrite — in seconds.
          </p>
        </section>

        <section className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-6">
            <UploadResume
              file={file}
              status={pdfStatus}
              error={pdfError}
              charCount={resumeText.length}
              onFileSelect={handleFileSelect}
              onClear={handleClearFile}
            />
            <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
            <AnalyzeButton
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              isLoading={analysisStatus === 'loading'}
            />
          </div>

          <div>
            <ResultsDashboard status={analysisStatus} result={result} error={analysisError} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
