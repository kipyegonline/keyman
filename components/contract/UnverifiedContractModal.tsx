"use client";
import React, { useState } from "react";
import {
  Modal,
  Text,
  Button,
  Group,
  ThemeIcon,
  Box,
  Textarea,
  Alert,
  Loader,
} from "@mantine/core";
import { AlertCircle, CheckCircle, X, Send } from "lucide-react";
import { notifyUnverifiedContractRequest } from "@/api/contract";
import { notify } from "@/lib/notifications";

interface UnverifiedContractModalProps {
  opened: boolean;
  onClose: () => void;
  supplierName?: string;
  storeId: string;
  userId: string | number;
}

type Status = "idle" | "loading" | "success" | "error";

const UnverifiedContractModal: React.FC<UnverifiedContractModalProps> = ({
  opened,
  onClose,
  supplierName = "this supplier",
  storeId,
  userId,
}) => {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleClose = () => {
    setMessage("");
    setStatus("idle");
    setErrorMsg("");
    onClose();
  };

  const handleSubmit = async () => {
    setStatus("loading");
    setErrorMsg("");
    const res = await notifyUnverifiedContractRequest({
      store_id: storeId,
      user_id: userId,
      message: message.trim() || undefined,
    });
    if (res?.status === false) {
      setStatus("error");
      setErrorMsg(res?.message || "Something went wrong. Please try again.");
    } else {
      setStatus("success");
      notify.success("Your request has been sent to the supplier!");
      setTimeout(() => handleClose(), 3000);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      centered
      size="md"
      radius="lg"
      withCloseButton={false}
      transitionProps={{
        transition: "slide-up",
        duration: 300,
        timingFunction: "ease-out",
      }}
      classNames={{
        content: "!rounded-2xl !overflow-hidden",
        body: "!p-0",
      }}
    >
      <Box className="relative">
        {/* Animated gradient border */}
        <Box className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-green-500 to-orange-500 animate-pulse" />

        <Box p="xl">
          {/* Icon Section */}
          <Box className="flex justify-center mb-4">
            <Box className="relative">
              <ThemeIcon
                size={80}
                radius="xl"
                className="!bg-gradient-to-br !from-orange-100 !to-orange-50"
                style={{ animation: "bounce 2s infinite" }}
              >
                <AlertCircle size={40} className="text-orange-500" />
              </ThemeIcon>
              <Box
                className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full"
                style={{
                  animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                }}
              />
            </Box>
          </Box>

          {/* Heading + info box */}
          <Box className="text-center mb-5">
            <Text size="xl" fw={700} className="text-gray-900 mb-3">
              Supplier Not Verified
            </Text>
            <Text size="sm" className="text-gray-600 leading-relaxed mb-4">
              The profile for <strong>{supplierName}</strong> is not yet
              verified. You can still notify them of your intent to contract —
              once they are verified, they will be able to proceed.
            </Text>

            <Box className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-orange-50 border border-green-200">
              <Group gap="sm" justify="center" wrap="nowrap">
                <CheckCircle
                  size={20}
                  className="text-green-600 flex-shrink-0"
                />
                <Text size="xs" className="text-gray-700 text-left">
                  Your message will be delivered to the store once their account
                  is verified by the Keyman team.
                </Text>
              </Group>
            </Box>
          </Box>

          {/* Success state */}
          {status === "success" ? (
            <Box className="flex flex-col items-center gap-3 py-4">
              <CheckCircle size={48} className="text-green-500" />
              <Text fw={600} size="md" className="text-green-700 text-center">
                Request sent successfully!
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                This window will close automatically in a moment.
              </Text>
            </Box>
          ) : (
            <>
              {/* Error alert */}
              {status === "error" && (
                <Alert
                  color="red"
                  variant="light"
                  mb="md"
                  icon={<AlertCircle size={16} />}
                >
                  {errorMsg}
                </Alert>
              )}

              {/* Optional message */}
              <Textarea
                label="Message (optional)"
                placeholder="e.g. I would like to discuss a supply contract for roofing materials..."
                value={message}
                onChange={(e) => setMessage(e.currentTarget.value)}
                minRows={3}
                maxRows={5}
                autosize
                radius="md"
                mb="lg"
                disabled={status === "loading"}
                styles={{
                  input: { borderColor: "#3D6B2C" },
                  label: { fontWeight: 600, marginBottom: 6 },
                }}
              />

              {/* Actions */}
              <Group gap="sm" grow>
                <Button
                  variant="subtle"
                  size="md"
                  radius="xl"
                  onClick={handleClose}
                  disabled={status === "loading"}
                  className="!text-gray-600 hover:!bg-gray-100"
                  leftSection={<X size={16} />}
                >
                  Cancel
                </Button>
                <Button
                  size="md"
                  radius="xl"
                  onClick={handleSubmit}
                  loading={status === "loading"}
                  disabled={status === "loading"}
                  className="!bg-gradient-to-r !from-[#3D6B2C] !to-[#4A8234] hover:!from-[#2d5120] hover:!to-[#3D6B2C] !transition-all !duration-300 hover:!shadow-lg"
                  style={{ color: "white" }}
                  leftSection={
                    status === "loading" ? (
                      <Loader size={16} color="white" />
                    ) : (
                      <Send size={16} />
                    )
                  }
                >
                  {status === "loading" ? "Sending..." : "Send Request"}
                </Button>
              </Group>
            </>
          )}
        </Box>
      </Box>

      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes ping {
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </Modal>
  );
};

export default UnverifiedContractModal;
