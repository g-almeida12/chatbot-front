import { env } from "@/config/env";
import { API_URL, fetchApi, getApiErrorMessage } from "../../services/api";
import type { ChatbotRequestDTO, ChatbotResponse } from "./chatbot.types";
import { createParser } from "eventsource-parser";

export class ChatbotService {
  /** Envia um novo prompt para o chatbot através de uma stream. */
  async sendPromptStream(
    dto: ChatbotRequestDTO,
    onChunk: (chunk: ChatbotResponse) => void,
  ): Promise<void> {
    const response = await fetchApi(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.openrouterApiKey}`,
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: dto,
        stream: true,
      }),
    });

    if (!response.ok) {
      const message = await getApiErrorMessage(
        response,
        "Erro ao retornar prompt",
      );
      throw new Error(message);
    }

    if (!response.body) {
      throw new Error("O corpo da resposta não suporta streaming.");
    }

    const parser = createParser({
      onEvent(event) {
        if (event.data === "[DONE]") return;

        try {
          const chunk = JSON.parse(event.data);
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) {
            onChunk(content);
          }
        } catch {
          // Ignore invalid JSON
        }
      },
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      parser.feed(decoder.decode(value, { stream: true }));
    }
  }
}

export const chatbotService = new ChatbotService();
