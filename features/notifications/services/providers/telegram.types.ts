/**
 * Telegram webhook payload types.
 * Only the fields we actually need are typed — Telegram sends a lot more.
 * @see https://core.telegram.org/bots/api#update
 */

export type TelegramChat = {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
};

export type TelegramUser = {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
};

export type TelegramMessageEntity = {
  type: 'bot_command' | 'mention' | 'hashtag' | string;
  offset: number;
  length: number;
};

export type TelegramMessage = {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  entities?: TelegramMessageEntity[];
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};
