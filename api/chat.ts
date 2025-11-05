import AxiosClient from "@/config/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import {
  ChatMessagesResponse,
  SendMessagePayload,
  SendMessageWithAttachmentPayload,
  SendFileOnlyPayload,
  ApiResponse,
  ChatMessage,
} from "@/types/chat";
import { AxiosError } from "axios";

/**
 * Get chat messages with pagination
 * @param chatId - The ID of the chat
 * @param page - Page number (default: 1)
 * @param perPage - Items per page (default: 20)
 */
export const getChatMessages = async (
  chatId: string,
  page: number = 1,
  perPage: number = 20
): Promise<ChatMessagesResponse> => {
  try {
    const response = await AxiosClient.get(
      `${ENDPOINTS.chat.MESSAGE_MANAGEMENT.GET_CHAT_MESSAGES(
        chatId
      )}&page=${page}&per_page=${perPage}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch messages"
      );
    }
    throw error;
  }
};

/**
 * Send a text message
 * @param chatId - The ID of the chat
 * @param payload - Message payload
 */
export const sendMessage = async (
  chatId: string,
  payload: SendMessagePayload
): Promise<ApiResponse<ChatMessage>> => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.chat.MESSAGE_MANAGEMENT.SEND_MESSAGE(chatId),
      payload
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to send message"
      );
    }
    throw error;
  }
};

/**
 * Send a message with attachments
 * @param chatId - The ID of the chat
 * @param payload - Message with attachments payload
 */
export const sendMessageWithAttachment = async (
  chatId: string,
  payload: SendMessageWithAttachmentPayload
): Promise<ApiResponse<ChatMessage>> => {
  try {
    const formData = new FormData();
    formData.append("message", payload.message);

    // Append each file to the form data
    payload.attachments.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });

    const response = await AxiosClient.post(
      ENDPOINTS.chat.MESSAGE_MANAGEMENT.SEND_MESSAGE_WITH_ATTACHMENT(chatId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to send message with attachment"
      );
    }
    throw error;
  }
};

/**
 * Send files only (no text message)
 * @param chatId - The ID of the chat
 * @param payload - Files payload
 */
export const sendFileOnly = async (
  chatId: string,
  payload: SendFileOnlyPayload
): Promise<ApiResponse<ChatMessage>> => {
  try {
    const formData = new FormData();

    // Append each file to the form data
    payload.attachments.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });

    const response = await AxiosClient.post(
      ENDPOINTS.chat.MESSAGE_MANAGEMENT.SEND_FILE_ONLY(chatId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to send files");
    }
    throw error;
  }
};

/**
 * Delete a message
 * @param chatId - The ID of the chat
 * @param messageId - The ID of the message to delete
 */
export const deleteMessage = async (
  chatId: string,
  messageId: string
): Promise<ApiResponse> => {
  try {
    const response = await AxiosClient.delete(
      ENDPOINTS.chat.MESSAGE_MANAGEMENT.DELETE_MESSAGE(chatId, messageId)
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to delete message"
      );
    }
    throw error;
  }
};

/**
 * Mark a single message as read
 * @param chatId - The ID of the chat
 * @param messageId - The ID of the message to mark as read
 */
export const markMessageAsRead = async (
  chatId: string,
  messageId: string
): Promise<ApiResponse> => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.chat.READ_RECEIPTS.MARK_MESSAGE_AS_READ(chatId, messageId)
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to mark message as read"
      );
    }
    throw error;
  }
};

/**
 * Mark all messages in a chat as read
 * @param chatId - The ID of the chat
 */
export const markAllMessagesAsRead = async (
  chatId: string
): Promise<ApiResponse> => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.chat.READ_RECEIPTS.MARK_MESSAGES_AS_READ(chatId)
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to mark all messages as read"
      );
    }
    throw error;
  }
};
