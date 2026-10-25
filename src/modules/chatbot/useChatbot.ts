import { useState } from "react";
import { chatbotService } from "./chatbot.service";
import type { ChatbotMessage } from "@/modules/chatbot/chatbot.types";

/**
 * Custom Hook para gerenciamento do estado e lógica de envio de mensagens do Chatbot.
 *
 * Controla o histórico de mensagens, o estado de carregamento do streaming,
 * a exibição de fontes consultadas e eventuais erros de comunicação com a API.
 *
 * @param initialMessages - Lista opcional de mensagens para inicializar o histórico da conversa.
 *
 * @returns Um objeto contendo:
 * - `sendMessage`: Função assíncrona para disparar uma nova mensagem do usuário.
 * - `messages`: Lista com o histórico atual de mensagens da conversa (usuário e assistente).
 * - `isLoading`: Booleano que indica se a IA está processando/enviando uma resposta em streaming.
 * - `hasError`: Booleano que indica se ocorreu algum erro na transmissão do evento ou na chamada da API.
 *
 * @example
 * ```tsx
 * const { messages, sendMessage, isLoading, hasError } = useChatbot();
 *
 * const handleSend = (text: string) => {
 *   sendMessage(text);
 * };
 * ```
 */
export function useChatbot(initialMessages: ChatbotMessage[] = []) {
  const [messages, setMessages] = useState<ChatbotMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  /**
   * Envia uma nova mensagem do usuário para a IA e consome a resposta em streaming.
   *
   * @param prompt - Texto enviado pelo usuário.
   */
  const sendMessage = async (prompt: string) => {
    if (isLoading || !prompt.trim()) return;

    const userMessage: ChatbotMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
    };

    const assistantMessage: ChatbotMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
    };

    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, assistantMessage]);

    try {
      setHasError(false);
      setIsLoading(true);

      await chatbotService.sendPromptStream(
        { messages: updatedMessages },
        (event) => {
          // Lida com os diferentes tipos de evento que podem chegar, como um chunk (token), o envio
          // das fontes utilizadas (sources) ou um erro (error), atualizando o campo certo do estado
          switch (event.type) {
            case "token":
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: msg.content + event.content }
                    : msg,
                ),
              );
              break;

            case "sources":
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessage.id
                    ? {
                        ...msg,
                        sourceInfo: {
                          success: event.success,
                          sources: event.sources,
                        },
                      }
                    : msg,
                ),
              );
              break;

            case "error":
              setHasError(true);
              break;

            default:
              setHasError(true);
          }
        },
      );

      // eslint-disable-next-line
    } catch (_err) {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };
  return {
    sendMessage,
    messages,
    isLoading,
    hasError,
  };
}
