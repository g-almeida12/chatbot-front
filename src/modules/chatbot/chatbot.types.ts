export type MessageRole = "user" | "assistant";

export interface ChatbotMessage {
  id?: string;
  role: MessageRole;
  content: string;
}

export interface ChatbotRequestDTO {
  messages: ChatbotMessage[];
}

export interface ChatbotResponse {
  content: ChatbotMessage["content"];
}
