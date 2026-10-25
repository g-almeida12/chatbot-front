import { useState } from "react";
import { mockedChatbotService } from "./mocked-chatbot-service";
import type { ChatbotMessage } from "../modules/chatbot/chatbot.types";

/**
 * Mensagem do sistema utilizada para orientar o comportamento e as restrições da IA no ambiente mockado.
 * Define o escopo de atendimento restrito às dúvidas de matrícula, trancamento de semestre e horários de disciplinas da UFPE.
 */
const SYSTEM_MESSAGE: ChatbotMessage = {
  id: "system",
  role: "system",
  content:
    "Você é um assistente de suporte. Responda apenas em português e de form objetiva. Você só pode responder a apenas três tipos de perguntas relactionadas a Universidade Federal de Pernambuco: sobre as matrículas 2026.2 para graduação; sobre como trancar o semestre; e sobre o horário das disciplinas. Se for perguntado sobre as matrículas 2026.2 para graduação, responda uma variação de 'O Edital 42/2026 trata da matrícula de graduação 2026.2 e vale para todos os campi. Ele foi publicado em 06/07/2026. O calendário 2026 foi republicado em 02/07/2026 e traz as datas do ano letivo.'. Se for perguntado sobre como trancar o semestre, responda uma variação de 'A SecGrad disponibiliza um tutorial com o passo a passo para pedir o trancamento de semestre no período regular, pelo SigaA. Só quem é da graduação pode trancar por aí.'. Se for perguntado sobre o horários das diciplinas, responda uma variação de 'O horário das disciplinas do semestre 2026 foi publicado em 20/07/2026, em uma planilha. Você também encontra o link na seção Informes da página inicial da SecGrad.'. Para qualquer outra pergunta, responda uma variação de 'Não encontrei essa informação nos materiais que tenho. Para não te passar algo errado, é melhor confirmar direto com a secretaria.'. ",
};

/**
 * Custom Hook para testes e desenvolvimento utilizando o serviço de chatbot mockado.
 *
 * Injeta automaticamente uma instrução de sistema (`systemMessage`) ao histórico de mensagens
 * enviadas para a IA, simulando as regras de suporte da UFPE e consumindo respostas via streaming.
 *
 * @param initialMessages - Lista opcional de mensagens para inicializar o histórico da conversa.
 *
 * @returns Um objeto contendo:
 * - `sendMessage`: Função assíncrona para enviar um prompt do usuário.
 * - `messages`: Histórico atualizado de mensagens, incluindo a mensagem de sistema inicial e as respostas da IA.
 * - `isLoading`: Booleano que indica se a resposta mockada está em processamento/streaming.
 * - `hasError`: Booleano que indica se ocorreu algum erro na stream do serviço mockado.
 *
 * @example
 * ```tsx
 * const { messages, sendMessage, isLoading } = useMockedChatbot();
 *
 * // Dispara uma mensagem que acionará as regras de resposta do mock
 * sendMessage("Como faço para trancar o semestre?");
 * ```
 */
export function useMockedChatbot(initialMessages: ChatbotMessage[] = []) {
  const [messages, setMessages] = useState<ChatbotMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  /**
   * Envia uma mensagem do usuário, anexa o `systemMessage` ao payload da requisição e consome a resposta do mock via streaming.
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

    const updatedMessages = [SYSTEM_MESSAGE, ...messages, userMessage];
    setMessages([...updatedMessages, assistantMessage]);

    try {
      setHasError(false);
      setIsLoading(true);

      await mockedChatbotService.sendPromptStream(
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
