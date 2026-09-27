import { env } from "@/config/env";
import { getApiErrorMessage } from "@/services/api";
import type {
  ChatbotRequestDTO,
  ChatbotSource,
  ChatbotStreamEvent,
} from "@/modules/chatbot/chatbot.types";
import { createParser } from "eventsource-parser";

/**
 * Serviço mockado do chatbot para testes e desenvolvimento local.
 *
 * Realiza chamadas diretas à API da OpenRouter via streaming e simula
 * a inclusão de fontes/referências com base no conteúdo da mensagem do usuário.
 */
export class MockedChatbotService {
  /**
   * Envia um prompt diretamente para a OpenRouter e simula o evento de envio de fontes
   * ao final da transmissão do stream (evento `[DONE]`).
   *
   * @param dto - Objeto contendo os dados da requisição, incluindo o histórico de mensagens (`messages`).
   * @param onEvent - Callback acionado a cada chunk de texto (`token`), envio de fontes (`sources`) ou erro (`error`).
   *
   * @returns Uma `Promise` que resolve ao finalizar o consumo do ReadableStream.
   *
   * @throws {Error} Lança um erro se a requisição à OpenRouter falhar (`!response.ok`).
   * @throws {Error} Lança um erro se o corpo da resposta (`response.body`) não suportar streaming.
   *
   * @example
   * ```typescript
   * await mockedChatbotService.sendPromptStream(
   *   { messages: [{ role: "user", content: "Como funciona a matrícula?" }] },
   *   (event) => {
   *     if (event.type === "token") console.log(event.content);
   *     if (event.type === "sources") console.log(event.sources);
   *   }
   * );
   * ```
   */
  async sendPromptStream(
    dto: ChatbotRequestDTO,
    onEvent: (event: ChatbotStreamEvent) => void,
  ): Promise<void> {
    const response = await fetch(
      `https://openrouter.ai/api/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.openrouterApiKey}`,
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: dto.messages,
          stream: true,
        }),
      },
    );

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

    // Jeito superficial de saber se a IA vai conseguir responder com fontes: se o usuário citar
    // ou a matrícula, ou o horário, ou o trancamento, resposta do mock do useMockedChatbot
    const lastUserMessageContent =
      dto.messages[dto.messages.length - 1].content;
    const hasFonts =
      lastUserMessageContent.includes("matrícula") ||
      lastUserMessageContent.includes("horário") ||
      lastUserMessageContent.includes("trancar");

    const sources: ChatbotSource[] = hasFonts
      ? [
          {
            title: "Primeira fonte encontrada",
            url: "https://secgrad.cin.ufpe.br/",
            description: "Secretaria de Graduação",
          },
          {
            title: "Segunda fonte encontrada",
            url: "https://www.ufpe.br/cursos/pos-graduacao",
          },
        ]
      : [
          {
            title: "Site da SecGrad",
            url: "https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://secgrad.cin.ufpe.br/&ved=2ahUKEwj1g-brjY-XAxWrq5UCHS1GCgwQFnoECBkQAQ&usg=AOvVaw3nnZu7euFFG1OOvlrgUJHU",
            description: "secgrad.cin.ufpe.br",
          },
        ];

    const parser = createParser({
      onEvent(event) {
        if (event.data === "[DONE]") {
          onEvent({ type: "sources", success: hasFonts, sources });
        }

        try {
          const chunk = JSON.parse(event.data);
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) {
            onEvent({ type: "token", content });
          }
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
 * Instância única (Singleton) do serviço mockado do chatbot.
 */
export const mockedChatbotService = new MockedChatbotService();
