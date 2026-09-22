import { chatbotService } from "./chatbot.service";
import type { ChatbotRequestDTO, ChatbotResponse } from "./chatbot.types";

export function useTodos() {
  const sendPromptStream = async (
    dto: ChatbotRequestDTO,
    onChunk: (chunk: ChatbotResponse) => void,
  ) => {
    await chatbotService.sendPromptStream(dto, onChunk);
  };

  return { sendPromptStream };
}
