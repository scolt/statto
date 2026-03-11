import { NextRequest, NextResponse } from 'next/server';
import type { TelegramUpdate } from '@/features/notifications/services/providers/telegram.types';
import { handleTelegramWebhook } from '@/features/notifications/services/telegram-webhook.handler';

/**
 * Verifies that the request contains a valid webhook secret token.
 * Telegram sends the secret in the `X-Telegram-Bot-Api-Secret-Token` header
 * when a webhook is registered with the `secret_token` parameter.
 *
 * @see https://core.telegram.org/bots/api#setwebhook
 */
function verifyWebhookSecret(request: NextRequest): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  // If no secret is configured, skip verification (development convenience)
  if (!secret) return true;

  const headerSecret = request.headers.get('x-telegram-bot-api-secret-token');
  return headerSecret === secret;
}

/**
 * POST /api/webhooks/telegram
 *
 * Receives Telegram Bot API webhook updates.
 * Telegram expects a 200 response — any non-200 causes retries.
 *
 * Setup:
 *   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<DOMAIN>/api/webhooks/telegram&secret_token=<SECRET>"
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Verify the webhook secret
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse the update payload
  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 3. Process the update — always return 200 to Telegram to prevent retries
  try {
    await handleTelegramWebhook(update);
  } catch (error) {
    console.error('Telegram webhook handler error:', error);
  }

  return NextResponse.json({ ok: true });
}
