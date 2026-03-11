/**
 * Low-level Telegram Bot API helpers shared between the provider and the webhook handler.
 */

export function getTelegramBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN not configured');
  }
  return token;
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

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Telegram API error (${response.status}): ${responseBody}`);
  }
}
