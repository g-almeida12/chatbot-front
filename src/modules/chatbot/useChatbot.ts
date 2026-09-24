import { useState } from "react";
import { chatbotService } from "./chatbot.service";
import type { ChatbotMessage } from "./chatbot.types";

export function useChatbot(initialMessages: ChatbotMessage[] = []) {
  const [messages, setMessages] = useState<ChatbotMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

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
      setIsLoading(true);
      await chatbotService.sendPromptStream(
        { messages: updatedMessages },
        (chunk) =>
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: msg.content + chunk }
                : msg,
            ),
          ),
      );

      // eslint-disable-next-line
    } catch (_err) {
      setHasError(true);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
      setHasError(false);
    }
  };
  return { sendMessage, messages, isLoading, hasError };
}
