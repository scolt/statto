import type { TelegramUpdate } from './providers/telegram.types';
import { sendTelegramMessage } from './providers/telegram.api';

/**
 * Extracts the bot command from a Telegram message.
 * Returns the command string (e.g. "/groupid") or null if no command is found.
 * Handles commands with bot username suffix (e.g. "/groupid@MyBot").
 */
function extractCommand(update: TelegramUpdate): string | null {
  const message = update.message;
  if (!message?.text || !message.entities) return null;

  const commandEntity = message.entities.find((e) => e.type === 'bot_command' && e.offset === 0);
  if (!commandEntity) return null;

  const raw = message.text.substring(commandEntity.offset, commandEntity.offset + commandEntity.length);
  // Strip @botname suffix: "/groupid@MyBot" → "/groupid"
  const atIndex = raw.indexOf('@');
  return atIndex !== -1 ? raw.substring(0, atIndex).toLowerCase() : raw.toLowerCase();
}

/**
 * Processes an incoming Telegram webhook update.
 * Currently supports:
 * - /groupid — replies with the chat ID so users can configure notifications
 */
export async function handleTelegramWebhook(update: TelegramUpdate): Promise<void> {
  const command = extractCommand(update);

  if (command === '/groupid') {
    const chatId = update.message!.chat.id;
    const chatTitle = update.message!.chat.title;
    const chatType = update.message!.chat.type;

    const lines: string[] = [
      `📋 Chat ID: \`${chatId}\``,
      '',
      `Type: ${chatType}`,
    ];

    if (chatTitle) {
      lines.push(`Title: ${chatTitle}`);
    }

    lines.push('');
    lines.push('Copy the Chat ID above and paste it into your Statto group notification settings.');

    await sendTelegramMessage(chatId, lines.join('\n'), 'Markdown');
  }
}
