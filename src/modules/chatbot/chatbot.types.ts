/**
 * Papéis permitidos para as mensagens no fluxo da conversa com a inteligência artificial.
 *
 * - `"user"`: Mensagem enviada pelo usuário.
 * - `"assistant"`: Resposta gerada pela IA.
 * - `"system"`: Instruções e contexto de sistema fornecidos à IA.
 */
export type MessageRole = "user" | "assistant" | "system";

/**
 * Estrutura de uma fonte enviada pela API
 * 
 * Propriedades:
 * - `name`: Nome do documento/site.
 * - `url`: URL do documento/site.
 */
export interface ChatLink {
  name: string;
  url: string;
}

/**
 * Estrutura completa de uma mensagem mantida no histórico da conversa do chatbot.
 *
 * Propriedades:
 * - `id`: Identificador único opcional da mensagem (geralmente gerado com timestamp ou UUID).
 * - `role`: Papel ou origem do emissor da mensagem (`user`, `assistant` ou `system`).
 * - `content`: Conteúdo textual da mensagem.
 * - `link`: Array com as fontes encontradas
 */
export interface ChatbotMessage {
  id?: string;
  role: MessageRole;
  content: string;
  links?: ChatLink[];
  contacts?: Record<string, string>
}

/**
 * DTO (Data Transfer Object) para envio de requisições ao endpoint do chatbot.
 *
 * Propriedades:
 * - `messages`: Histórico completo ou parcial das mensagens enviadas para o modelo de linguagem.
 */
export interface ChatbotRequestDTO {
  message: string;
}
