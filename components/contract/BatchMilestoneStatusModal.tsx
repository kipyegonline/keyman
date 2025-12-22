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
  Radio,
  Collapse,
  Box,
  PinInput,
} from "@mantine/core";
import {
  Play,
  CheckCircle,
  X,
  FileText,
  CreditCard,
  RefreshCw,
  Smartphone,
  Wallet,
  Shield,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { confirmOTP } from "@/api/wallet";

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
  onConfirm: (
    milestoneIds: string[],
    action: string,
    paymentMethod?: string,
    phoneNumber?: string,
    walletId?: string
  ) => Promise<void>;
  providerName?: string;
  initiatorName?: string;
  isLoading?: boolean;
  initiatorPhone?: string;
  initiatorWalletId?: string;
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
  initiatorPhone = "",
  initiatorWalletId = "",
}) => {
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  // Unified screen state: "form" | "mobile_payment" | "wallet_otp"
  const [currentScreen, setCurrentScreen] = useState<
    "form" | "mobile_payment" | "wallet_otp"
  >("form");
  const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "wallet">(
    "wallet"
  );
  const [useAlternateNumber, setUseAlternateNumber] = useState(false);
  const [alternatePhone, setAlternatePhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [useAlternateWallet, setUseAlternateWallet] = useState(false);
  const [alternateWalletId, setAlternateWalletId] = useState("");
  const [walletError, setWalletError] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);

  const isStarting = action === "start";

  // Calculate total amount for all milestones
  const totalAmount = useMemo(() => {
    return milestones.reduce((sum, m) => sum + Number(m.amount || 0), 0);
  }, [milestones]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (opened) {
      setAgreed(false);
      setSignature("");
      setError("");
      setCurrentScreen("form");
      setPaymentMethod("wallet");
      setUseAlternateNumber(false);
      setAlternatePhone("");
      setPhoneError("");
      setUseAlternateWallet(false);
      setAlternateWalletId("");
      setWalletError("");
      setOtpValue("");
      setOtpError("");
      setOtpSuccess(false);
    }
  }, [opened, milestones]);

  // Mask phone number for privacy (e.g., "******789")
  const maskPhoneNumber = (phone: string) => {
    if (!phone || phone.length < 3) return "******";
    const lastThree = phone.slice(-3);
    return `******${lastThree}`;
  };

  // Validate Kenyan phone number
  const validatePhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\s/g, "");
    // Kenyan phone: 07XXXXXXXX, 01XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX
    const kenyanPhoneRegex = /^(?:(?:\+?254|0)(?:7|1)\d{8})$/;
    return kenyanPhoneRegex.test(cleanPhone);
  };

  const handleAlternatePhoneChange = (value: string) => {
    setAlternatePhone(value);
    if (value && !validatePhoneNumber(value)) {
      setPhoneError("Please enter a valid Kenyan phone number");
    } else {
      setPhoneError("");
    }
  };

  // Get the active phone number for payment
  const getActivePhoneNumber = () => {
    if (useAlternateNumber && alternatePhone) {
      return alternatePhone;
    }
    return initiatorPhone;
  };

  // Mask wallet ID for privacy (e.g., "******123")
  const maskWalletId = (walletId: string) => {
    if (!walletId || walletId.length < 3) return "******";
    const lastThree = walletId?.slice(-3);
    const firstThree = walletId?.slice(0, 3);
    return `${firstThree}******${lastThree}`;
  };

  // Validate wallet ID (alphanumeric, min 6 characters)
  const validateWalletId = (walletId: string) => {
    const cleanWalletId = walletId.trim();
    return cleanWalletId.length >= 6 && /^[a-zA-Z0-9]+$/.test(cleanWalletId);
  };

  const handleAlternateWalletChange = (value: string) => {
    setAlternateWalletId(value);
    if (value && !validateWalletId(value)) {
      setWalletError("Wallet ID must be at least 6 alphanumeric characters");
    } else {
      setWalletError("");
    }
  };

  // Get the active wallet ID for payment
  const getActiveWalletId = () => {
    if (useAlternateWallet && alternateWalletId) {
      return alternateWalletId;
    }
    return initiatorWalletId;
  };

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

    // Validate phone number if using alternate number with mobile money
    if (isStarting && paymentMethod === "mobile_money" && useAlternateNumber) {
      if (!alternatePhone.trim()) {
        setPhoneError("Please enter a phone number");
        return;
      }
      if (!validatePhoneNumber(alternatePhone)) {
        setPhoneError("Please enter a valid Kenyan phone number");
        return;
      }
    }

    // Validate wallet ID if using alternate wallet
    if (isStarting && paymentMethod === "wallet" && useAlternateWallet) {
      if (!alternateWalletId.trim()) {
        setWalletError("Please enter a wallet ID");
        return;
      }
      if (!validateWalletId(alternateWalletId)) {
        setWalletError("Wallet ID must be at least 6 alphanumeric characters");
        return;
      }
    }

    setError("");

    try {
      const milestoneIds = milestones.map((m) => m.id);
      const phoneToUse =
        isStarting && paymentMethod === "mobile_money"
          ? getActivePhoneNumber()
          : undefined;
      const walletToUse =
        isStarting && paymentMethod === "wallet"
          ? getActiveWalletId()
          : undefined;
      await onConfirm(
        milestoneIds,
        action,
        isStarting ? paymentMethod : undefined,
        phoneToUse,
        walletToUse
      );
      // For starting milestones, show appropriate screen based on payment method
      if (isStarting) {
        if (paymentMethod === "mobile_money") {
          setCurrentScreen("mobile_payment");
        } else if (paymentMethod === "wallet") {
          setCurrentScreen("wallet_otp");
        }
      }
      // For completing milestones, parent component handles closing
    } catch (error) {
      console.error("Error confirming batch milestone status change:", error);
    }
  };

  const handleClose = () => {
    if (!isLoading && !isOtpLoading) {
      onClose();
    }
  };

  const handleContinue = () => {
    // Reload page to fetch latest data
    window.location.reload();
  };

  const handleOtpSubmit = async () => {
    if (!otpValue || otpValue.length !== 4) {
      setOtpError("Please enter a valid 4-digit OTP");
      return;
    }

    setOtpError("");
    setIsOtpLoading(true);

    try {
      const walletId = getActiveWalletId();
      const response = await confirmOTP(otpValue, undefined, walletId);

      if (response.status) {
        setOtpSuccess(true);
        // Wait 2 seconds then reload page
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setOtpError(response.message || "Invalid OTP. Please try again.");
        setOtpValue("");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setOtpError("Failed to verify OTP. Please try again.");
      setOtpValue("");
    } finally {
      setIsOtpLoading(false);
    }
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
      closeOnClickOutside={!isLoading && currentScreen === "form"}
      closeOnEscape={!isLoading && currentScreen === "form"}
    >
      {milestones.length > 0 && (
        <div
          style={{
            position: "relative",
            minHeight: currentScreen !== "form" ? 350 : "auto",
          }}
        >
          {/* Form Screen */}
          <Transition
            mounted={currentScreen === "form"}
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
                      <Stack gap="md">
                        <Text size="sm" c="dimmed">
                          Amount to pay:{" "}
                          <Text span fw={600} c="#3D6B2C">
                            {formatCurrency(totalAmount)}
                          </Text>{" "}
                          for{" "}
                          {milestones.length > 1
                            ? "these milestones"
                            : "this milestone"}
                        </Text>

                        {/* Payment Method Selection */}
                        <Radio.Group
                          value={paymentMethod}
                          onChange={(value) =>
                            setPaymentMethod(value as "mobile_money" | "wallet")
                          }
                          name="paymentMethod"
                        >
                          <Stack gap="sm">
                            {/* Wallet Option */}
                            <Paper
                              p="sm"
                              radius="md"
                              withBorder
                              style={{
                                borderColor:
                                  paymentMethod === "wallet"
                                    ? "#F08C23"
                                    : "#e0e0e0",
                                backgroundColor:
                                  paymentMethod === "wallet"
                                    ? "#F08C2308"
                                    : "white",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                              onClick={() => setPaymentMethod("wallet")}
                            >
                              <Group justify="space-between">
                                <Group gap="sm">
                                  <ThemeIcon
                                    size={36}
                                    radius="md"
                                    variant="light"
                                    color="orange"
                                  >
                                    <Wallet size={20} />
                                  </ThemeIcon>
                                  <div>
                                    <Text size="sm" fw={600}>
                                      Keyman Wallet
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                      Pay from your wallet balance
                                    </Text>
                                  </div>
                                </Group>
                                <Radio value="wallet" color="orange" />
                              </Group>
                            </Paper>

                            {/* Wallet Details - Collapsible */}
                            <Collapse in={paymentMethod === "wallet"}>
                              <Box
                                pl="md"
                                py="sm"
                                style={{
                                  borderLeft: "3px solid #F08C23",
                                  marginLeft: "8px",
                                }}
                              >
                                <Stack gap="xs">
                                  {!useAlternateWallet ? (
                                    <>
                                      <Text size="sm" c="dimmed">
                                        Payment will be deducted from:
                                      </Text>
                                      <Group gap="xs">
                                        <Text size="sm" fw={600} c="#F08C23">
                                          Wallet:{" "}
                                          {maskWalletId(initiatorWalletId)}
                                        </Text>
                                      </Group>
                                      <Text
                                        size="xs"
                                        c="blue"
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                          setUseAlternateWallet(true)
                                        }
                                      >
                                        Use another wallet
                                      </Text>
                                    </>
                                  ) : (
                                    <>
                                      <TextInput
                                        placeholder="Enter wallet ID"
                                        value={alternateWalletId}
                                        onChange={(e) =>
                                          handleAlternateWalletChange(
                                            e.currentTarget.value
                                          )
                                        }
                                        error={walletError}
                                        size="sm"
                                        leftSection={<Wallet size={16} />}
                                      />
                                      <Text
                                        size="xs"
                                        c="blue"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                          setUseAlternateWallet(false);
                                          setAlternateWalletId("");
                                          setWalletError("");
                                        }}
                                      >
                                        Use registered wallet (
                                        {maskWalletId(initiatorWalletId)})
                                      </Text>
                                    </>
                                  )}
                                </Stack>
                              </Box>
                            </Collapse>
                            {/* Mobile Money Option */}
                            <Paper
                              p="sm"
                              radius="md"
                              withBorder
                              style={{
                                borderColor:
                                  paymentMethod === "mobile_money"
                                    ? "#3D6B2C"
                                    : "#e0e0e0",
                                backgroundColor:
                                  paymentMethod === "mobile_money"
                                    ? "#3D6B2C08"
                                    : "white",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                              onClick={() => setPaymentMethod("mobile_money")}
                            >
                              <Group justify="space-between">
                                <Group gap="sm">
                                  <ThemeIcon
                                    size={36}
                                    radius="md"
                                    variant="light"
                                    color="green"
                                  >
                                    <Smartphone size={20} />
                                  </ThemeIcon>
                                  <div>
                                    <Text size="sm" fw={600}>
                                      Mobile Money
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                      Pay via M-Pesa
                                    </Text>
                                  </div>
                                </Group>
                                <Radio value="mobile_money" color="green" />
                              </Group>
                            </Paper>

                            {/* Mobile Money Details - Collapsible */}
                            <Collapse in={paymentMethod === "mobile_money"}>
                              <Box
                                pl="md"
                                py="sm"
                                style={{
                                  borderLeft: "3px solid #3D6B2C",
                                  marginLeft: "8px",
                                }}
                              >
                                <Stack gap="xs">
                                  {!useAlternateNumber ? (
                                    <>
                                      <Text size="sm" c="dimmed">
                                        Payment will be sent to:
                                      </Text>
                                      <Group gap="xs">
                                        <Text size="sm" fw={600} c="#3D6B2C">
                                          {maskPhoneNumber(initiatorPhone)}
                                        </Text>
                                      </Group>
                                      <Text
                                        size="xs"
                                        c="blue"
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                          setUseAlternateNumber(true)
                                        }
                                      >
                                        Use another number
                                      </Text>
                                    </>
                                  ) : (
                                    <>
                                      <TextInput
                                        placeholder="Enter phone number (e.g., 0712345678)"
                                        value={alternatePhone}
                                        onChange={(e) =>
                                          handleAlternatePhoneChange(
                                            e.currentTarget.value
                                          )
                                        }
                                        error={phoneError}
                                        size="sm"
                                        leftSection={<Smartphone size={16} />}
                                      />
                                      <Text
                                        size="xs"
                                        c="blue"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                          setUseAlternateNumber(false);
                                          setAlternatePhone("");
                                          setPhoneError("");
                                        }}
                                      >
                                        Use registered number (
                                        {maskPhoneNumber(initiatorPhone)})
                                      </Text>
                                    </>
                                  )}
                                </Stack>
                              </Box>
                            </Collapse>
                          </Stack>
                        </Radio.Group>

                        <Paper
                          p="xs"
                          radius="sm"
                          style={{
                            backgroundColor: "#F08C2315",
                            border: "1px solid #F08C2340",
                          }}
                        >
                          <Text size="xs" fw={500} c="#F08C23">
                            ⓘ One time contract fee of KES 200 will be charged
                            on your first milestone.
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
            mounted={currentScreen === "mobile_payment"}
            transition="slide-left"
            duration={300}
            timingFunction="ease"
          >
            {(styles) => (
              <div
                style={{
                  ...styles,
                  position:
                    currentScreen === "mobile_payment"
                      ? "relative"
                      : "absolute",
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

          {/* Wallet OTP Verification Screen */}
          <Transition
            mounted={currentScreen === "wallet_otp"}
            transition="slide-left"
            duration={300}
            timingFunction="ease"
          >
            {(styles) => (
              <div
                style={{
                  ...styles,
                  position:
                    currentScreen === "wallet_otp" ? "relative" : "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                }}
              >
                {!otpSuccess ? (
                  <Stack gap="lg" align="center" py="xl">
                    {/* OTP Icon */}
                    <ThemeIcon
                      size={80}
                      radius="xl"
                      variant="light"
                      color="orange"
                      style={{
                        animation: "pulse 2s infinite",
                      }}
                    >
                      <Shield size={40} />
                    </ThemeIcon>

                    <Stack gap="xs" align="center">
                      <Text fw={700} size="xl" c="#F08C23" ta="center">
                        OTP Verification
                      </Text>
                      <Text size="sm" c="dimmed" ta="center" maw={300}>
                        An OTP code has been sent to the phone number associated
                        with wallet{" "}
                        <Text span fw={600} c="#F08C23">
                          {maskWalletId(getActiveWalletId())}
                        </Text>
                      </Text>
                    </Stack>

                    {/* OTP Input */}
                    <Box>
                      <Text size="sm" fw={500} mb="sm" ta="center">
                        Enter 4-digit OTP
                      </Text>
                      <PinInput
                        size="lg"
                        length={4}
                        value={otpValue}
                        onChange={setOtpValue}
                        placeholder="○"
                        type="number"
                        disabled={isOtpLoading}
                        error={!!otpError}
                        style={{ display: "flex", justifyContent: "center" }}
                      />
                      {otpError && (
                        <Text size="xs" c="red" ta="center" mt="xs">
                          {otpError}
                        </Text>
                      )}
                    </Box>

                    {/* Confirm OTP Button */}
                    <Button
                      size="lg"
                      className="bg-keyman-orange"
                      leftSection={<Shield size={18} />}
                      onClick={handleOtpSubmit}
                      loading={isOtpLoading}
                      disabled={!otpValue || otpValue.length !== 4}
                      fullWidth
                      mt="md"
                    >
                      Confirm OTP
                    </Button>

                    <Text size="xs" c="dimmed" ta="center">
                      Didn&apos;t receive the code? Check your phone or try
                      again
                    </Text>
                  </Stack>
                ) : (
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
                      <CheckCircle size={40} />
                    </ThemeIcon>

                    <Stack gap="xs" align="center">
                      <Text fw={700} size="xl" c="#3D6B2C" ta="center">
                        Payment Successful!
                      </Text>
                      <Text size="sm" c="dimmed" ta="center" maw={300}>
                        Your wallet payment of{" "}
                        <Text span fw={600} c="#3D6B2C">
                          {formatCurrency(totalAmount)}
                        </Text>{" "}
                        for{" "}
                        {milestones.length > 1
                          ? `${milestones.length} milestones`
                          : "this milestone"}{" "}
                        has been processed successfully.
                      </Text>
                    </Stack>

                    {/* Loading indicator for redirect */}
                    <Paper
                      p="md"
                      radius="md"
                      style={{
                        backgroundColor: "#3D6B2C15",
                        border: "1px solid #3D6B2C40",
                        width: "100%",
                      }}
                    >
                      <Stack gap="sm" align="center">
                        <Group gap="xs">
                          <Loader size="xs" color="#3D6B2C" />
                          <Text size="sm" fw={600} c="#3D6B2C">
                            Redirecting...
                          </Text>
                        </Group>
                        <Text size="xs" c="dimmed">
                          Please wait while we update your milestone status.
                        </Text>
                      </Stack>
                    </Paper>
                  </Stack>
                )}
              </div>
            )}
          </Transition>
        </div>
      )}
    </Modal>
  );
};

export default BatchMilestoneStatusModal;
