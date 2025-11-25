export async function testGeminiAPI(prompt: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) throw new Error("❌ Missing Gemini API Key");

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    apiKey;

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "Continue the following text naturally. " +
              "Do NOT repeat or restate the user's text. " +
              "Start directly with the next sentence. " +
              "Match the style of the user's writing.\n\n" +
              "----- USER TEXT -----\n" +
              prompt +
              "\n----------------------",
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error("❌ Gemini Error: " + err);
    }

    const data = await res.json();

    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "(No response text found)";

    return output;
  } catch (err) {
    console.error("🔥 Gemini API error:", err);
    throw err;
  }
}
