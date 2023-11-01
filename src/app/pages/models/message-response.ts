export interface MessageResponse {
    id: number;
    senderId: string;
    receiverId: string;
    content?: string;
    gifUrl?: string;
    timestamp: string;
  }