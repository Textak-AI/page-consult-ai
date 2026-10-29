// Lead webhook delivery — shared by submit-form and test-lead-webhook.
// Rules: HTTPS only, 5s timeout, one retry on network failure, never throws,
// every outcome recorded in webhook_deliveries for the owner to see.

const TIMEOUT_MS = 5000;

export interface LeadWebhookPayload {
  event: string;
  source?: 'quickpivot';
  prospect_slug?: string;
  page: { title: string | null; slug: string | null };
  lead: Record<string, unknown>;
  submitted_at: string;
}

export interface DeliveryResult {
  delivered: boolean;
  responseStatus: number | null;
  error: string | null;
  attempts: number;
}

async function postOnce(url: string, payload: LeadWebhookPayload): Promise<{ ok: boolean; status: number | null; error: string | null; networkFailure: boolean }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    return { ok: res.ok, status: res.status, error: res.ok ? null : `HTTP ${res.status}`, networkFailure: false };
  } catch (err) {
    const message = err instanceof DOMException && err.name === "AbortError"
      ? `Timed out after ${TIMEOUT_MS}ms`
      : err instanceof Error ? err.message : String(err);
    // Timeouts and network errors are retryable; anything else is not
    return { ok: false, status: null, error: message, networkFailure: true };
  } finally {
    clearTimeout(timer);
  }
}

export async function deliverLeadWebhook(
  supabase: { from: (t: string) => any },
  opts: { userId: string; url: string; payload: LeadWebhookPayload }
): Promise<DeliveryResult> {
  const { userId, url, payload } = opts;

  // HTTPS only — never POST lead data to a plaintext endpoint
  if (!url.toLowerCase().startsWith("https://")) {
    const result: DeliveryResult = { delivered: false, responseStatus: null, error: "Webhook URL must use HTTPS", attempts: 0 };
    await recordDelivery(supabase, userId, url, payload, result);
    return result;
  }

  let attempt = await postOnce(url, payload);
  let attempts = 1;
  // One retry on network failure (including timeout)
  if (!attempt.ok && attempt.networkFailure) {
    attempts = 2;
    attempt = await postOnce(url, payload);
  }

  const result: DeliveryResult = {
    delivered: attempt.ok,
    responseStatus: attempt.status,
    error: attempt.ok ? null : attempt.error,
    attempts,
  };
  await recordDelivery(supabase, userId, url, payload, result);
  return result;
}

async function recordDelivery(
  supabase: { from: (t: string) => any },
  userId: string,
  url: string,
  payload: LeadWebhookPayload,
  result: DeliveryResult
): Promise<void> {
  try {
    await supabase.from("webhook_deliveries").insert({
      user_id: userId,
      event_type: payload.event,
      webhook_url: url,
      payload,
      status: result.delivered ? "delivered" : "failed",
      response_status: result.responseStatus,
      error: result.error,
      attempt_count: result.attempts,
    });
  } catch (err) {
    // Recording must never break lead capture either
    console.error("webhook_deliveries insert failed:", err);
  }
}
