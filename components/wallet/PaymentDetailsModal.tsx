"use client";
import {
  Modal,
  Button,
  Stack,
  Text,
  TextInput,
  Select,
  Paper,
  Group,
  Title,
  ThemeIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { CreditCard, Phone, DollarSign } from "lucide-react";

interface PaymentDetailsModalProps {
  opened: boolean;
  onClose: () => void;
  walletType: "personal" | "business";
  onSubmit: (data: {
    type: "personal" | "business";
    payment_method: string;
    phone_number: string;
  }) => void;
  isLoading?: boolean;
  success?: null | number;
}

const paymentMethods = [
  { value: "mpesa", label: "M-Pesa" },
  { value: "airtel_money", label: "Airtel Money" },
  { value: "t_kash", label: "T-Kash" },
];

export default function PaymentDetailsModal({
  opened,
  onClose,
  walletType,
  onSubmit,
  isLoading = false,
  success = null,
}: PaymentDetailsModalProps) {
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
        const phoneRegex = /^(\+254|254|07|01)\d{8,9}$/;
        return phoneRegex.test(value.replace(/\s+/g, ""))
          ? null
          : "Please enter a valid Kenyan phone number";
      },
    },
  });

  const handleSubmit = (values: {
    payment_method: string;
    phone_number: string;
  }) => {
    onSubmit({
      type: walletType,
      payment_method: values.payment_method,
      phone_number: values.phone_number,
    });
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Format based on length
    if (digits.startsWith("254")) {
      return `+${digits}`;
    } else if (digits.startsWith("07") || digits.startsWith("01")) {
      return digits;
    }

    return value;
  };
  const handleConfirmPayment = () => {
    setTimeout(() => {
      onClose();
      location.reload();
    }, 1000);
  };
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon
            size="lg"
            style={{ backgroundColor: "#3D6B2C15" }}
            variant="light"
          >
            <CreditCard size={20} style={{ color: "#3D6B2C" }} />
          </ThemeIcon>
          <Title order={3} className="text-gray-800">
            Payment Details
          </Title>
        </Group>
      }
      size="md"
      centered
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {/* Wallet Type Confirmation */}
          <Paper
            p="md"
            className="bg-blue-50 border border-blue-200"
            radius="md"
          >
            <Group gap="sm" mb="sm">
              <ThemeIcon
                size="sm"
                style={{
                  backgroundColor:
                    walletType === "personal" ? "#3D6B2C" : "#F08C23",
                }}
                variant="filled"
              >
                <DollarSign size={14} color="white" />
              </ThemeIcon>
              <Text fw={600} size="sm" className="text-blue-800">
                Wallet Type:{" "}
                {walletType === "personal" ? "Personal" : "Business"} Wallet
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              Complete the payment details to activate your {walletType} wallet
            </Text>
          </Paper>

          {/* Payment Method Selection */}
          <div>
            <Select
              label="Payment Method"
              placeholder="Select your preferred payment method"
              data={paymentMethods}
              required
              {...form.getInputProps("payment_method")}
              leftSection={<CreditCard size={16} />}
              description="Choose the mobile money service you want to use"
            />
          </div>

          {/* Phone Number Input */}
          <div>
            <TextInput
              label="Phone Number"
              placeholder="0712345678 or +254712345678"
              required
              {...form.getInputProps("phone_number")}
              leftSection={<Phone size={16} />}
              description="Enter the phone number linked to your selected payment method"
              onChange={(event) => {
                const formatted = formatPhoneNumber(event.currentTarget.value);
                form.setFieldValue("phone_number", formatted);
              }}
            />
          </div>

          {/* Payment Info */}
          <Paper
            p="md"
            className="bg-orange-50 border border-orange-200"
            radius="md"
          >
            <Text size="sm" fw={500} className="text-orange-800 mb-2">
              Payment Instructions
            </Text>
            <div className="space-y-1">
              <Text size="sm" c="dimmed">
                • You will receive an STK push notification
              </Text>
              <Text size="sm" c="dimmed">
                • Complete the payment to activate your wallet
              </Text>
            </div>
          </Paper>

          {/* Action Buttons */}
          <Group justify="space-between" mt="lg">
            <Button
              variant="light"
              onClick={onClose}
              disabled={isLoading}
              color="gray"
            >
              Cancel
            </Button>

            {success && success === 1 ? (
              <Button onClick={handleConfirmPayment}>Complete payment</Button>
            ) : (
              <p></p>
            )}
            {success && success === 0 && (
              <Text size="sm" color="red">
                Failed to trigger payment. Check number and try again.
              </Text>
            )}
            {success !== 1 && (
              <Button
                type="submit"
                loading={isLoading}
                style={{ backgroundColor: "#3D6B2C" }}
                className="hover:opacity-90"
                disabled={
                  !form.values.payment_method || !form.values.phone_number
                }
              >
                {isLoading ? "Processing..." : "Proceed with Payment"}
              </Button>
            )}
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
