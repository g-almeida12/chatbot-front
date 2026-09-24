import { SendIcon } from "@/components/icons";
import type { InputHTMLAttributes } from "react";
import type React from "react";

interface ChatbotInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onSend: (prompt: string) => void;
  blockSendAction: boolean;
}

export function ChatbotInput({
  onSend,
  blockSendAction,
  ...props
}: ChatbotInputProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const prompt = formData.get("prompt") as string;

    if (!prompt.trim() || blockSendAction) return;

    onSend(prompt);
    e.currentTarget.reset();
  };

  return (
    <form
      className="flex flex-row gap-4 border-t border-border px-4 py-2"
      onSubmit={handleSubmit}
    >
      <input
        className="flex-1 min-w-0 border border-border rounded-full px-4 py-2 outline-none bg-muted"
        placeholder="Escreva sua dúvida"
        name="prompt"
        autoComplete="off"
        {...props}
      />

      <button
        type="submit"
        aria-label="Enviar dúvida"
        className="flex items-center justify-center size-10 rounded-full bg-input cursor-pointer"
      >
        <SendIcon className="relative right-px top-px text-muted-foreground" />
      </button>
    </form>
  );
}
