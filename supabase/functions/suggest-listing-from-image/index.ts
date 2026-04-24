/**
 * Vision + LLM: suggest listing title/description/category/condition/brand from a photo.
 * Uses Google Gemini (Generative Language API).
 *
 * Secrets (Supabase Dashboard → Edge Functions → Secrets, or CLI):
 *   supabase secrets set GEMINI_API_KEY=your_key
 *
 * Optional:
 *   supabase secrets set GEMINI_MODEL=gemini-2.0-flash
 * (default model below if unset)
 *
 * Invoke body (JSON):
 *   { "imageUrl": "https://..." }  OR  { "imageBase64": "...", "mimeType": "image/jpeg" }
 *   Optional: "hints": { "title": "...", "description": "..." } to refine existing copy.
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash';

type Hints = { title?: string; description?: string };

type SuggestBody = {
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
  hints?: Hints;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function stripJsonFence(raw: string): string {
  const t = raw.trim();
  if (t.startsWith('```')) {
    return t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }
  return t;
}

function base64FromArrayBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function resolveInlineImage(
  imageUrl: string | undefined,
  imageBase64: string | undefined,
  mimeType: string,
): Promise<{ mime: string; data: string } | Response> {
  if (typeof imageBase64 === 'string' && imageBase64.length > 0) {
    return { mime: mimeType, data: imageBase64 };
  }
  if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return jsonResponse({ error: 'Failed to fetch imageUrl' }, 400);
    }
    const buf = await imgRes.arrayBuffer();
    const mime =
      imgRes.headers.get('content-type')?.split(';')[0]?.trim() || 'image/jpeg';
    return { mime: mime || 'image/jpeg', data: base64FromArrayBuffer(buf) };
  }
  return jsonResponse(
    { error: 'Provide imageUrl (https) or imageBase64 with optional mimeType' },
    400,
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiKey) {
    return jsonResponse(
      {
        error:
          'Server misconfiguration: GEMINI_API_KEY is not set for this function (Google AI Studio / Gemini API key)',
      },
      503,
    );
  }

  let body: SuggestBody;
  try {
    body = (await req.json()) as SuggestBody;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { imageUrl, imageBase64, mimeType = 'image/jpeg', hints } = body;

  const inline = await resolveInlineImage(imageUrl, imageBase64, mimeType);
  if (inline instanceof Response) return inline;

  const hintLines: string[] = [];
  if (hints?.title?.trim()) hintLines.push(`Draft title (refine to match photo): ${hints.title.trim()}`);
  if (hints?.description?.trim()) {
    hintLines.push(`Draft description (refine to match photo): ${hints.description.trim()}`);
  }

  const system = `You help sellers on a university campus marketplace (Handoff).
Analyze the product photo and suggest listing fields.

Rules:
- title: short, specific, max 55 characters, no price in title.
- description: 1–3 sentences, max 280 characters, mention visible condition cues if any.
- category must be exactly one of: Clothes, Electronics, Furniture, Books, Sports, Tickets & Events, Other.
- condition must be exactly one of: New, Like New, Good, Fair, For Parts.
- brand must be exactly one of: Nike, Adidas, Apple, Samsung, Generic / Unbranded, LSU / Campus, Other.

Respond with ONLY a JSON object (no markdown) with keys: title, description, category, condition, brand.`;

  const userText =
    hintLines.length > 0
      ? `${hintLines.join('\n')}\n\nBase suggestions on the photo; keep any model names/sizes from the drafts if they still fit what you see.`
      : 'Suggest fields from the photo only.';

  const model =
    Deno.env.get('GEMINI_MODEL')?.trim().replace(/^models\//, '') ||
    DEFAULT_GEMINI_MODEL;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiKey)}`;

  const geminiRes = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: system }],
      },
      contents: [
        {
          role: 'user',
          parts: [
            { text: userText },
            { inlineData: { mimeType: inline.mime, data: inline.data } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    }),
  });

  const rawJson = await geminiRes.text();
  if (!geminiRes.ok) {
    console.error('Gemini error', geminiRes.status, rawJson);
    return jsonResponse(
      { error: 'Vision model request failed', detail: rawJson.slice(0, 300) },
      502,
    );
  }

  let completion: {
    error?: { message?: string };
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
  };
  try {
    completion = JSON.parse(rawJson) as typeof completion;
  } catch {
    return jsonResponse({ error: 'Invalid response from model' }, 502);
  }

  if (completion.error?.message) {
    return jsonResponse({ error: completion.error.message }, 502);
  }

  const rawContent = completion.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawContent) {
    const reason = completion.candidates?.[0]?.finishReason;
    return jsonResponse(
      { error: 'Empty model response', finishReason: reason ?? null },
      502,
    );
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(stripJsonFence(rawContent)) as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: 'Model returned invalid JSON' }, 502);
  }

  const title = typeof parsed.title === 'string' ? parsed.title.trim() : '';
  const description = typeof parsed.description === 'string' ? parsed.description.trim() : '';
  const category = typeof parsed.category === 'string' ? parsed.category.trim() : '';
  const condition = typeof parsed.condition === 'string' ? parsed.condition.trim() : '';
  const brand = typeof parsed.brand === 'string' ? parsed.brand.trim() : '';

  if (!title) {
    return jsonResponse({ error: 'Model response missing title' }, 502);
  }

  return jsonResponse({
    title: title.slice(0, 60),
    description: description.slice(0, 300),
    category,
    condition,
    brand,
  });
});
