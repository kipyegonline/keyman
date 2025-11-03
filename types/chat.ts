/**
 * Chat Management Types
 */

export interface ChatUser {
  id: number;
  name: string;
  email: string;
  profile_photo_url: string;
}

export interface Chat {
  id: string;
  chatable_id: string;
  chatable_type: string;
  title: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface MessageAttachment {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  user_id: number;
  message: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_read: boolean;
  read_at: string | null;
  user: ChatUser;
  attachments: MessageAttachment[];
}

export interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface MessagesPaginatedData {
  current_page: number;
  data: ChatMessage[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface ChatMessagesResponse {
  status: boolean;
  data: MessagesPaginatedData;
}

export interface SendMessagePayload {
  message: string;
}

export interface SendMessageWithAttachmentPayload {
  message: string;
  attachments: File[];
}

export interface SendFileOnlyPayload {
  attachments: File[];
}

export interface ApiResponse<T = unknown> {
  status: boolean;
  message?: string;
  data?: T;
}
