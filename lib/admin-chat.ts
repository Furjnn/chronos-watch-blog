export const ADMIN_CHAT_CHANNEL = "admin-chat:main";
export const ADMIN_CHAT_FETCH_LIMIT = 100;
export const ADMIN_CHAT_MAX_MESSAGE_LENGTH = 2000;

export type AdminChatMessagePayload = {
  id: string;
  content: string;
  senderUserId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  createdAt: string;
};
