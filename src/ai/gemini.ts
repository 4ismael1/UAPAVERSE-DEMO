import { SYSTEM_PROMPT } from "./context";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const MODEL =
  (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || "gemini-2.5-flash";

const ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

export function hasGeminiKey() {
  return !!API_KEY && API_KEY.length > 10;
}

interface GeminiPart {
  text?: string;
}
interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
  error?: { message?: string };
}

async function callGemini(parts: object[], context: string): Promise<string> {
  if (!hasGeminiKey()) {
    throw new Error("Falta la clave VITE_GEMINI_API_KEY en el archivo .env");
  }
  const body = {
    systemInstruction: {
      parts: [{ text: `${SYSTEM_PROMPT}\n\n=== CONTEXTO DEL STAND ===\n${context}` }],
    },
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 320,
      topP: 0.95,
    },
  };

  const res = await fetch(`${ENDPOINT(MODEL)}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as GeminiResponse;
  if (!res.ok) {
    throw new Error(data?.error?.message || `Error de Gemini (${res.status})`);
  }
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join(" ")
    .trim();
  return text || "Lo siento, no pude generar una respuesta.";
}

/** Pregunta por voz: envía el audio grabado (WAV base64) + contexto. */
export function askGeminiWithAudio(
  audioBase64: string,
  mimeType: string,
  context: string
): Promise<string> {
  return callGemini(
    [
      {
        text: "El visitante hace esta pregunta hablada sobre el stand. Escúchala y respóndela según el contexto:",
      },
      { inlineData: { mimeType, data: audioBase64 } },
    ],
    context
  );
}

/** Alternativa por texto (fallback). */
export function askGeminiWithText(
  question: string,
  context: string
): Promise<string> {
  return callGemini([{ text: question }], context);
}
