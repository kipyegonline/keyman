// Main exports for ContractChat TypeScript components
export { default as ContractChat } from "./ContractChat";
export { default as ContractChatBot } from "./ContractChatBot";
export { default as ContractWizard } from "./ContractWizard";
export { default as StoreSearch } from "./StoreSearch";
export { default as PhasesAndMilestones } from "./PhasesAndMilestones";
export { default as ReviewAndSubmit } from "./ReviewAndSubmit";
export { default as LabourSection } from "./LabourSection";
export { default as ItemsSection } from "./ItemsSection";
export { default as ContractPaymentModal } from "./ContractPaymentModal";

// Type exports
export type { LabourItem } from "./LabourSection";
export type { MaterialItem } from "./ItemsSection";
export type {
  ContractChatProps,
  ChatMessage,
  Attachment,
  ChatState,
  LocalStorageKeys,
  AssistantResponse,
  Environment,
  UserType,
  MessageRole,
  AttachmentType,
  WebhookPayload,
  ApiResponse,
  FileInputHandler,
  KeyboardHandler,
  ButtonClickHandler,
  StateUpdateHandler,
} from "./ContractChat.types";

// Re-export everything from types for convenience
export * from "./ContractChat.types";
