import type { ChatbotMessage } from "@/modules/chatbot/chatbot.types";
import { ChatbotInput } from "@/modules/chatbot/components/ChatbotInput";
import { ChatbotMessageList } from "@/modules/chatbot/components/ChatbotMessages";
import { useChatbot } from "@/modules/chatbot/useChatbot";
import { RefreshIcon } from "@/components/icons";

const INITIAL_ASSISTANT_MESSAGE: ChatbotMessage = {
  id: `assistant-${Date.now()}`,
  role: "assistant",
  content:
    "Olá, eu sou o Chatbot do CIn e estou aqui para tirar suas dúvidas. O que deseja saber?",
};

export default function ChatbotPage() {
  const { sendMessage, messages, isLoading, hasError } = useChatbot([
    INITIAL_ASSISTANT_MESSAGE,
  ]);

  return (
    <div className="mx-auto w-full grid grid-rows-[auto_1fr_auto] max-w-7xl h-[calc(100dvh-4rem-40px)] border border-sidebar-ring rounded-sm overflow-hidden sm:px-6 lg:px-8">
      {/* Top bar */}
      <div className="flex flex-row items-center justify-between border-b border-b-sidebar-ring px-4 py-2">
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
        <div className="flex flexr-row gap-2">
          <button
            className="text-foreground-400 cursor-pointer"
            aria-label="Abrir nova conversa"
            title="Nova conversa"
            onClick={() => {}} //TODO: função de nova conversa
          >
            <RefreshIcon size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <ChatbotMessageList
        messages={messages}
        isLoading={isLoading}
        hasError={hasError}
      />

      <ChatbotInput onSend={sendMessage} blockSendAction={isLoading} />
    </div>
  );
}
