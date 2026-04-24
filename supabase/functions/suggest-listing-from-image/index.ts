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

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODELS = ['gemini-1.5-flash'] as const;

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
- title: concise and sellable, max 45 characters, no price in title.
- description: 1–2 short sentences written in a student seller voice (friendly, direct, "ready for pickup", "used for one semester", etc.), max 220 characters.
- category must be exactly one of: Clothes, Electronics, Furniture, Books, Sports, Tickets & Events, Other.
- condition must be exactly one of: New, Like New, Good, Fair, For Parts.
- brand must match the category's brand/organizer list as best as possible.
- model/type should be filled from the category type list; if uncertain return "Other" (or "N/A" if applicable).
- storage should be filled when relevant; if unknown, return "N/A".
- color should be filled when relevant; if unknown, return "Other".
- estimatedPrice should be an integer USD estimate with no currency symbol.

Respond with ONLY a JSON object (no markdown) with keys:
title, description, category, condition, brand, model, storage, color, estimatedPrice.`;

  const userText =
    hintLines.length > 0
      ? `${hintLines.join('\n')}\n\nBase suggestions on the photo; keep any model names/sizes from the drafts if they still fit what you see.`
      : 'Suggest fields from the photo only.';

  const envModel = Deno.env.get('GEMINI_MODEL')?.trim().replace(/^models\//, '');
  const modelCandidates = [
    envModel || DEFAULT_GEMINI_MODEL,
    ...FALLBACK_MODELS.filter((m) => m !== (envModel || DEFAULT_GEMINI_MODEL)),
  ];

  let rawJson = '';
  let lastStatus = 500;
  let lastModel = modelCandidates[0];

  for (const model of modelCandidates) {
    lastModel = model;
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

    rawJson = await geminiRes.text();
    lastStatus = geminiRes.status;

    if (geminiRes.ok) {
      break;
    }

    const isModelNotFound = geminiRes.status === 404;
    console.error('Gemini error', geminiRes.status, model, rawJson);
    if (!isModelNotFound) {
      return jsonResponse(
        { error: 'Vision model request failed', model, detail: rawJson.slice(0, 300) },
        502,
      );
    }
  }

  if (!rawJson || lastStatus >= 400) {
    return jsonResponse(
      {
        error: 'Vision model request failed',
        model: lastModel,
        detail: rawJson.slice(0, 300),
      },
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
  const model = typeof parsed.model === 'string' ? parsed.model.trim() : '';
  const storage = typeof parsed.storage === 'string' ? parsed.storage.trim() : '';
  const color = typeof parsed.color === 'string' ? parsed.color.trim() : '';
  const estimatedPrice = parsed.estimatedPrice;

  if (!title) {
    return jsonResponse({ error: 'Model response missing title' }, 502);
  }

  return jsonResponse({
    title: title.slice(0, 60),
    description: description.slice(0, 220),
    category,
    condition,
    brand,
    model,
    storage,
    color,
    estimatedPrice,
  });
});
