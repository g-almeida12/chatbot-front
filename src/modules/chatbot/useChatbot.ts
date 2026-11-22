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
 * - `clearMessages`: Função síncrona para resetar o estado das mensagens.
 * - `messages`: Lista com o histórico atual de mensagens da conversa (usuário e assistente).
 * - `isLoading`: Booleano que indica se a IA está processando/enviando uma resposta em streaming.
 * - `hasError`: Booleano que indica se ocorreu algum erro na transmissão do evento ou na chamada da API.
 *
 * @example
 * ```tsx
 * const { messages, sendMessage, clearMessages isLoading, hasError } = useChatbot();
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
    setMessages([...messages, userMessage]);

    try {
      setHasError(false);
      setIsLoading(true);

      await chatbotService.sendPrompt(prompt, (response) => {
        const assistantMessage: ChatbotMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.answer,
          links: response.links,
          contacts: response.contacts
        };
        setMessages((prev) => [...prev, assistantMessage]);
      });
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => setMessages(initialMessages);

  return {
    sendMessage,
    clearMessages,
    messages,
    isLoading,
    hasError,
  };
}
