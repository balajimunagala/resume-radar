// Vercel serverless function: POST /api/analyze
// Keeps GEMINI_API_KEY on the server — it is never sent to the browser.
// Configure GEMINI_API_KEY (and optionally GEMINI_MODEL) in your Vercel
// project's Environment Variables, or in a local .env file for `vercel dev`.

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_RESUME_CHARS = 15000;
const MAX_JD_CHARS = 8000;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    atsScore: {
      type: 'INTEGER',
      description: 'Overall ATS / job-fit match score from 0 to 100.',
    },
    scoreSummary: {
      type: 'STRING',
      description: 'One short sentence explaining the score.',
    },
    matchingSkills: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Skills/keywords present in both the resume and the job description.',
    },
    missingSkills: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Important skills/keywords from the job description absent from the resume.',
    },
    suggestions: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Specific, actionable rewrite suggestions to improve the resume for this job.',
    },
  },
  required: ['atsScore', 'scoreSummary', 'matchingSkills', 'missingSkills', 'suggestions'],
};

function buildPrompt(resumeText, jobDescription) {
  return `You are an expert ATS (Applicant Tracking System) and technical recruiter.
Compare the RESUME against the JOB DESCRIPTION below and evaluate the match.

Score strictly out of 100 based on: keyword/skill overlap, relevant experience level,
and how well the resume is written for ATS parsing (clear sections, no graphics-only content).

Return:
- atsScore: integer 0-100
- scoreSummary: one short sentence justifying the score
- matchingSkills: skills/technologies/keywords found in BOTH the resume and job description (max 15)
- missingSkills: important skills/keywords from the job description that are missing or weak in the resume (max 12)
- suggestions: 5-8 specific, actionable suggestions to improve the resume for this exact job
  (e.g. "Quantify the impact of the React dashboard project with a metric like users served or load time reduced",
  not generic advice like "add more skills")

RESUME:
"""
${resumeText}
"""

JOB DESCRIPTION:
"""
${jobDescription}
"""`;
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function sanitizeResult(raw) {
  const toStringArray = (val, max) =>
    Array.isArray(val)
      ? val
          .filter((item) => typeof item === 'string' && item.trim().length > 0)
          .map((item) => item.trim())
          .slice(0, max)
      : [];

  const score = Number.isFinite(raw?.atsScore) ? Math.round(raw.atsScore) : 0;

  return {
    atsScore: clamp(score, 0, 100),
    scoreSummary: typeof raw?.scoreSummary === 'string' ? raw.scoreSummary.trim() : '',
    matchingSkills: toStringArray(raw?.matchingSkills, 15),
    missingSkills: toStringArray(raw?.missingSkills, 12),
    suggestions: toStringArray(raw?.suggestions, 8),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server is missing GEMINI_API_KEY. Add it to your environment variables.',
    });
  }

  const { resumeText, jobDescription } = req.body || {};

  if (typeof resumeText !== 'string' || resumeText.trim().length < 50) {
    return res.status(400).json({ error: 'resumeText is missing or too short.' });
  }
  if (typeof jobDescription !== 'string' || jobDescription.trim().length < 30) {
    return res.status(400).json({ error: 'jobDescription is missing or too short.' });
  }

  const trimmedResume = resumeText.trim().slice(0, MAX_RESUME_CHARS);
  const trimmedJD = jobDescription.trim().slice(0, MAX_JD_CHARS);

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: buildPrompt(trimmedResume, trimmedJD) }],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  };

  try {
    const geminiResponse = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      const message = data?.error?.message || 'Gemini API request failed.';
      return res.status(geminiResponse.status).json({ error: message });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(502).json({ error: 'Gemini returned an empty response.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      return res.status(502).json({ error: 'Gemini returned a response that was not valid JSON.' });
    }

    return res.status(200).json(sanitizeResult(parsed));
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error while contacting Gemini.' });
  }
}
