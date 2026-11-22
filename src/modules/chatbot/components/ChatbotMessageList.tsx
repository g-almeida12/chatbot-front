import { AlertIcon, FileIcon } from "@/components/icons";
import type { ChatbotMessage } from "../chatbot.types";
import Markdown from "react-markdown";
import type { Ref } from "react";

export function ChatbotMessageList({
  messages,
  isLoading,
  hasError,
  messageListRef = null,
}: {
  messages: ChatbotMessage[];
  isLoading: boolean;
  hasError: boolean;
  messageListRef?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      className="min-h-0 flex flex-col flex-1 gap-2 overflow-y-auto p-2"
      ref={messageListRef}
    >
      {messages.map((msg) => {
        if (msg.role === "system") return null;

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
          <div className="flex flex-col gap-4">
            <div
              className={`${baseContentStyles} self-start rounded-tl-none bg-mauve-100 after:content-[''] after:absolute after:top-0 after:-left-1 after:border-6 after:border-transparent after:border-t-mauve-100 after:border-r-mauve-100`}
              key={msg.id}
            >
              <span className={`${baseAuthorStyles} text-mauve-400`}>
                CIn Chatbot
              </span>
              <div className="prose">
                <Markdown>{msg.content}</Markdown>
              </div>

              {msg.links && msg.links.length > 0 && (
                <div className="mt-4">
                  <span className="block mb-2 text-sm text-muted-foreground">
                    Fontes
                  </span>
                  <div className="flex flex-col gap-2">
                    {msg.links.map((lk) => (
                      <a href={lk.url} target="_blank">
                        <div className="flex flex-row items-center gap-3 rounded-md border border-sidebar-ring p-2 bg-background cursor-pointer select-none hover:border-[#db1e2f] hover:bg-red-100">
                          <FileIcon size={20} className="text-[#db1e2f]" />
                          <div className="flex flex-col gap-0">
                            <span className="text-sm ">{lk.name}</span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
