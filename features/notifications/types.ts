// ── Provider Configs (discriminated union) ──────────

export type TelegramNotificationConfig = {
  provider: 'telegram';
  chatId: string;
};

// Future providers:
// export type DiscordNotificationConfig = {
//   provider: 'discord';
//   webhookUrl: string;
// };

export type NotificationConfig = TelegramNotificationConfig;
// Future: NotificationConfig = TelegramNotificationConfig | DiscordNotificationConfig;

export type NotificationProvider = NotificationConfig['provider'];

// ── DB Row Type ─────────────────────────────────────

export type GroupNotification = {
  id: number;
  groupId: number;
  provider: NotificationProvider;
  enabled: boolean;
  config: NotificationConfig;
};

// ── Notification Payload ────────────────────────────

export type NotificationPayload = {
  groupName: string;
  matchId: number;
  results: Array<{
    playerName: string;
    wins: number;
    isWinner: boolean;
  }>;
  comment?: string | null;
  duration?: number;
  appBaseUrl?: string;
  groupId: number;
};
