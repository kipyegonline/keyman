"use client";
import React from "react";
import { Modal, Text, Button, Group, ThemeIcon, Box } from "@mantine/core";
import { AlertCircle, CheckCircle, X } from "lucide-react";

interface UnverifiedContractModalProps {
  opened: boolean;
  onClose: () => void;
  onAccept: () => void;
  supplierName?: string;
}

const UnverifiedContractModal: React.FC<UnverifiedContractModalProps> = ({
  opened,
  onClose,
  onAccept,
  supplierName = "this supplier",
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
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
                className="!bg-gradient-to-br !from-orange-100 !to-orange-50 animate-bounce"
                style={{
                  animation: "bounce 2s infinite",
                }}
              >
                <AlertCircle size={40} className="text-orange-500" />
              </ThemeIcon>
              <Box
                className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-ping"
                style={{
                  animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                }}
              />
            </Box>
          </Box>

          {/* Content */}
          <Box className="text-center mb-6">
            <Text
              size="xl"
              fw={700}
              className="text-gray-900 mb-3"
              style={{
                animation: "fadeIn 0.5s ease-out 0.2s both",
              }}
            >
              Supplier Not Verified
            </Text>
            <Text
              size="sm"
              className="text-gray-600 leading-relaxed mb-4"
              style={{
                animation: "fadeIn 0.5s ease-out 0.3s both",
              }}
            >
              The profile for <strong>{supplierName}</strong> is not yet
              verified. For your security, this contract will be assigned to{" "}
              <strong className="text-[#3D6B2C]">KS001</strong> (Keyman Verified
              Supplier).
            </Text>

            {/* Info Box */}
            <Box
              className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-orange-50 border border-green-200"
              style={{
                animation: "slideInUp 0.5s ease-out 0.4s both",
              }}
            >
              <Group gap="sm" justify="center" wrap="nowrap">
                <CheckCircle
                  size={20}
                  className="text-green-600 flex-shrink-0"
                />
                <Text size="xs" className="text-gray-700 text-left">
                  KS001 is a Keyman verified and trusted supplier with full
                  accountability and service guarantee.
                </Text>
              </Group>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Group
            gap="sm"
            grow
            style={{
              animation: "fadeIn 0.5s ease-out 0.5s both",
            }}
          >
            <Button
              variant="subtle"
              size="md"
              radius="xl"
              onClick={onClose}
              className="!text-gray-600 hover:!bg-gray-100 !transition-all !duration-300 hover:!scale-105"
              leftSection={<X size={18} />}
            >
              No, Thank You
            </Button>
            <Button
              size="md"
              radius="xl"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="!bg-gradient-to-r !from-[#3D6B2C] !to-[#4A8234] hover:!from-[#2d5120] hover:!to-[#3D6B2C] !transition-all !duration-300 hover:!scale-105 hover:!shadow-lg"
              style={{ color: "white" }}
              leftSection={<CheckCircle size={18} />}
            >
              Accept & Continue
            </Button>
          </Group>
        </Box>
      </Box>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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
