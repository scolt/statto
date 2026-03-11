import type { NotificationSender } from './types';
import type { NotificationPayload, TelegramNotificationConfig } from '../../types';
import { sendTelegramMessage } from './telegram.api';

/**
 * Escape special characters for Telegram HTML parse mode.
 * Only &, <, > need escaping in HTML mode.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return '&lt;1m';
}

function formatMatchResult(payload: NotificationPayload): string {
  const lines: string[] = [];

  lines.push(`🏆 <b>Match Complete — ${escapeHtml(payload.groupName)}</b>`);
  lines.push('');
  lines.push('📊 Results:');

  const medals = ['🥇', '🥈', '🥉'];
  payload.results.forEach((r, i) => {
    const medal = i < medals.length ? medals[i] : '  ';
    lines.push(`${medal} ${escapeHtml(r.playerName)} — ${r.wins} win${r.wins !== 1 ? 's' : ''}`);
  });

  const duration = formatDuration(payload.duration);
  if (duration) {
    lines.push('');
    lines.push(`⏱ Duration: ${duration}`);
  }

  if (payload.comment) {
    lines.push('');
    lines.push(`💬 <i>"${escapeHtml(payload.comment)}"</i>`);
  }

  if (payload.appBaseUrl && payload.groupId) {
    const url = `${payload.appBaseUrl}/groups/${payload.groupId}/matches/${payload.matchId}`;
    lines.push('');
    lines.push(`🔗 <a href="${url}">View match</a>`);
  }

  return lines.join('\n');
}

export const telegramProvider: NotificationSender = {
  async send(config: Record<string, unknown>, payload: NotificationPayload): Promise<void> {
    const { chatId } = config as TelegramNotificationConfig;
    const message = formatMatchResult(payload);
    await sendTelegramMessage(chatId, message, 'HTML');
  },
};
