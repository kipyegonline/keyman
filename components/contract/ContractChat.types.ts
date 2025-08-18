// Type definitions for ContractChat component
/*eslint-disable*/
export interface ContractChatProps {
  userToken: string;
  sessionId: string;
  supplierId?: string | null;
  contractId?: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
  options?: string[];
  action?: string;
  canResend?: boolean;
  resendPayload?: {
    chatInput: string;
    file: File | null;
  };
}

export interface Attachment {
  type: "image" | "audio";
  url: string;
}

export interface ChatState {
  baseUrlProd: string;
  baseUrlTest: string;
  env: "test" | "prod";
  userType: "user" | "supplier";
  userToken: string;
}

export interface LocalStorageKeys {
  baseUrlProd: string;
  baseUrlTest: string;
  env: string;
  userType: string;
  userToken: string;
}

export interface AssistantResponse {
  json?: any;
  output?: any;
  content?: string;
  message?: string;
  options?: string | string[];
  action?: string;
}

export type Environment = "test" | "prod";
export type UserType = "user" | "supplier";
export type MessageRole = "user" | "assistant";
export type AttachmentType = "image" | "audio";

// API related types
export interface WebhookPayload {
  chatInput: string;
  sessionId: string;
  workflow: string;
  user_type: "CLIENT" | "SERVICE_PROVIDER";
  user_token: string;
  supplierId?: string;
  contractId?: string;
  file?: File;
}

export interface ApiResponse {
  content?: string;
  message?: string;
  options?: string | string[];
  action?: string;
  json?: any;
  output?: any;
}

// Event handler types
export type FileInputHandler = (
  event: React.ChangeEvent<HTMLInputElement>
) => void;
export type KeyboardHandler = (
  event: React.KeyboardEvent<HTMLTextAreaElement>
) => void;
export type ButtonClickHandler = () => void;
export type StateUpdateHandler = <K extends keyof ChatState>(
  key: K,
  value: ChatState[K]
) => void;
