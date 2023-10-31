export interface UserChatResponse {
    userId: string;
    name: string;
    email: string;
    statusMessage: string;
    messageCount: number;
    isRead: boolean;
  }