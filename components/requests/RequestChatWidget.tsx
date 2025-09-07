/* eslint-disable */
//@ts-ignore
import React, { useState } from "react";
import RequestChat from "./RequestChat";

interface RequestChatWidgetProps {
  userToken?: string;
  sessionId?: string;
  userType?: "user" | "supplier";
  isOpen?: boolean;
  handleToggle?: () => void;
}

/**
 * RequestChatWidget - A wrapper component that manages the open/close state
 * of the RequestChat component and provides a complete chatbot widget experience
 */
const RequestChatWidget: React.FC<RequestChatWidgetProps> = ({
  userToken = globalThis?.window?.localStorage?.getItem("auth_token") || "",
  sessionId,
  userType = "user",
  isOpen = false,
  handleToggle,
}) => {
  const handleError = (error: string) => {
    console.error("RequestChat Error:", error);
    // You can implement your own error handling here
    // For example, show a toast notification or send to error tracking
  };

  const handleRequestSubmitted = (message: any) => {
    console.log("Request submitted:", message);
    // You can implement your own success handling here
    // For example, show a success notification or redirect user
  };

  return (
    <RequestChat
      userToken={userToken}
      sessionId={sessionId}
      userType={userType}
      isOpen={isOpen}
      onToggle={handleToggle}
      onError={handleError}
      onRequestSubmitted={handleRequestSubmitted}
    />
  );
};

export default RequestChatWidget;
