async function generateAnnouncementPreview({
  prompt,
  language,
  courseName,
  instructorName,
}) {
  const langInstruction =
    language === "ar"
      ? "Write the title and message in Arabic."
      : "Write the title and message in English.";

  const fullPrompt = `You are a university announcement assistant.
${langInstruction}
Generate a professional announcement for university students based on the instructor's rough note.
Use a professional tone. Use bullet points or short paragraphs where helpful.
Add the instructor's name as a signature at the end of the message field.
Return ONLY valid JSON with exactly this shape — no markdown, no backticks, no preamble, no extra keys:
{"title":"...","message":"..."}

Course: ${courseName}
Instructor: ${instructorName}
Note: ${prompt}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: fullPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 1,
        topK: 1,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!rawText) throw new Error("Empty response from Gemini API");

  const clean = rawText
    .replace(/```json|```/g, "")
    .replace(/[\u0000-\u001F]/g, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch (e) {
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid JSON from AI");
    parsed = JSON.parse(match[0]);
  }

  if (!parsed.title || !parsed.message) {
    throw new Error("Missing fields in AI response");
  }

  return parsed;
}

module.exports = { generateAnnouncementPreview };
