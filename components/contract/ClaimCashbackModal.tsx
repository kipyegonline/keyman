"use client";
import {
  Modal,
  Group,
  Text,
  Stack,
  Button,
  Paper,
  Divider,
  TextInput,
  Transition,
  ThemeIcon,
  Radio,
  Collapse,
  Box,
  PinInput,
} from "@mantine/core";
import {
  CheckCircle,
  X,
  RefreshCw,
  Smartphone,
  Wallet,
  Shield,
  Gift,
} from "lucide-react";
import { useState, useEffect } from "react";
import { confirmOTP } from "@/api/wallet";
import MobileMoneyOperatorSelect from "@/components/ui/MobileMoneyOperatorSelect";

interface ClaimCashbackModalProps {
  opened: boolean;
  onClose: () => void;
  amount: number;
  contractCode: string | null;
  onConfirm: (
    amount: number,
    paymentMethod: string,
    phoneNumber?: string,
    walletId?: string,
    networkOperator?: string
  ) => Promise<void | string>;
  initiatorPhone?: string;
  initiatorWalletId?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

const ClaimCashbackModal: React.FC<ClaimCashbackModalProps> = ({
  opened,
  onClose,
  amount,
  contractCode,
  onConfirm,
  initiatorPhone = "",
  initiatorWalletId = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "wallet">(
    "wallet"
  );
  const [useAlternateNumber, setUseAlternateNumber] = useState(false);
  const [alternatePhone, setAlternatePhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [useAlternateWallet, setUseAlternateWallet] = useState(false);
  const [alternateWalletId, setAlternateWalletId] = useState("");
  const [walletError, setWalletError] = useState("");
  const [networkOperator, setNetworkOperator] = useState<string | null>(
    "mpesa"
  );
  // Unified screen state: "form" | "mobile_otp" | "wallet_otp" | "success"
  const [currentScreen, setCurrentScreen] = useState<
    "form" | "mobile_otp" | "wallet_otp" | "success"
  >("form");
  const [otpValue, setOtpValue] = useState("");
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [txId, setTxId] = useState("");

  // Mask phone number for privacy (e.g., "0712***789")
  const maskPhoneNumber = (phone: string) => {
    if (!phone || phone.length < 3) return "******";
    const lastThree = phone.slice(-3);
    const firstFour = phone.slice(0, 4);
    return `${firstFour}***${lastThree}`;
  };

  // Validate Kenyan phone number
  const validatePhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\s/g, "");
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

  // Mask wallet ID for privacy (e.g., "KEY******123")
  const maskWalletId = (walletId: string) => {
    if (!walletId || walletId.length < 6) return "******";
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

  // Reset form when modal opens
  useEffect(() => {
    if (opened) {
      setCurrentScreen("form");
      setPaymentMethod("wallet");
      setUseAlternateNumber(false);
      setAlternatePhone("");
      setPhoneError("");
      setUseAlternateWallet(false);
      setAlternateWalletId("");
      setWalletError("");
      setNetworkOperator("mpesa");
      setOtpValue("");
      setOtpError("");
      setOtpSuccess(false);
      setTxId("");
    }
  }, [opened]);

  const handleSubmit = async () => {
    // Validate phone number if using alternate number with mobile money
    if (paymentMethod === "mobile_money" && useAlternateNumber) {
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
    if (paymentMethod === "wallet" && useAlternateWallet) {
      if (!alternateWalletId.trim()) {
        setWalletError("Please enter a wallet ID");
        return;
      }
      if (!validateWalletId(alternateWalletId)) {
        setWalletError("Wallet ID must be at least 6 alphanumeric characters");
        return;
      }
    }

    setIsLoading(true);

    try {
      const phoneToUse =
        paymentMethod === "mobile_money" ? getActivePhoneNumber() : undefined;
      const walletToUse =
        paymentMethod === "wallet" ? getActiveWalletId() : undefined;
      const operatorToUse =
        paymentMethod === "mobile_money"
          ? networkOperator ?? undefined
          : undefined;

      const result = await onConfirm(
        amount,
        paymentMethod,
        phoneToUse,
        walletToUse,
        operatorToUse
      );

      // Save txId from the response
      if (result) {
        setTxId(result as string);
      }

      // Show appropriate OTP screen based on payment method
      if (paymentMethod === "mobile_money") {
        setCurrentScreen("mobile_otp");
      } else if (paymentMethod === "wallet") {
        setCurrentScreen("wallet_otp");
      }
    } catch (error) {
      console.error("Error claiming cashback:", error);
    } finally {
      setIsLoading(false);
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
      // Use wallet ID for wallet payments, phone number for mobile money
      const accountId =
        paymentMethod === "wallet"
          ? getActiveWalletId()
          : getActivePhoneNumber();
      const response = await confirmOTP(otpValue, txId, accountId);

      if (response.status || response.success) {
        setOtpSuccess(true);
        setCurrentScreen("success");
        // Wait 2 seconds then reload the page
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

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <Gift size={20} className="text-keyman-orange" />
          <Text fw={600} size="lg">
            Referral Cashback
          </Text>
        </Group>
      }
      size="md"
      radius="lg"
      centered
      closeOnClickOutside={!isLoading && currentScreen === "form"}
      closeOnEscape={!isLoading && currentScreen === "form"}
    >
      <div
        style={{
          position: "relative",
          minHeight: currentScreen !== "form" ? 300 : "auto",
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
                {/* Cashback Information */}
                <Paper
                  p="md"
                  radius="md"
                  style={{
                    backgroundColor: "#F08C2315",
                    border: "1px solid #F08C2340",
                  }}
                >
                  <Stack gap="sm">
                    <Group gap="xs">
                      <Gift size={18} className="text-keyman-orange" />
                      <Text size="sm" fw={600} c="#F08C23">
                        Referral Cashback
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      You are about to send referral cashback for contract{" "}
                      <Text span fw={600} c="#F08C23">
                        {contractCode}
                      </Text>
                    </Text>
                    <Divider />
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Cashback Amount
                      </Text>
                      <Text size="xl" fw={700} c="#3D6B2C">
                        {formatCurrency(amount)}
                      </Text>
                    </Group>
                  </Stack>
                </Paper>

                {/* Payment Method Selection */}
                <Text size="sm" fw={600} c="dimmed">
                  Select how will transmit your cashback
                </Text>

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
                          paymentMethod === "wallet" ? "#F08C23" : "#e0e0e0",
                        backgroundColor:
                          paymentMethod === "wallet" ? "#F08C2308" : "white",
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
                              send via your wallet balance
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
                                Cashback will be sent to:
                              </Text>
                              <Group gap="xs">
                                <Text size="sm" fw={600} c="#F08C23">
                                  Wallet: {maskWalletId(initiatorWalletId)}
                                </Text>
                              </Group>
                              <Text
                                size="xs"
                                c="blue"
                                style={{ cursor: "pointer" }}
                                onClick={() => setUseAlternateWallet(true)}
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
                              send via Mobile Money
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
                        <Stack gap="sm">
                          {/* Mobile Money Operator Selection */}
                          <MobileMoneyOperatorSelect
                            value={networkOperator}
                            onChange={setNetworkOperator}
                            label="Select Operator"
                            required
                          />

                          {!useAlternateNumber ? (
                            <>
                              <Text size="sm" c="dimmed">
                                Cashback will be sent to:
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
                                onClick={() => setUseAlternateNumber(true)}
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
                    className="bg-keyman-orange"
                    leftSection={<Gift size={16} />}
                    onClick={handleSubmit}
                    loading={isLoading}
                  >
                    send {formatCurrency(amount)}
                  </Button>
                </Group>
              </Stack>
            </div>
          )}
        </Transition>

        {/* Mobile Money STK Push Screen */}
        <Transition
          mounted={currentScreen === "mobile_otp"}
          transition="slide-left"
          duration={300}
          timingFunction="ease"
        >
          {(styles) => (
            <div
              style={{
                ...styles,
                position:
                  currentScreen === "mobile_otp" ? "relative" : "absolute",
                top: 0,
                left: 0,
                right: 0,
              }}
            >
              <Stack gap="lg" align="center" py="xl">
                {/* Phone with notification icon */}
                <Box style={{ position: "relative" }}>
                  <ThemeIcon
                    size={80}
                    radius="xl"
                    variant="light"
                    color="green"
                    style={{
                      animation: "pulse 2s infinite",
                    }}
                  >
                    <Smartphone size={40} />
                  </ThemeIcon>
                  {/* Notification badge */}
                  <Box
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: "#F08C23",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(240, 140, 35, 0.4)",
                      animation: "pulse 1.5s infinite",
                    }}
                  >
                    <Text size="xs" c="white" fw={700}>
                      1
                    </Text>
                  </Box>
                </Box>

                <Stack gap="xs" align="center">
                  <Text fw={700} size="xl" c="#3D6B2C" ta="center">
                    Check Your Phone
                  </Text>
                  <Text size="sm" c="dimmed" ta="center" maw={300}>
                    A payment request has been sent to{" "}
                    <Text span fw={600} c="#3D6B2C">
                      {maskPhoneNumber(getActivePhoneNumber())}
                    </Text>
                  </Text>
                </Stack>

                {/* Instructions */}
                <Paper
                  p="md"
                  radius="md"
                  withBorder
                  style={{
                    backgroundColor: "#3D6B2C08",
                    borderColor: "#3D6B2C30",
                    width: "100%",
                  }}
                >
                  <Stack gap="sm">
                    <Group gap="sm" align="flex-start">
                      <ThemeIcon
                        size="sm"
                        radius="xl"
                        color="green"
                        variant="filled"
                      >
                        <Text size="xs" fw={700}>
                          1
                        </Text>
                      </ThemeIcon>
                      <Text size="sm" c="dimmed">
                        Open the payment prompt on your phone
                      </Text>
                    </Group>
                    <Group gap="sm" align="flex-start">
                      <ThemeIcon
                        size="sm"
                        radius="xl"
                        color="green"
                        variant="filled"
                      >
                        <Text size="xs" fw={700}>
                          2
                        </Text>
                      </ThemeIcon>
                      <Text size="sm" c="dimmed">
                        Enter your{" "}
                        <Text span fw={600} c="#3D6B2C">
                          Mobile Money PIN
                        </Text>{" "}
                        to confirm
                      </Text>
                    </Group>
                    <Group gap="sm" align="flex-start">
                      <ThemeIcon
                        size="sm"
                        radius="xl"
                        color="green"
                        variant="filled"
                      >
                        <Text size="xs" fw={700}>
                          3
                        </Text>
                      </ThemeIcon>
                      <Text size="sm" c="dimmed">
                        Wait for the confirmation SMS
                      </Text>
                    </Group>
                  </Stack>
                </Paper>

                {/* Loading spinner and status */}
                <Stack gap="sm" align="center">
                  <Group gap="xs">
                    <RefreshCw
                      size={18}
                      className="text-keyman-green"
                      style={{
                        animation: "spin 1.5s linear infinite",
                      }}
                    />
                    <Text size="sm" c="#3D6B2C" fw={500}>
                      Awaiting confirmation...
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed" ta="center">
                    Complete the payment on your phone, then click continue
                  </Text>
                </Stack>

                {/* Continue Button */}
                <Button
                  size="lg"
                  className="bg-keyman-green"
                  leftSection={<CheckCircle size={18} />}
                  onClick={() => {
                    setIsOtpLoading(true);
                    setTimeout(() => {
                      window.location.reload();
                    }, 3000);
                  }}
                  loading={isOtpLoading}
                  fullWidth
                  mt="md"
                >
                  {isOtpLoading ? "Please wait..." : "I have completed payment"}
                </Button>

                <Text size="xs" c="dimmed" ta="center">
                  Didn&apos;t receive the prompt? Check your phone or try again
                </Text>
              </Stack>

              {/* CSS for spin animation */}
              <style jsx global>{`
                @keyframes spin {
                  from {
                    transform: rotate(0deg);
                  }
                  to {
                    transform: rotate(360deg);
                  }
                }
              `}</style>
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
                    Didn&apos;t receive the code? Check your phone or try again
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
                      Cashback Claimed!
                    </Text>
                    <Text size="sm" c="dimmed" ta="center" maw={300}>
                      Your cashback of{" "}
                      <Text span fw={600} c="#3D6B2C">
                        {formatCurrency(amount)}
                      </Text>{" "}
                      has been added to your wallet successfully.
                    </Text>
                  </Stack>

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
                </Stack>
              )}
            </div>
          )}
        </Transition>

        {/* Success Screen */}
        <Transition
          mounted={currentScreen === "success"}
          transition="slide-left"
          duration={300}
          timingFunction="ease"
        >
          {(styles) => (
            <div
              style={{
                ...styles,
                position: currentScreen === "success" ? "relative" : "absolute",
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
                  <CheckCircle size={40} />
                </ThemeIcon>

                <Stack gap="xs" align="center">
                  <Text fw={700} size="xl" c="#3D6B2C" ta="center">
                    Cashback Claimed!
                  </Text>
                  <Text size="sm" c="dimmed" ta="center" maw={300}>
                    Your cashback of{" "}
                    <Text span fw={600} c="#3D6B2C">
                      {formatCurrency(amount)}
                    </Text>{" "}
                    has been processed successfully.
                  </Text>
                </Stack>

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
              </Stack>
            </div>
          )}
        </Transition>
      </div>
    </Modal>
  );
};

export default ClaimCashbackModal;
