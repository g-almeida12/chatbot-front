import { API_URL, fetchApi, getApiErrorMessage } from "@/services/api";
import type { ChatLink } from "@/modules/chatbot/chatbot.types";

export class ChatbotService {
  async sendPrompt(
    prompt: string,
    onFinish: (response: ChatbotResponse) => void,
  ): Promise<void> {
    if (!prompt) throw new Error("Nenhuma pergunta para enviar.");

    const response = await fetchApi(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt }),
    });

    if (!response.ok) {
      throw new Error(
        await getApiErrorMessage(response, "Erro ao retornar prompt"),
      );
    }

    const body = await response.json();
    onFinish(body.data as ChatbotResponse);
  }
}

export const chatbotService = new ChatbotService();

/**
 * Estrutura representando o objeto de resposta da API.
 *
 * Propriedades:
 * - `answer`: A resposta em texto do chatbot.
 * - `found`: Um booleano indicando se a pergunta do usuário foi ou não encontrada no banco.
 * - `links`: As fontes encontradas para responder a pergunta do usuário.
 * - `contacts`: Um objeto contendo os contatos para o caso da pergunta não ser respondida.
 */
export interface ChatbotResponse {
  answer: string;
  found: boolean;
  links: ChatLink[];
  contacts: Record<string, string>;
}
