// Vercel serverless function: POST /api/analyze

const GROQ_MODEL =
  process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const GROQ_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const MAX_RESUME_CHARS = 15000;
const MAX_JD_CHARS = 8000;

function buildPrompt(resumeText, jobDescription) {
  return `
You are an expert ATS (Applicant Tracking System) reviewer and technical recruiter.

Compare the RESUME against the JOB DESCRIPTION.

Return ONLY valid JSON in this exact format:

{
  "atsScore": number,
  "scoreSummary": "string",
  "matchingSkills": ["skill1","skill2"],
  "missingSkills": ["skill1","skill2"],
  "suggestions": ["suggestion1","suggestion2"]
}

Rules:
- atsScore must be between 0 and 100
- matchingSkills max 15 items
- missingSkills max 12 items
- suggestions max 8 items
- Return only JSON
- No markdown
- No explanations outside JSON

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`;
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function sanitizeResult(raw) {
  const toStringArray = (val, max) =>
    Array.isArray(val)
      ? val
          .filter(
            (item) =>
              typeof item === "string" &&
              item.trim().length > 0
          )
          .map((item) => item.trim())
          .slice(0, max)
      : [];

  const score =
    Number.isFinite(raw?.atsScore)
      ? Math.round(raw.atsScore)
      : 0;

  return {
    atsScore: clamp(score, 0, 100),
    scoreSummary:
      typeof raw?.scoreSummary === "string"
        ? raw.scoreSummary.trim()
        : "",

    matchingSkills: toStringArray(
      raw?.matchingSkills,
      15
    ),

    missingSkills: toStringArray(
      raw?.missingSkills,
      12
    ),

    suggestions: toStringArray(
      raw?.suggestions,
      8
    ),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Method not allowed. Use POST."
    });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error:
        "Server is missing GROQ_API_KEY."
    });
  }

  const { resumeText, jobDescription } =
    req.body || {};

  if (
    typeof resumeText !== "string" ||
    resumeText.trim().length < 50
  ) {
    return res.status(400).json({
      error:
        "resumeText is missing or too short."
    });
  }

  if (
    typeof jobDescription !== "string" ||
    jobDescription.trim().length < 30
  ) {
    return res.status(400).json({
      error:
        "jobDescription is missing or too short."
    });
  }

  const trimmedResume = resumeText
    .trim()
    .slice(0, MAX_RESUME_CHARS);

  const trimmedJD = jobDescription
    .trim()
    .slice(0, MAX_JD_CHARS);

  const requestBody = {
    model: GROQ_MODEL,
    temperature: 0.3,

    response_format: {
      type: "json_object"
    },

    messages: [
      {
        role: "user",
        content: buildPrompt(
          trimmedResume,
          trimmedJD
        )
      }
    ]
  };

  try {
    const groqResponse = await fetch(
      GROQ_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
          Authorization: `Bearer ${apiKey}`
        },

        body: JSON.stringify(
          requestBody
        )
      }
    );

    const data =
      await groqResponse.json();

    if (!groqResponse.ok) {
      const message =
        data?.error?.message ||
        "Groq API request failed.";

      return res
        .status(groqResponse.status)
        .json({
          error: message
        });
    }

    const text =
      data?.choices?.[0]?.message
        ?.content;

    if (!text) {
      return res.status(502).json({
        error:
          "Groq returned an empty response."
      });
    }

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (err) {
      return res.status(502).json({
        error:
          "Groq returned invalid JSON."
      });
    }

    return res
      .status(200)
      .json(sanitizeResult(parsed));
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error:
        "Unexpected server error while contacting Groq."
    });
  }
}