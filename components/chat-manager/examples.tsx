"use client";
import React from "react";
import { ChatManager } from "@/components/chat-manager";
import { useAppContext } from "@/providers/AppContext";

/**
 * Example usage of ChatManager component
 *
 * This component demonstrates how to integrate the ChatManager
 * into your application with user context.
 */
export default function ChatExample() {
  const { user } = useAppContext();

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <ChatManager
      chatId="example-chat-123"
      currentUserId={user.id}
      recipientName="Support Team"
      recipientAvatar="/support-avatar.png"
    />
  );
}

/**
 * Example: Contract-specific chat
 */
export function ContractChat({ contractId }: { contractId: string }) {
  const { user } = useAppContext();

  if (!user) return null;

  return (
    <ChatManager
      chatId={`contract-${contractId}`}
      currentUserId={user.id}
      recipientName="Contract Discussion"
    />
  );
}

/**
 * Example: Supplier chat
 */
export function SupplierChat({
  supplierId,
  supplierName,
  supplierAvatar,
}: {
  supplierId: string;
  supplierName: string;
  supplierAvatar?: string;
}) {
  const { user } = useAppContext();

  if (!user) return null;

  return (
    <ChatManager
      chatId={`supplier-${supplierId}`}
      currentUserId={user.id}
      recipientName={supplierName}
      recipientAvatar={supplierAvatar}
    />
  );
}

/**
 * Example: Request-specific chat
 */
export function RequestChat({ requestId }: { requestId: string }) {
  const { user } = useAppContext();

  if (!user) return null;

  return (
    <ChatManager
      chatId={`request-${requestId}`}
      currentUserId={user.id}
      recipientName="Request Discussion"
    />
  );
}
