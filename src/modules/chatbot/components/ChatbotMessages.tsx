import { AlertIcon } from "@/components/icons";
import type { ChatbotMessage } from "../chatbot.types";

export function ChatbotMessageList({
  messages,
  isLoading,
  hasError,
}: {
  messages: ChatbotMessage[];
  isLoading: boolean;
  hasError: boolean;
}) {
  return (
    <div className="min-h-0 flex flex-col flex-1 gap-2 overflow-y-auto p-2">
      {messages.map((msg) => {
        const baseAuthorStyles = "block mb-1 text-sm font-semibold";
        const baseContentStyles = "relative max-w-[85%] rounded-md p-2";

        return msg.role === "user" ? (
          <div
            className={`${baseContentStyles} self-end rounded-tr-none bg-red-200 after:content-[''] after:absolute after:top-0 after:-right-1 after:border-6 after:border-transparent after:border-t-red-200 after:border-l-red-200`}
            key={msg.id}
          >
            <span className={`${baseAuthorStyles} text-red-400`}>Você</span>
            <span>{msg.content}</span>
          </div>
        ) : (
          <div
            className={`${baseContentStyles} self-start rounded-tl-none bg-gray-200 after:content-[''] after:absolute after:top-0 after:-left-1 after:border-6 after:border-transparent after:border-t-gray-200 after:border-r-gray-200`}
            key={msg.id}
          >
            <span className={`${baseAuthorStyles} text-gray-400`}>
              CIn Chatbot
            </span>
            <span>{msg.content}</span>
          </div>
        );
      })}

      {isLoading && (
        <div className="relative flex flex-row gap-1 w-fit items-center rounded-md px-3 py-2 bg-gray-200 rounded-tl-none after:content-[''] after:absolute after:top-0 after:-left-1 after:border-6 after:border-transparent after:border-t-gray-200 after:border-r-gray-200">
          <span className="size-2 rounded-full bg-gray-400 animate-bounce" />
          <span className="size-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.15s]" />
          <span className="size-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.30s]" />
        </div>
      )}

      {hasError && (
        <div className="flex flex-row gap-2 text-muted-foreground">
          <AlertIcon size={20} />
          <span className="text-sm">Não foi possível gerar sua resposta.</span>
        </div>
      )}
    </div>
  );
}
