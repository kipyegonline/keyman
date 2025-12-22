"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Stack,
  Text,
  TextInput,
  Paper,
  Group,
  Title,
  ThemeIcon,
  Card,
  Loader,
  Alert,
  Divider,
  Image,
  Box,
  PinInput,
  Collapse,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  CreditCard,
  Phone,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Shield,
  Smartphone,
  Wallet,
} from "lucide-react";
import { payFullContract } from "@/api/contract";
import { confirmOTP } from "@/api/wallet";
import { notify } from "@/lib/notifications";

interface ContractPaymentModalProps {
  opened: boolean;
  onClose: () => void;
  contractId: string;
  contractTitle: string;
  amount: number;
  contractFee?: number;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
  initiatorWalletId?: string;
}

// Payment method configurations
const paymentMethods = {
  keyman_wallet: {
    label: "Keyman Wallet",
    icon: <Wallet size={24} className="text-keyman-orange" />,
    img: "/keyman-wallet.png",
    color: "#F08C23",
    description: "Pay from your wallet balance",
    regex: /^[a-zA-Z0-9]{6,}$/,
    placeholder: "",
  },
  mpesa: {
    label: "M-Pesa",
    icon: <Smartphone size={24} />,
    img: "/mpesa.png",
    color: "#00A651",
    description: "Pay with M-Pesa",
    regex: /^(254|07|01)[0-9]{8,9}$/,
    placeholder: "254712345678",
  },
  airtel_money: {
    label: "Airtel Money",
    img: "/airtelmoney.png",
    icon: <CreditCard size={24} />,
    color: "#FF0000",
    description: "Pay with Airtel Money",
    regex: /^(254|07|01)[0-9]{8,9}$/,
    placeholder: "254733000000",
  },
  t_kash: {
    label: "T-Kash",
    img: "/tkash.png",
    icon: <Phone size={24} />,
    color: "#FF6B35",
    description: "Pay with T-Kash",
    regex: /^(254|07|01)[0-9]{8,9}$/,
    placeholder: "254712345678",
  },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

export default function ContractPaymentModal({
  opened,
  onClose,
  contractId,
  contractTitle,
  amount,
  contractFee = 200,
  onPaymentSuccess,
  onPaymentError,
  initiatorWalletId = "",
}: ContractPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [paymentStep, setPaymentStep] = useState<
    | "select"
    | "form"
    | "wallet_form"
    | "wallet_otp"
    | "processing"
    | "success"
    | "error"
  >("select");

  // Wallet-specific states
  const [useAlternateWallet, setUseAlternateWallet] = useState(false);
  const [alternateWalletId, setAlternateWalletId] = useState("");
  const [walletError, setWalletError] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);

  const totalAmount = amount + contractFee;

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

  // Get the active wallet ID (registered or alternate)
  const getActiveWalletId = () => {
    if (useAlternateWallet && alternateWalletId) {
      return alternateWalletId;
    }
    return initiatorWalletId;
  };

  const handleAlternateWalletChange = (value: string) => {
    setAlternateWalletId(value);
    if (value && !validateWalletId(value)) {
      setWalletError("Wallet ID must be at least 6 alphanumeric characters");
    } else {
      setWalletError("");
    }
  };

  const form = useForm({
    initialValues: {
      payment_method: "",
      phone_number: "",
    },
    validate: {
      payment_method: (value) =>
        !value ? "Please select a payment method" : null,
      phone_number: (value) => {
        if (!value) return "Phone number is required";
        const cleanNumber = value.replace(/\s+/g, "");
        const phoneRegex = /^(254|07|01)[0-9]{8,9}$/;
        return phoneRegex.test(cleanNumber)
          ? null
          : "Please enter a valid Kenyan phone number";
      },
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (opened) {
      form.reset();
      setSelectedMethod("");
      setPaymentStep("select");
      setUseAlternateWallet(false);
      setAlternateWalletId("");
      setWalletError("");
      setOtpValue("");
      setOtpError("");
      setOtpSuccess(false);
    }
  }, [opened]);

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    form.setFieldValue("payment_method", method);
    if (method === "keyman_wallet") {
      setPaymentStep("wallet_form");
    } else {
      setPaymentStep("form");
    }
  };

  const handleSubmit = async (values: {
    payment_method: string;
    phone_number: string;
  }) => {
    setLoading(true);
    setPaymentStep("processing");

    try {
      const response = await payFullContract(contractId, {
        amount: totalAmount,
        payment_method: values.payment_method,
        phone_number: values.phone_number,
      });

      if (response.status) {
        setPaymentStep("success");
        /* notify.success(response.message || "Payment initiated successfully!");
        setTimeout(() => {
          onPaymentSuccess?.(); 
          handleClose();
        }, 3000);*/
      } else {
        setPaymentStep("error");
        notify.error(response.message || "Payment failed");
        onPaymentError?.(response.message || "Payment failed");
      }
    } catch (error) {
      setPaymentStep("error");
      const errorMessage =
        error instanceof Error ? error.message : "Payment failed";
      notify.error(errorMessage);
      onPaymentError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedMethod("");
    setPaymentStep("select");
    setLoading(false);
    setUseAlternateWallet(false);
    setAlternateWalletId("");
    setWalletError("");
    setOtpValue("");
    setOtpError("");
    setOtpSuccess(false);
    onClose();
  };

  const handleBack = () => {
    if (paymentStep === "wallet_otp") {
      setPaymentStep("wallet_form");
      setOtpValue("");
      setOtpError("");
    } else if (paymentStep === "wallet_form" || paymentStep === "form") {
      setPaymentStep("select");
      setSelectedMethod("");
      form.setFieldValue("payment_method", "");
      setUseAlternateWallet(false);
      setAlternateWalletId("");
      setWalletError("");
    } else {
      setPaymentStep("select");
      setSelectedMethod("");
      form.setFieldValue("payment_method", "");
    }
  };

  // Handle proceeding from wallet form to OTP - calls payFullContract first
  const handleWalletProceed = async () => {
    const activeWalletId = getActiveWalletId();
    if (!activeWalletId) {
      setWalletError("Please enter a valid wallet ID");
      return;
    }
    if (useAlternateWallet && !validateWalletId(alternateWalletId)) {
      setWalletError("Wallet ID must be at least 6 alphanumeric characters");
      return;
    }

    setIsWalletLoading(true);
    setWalletError("");

    try {
      // Call payFullContract with wallet_id to initiate payment and trigger OTP
      const response = await payFullContract(contractId, {
        amount: totalAmount,
        payment_method: "wallet",
        wallet_id: activeWalletId,
      });
      console.log(response, "sponx");
      if (response.status) {
        // Payment initiated, OTP sent - proceed to OTP verification
        setPaymentStep("wallet_otp");
        setOtpValue("");
        setOtpError("");
        notify.success(
          response.message || "OTP sent to your registered phone number"
        );
      } else {
        setWalletError(
          response.message || "Failed to initiate payment. Please try again."
        );
        notify.error(response.message || "Failed to initiate payment");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to initiate payment";
      setWalletError(errorMessage);
    } finally {
      setIsWalletLoading(false);
    }
  };

  // Handle OTP submission for wallet payment - confirms OTP to complete payment
  const handleWalletOtpSubmit = async () => {
    if (otpValue.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsOtpLoading(true);
    setOtpError("");

    try {
      const activeWalletId = getActiveWalletId();
      // confirmOTP takes (otp, businessId?, phoneNumber?) - verify OTP to complete the payment
      const otpResponse = await confirmOTP(otpValue, activeWalletId);

      if (otpResponse.status) {
        setOtpSuccess(true);
        setPaymentStep("success");
        notify.success(otpResponse.message || "Payment successful!");
        setTimeout(() => {
          onPaymentSuccess?.();
          handleClose();
        }, 3000);
      } else {
        setOtpError(otpResponse.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "OTP verification failed";
      setOtpError(errorMessage);
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Render payment method selection
  const renderMethodSelection = () => (
    <Stack gap="md">
      <Paper p="md" className="bg-green-50 border border-green-200" radius="md">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Contract
          </Text>
          <Text size="sm" fw={500}>
            {contractTitle}
          </Text>
        </Group>
        <Divider my="sm" />
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Contract Amount
          </Text>
          <Text size="sm" fw={500}>
            {formatCurrency(amount)}
          </Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Contract Fee
          </Text>
          <Text size="sm" fw={500}>
            {formatCurrency(contractFee)}
          </Text>
        </Group>
        <Divider my="sm" />
        <Group justify="space-between">
          <Text size="sm" fw={600}>
            Total Amount
          </Text>
          <Text size="lg" fw={700} c="green">
            {formatCurrency(totalAmount)}
          </Text>
        </Group>
      </Paper>

      <Text size="sm" fw={500} c="dimmed">
        Select Payment Method
      </Text>

      <Stack gap="sm">
        {Object.entries(paymentMethods).map(([key, method], i) => (
          <Card
            key={key}
            padding="md"
            radius="md"
            withBorder
            className="cursor-pointer hover:border-orange-400 transition-all"
            onClick={() => handleMethodSelect(key)}
            style={{
              borderColor:
                selectedMethod === key
                  ? "#F08C23"
                  : "var(--mantine-color-gray-3)",
            }}
          >
            <Group>
              {i == 0 ? (
                method.icon
              ) : (
                <Image
                  src={method.img}
                  alt={method.label}
                  w={40}
                  h={40}
                  fit="contain"
                  fallbackSrc="/placeholder.png"
                />
              )}

              <div>
                <Text fw={500}>{method.label}</Text>
                <Text size="xs" c="dimmed">
                  {method.description}
                </Text>
              </div>
            </Group>
          </Card>
        ))}
      </Stack>
    </Stack>
  );

  // Render phone number form
  const renderPhoneForm = () => {
    const method =
      paymentMethods[selectedMethod as keyof typeof paymentMethods];

    return (
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Paper
            p="md"
            className="bg-green-50 border border-green-200"
            radius="md"
          >
            <Group justify="space-between">
              <Text size="sm" fw={600}>
                Total to Pay
              </Text>
              <Text size="lg" fw={700} c="green">
                {formatCurrency(totalAmount)}
              </Text>
            </Group>
          </Paper>

          <Card padding="md" radius="md" withBorder>
            <Group>
              <Image
                src={method?.img}
                alt={method?.label}
                w={40}
                h={40}
                fit="contain"
                fallbackSrc="/placeholder.png"
              />
              <div>
                <Text fw={500}>{method?.label}</Text>
                <Text size="xs" c="dimmed">
                  Selected payment method
                </Text>
              </div>
            </Group>
          </Card>

          <TextInput
            label="Phone Number"
            placeholder={method?.placeholder || "254712345678"}
            leftSection={<Phone size={16} />}
            {...form.getInputProps("phone_number")}
            description="Enter the phone number linked to your mobile money account"
          />

          <Alert
            icon={<Shield size={16} />}
            color="blue"
            variant="light"
            radius="md"
          >
            <Text size="xs">
              Your payment is secure. You will receive a prompt on your phone to
              complete the transaction.
            </Text>
          </Alert>

          <Group justify="space-between" mt="md">
            <Button variant="subtle" color="gray" onClick={handleBack}>
              Back
            </Button>
            <Button
              type="submit"
              loading={loading}
              style={{ backgroundColor: "#F08C23" }}
            >
              Pay {formatCurrency(totalAmount)}
            </Button>
          </Group>
        </Stack>
      </form>
    );
  };

  // Render wallet form (wallet selection)
  const renderWalletForm = () => {
    const activeWalletId = getActiveWalletId();
    const hasValidWallet = activeWalletId && validateWalletId(activeWalletId);

    return (
      <Stack gap="md">
        <Paper
          p="md"
          className="bg-green-50 border border-green-200"
          radius="md"
        >
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              Total to Pay
            </Text>
            <Text size="lg" fw={700} c="green">
              {formatCurrency(totalAmount)}
            </Text>
          </Group>
        </Paper>

        <Card padding="md" radius="md" withBorder>
          <Group>
            <ThemeIcon size={40} radius="md" color="orange" variant="light">
              <Wallet size={24} />
            </ThemeIcon>
            <div>
              <Text fw={500}>Keyman Wallet</Text>
              <Text size="xs" c="dimmed">
                Pay from your wallet balance
              </Text>
            </div>
          </Group>
        </Card>

        {/* Show registered wallet if available */}
        {initiatorWalletId && (
          <Paper p="md" withBorder radius="md">
            <Group justify="space-between" align="center">
              <div>
                <Text size="sm" c="dimmed">
                  Registered Wallet
                </Text>
                <Text fw={600}>{maskWalletId(initiatorWalletId)}</Text>
              </div>
              {!useAlternateWallet && (
                <ThemeIcon size="sm" radius="xl" color="green" variant="light">
                  <CheckCircle size={14} />
                </ThemeIcon>
              )}
            </Group>
            <Button
              variant="subtle"
              size="xs"
              mt="sm"
              onClick={() => setUseAlternateWallet(!useAlternateWallet)}
            >
              {useAlternateWallet
                ? "Use Registered Wallet"
                : "Use Different Wallet"}
            </Button>
          </Paper>
        )}

        {/* Alternate wallet input */}
        <Collapse in={useAlternateWallet || !initiatorWalletId}>
          <TextInput
            label="Wallet ID"
            placeholder="Enter your Keyman Wallet ID"
            leftSection={<Wallet size={16} />}
            value={alternateWalletId}
            onChange={(e) => handleAlternateWalletChange(e.target.value)}
            error={walletError}
            description="Enter your Keyman Wallet ID to proceed"
          />
        </Collapse>
        {walletError && (
          <Alert color="red" variant="light" radius="md" w="100%">
            <Text size="sm">{walletError}</Text>
          </Alert>
        )}

        <Alert
          icon={<Shield size={16} />}
          color="blue"
          variant="light"
          radius="md"
        >
          <Text size="xs">
            You will receive an OTP on your registered phone number to verify
            this transaction.
          </Text>
        </Alert>

        <Group justify="space-between" mt="md">
          <Button
            variant="subtle"
            color="gray"
            onClick={handleBack}
            disabled={isWalletLoading}
          >
            Back
          </Button>
          <Button
            onClick={handleWalletProceed}
            disabled={!hasValidWallet || isWalletLoading}
            loading={isWalletLoading}
            style={{
              backgroundColor:
                hasValidWallet && !isWalletLoading ? "#F08C23" : undefined,
            }}
          >
            Proceed to Verify
          </Button>
        </Group>
      </Stack>
    );
  };

  // Render wallet OTP verification
  const renderWalletOtp = () => {
    const activeWalletId = getActiveWalletId();

    return (
      <Stack gap="md" align="center">
        <ThemeIcon size={60} radius="xl" color="orange" variant="light">
          <Shield size={32} />
        </ThemeIcon>

        <Text fw={600} size="lg" ta="center">
          Verify Your Wallet
        </Text>

        <Text size="sm" c="dimmed" ta="center">
          Enter the 6-digit OTP sent to your registered phone number for wallet{" "}
          <Text component="span" fw={600}>
            {maskWalletId(activeWalletId)}
          </Text>
        </Text>

        <Paper
          p="md"
          className="bg-green-50 border border-green-200"
          radius="md"
          w="100%"
        >
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              Amount to Pay
            </Text>
            <Text size="lg" fw={700} c="green">
              {formatCurrency(totalAmount)}
            </Text>
          </Group>
        </Paper>

        <PinInput
          length={6}
          type="number"
          value={otpValue}
          onChange={(value) => {
            setOtpValue(value);
            setOtpError("");
          }}
          error={!!otpError}
          size="lg"
          oneTimeCode
        />

        {otpError && (
          <Alert color="red" variant="light" radius="md" w="100%">
            <Text size="sm">{otpError}</Text>
          </Alert>
        )}

        {otpSuccess && (
          <Alert color="green" variant="light" radius="md" w="100%">
            <Group gap="xs">
              <CheckCircle size={16} />
              <Text size="sm">OTP verified! Processing payment...</Text>
            </Group>
          </Alert>
        )}

        <Group justify="space-between" mt="md" w="100%">
          <Button
            variant="subtle"
            color="gray"
            onClick={handleBack}
            disabled={isOtpLoading}
          >
            Back
          </Button>
          <Button
            onClick={handleWalletOtpSubmit}
            loading={isOtpLoading}
            disabled={otpValue.length !== 6}
            style={{
              backgroundColor: otpValue.length === 6 ? "#F08C23" : undefined,
            }}
          >
            Verify & Pay
          </Button>
        </Group>
      </Stack>
    );
  };

  // Render processing state
  const renderProcessing = () => (
    <Stack align="center" gap="md" py="xl">
      <Loader size="lg" color="orange" />
      <Text fw={500}>Processing your payment...</Text>
      <Text size="sm" c="dimmed" ta="center">
        Please check your phone for the payment prompt and enter your PIN to
        complete the transaction.
      </Text>
    </Stack>
  );

  // Render success state
  const renderSuccess = () => (
    <Stack align="center" gap="md" py="xl">
      <ThemeIcon size={60} radius="xl" color="green">
        <CheckCircle size={32} />
      </ThemeIcon>
      <Text fw={600} size="lg">
        Payment Initiated!
      </Text>
      <Text size="sm" c="dimmed" ta="center">
        Your payment has been initiated successfully. Please complete the
        transaction on your phone.
      </Text>
      <Button onClick={() => location.reload()} py="md">
        Continue
      </Button>
    </Stack>
  );

  // Render error state
  const renderError = () => (
    <Stack align="center" gap="md" py="xl">
      <ThemeIcon size={60} radius="xl" color="red">
        <AlertCircle size={32} />
      </ThemeIcon>
      <Text fw={600} size="lg">
        Payment Failed
      </Text>
      <Text size="sm" c="dimmed" ta="center">
        There was an issue processing your payment. Please try again.
      </Text>
      <Button
        variant="light"
        color="orange"
        onClick={() => setPaymentStep("select")}
      >
        Try Again
      </Button>
    </Stack>
  );

  const renderContent = () => {
    switch (paymentStep) {
      case "select":
        return renderMethodSelection();
      case "form":
        return renderPhoneForm();
      case "wallet_form":
        return renderWalletForm();
      case "wallet_otp":
        return renderWalletOtp();
      case "processing":
        return renderProcessing();
      case "success":
        return renderSuccess();
      case "error":
        return renderError();
      default:
        return renderMethodSelection();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <ThemeIcon
            size="lg"
            style={{ backgroundColor: "#F08C2315" }}
            variant="light"
          >
            <DollarSign
              size={20}
              style={{ color: "#F08C23", display: "none" }}
            />
          </ThemeIcon>
          <Title order={3} className="text-gray-800">
            Pay Full Contract
          </Title>
        </Group>
      }
      size="md"
      centered
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <Box py="md">{renderContent()}</Box>
    </Modal>
  );
}
