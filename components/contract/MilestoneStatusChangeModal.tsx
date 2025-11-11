"use client";
import {
  Modal,
  Group,
  Text,
  Stack,
  Button,
  Checkbox,
  Paper,
  Divider,
  TextInput,
} from "@mantine/core";
import { Play, CheckCircle, X, FileText } from "lucide-react";
import { useState, useEffect } from "react";

interface Milestone {
  id: string;
  title: string;
  name: string;
  description: string;
  status: "completed" | "in_progress" | "pending" | "overdue";
  amount?: number;
  due_date?: string;
}

interface MilestoneStatusChangeModalProps {
  opened: boolean;
  onClose: () => void;
  milestone: Milestone | null;
  currentStatus: string;
  onConfirm: (milestoneId: string, signature: string) => Promise<void>;
  providerName?: string;
  initiatorName?: string;
}

const MilestoneStatusChangeModal: React.FC<MilestoneStatusChangeModalProps> = ({
  opened,
  onClose,
  milestone,
  currentStatus,
  onConfirm,
  providerName,
  initiatorName,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");

  const isStarting = currentStatus.toLowerCase() === "pending";
  const isCompleting = currentStatus.toLowerCase() === "in_progress";

  // Reset form when modal opens/closes
  useEffect(() => {
    if (opened) {
      setAgreed(false);
      setSignature("");
      setError("");
    }
  }, [opened, milestone]);

  const handleSubmit = async () => {
    if (!milestone) return;

    if (!agreed) {
      setError("You must agree to the terms to proceed");
      return;
    }

    if (!signature.trim()) {
      setError("Digital signature is required");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await onConfirm(milestone.id, signature.trim());
      // Don't close modal here - let parent component handle it based on API response
    } catch (error) {
      console.error("Error confirming milestone status change:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const getActionText = () => {
    if (isStarting) return "start";
    if (isCompleting) return "complete";
    return "update";
  };

  const getActionTitle = () => {
    if (isStarting) return "Start Milestone";
    if (isCompleting) return "Complete Milestone";
    return "Update Milestone";
  };

  const getAgreementText = () => {
    if (isStarting) {
      return "I confirm that I am ready to begin work on this milestone and understand the requirements and timeline.";
    }
    if (isCompleting) {
      return `I, ${providerName}, confirm that all work for this milestone has been completed according to the specified requirements and is ready for review.`;
    }
    return `I, ${initiatorName}, confirm that the milestone has been completed as per my requirements.`;
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          {isStarting ? (
            <Play size={20} className="text-keyman-green" />
          ) : (
            <CheckCircle size={20} className="text-keyman-orange" />
          )}
          <Text fw={600} size="lg">
            {getActionTitle()}
          </Text>
        </Group>
      }
      size="md"
      radius="lg"
      centered
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
    >
      {milestone && (
        <Stack gap="md">
          {/* Milestone Information */}
          <Paper
            p="md"
            radius="md"
            className="bg-gray-50 border border-gray-200"
          >
            <Group gap="sm" mb="sm">
              <FileText size={16} className="text-gray-600" />
              <Text fw={600} size="sm">
                Milestone Details
              </Text>
            </Group>
            <Text fw={600} size="sm" className="text-gray-800 mb-xs">
              {milestone.name}
            </Text>
            <Text size="sm" c="dimmed" className="mb-xs">
              {milestone.title}
            </Text>
            <Text size="xs" c="dimmed" className="leading-relaxed">
              {milestone.description}
            </Text>
            {milestone.due_date && (
              <Text size="xs" c="dimmed" className="mt-xs">
                Due: {new Date(milestone.due_date).toLocaleDateString()}
              </Text>
            )}
          </Paper>

          {/* Payment Information Alert - Only show when starting a milestone */}
          {isStarting && milestone.amount && (
            <Paper
              p="md"
              radius="md"
              style={{
                backgroundColor: "#3D6B2C15",
                border: "1px solid #3D6B2C40",
              }}
            >
              <Group gap="xs" mb="sm">
                <Text size="sm" fw={600} c="#3D6B2C">
                  💳 Payment Information
                </Text>
              </Group>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  You will be prompted on your phone to pay{" "}
                  <Text span fw={600} c="#3D6B2C">
                    KES {milestone.amount.toLocaleString()}
                  </Text>{" "}
                  for this milestone.
                </Text>
                <Paper
                  p="xs"
                  radius="sm"
                  style={{
                    backgroundColor: "#F08C2315",
                    border: "1px solid #F08C2340",
                  }}
                >
                  <Text size="xs" fw={500} c="#F08C23">
                    ⓘ Contract fee of KES 200 will be charged on your first
                    milestone.
                  </Text>
                </Paper>
              </Stack>
            </Paper>
          )}

          {/* Action Confirmation */}
          <Paper
            p="md"
            radius="md"
            className="border border-amber-200 bg-amber-50"
          >
            <Text fw={600} size="sm" className="text-amber-800 mb-sm">
              Confirmation Required
            </Text>
            <Text size="sm" className="text-amber-700 mb-md">
              You are about to {getActionText()} this milestone. This action
              will update the milestone status and notify relevant parties.
            </Text>

            {/* Agreement Checkbox */}
            <Checkbox
              checked={agreed}
              onChange={(event) => setAgreed(event.currentTarget.checked)}
              label={
                <Text size="sm" className="text-gray-700">
                  {getAgreementText()}
                </Text>
              }
              disabled={isLoading}
              className="mb-md"
            />
          </Paper>

          {/* Digital Signature */}
          <div>
            <Text fw={600} size="sm" className="text-gray-700 mb-xs">
              Digital Signature
            </Text>
            <TextInput
              placeholder="Enter your full name as digital signature"
              value={signature}
              onChange={(event) => setSignature(event.currentTarget.value)}
              disabled={isLoading}
              error={error && !signature.trim() ? "Signature is required" : ""}
            />
            <Text size="xs" c="dimmed" className="mt-xs">
              Date: {getCurrentDate()}
            </Text>
          </div>

          {error && (
            <Text size="sm" c="red" className="text-center">
              {error}
            </Text>
          )}

          <Divider />

          {/* Action Buttons */}
          <Group justify="space-between">
            <Button
              variant="light"
              color="gray"
              leftSection={<X size={16} />}
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>

            <Button
              className={isStarting ? "bg-keyman-green" : "bg-keyman-orange"}
              leftSection={
                isStarting ? <Play size={16} /> : <CheckCircle size={16} />
              }
              onClick={handleSubmit}
              loading={isLoading}
              disabled={!agreed || !signature.trim()}
            >
              {isStarting ? "Start Milestone" : "Complete Milestone"}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
};

export default MilestoneStatusChangeModal;
