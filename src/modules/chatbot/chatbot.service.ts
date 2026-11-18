import { API_URL, fetchApi, getApiErrorMessage } from "@/services/api";
import type {
  ChatbotRequestDTO,
  ChatbotStreamEvent,
} from "@/modules/chatbot/chatbot.types";

interface ChatResponse {
  answer: string;
  found: boolean;
  links: { name: string; url: string }[];
}

export class ChatbotService {
  async sendPromptStream(
    dto: ChatbotRequestDTO,
    onEvent: (event: ChatbotStreamEvent) => void,
  ): Promise<void> {
    const message = [...dto.messages]
      .reverse()
      .find((m) => m.role === "user")?.content;
    if (!message) throw new Error("Nenhuma pergunta para enviar.");

    const response = await fetchApi(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(
        await getApiErrorMessage(response, "Erro ao retornar prompt"),
      );
    }

    const body = await response.json();
    const data: ChatResponse = body.data ?? body;
    onEvent({ type: "token", content: data.answer });

    if (data.links.length > 0) {
      onEvent({
        type: "sources",
        success: data.found,
        sources: data.links.map((link) => ({ title: link.name, url: link.url })),
      });
    }
  }
}

export const chatbotService = new ChatbotService();