export interface ConversationRequest {
    userId: string;
    before?: string;
    count: number;
    sort: string;
  }