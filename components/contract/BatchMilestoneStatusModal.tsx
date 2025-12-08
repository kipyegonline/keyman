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
  Badge,
  ScrollArea,
  Transition,
  ThemeIcon,
  Loader,
} from "@mantine/core";
import {
  Play,
  CheckCircle,
  X,
  FileText,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

interface Milestone {
  id: string;
  title: string;
  name: string;
  description: string;
  status: "completed" | "in_progress" | "pending" | "overdue";
  amount?: number;
  due_date?: string;
}

interface BatchMilestoneStatusModalProps {
  opened: boolean;
  onClose: () => void;
  milestones: Milestone[];
  action: "start" | "complete";
  onConfirm: (milestoneIds: string[], action: string) => Promise<void>;
  providerName?: string;
  initiatorName?: string;
  isLoading?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

const BatchMilestoneStatusModal: React.FC<BatchMilestoneStatusModalProps> = ({
  opened,
  onClose,
  milestones,
  action,
  onConfirm,
  providerName,
  initiatorName,
  isLoading = false,
}) => {
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);

  const isStarting = action === "start";

  // Calculate total amount for all milestones
  const totalAmount = useMemo(() => {
    return milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  }, [milestones]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (opened) {
      setAgreed(false);
      setSignature("");
      setError("");
      setShowPaymentScreen(false);
    }
  }, [opened, milestones]);

  const handleSubmit = async () => {
    if (milestones.length === 0) return;

    if (!agreed) {
      setError("You must agree to the terms to proceed");
      return;
    }

    if (!signature.trim()) {
      setError("Digital signature is required");
      return;
    }

    setError("");

    try {
      const milestoneIds = milestones.map((m) => m.id);
      await onConfirm(milestoneIds, action);
      // For starting milestones, show payment screen instead of closing
      if (isStarting) {
        setShowPaymentScreen(true);
      }
      // For completing milestones, parent component handles closing
    } catch (error) {
      console.error("Error confirming batch milestone status change:", error);
    }
  };

  const handleClose = () => {
    if (!isLoading && !showPaymentScreen) {
      onClose();
    }
  };

  const handleContinue = () => {
    // Reload page to fetch latest data
    window.location.reload();
  };

  const getActionText = () => {
    if (isStarting) return "start";
    return "complete";
  };

  const getActionTitle = () => {
    const count = milestones.length;
    if (isStarting) return `Start ${count} Milestone${count > 1 ? "s" : ""}`;
    return `Complete ${count} Milestone${count > 1 ? "s" : ""}`;
  };

  const getAgreementText = () => {
    const count = milestones.length;
    if (isStarting) {
      return `I confirm that I am ready to begin work on ${
        count > 1 ? "these " + count + " milestones" : "this milestone"
      } and understand the requirements and timeline.`;
    }
    return `I, ${providerName || initiatorName}, confirm that all work for ${
      count > 1 ? "these " + count + " milestones" : "this milestone"
    } has been completed according to the specified requirements and is ready for review.`;
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
      size="lg"
      radius="lg"
      centered
      closeOnClickOutside={!isLoading && !showPaymentScreen}
      closeOnEscape={!isLoading && !showPaymentScreen}
    >
      {milestones.length > 0 && (
        <div
          style={{
            position: "relative",
            minHeight: showPaymentScreen ? 350 : "auto",
          }}
        >
          {/* Form Screen */}
          <Transition
            mounted={!showPaymentScreen}
            transition="slide-right"
            duration={300}
            timingFunction="ease"
          >
            {(styles) => (
              <div style={styles}>
                <Stack gap="md">
                  {/* Milestones List */}
                  <Paper
                    p="md"
                    radius="md"
                    className="bg-gray-50 border border-gray-200"
                  >
                    <Group gap="sm" mb="sm" justify="space-between">
                      <Group gap="sm">
                        <FileText size={16} className="text-gray-600" />
                        <Text fw={600} size="sm">
                          Milestones to {getActionText()}
                        </Text>
                      </Group>
                      <Badge
                        size="sm"
                        variant="light"
                        color={isStarting ? "green" : "orange"}
                      >
                        {milestones.length} milestone
                        {milestones.length > 1 ? "s" : ""}
                      </Badge>
                    </Group>

                    <ScrollArea.Autosize mah={200}>
                      <Stack gap="xs">
                        {milestones.map((milestone, index) => (
                          <Paper
                            key={milestone.id}
                            p="sm"
                            radius="sm"
                            withBorder
                            className="bg-white"
                          >
                            <Group justify="space-between" align="flex-start">
                              <div style={{ flex: 1 }}>
                                <Group gap="xs" mb={4}>
                                  <Text size="xs" c="dimmed" fw={500}>
                                    #{index + 1}
                                  </Text>
                                  <Text
                                    fw={600}
                                    size="sm"
                                    className="text-gray-800"
                                  >
                                    {milestone.name}
                                  </Text>
                                </Group>
                                {milestone.description && (
                                  <Text size="xs" c="dimmed" lineClamp={1}>
                                    {milestone.description}
                                  </Text>
                                )}
                              </div>
                              {milestone.amount && (
                                <Badge size="sm" variant="light" color="gray">
                                  {formatCurrency(milestone.amount)}
                                </Badge>
                              )}
                            </Group>
                          </Paper>
                        ))}
                      </Stack>
                    </ScrollArea.Autosize>
                  </Paper>

                  {/* Payment Information Alert - Only show when starting milestones */}
                  {isStarting && totalAmount > 0 && (
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
                            {formatCurrency(totalAmount)}
                          </Text>{" "}
                          for{" "}
                          {milestones.length > 1
                            ? "these milestones"
                            : "this milestone"}
                          .
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
                            ⓘ Contract fee of KES 200 will be charged on your
                            first milestone.
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
                      You are about to {getActionText()}{" "}
                      {milestones.length > 1
                        ? `${milestones.length} milestones`
                        : "this milestone"}
                      . This action will update the milestone status and notify
                      relevant parties.
                    </Text>

                    {/* Agreement Checkbox */}
                    <Checkbox
                      checked={agreed}
                      onChange={(event) =>
                        setAgreed(event.currentTarget.checked)
                      }
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
                      onChange={(event) =>
                        setSignature(event.currentTarget.value)
                      }
                      disabled={isLoading}
                      error={
                        error && !signature.trim()
                          ? "Signature is required"
                          : ""
                      }
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
                      className={
                        isStarting ? "bg-keyman-green" : "bg-keyman-orange"
                      }
                      leftSection={
                        isStarting ? (
                          <Play size={16} />
                        ) : (
                          <CheckCircle size={16} />
                        )
                      }
                      onClick={handleSubmit}
                      loading={isLoading}
                      disabled={!agreed || !signature.trim()}
                    >
                      {isStarting
                        ? `Start ${milestones.length} Milestone${
                            milestones.length > 1 ? "s" : ""
                          }`
                        : `Complete ${milestones.length} Milestone${
                            milestones.length > 1 ? "s" : ""
                          }`}
                    </Button>
                  </Group>
                </Stack>
              </div>
            )}
          </Transition>

          {/* Payment Confirmation Screen */}
          <Transition
            mounted={showPaymentScreen}
            transition="slide-left"
            duration={300}
            timingFunction="ease"
          >
            {(styles) => (
              <div
                style={{
                  ...styles,
                  position: showPaymentScreen ? "relative" : "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                }}
              >
                <Stack gap="lg" align="center" py="xl">
                  {/* Success Animation */}
                  <ThemeIcon
                    size={80}
                    radius="xl"
                    variant="light"
                    color="green"
                    style={{
                      animation: "pulse 2s infinite",
                    }}
                  >
                    <CreditCard size={40} />
                  </ThemeIcon>

                  <Stack gap="xs" align="center">
                    <Text fw={700} size="xl" c="#3D6B2C" ta="center">
                      STK Payment Triggered!
                    </Text>
                    <Text size="sm" c="dimmed" ta="center" maw={300}>
                      A payment request of{" "}
                      <Text span fw={600} c="#3D6B2C">
                        {formatCurrency(totalAmount)}
                      </Text>{" "}
                      has been sent to your phone for{" "}
                      {milestones.length > 1
                        ? `${milestones.length} milestones`
                        : "this milestone"}
                      .
                    </Text>
                  </Stack>

                  {/* Payment Instructions */}
                  <Paper
                    p="md"
                    radius="md"
                    style={{
                      backgroundColor: "#F08C2315",
                      border: "1px solid #F08C2340",
                      width: "100%",
                    }}
                  >
                    <Stack gap="sm">
                      <Group gap="xs">
                        <Loader size="xs" color="#F08C23" />
                        <Text size="sm" fw={600} c="#F08C23">
                          Waiting for payment...
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed">
                        Please check your phone and enter your M-Pesa PIN to
                        complete the payment.
                      </Text>
                    </Stack>
                  </Paper>

                  {/* Continue Button */}
                  <Button
                    size="lg"
                    className="bg-keyman-green"
                    leftSection={<RefreshCw size={18} />}
                    onClick={handleContinue}
                    fullWidth
                    mt="md"
                  >
                    Continue
                  </Button>

                  <Text size="xs" c="dimmed" ta="center">
                    Click continue after completing the payment to see updated
                    status
                  </Text>
                </Stack>
              </div>
            )}
          </Transition>
        </div>
      )}
    </Modal>
  );
};

export default BatchMilestoneStatusModal;
