export type Message = {
  id: string;
  content: string;
  author: string;
  avatarUrl?: string;
};

export type GetMessagesParamsApi = {
  lastMessageId: number | null;
  size: number;
};
