"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Paperclip,
  Trash2,
  Check,
  CheckCheck,
  Image as ImageIcon,
  File,
  Sparkles,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getChatMessages,
  sendMessage,
  sendMessageWithAttachment,
  sendFileOnly,
  deleteMessage,
  markAllMessagesAsRead,
} from "@/api/chat";
import { notify } from "@/lib/notifications";
import "./ChatManager.css";
import { Tooltip } from "@mantine/core";

export interface ChatManagerProps {
  chatId: string;
  currentUserId: number;
  recipientName?: string;
  recipientAvatar?: string;
}

export const ChatManager: React.FC<ChatManagerProps> = ({
  chatId,
  currentUserId,
  recipientName = "Chat",
  recipientAvatar,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch messages with long polling (refetch every 5 seconds when chat is open)
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ["chat-messages", chatId],
    queryFn: () => getChatMessages(chatId),
    enabled: isOpen,
    refetchInterval: isOpen ? 5000 : false, // Long polling every 5 seconds
    refetchOnWindowFocus: true,
  });

  const messages = messagesData?.data?.data.toReversed() || [];
  const unreadCount = messages.filter(
    (msg) => !msg.is_read && msg.user_id !== currentUserId
  ).length;

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isOpen, isMinimized]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized && unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  }, [isOpen, isMinimized, unreadCount]);

  // Send text message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => sendMessage(chatId, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", chatId] });
      setMessageText("");
    },
    onError: (error: Error) => {
      notify.error(error.message || "Failed to send message");
    },
  });

  // Send message with attachments mutation
  const sendWithAttachmentMutation = useMutation({
    mutationFn: ({ message, files }: { message: string; files: File[] }) =>
      sendMessageWithAttachment(chatId, { message, attachments: files }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", chatId] });
      setMessageText("");
      setSelectedFiles([]);
    },
    onError: (error: Error) => {
      notify.error(error.message || "Failed to send message");
    },
  });

  // Send files only mutation
  const sendFilesOnlyMutation = useMutation({
    mutationFn: (files: File[]) => sendFileOnly(chatId, { attachments: files }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", chatId] });
      setSelectedFiles([]);
    },
    onError: (error: Error) => {
      notify.error(error.message || "Failed to send files");
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: string) => deleteMessage(chatId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", chatId] });
      notify.success("Message deleted successfully");
    },
    onError: (error: Error) => {
      notify.error(error.message || "Failed to delete message");
    },
  });

  // Mark all messages as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllMessagesAsRead(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", chatId] });
    },
  });

  const handleToggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
    } else {
      setIsOpen(false);
      setIsMinimized(false);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = () => {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage && selectedFiles.length === 0) {
      return;
    }

    if (trimmedMessage && selectedFiles.length > 0) {
      // Send message with attachments
      sendWithAttachmentMutation.mutate({
        message: trimmedMessage,
        files: selectedFiles,
      });
    } else if (selectedFiles.length > 0) {
      // Send files only
      sendFilesOnlyMutation.mutate(selectedFiles);
    } else {
      // Send text only
      sendMessageMutation.mutate(trimmedMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) {
      return <ImageIcon size={16} />;
    }
    return <File size={16} />;
  };

  return (
    <>
      {/* Floating Action Button */}
      <Tooltip
        label="use chat assistant to create milestones"
        position="right-end"
        withArrow
      >
        <button
          onClick={handleToggleChat}
          className="chat-manager-fab"
          style={{
            //position: "fixed",
            //bottom: "24px",
            //right: "24px",
            width: "80px",
            height: "50px",
            //borderRadius: "50%",
            borderRadius: "12px",
            backgroundColor: "#F08C23",
            border: "none",
            boxShadow: "0 4px 12px rgba(240, 140, 35, 0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            // zIndex: 1000,
          }}
          aria-label="Toggle chat"
        >
          {isOpen ? (
            <X size={24} color="white" />
          ) : (
            <>
              <Sparkles size={24} color="white" className="animate-pulse" />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </>
          )}
        </button>
      </Tooltip>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`chat-manager-window ${isMinimized ? "minimized" : ""}`}
          style={{
            position: "fixed",
            bottom: "100px",
            right: "24px",
            width: "380px",
            maxWidth: "calc(100vw - 48px)",
            height: isMinimized ? "60px" : "600px",
            maxHeight: "calc(100vh - 150px)",
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 999,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #3D6B2C 0%, #4A8234 100%)",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: "16px 16px 0 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#F08C23",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  color: "white",
                  fontSize: "16px",
                  backgroundImage: recipientAvatar
                    ? `url(${recipientAvatar})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {!recipientAvatar && recipientName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  {recipientName}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "12px",
                  }}
                >
                  {messages.length} messages
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleMinimize}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <Minimize2 size={16} color="white" />
              </button>
              <button
                onClick={handleToggleChat}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <X size={16} color="white" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px",
                  backgroundColor: "#f8f9fa",
                }}
              >
                {isLoading && !messagesData ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <div className="chat-loader"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "#6b7280",
                      textAlign: "center",
                    }}
                  >
                    <MessageCircle size={48} color="#d1d5db" />
                    <p style={{ marginTop: "16px", fontSize: "14px" }}>
                      No messages yet
                    </p>
                    <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                      Start a conversation
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => {
                      const isOwn = message.user_id === currentUserId;
                      return (
                        <div
                          key={message.id}
                          className={`chat-message ${isOwn ? "own" : "other"}`}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: isOwn ? "flex-end" : "flex-start",
                            marginBottom: "16px",
                            animation: "slideIn 0.3s ease",
                          }}
                        >
                          {!isOwn && (
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                marginBottom: "4px",
                                marginLeft: "4px",
                              }}
                            >
                              {message.user.name}
                            </span>
                          )}
                          <div
                            style={{
                              maxWidth: "70%",
                              position: "relative",
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: isOwn ? "#3D6B2C" : "white",
                                color: isOwn ? "white" : "#1f2937",
                                padding: "12px 16px",
                                borderRadius: isOwn
                                  ? "16px 16px 4px 16px"
                                  : "16px 16px 16px 4px",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                                wordBreak: "break-word",
                              }}
                            >
                              {message.message && (
                                <p style={{ margin: 0, fontSize: "14px" }}>
                                  {message.message}
                                </p>
                              )}
                              {message.attachments &&
                                message.attachments.length > 0 && (
                                  <div
                                    style={{
                                      marginTop: message.message ? "8px" : 0,
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "8px",
                                    }}
                                  >
                                    {message.attachments.map((attachment) => (
                                      <a
                                        key={attachment.id}
                                        href={attachment.file_path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                          padding: "8px",
                                          backgroundColor: isOwn
                                            ? "rgba(255, 255, 255, 0.2)"
                                            : "#f3f4f6",
                                          borderRadius: "8px",
                                          textDecoration: "none",
                                          color: isOwn ? "white" : "#1f2937",
                                          fontSize: "13px",
                                        }}
                                      >
                                        {getFileIcon(attachment.file_name)}
                                        <span>{attachment.file_name}</span>
                                      </a>
                                    ))}
                                  </div>
                                )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                justifyContent: isOwn
                                  ? "flex-end"
                                  : "flex-start",
                                marginTop: "4px",
                                fontSize: "11px",
                                color: "#9ca3af",
                              }}
                            >
                              <span>{formatTime(message.created_at)}</span>
                              {isOwn && (
                                <>
                                  {message.is_read ? (
                                    <CheckCheck size={14} color="#10b981" />
                                  ) : (
                                    <Check size={14} color="#9ca3af" />
                                  )}
                                  <button
                                    onClick={() =>
                                      deleteMessageMutation.mutate(message.id)
                                    }
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      padding: "2px",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                    title="Delete message"
                                  >
                                    <Trash2 size={12} color="#ef4444" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "white",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div
                    style={{
                      marginBottom: "12px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          backgroundColor: "#f3f4f6",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      >
                        {getFileIcon(file.name)}
                        <span>{file.name}</span>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "2px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <X size={14} color="#6b7280" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input Row */}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-end",
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                    multiple
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      backgroundColor: "#f3f4f6",
                      border: "none",
                      borderRadius: "8px",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    <Paperclip size={20} color="#6b7280" />
                  </button>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      padding: "12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      resize: "none",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      minHeight: "40px",
                      maxHeight: "120px",
                    }}
                    rows={1}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={
                      (!messageText.trim() && selectedFiles.length === 0) ||
                      sendMessageMutation.isPending ||
                      sendWithAttachmentMutation.isPending ||
                      sendFilesOnlyMutation.isPending
                    }
                    style={{
                      backgroundColor: "#F08C23",
                      border: "none",
                      borderRadius: "8px",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor:
                        !messageText.trim() && selectedFiles.length === 0
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        !messageText.trim() && selectedFiles.length === 0
                          ? 0.5
                          : 1,
                      transition: "all 0.2s",
                    }}
                  >
                    <Send size={20} color="white" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatManager;
