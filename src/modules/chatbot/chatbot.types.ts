/**
 * Papéis permitidos para as mensagens no fluxo da conversa com a inteligência artificial.
 * 
 * - `"user"`: Mensagem enviada pelo usuário.
 * - `"assistant"`: Resposta gerada pela IA.
 * - `"system"`: Instruções e contexto de sistema fornecidos à IA.
 */
export type MessageRole = "user" | "assistant" | "system";

/**
 * Estrutura que representa uma fonte ou referência consultada pela IA para compor a resposta.
 * 
 * Propriedades:
 * - `title`: Título legível da página ou documento de origem.
 * - `url`: Link/URL de acesso à fonte original.
 * - `description`: Breve descrição ou resumo opcional sobre a fonte consultada.
 */
export type ChatbotSource = {
  title: string;
  url: string;
  description?: string;
};

/**
 * Estrutura completa de uma mensagem mantida no histórico da conversa do chatbot.
 * 
 * Propriedades:
 * - `id`: Identificador único opcional da mensagem (geralmente gerado com timestamp ou UUID).
 * - `role`: Papel ou origem do emissor da mensagem (`user`, `assistant` ou `system`).
 * - `content`: Conteúdo textual da mensagem.
 * - `sourceInfo`: Informações opcionais sobre as fontes consultadas pela IA, contendo um array `sources` com as fontes encontradas e um booleano `success` indicando se a busca foi realizada com êxito.
 */
export interface ChatbotMessage {
  id?: string;
  role: MessageRole;
  content: string;
  sourceInfo?: {
    sources: ChatbotSource[];
    success: boolean;
  };
}

/**
 * DTO (Data Transfer Object) para envio de requisições ao endpoint do chatbot.
 * 
 * Propriedades:
 * - `messages`: Histórico completo ou parcial das mensagens enviadas para o modelo de linguagem.
 */
export interface ChatbotRequestDTO {
  messages: ChatbotMessage[];
}

/**
 * Tipos de eventos transmitidos em tempo real via Server-Sent Events (SSE) / Streaming da API.
 * 
 * Variações possíveis:
 * - `sources` (`type: "sources"`): Evento emitido ao finalizar a busca por fontes, trazendo o status de sucesso (`success`) e a lista de referências (`sources`).
 * - `token` (`type: "token"`): Evento emitido a cada pedaço de texto gerado pela IA, trazendo o trecho no campo `content`.
 * - `error` (`type: "error"`): Evento emitido em caso de falha na stream, contendo o detalhe do erro em `message`.
 */
export type ChatbotStreamEvent =
  | {
      type: "sources";
      success: true;
      sources: ChatbotSource[];
    }
  | {
      type: "sources";
      success: false;
      sources: ChatbotSource[];
    }
  | {
      type: "token";
      content: string;
    }
  | {
      type: "error";
      message: string;
    };