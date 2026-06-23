export class AnalysisError extends Error {}

/**
 * Sends resume text + job description to our serverless /api/analyze function,
 * which in turn calls the Gemini API server-side (keeping the API key private).
 */
export async function analyzeResume({ resumeText, jobDescription }) {
  let response;
  try {
    response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, jobDescription }),
    });
  } catch (err) {
    throw new AnalysisError('Could not reach the analysis service. Check your connection and try again.');
  }

  let payload;
  try {
    payload = await response.json();
  } catch (err) {
    throw new AnalysisError('The analysis service returned an unreadable response.');
  }

  if (!response.ok) {
    throw new AnalysisError(payload?.error || `Analysis failed (${response.status}).`);
  }

  return payload;
}
