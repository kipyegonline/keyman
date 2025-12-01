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
} from "lucide-react";
import { payFullContract } from "@/api/contract";
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
}

// Payment method configurations
const paymentMethods = {
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
}: ContractPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [paymentStep, setPaymentStep] = useState<
    "select" | "form" | "processing" | "success" | "error"
  >("select");

  const totalAmount = amount + contractFee;

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
    }
  }, [opened]);

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    form.setFieldValue("payment_method", method);
    setPaymentStep("form");
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
        notify.success(response.message || "Payment initiated successfully!");
        setTimeout(() => {
          onPaymentSuccess?.();
          handleClose();
        }, 3000);
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
    onClose();
  };

  const handleBack = () => {
    setPaymentStep("select");
    setSelectedMethod("");
    form.setFieldValue("payment_method", "");
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
        {Object.entries(paymentMethods).map(([key, method]) => (
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
              <Image
                src={method.img}
                alt={method.label}
                w={40}
                h={40}
                fit="contain"
                fallbackSrc="/placeholder.png"
              />
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
