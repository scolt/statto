/**
 * Low-level Telegram Bot API helpers shared between the provider and the webhook handler.
 */

/** Telegram request timeout — prevents a hung fetch from stalling the caller indefinitely. */
const REQUEST_TIMEOUT_MS = 10_000;

/** Telegram returns 429 when a chat/bot is rate-limited; retry once after the given delay. */
const MAX_RATE_LIMIT_RETRIES = 1;

type TelegramApiResponse = {
  ok: boolean;
  result?: { message_id: number };
  error_code?: number;
  description?: string;
  parameters?: { retry_after?: number };
};

export function getTelegramBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN not configured');
  }
  return token;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callTelegramApi(
  token: string,
  body: Record<string, unknown>,
): Promise<TelegramApiResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    const reason = error instanceof Error && error.name === 'AbortError' ? 'timed out' : 'network error';
    console.error(
      `[telegram.api] sendMessage request failed (${reason}) for chat_id=${body.chat_id}:`,
      error,
    );
    throw new Error(`Telegram API request failed (${reason}) for chat_id=${body.chat_id}`, {
      cause: error,
    });
  } finally {
    clearTimeout(timeout);
  }

  const rawText = await response.text();
  let parsed: TelegramApiResponse | undefined;
  try {
    parsed = rawText ? (JSON.parse(rawText) as TelegramApiResponse) : undefined;
  } catch {
    // Non-JSON response — fall through and log the raw body below.
  }

  if (!response.ok || !parsed?.ok) {
    console.error(
      `[telegram.api] sendMessage error for chat_id=${body.chat_id}: status=${response.status} ` +
        `error_code=${parsed?.error_code ?? 'n/a'} description=${parsed?.description ?? rawText}`,
    );
    return (
      parsed ?? {
        ok: false,
        error_code: response.status,
        description: rawText,
      }
    );
  }

  return parsed;
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  parseMode: 'Markdown' | 'MarkdownV2' | 'HTML' | undefined = undefined,
): Promise<void> {
  const token = getTelegramBotToken();

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
  };
  if (parseMode) {
    body.parse_mode = parseMode;
  }

  let attempt = 0;
  let result = await callTelegramApi(token, body);

  // Telegram rate-limits per chat (HTTP 429) with a `retry_after` (seconds) hint.
  // Retrying once after the suggested delay resolves the most common intermittent failure.
  while (!result.ok && result.error_code === 429 && attempt < MAX_RATE_LIMIT_RETRIES) {
    const retryAfterSeconds = result.parameters?.retry_after ?? 1;
    console.warn(
      `[telegram.api] rate limited for chat_id=${chatId}, retrying in ${retryAfterSeconds}s ` +
        `(attempt ${attempt + 1}/${MAX_RATE_LIMIT_RETRIES})`,
    );
    await sleep(retryAfterSeconds * 1000);
    attempt += 1;
    result = await callTelegramApi(token, body);
  }

  if (!result.ok) {
    throw new Error(
      `Telegram API error (${result.error_code ?? 'unknown'}) for chat_id=${chatId}: ${result.description ?? 'unknown error'}`,
    );
  }

  console.info(
    `[telegram.api] message sent to chat_id=${chatId} message_id=${result.result?.message_id ?? 'n/a'}`,
  );
}
