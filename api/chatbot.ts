import AxiosClient from "@/config/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { AxiosError } from "axios";

export interface CreateThreadPayload {
  name?: string; // Optional name for the thread
}

export interface SendMessagePayload {
  content: string;
  type: "text" | "image" | "file";
  // You can add other fields like role if your API supports it
  // role?: 'user' | 'assistant';
}

/**
 * Create a new chat thread.
 * @param payload Optional payload to name the thread.
 * @returns The created thread data.
 */
export const createThread = async () => {
  try {
    const response = await AxiosClient.post(ENDPOINTS.chatbot.CREATE_THREAD);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while creating the chat thread",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

/**
 * Get all chat threads for the user.
 * @returns A list of chat threads.
 */
export const getThreads = async () => {
  try {
    const response = await AxiosClient.get(ENDPOINTS.chatbot.GET_THREADS);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while fetching chat threads",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

/**
 * Get all messages for a specific thread.
 * @param threadId The ID of the thread.
 * @returns A list of messages for the thread.
 */
export const getMessages = async (threadId: string) => {
  try {
    const response = await AxiosClient.get(
      ENDPOINTS.chatbot.GET_MESSAGES(threadId)
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while fetching messages",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

/**
 * Send a message to a specific thread.
 * @param threadId The ID of the thread.
 * @param payload The message payload.
 * @returns The newly created message data.
 */
export const sendMessage = async (
  threadId: string,
  payload: SendMessagePayload
) => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.chatbot.SEND_MESSAGE(threadId),
      payload
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while sending the message",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

/**
 * Get the message count for a specific thread.
 * @param threadId The ID of the thread.
 * @returns The message count.
 */
export const getMessageCount = async (threadId: string) => {
  try {
    const response = await AxiosClient.get(
      ENDPOINTS.chatbot.GET_MESSAGE_COUNT(threadId)
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while fetching the message count",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};
