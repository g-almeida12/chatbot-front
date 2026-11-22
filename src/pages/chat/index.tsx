import type { ChatbotMessage } from "@/modules/chatbot/chatbot.types";
import { ChatbotInput } from "@/modules/chatbot/components/ChatbotInput";
import { ChatbotMessageList } from "@/modules/chatbot/components/ChatbotMessageList";
import { DeleteIcon } from "@/components/icons";
import { useChatbot } from "@/modules/chatbot/useChatbot";
import { useEffect, useRef } from "react";

const INITIAL_ASSISTANT_MESSAGE: ChatbotMessage = {
  id: `assistant-${Date.now()}`,
  role: "assistant",
  content:
    "Olá, eu sou o Chatbot do CIn e estou aqui para tirar suas dúvidas. O que deseja saber?",
};

export default function ChatbotPage() {
  const { sendMessage, clearMessages, messages, isLoading, hasError } =
    useChatbot([INITIAL_ASSISTANT_MESSAGE]);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!messageListRef.current) return;

    messageListRef.current.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  return (
    <div className="mx-auto w-full grid grid-rows-[auto_1fr_auto] grid-cols-1 max-w-5xl h-[calc(100dvh-4rem-40px)] border border-sidebar-ring rounded-sm overflow-hidden">
      {/* Top bar */}
      <div className="max-w-full flex flex-row items-center justify-between border-b border-b-sidebar-ring px-4 py-2">
        {/* Brand */}
        <div className="flex flex-row gap-2 items-center">
          <div className="flex items-center justify-center size-9 rounded-lg bg-[#db1e2f]">
            <span className="text-sm text-white font-semibold">CIn</span>
          </div>

          <div className="flex flex-col gap-0">
            <span className="text-sm/[14px] font-semibold">
              Assistente do CIn
            </span>
            <span className="text-[12px]/[14px] text-muted-foreground italic">
              Chatbot
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-row gap-2">
          <button
            className="text-foreground-400 cursor-pointer"
            aria-label="Limpar conversa"
            title="Limpar conversa"
            onClick={clearMessages}
          >
            <DeleteIcon size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <ChatbotMessageList
        messages={messages}
        isLoading={isLoading}
        hasError={hasError}
        messageListRef={messageListRef}
      />

      <ChatbotInput onSend={sendMessage} blockSendAction={isLoading} />
    </div>
  );
}
