const API_KEY_STORAGE = "inquiry-toolkit-gemini-key";

export function getApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || "";
}

export function setApiKey(key) {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function hasApiKey() {
  return !!getApiKey();
}

/**
 * Call Gemini API with a prompt. Uses gemini-2.5-flash.
 */
async function callGemini(prompt) {
  const key = getApiKey();
  if (!key) throw new Error("No Gemini API key configured");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * Build a context summary of the current assessment state for the AI.
 */
function buildContext({ inquiryName, consultDate, responses, notes, phaseCommentary, gapAnalysis, phaseStats, phases, selectedScale, customBudget, customDuration }) {
  let ctx = `Assessment for: ${inquiryName || "Unnamed inquiry"} (${consultDate})\n\n`;

  if (selectedScale) {
    ctx += `Scale classification: ${selectedScale}\n`;
    if (customBudget) ctx += `Working budget: £${customBudget}m\n`;
    if (customDuration) ctx += `Working duration: ${customDuration} months\n`;
    ctx += "\n";
  }

  phases.forEach((phase) => {
    const s = phaseStats[phase.id];
    ctx += `${phase.name}: ${s.answered}/${s.total} assessed, ${s.gaps} gaps (${s.highRiskGaps} high-risk)\n`;

    phase.questions.forEach((q) => {
      const resp = responses[q.id];
      if (resp && resp !== "unanswered") {
        const label = resp === "yes" ? "Yes" : resp === "partial" ? "Partial" : resp === "no" ? "No" : "N/A";
        ctx += `  - [${label}] ${q.text}`;
        if (notes[q.id]) ctx += ` | Notes: ${notes[q.id]}`;
        ctx += "\n";
      }
    });

    if (phaseCommentary[phase.id]) {
      ctx += `  Phase commentary: ${phaseCommentary[phase.id]}\n`;
    }
    ctx += "\n";
  });

  if (gapAnalysis.length > 0) {
    ctx += `\nGAPS IDENTIFIED (${gapAnalysis.length} total):\n`;
    gapAnalysis.forEach((g) => {
      ctx += `  - [${g.question.risk.toUpperCase()} RISK] ${g.question.text} (${g.response === "no" ? "Not in place" : "Partial"})`;
      if (g.note) ctx += ` | Notes: ${g.note}`;
      ctx += "\n";
    });
  }

  return ctx;
}

/**
 * Generate an overall assessment narrative.
 */
export async function generateOverallAssessment(state) {
  const context = buildContext(state);

  const prompt = `You are a senior public inquiry consultant advising UK government departments and inquiry teams. Based on the following diagnostic assessment data, write a concise overall assessment narrative (3-5 paragraphs).

The assessment should:
- Open with a headline readiness judgement (e.g. "The inquiry is well-positioned..." or "Significant gaps remain...")
- Identify the most critical risks and gaps, prioritised by severity
- Note areas of strength where the inquiry is well-prepared
- Highlight cross-cutting themes (e.g. if multiple phases show the same weakness)
- Close with 2-3 strategic priority recommendations
- Be written in professional consulting language suitable for a senior civil servant audience
- Reference specific questions/phases where relevant
- Be practical and actionable, not generic

ASSESSMENT DATA:
${context}

Write the overall assessment narrative now. Do not include headers or bullet points — write flowing prose paragraphs.`;

  return callGemini(prompt);
}

/**
 * Generate a phase-specific commentary.
 */
export async function generatePhaseCommentary(state, phaseId) {
  const context = buildContext(state);
  const phase = state.phases.find((p) => p.id === phaseId);
  if (!phase) throw new Error("Phase not found");

  const prompt = `You are a senior public inquiry consultant. Based on the following assessment data, write a focused commentary specifically for the "${phase.name}" phase (2-3 paragraphs).

The commentary should:
- Assess the overall readiness of this specific phase
- Identify the most important gaps and risks within this phase
- Note any strengths or areas that are well-handled
- Provide specific, actionable recommendations for this phase
- Reference the specific questions and their responses
- Be practical and written for a senior inquiry team audience

FULL ASSESSMENT DATA (for context):
${context}

Write the commentary for "${phase.name}" now. Flowing prose, no bullet points or headers.`;

  return callGemini(prompt);
}

/**
 * Generate a gap-specific action recommendation.
 */
export async function generateGapAction(state, gap) {
  const context = buildContext(state);

  const prompt = `You are a senior public inquiry consultant. For the following specific gap identified in an inquiry assessment, write a focused action recommendation (1-2 paragraphs).

GAP: ${gap.question.text}
Phase: ${gap.phase}
Risk level: ${gap.question.risk}
Status: ${gap.response === "no" ? "Not in place" : "Partially in place"}
Standard guidance: ${gap.question.guidance}
${gap.note ? `Consultant notes: ${gap.note}` : ""}

FULL ASSESSMENT CONTEXT:
${context}

Write a specific, actionable recommendation for addressing this gap. Consider the inquiry's overall context, scale, and other gaps. Be practical and direct.`;

  return callGemini(prompt);
}
