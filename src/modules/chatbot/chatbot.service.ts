import { API_URL, fetchApi, getApiErrorMessage } from "@/services/api";
import type {
  ChatbotRequestDTO,
  ChatbotStreamEvent,
} from "@/modules/chatbot/chatbot.types";
import { createParser } from "eventsource-parser";

/**
 * Serviço responsável pela comunicação e integração com as rotas de Chatbot/IA.
 */
export class ChatbotService {
  /**
   * Envia uma mensagem para o serviço de chatbot e processa a resposta em tempo real
   * via Server-Sent Events (SSE).
   *
   * @param dto - Objeto contendo os dados da requisição, incluindo o histórico de mensagens 
   * (`messages`).
   * @param onEvent - Callback acionado a cada evento recebido da stream da API.
   *
   * @returns Uma `Promise` que resolve quando o consumo do ReadableStream for totalmente concluído.
   *
   * @throws {Error} Lança um erro se a resposta HTTP não for ok (`!response.ok`), contendo a 
   * mensagem tratada da API.
   * @throws {Error} Lança um erro se o corpo da resposta (`response.body`) estiver indisponível 
   * para consumo.
   *
   * @example
   * ```typescript
   * await chatbotService.sendPromptStream(
   *   { messages: [{ role: "user", content: "Olá!" }] },
   *   (event) => {
   *     if (event.type === "token") {
   *       console.log("Trecho recebido:", event.message);
   *     }
   *   }
   * );
   * ```
   */
  async sendPromptStream(
    dto: ChatbotRequestDTO,
    onEvent: (event: ChatbotStreamEvent) => void,
  ): Promise<void> {
    const response = await fetchApi(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: dto.messages,
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
        try {
          const data = JSON.parse(event.data) as ChatbotStreamEvent;
          onEvent(data);
        } catch {
          // Ignora JSON inválido
        }
      },
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        parser.feed(decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      onEvent({
        type: "error",
        message: err instanceof Error ? err.message : "Erro na stream.",
      });
    }
  }
}

/**
 * Instância única (Singleton) do serviço do chatbot para uso global na aplicação.
 */
export const chatbotService = new ChatbotService();
