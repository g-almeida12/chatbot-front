export interface ChatbotRequestDTO {
  messages: { role: string; content: string }[];
}

export interface ChatbotResponse {
  content: string;
}
