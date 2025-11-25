export async function testGeminiAPI(prompt: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  console.log("🔑 API Key loaded:", apiKey ? "YES" : "NO");

  if (!apiKey) {
    throw new Error("❌ Missing Gemini API Key (VITE_GEMINI_API_KEY)");
  }

  // Correct Gemini endpoint
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    apiKey;

  // Build the prompt — SAFE for Gemini (no system role)
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
Continue the following text naturally.
❗ Do NOT repeat or restate any user text.
❗ Start directly with a new continuation.
❗ Match the user's writing style, tone, and flow.

--- USER TEXT START ---
${prompt}
--- USER TEXT END ---
            `.trim(),
          },
        ],
      },
    ],
  };

  try {
    console.log("🌐 Sending request to Gemini…");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

        // IMPORTANT: Required for some deployments
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("❌ Gemini Error Response:", errBody);
      throw new Error("❌ Gemini Error: " + errBody);
    }

    const data = await res.json();

    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "(No response text found)";

    console.log("✅ Gemini output:", output);

    return output;
  } catch (err) {
    console.error("🔥 Gemini API error (caught):", err);
    throw err;
  }
}
