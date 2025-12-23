"use client";
import {
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Text,
  Alert,
  PinInput,
  Card,
  Transition,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowUpRight,
  User,
  AlertTriangle,
  Shield,
  //Wallet,
  Smartphone,
  Building2,
  Link as LinkIcon,
} from "lucide-react";
import { notifications } from "@mantine/notifications";
import { notify } from "@/lib/notifications";
import { generalTransfer, confirmOTP } from "@/api/wallet";

interface TransferResponse {
  status: boolean;
  message?: string;
  transaction_id?: string;
  [key: string]: string | number | boolean | undefined;
}

interface GeneralTransferProps {
  walletData: {
    currency: string;
    balance: string;
    accountId: string;
  };
  onClose: () => void;
  onBack: () => void;
}

// Transfer type configurations
const transferTypeOptions = [
  /*{
    value: "wallet",
    label: "Wallet Transfer",
    icon: <Wallet size={16} />,
    description: "Send to another wallet instantly",
    placeholder: "Enter wallet ID",
  }*/ {
    value: "mpesa",
    label: "M-Pesa",
    icon: <Smartphone size={16} />,
    description: "Send to M-Pesa mobile number",
    placeholder: "254712345678",
  },
  {
    value: "airtel",
    label: "Airtel Money",
    icon: <Smartphone size={16} />,
    description: "Send to Airtel Money mobile number",
    placeholder: "254733000000",
  },
  {
    value: "choice_bank",
    label: "Choice Bank",
    icon: <Building2 size={16} />,
    description: "Send to Choice Bank account (requires bank code)",
    placeholder: "Enter bank account number",
  },
  {
    value: "pesa_link",
    label: "PesaLink",
    icon: <LinkIcon size={16} />,
    description: "Send via PesaLink (KES only, max 999,999)",
    placeholder: "Enter PesaLink account ID",
    limitations: [
      "Domestic banks only",
      "KES currency only",
      "Maximum KES 999,999 per transaction",
      "Some banks restrict to business hours",
    ],
  },
];

// Custom styles matching PaymentModal
const customStyles = {
  primary: "#3D6B2C",
  secondary: "#F08C23",
  success: "#388E3C",
  gradient: "linear-gradient(135deg, #3D6B2C 0%, #388E3C 100%)",
};

export default function GeneralTransfer({
  walletData,
  onClose,
  onBack,
}: GeneralTransferProps) {
  const [transferType, setTransferType] = useState<string>("");

  // Mantine form for better state management and validation
  const form = useForm({
    initialValues: {
      payerAccountId: walletData?.accountId,
      payeeBankCode: "",
      payeeAccountId: "",
      payeeAccountName: "",
      amount: "",
      remark: "",
      payeeMobileForNotification: "",
    },
    validate: {
      payerAccountId: (value) =>
        !value ? "Payer account ID is required" : null,
      payeeAccountId: (value) =>
        !value ? "Payee account ID is required" : null,
      payeeAccountName: (value) =>
        !value ? "Recipient name is required" : null,
      payeeBankCode: (value) =>
        transferType === "choice_bank" && !value
          ? "Bank code is required for Choice Bank"
          : null,
      amount: (value) => {
        if (!value) return "Amount is required";
        const amount = parseFloat(value);
        if (amount <= 0 || isNaN(amount)) return "Please enter a valid amount";
        if (amount > availableBalance)
          return "Amount exceeds available balance";
        if (transferType === "pesa_link" && amount > 999999)
          return "PesaLink maximum is KES 999,999";
        return null;
      },
      remark: (value) => (!value ? "Remark is required" : null),
      payeeMobileForNotification: (value) =>
        !value ? "Mobile number for notification is required" : null,
    },
  });

  const [sendMoneyResponse, setSendMoneyResponse] =
    useState<TransferResponse | null>(null);
  const [isSendMoneyLoading, setIsSendMoneyLoading] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const queryClient = useQueryClient();
  const availableBalance = parseFloat(walletData.balance);

  const sendMoneyMutation = useMutation({
    mutationFn: (data: {
      payerAccountId: string;
      payeeBankCode: string;
      payeeAccountId: string;
      payeeAccountName: string;
      currency: string;
      amount: number;
      remark: string;
      payeeMobileForNotification: string;
    }) => {
      return generalTransfer(data);
    },
    onSuccess: (data: TransferResponse) => {
      setIsSendMoneyLoading(false);
      if (data.success) {
        setSendMoneyResponse(data);
        setShowOtpInput(true);
        notifications.show({
          title: "Transaction Initiated",
          message:
            "Please enter the OTP sent to your phone to complete the transaction.",
          color: "blue",
        });
      } else {
        notify.error(data.message || "Failed to send money");
      }
    },
    onError: (error) => {
      console.error("Transfer mutation error:", error);
      setIsSendMoneyLoading(false);
      notify.error("An error occurred while processing the transfer");
    },
  });

  const otpMutation = useMutation({
    mutationFn: (data: { otp: string; businessId: string }) =>
      confirmOTP(data.otp, data.businessId),
    onSuccess: (data) => {
      setIsOtpLoading(false);
      if (data.success) {
        setShowOtpInput(false);
        notifications.show({
          title: "Success",
          message: "Transaction completed successfully!",
          color: "green",
        });
        setTimeout(() => {
          location.reload();
        }, 2000);
      } else {
        notify.error(data.message || "Invalid OTP. Please try again.");
        setOtpValue("");
      }
    },
    onError: (error) => {
      setIsOtpLoading(false);
      console.error("OTP verification error:", error);
      notify.error("Failed to verify OTP. Please try again.");
      setOtpValue("");
    },
  });

  const handleSendMoneySubmit = () => {
    const validation = form.validate();

    if (!transferType) {
      notify.error("Please select a transfer type");
      return;
    }

    if (validation.hasErrors) {
      notify.error("Please fix the errors in the form");
      return;
    }

    const amount = parseFloat(form.values.amount);

    if (amount < 10) {
      notify.error("Minimum transfer amount is KES 10");
      return;
    }

    // PesaLink specific validation
    if (transferType === "pesa_link") {
      if (walletData.currency !== "KES") {
        notify.error("PesaLink only supports KES currency");
        return;
      }
      if (amount > 999999) {
        notify.error("PesaLink maximum is KES 999,999 per transaction");
        return;
      }
    }

    setIsSendMoneyLoading(true);

    // Get the correct bank code based on transfer type
    const getPayeeBankCode = (transferType: string) => {
      switch (transferType) {
        case "mpesa":
          return "M-PESA";
        case "airtel":
          return "AIRTEL";
        case "choice_bank":
          return form.values.payeeBankCode || "";
        case "pesa_link":
          return "03";
        default:
          return "";
      }
    };

    const finalBankCode = getPayeeBankCode(transferType);
    const mobile =
      transferType === "mpesa" ||
      transferType === "airtel" ||
      transferType === "pesa_link"
        ? form.values.payeeAccountId.slice(-9)
        : form.values.payeeAccountId;
    sendMoneyMutation.mutate({
      payerAccountId: form.values.payerAccountId || "12345", // Default or get from user context
      payeeBankCode: finalBankCode,
      payeeAccountId: mobile, //form.values.payeeAccountId,
      payeeAccountName: form.values.payeeAccountName,
      currency: walletData.currency || "KES",
      amount: amount,
      remark: form.values.remark,
      payeeMobileForNotification: form.values.payeeMobileForNotification,
    });
  };

  const handleOtpSubmit = () => {
    if (!otpValue || otpValue.trim().length !== 4) {
      notify.error("Please enter a valid 4-digit OTP");
      return;
    }

    if (!sendMoneyResponse?.txId) {
      notify.error("Transaction ID not found. Please try again.");
      return;
    }

    setIsOtpLoading(true);
    otpMutation.mutate({
      otp: otpValue,
      businessId: sendMoneyResponse?.txId as string,
    });
  };

  const handleCompleteSendMoney = () => {
    onClose();
    form.reset();
    setSendMoneyResponse(null);
    queryClient.invalidateQueries({ queryKey: ["wallet"] });
    notifications.show({
      title: "Transaction Completed",
      message: "Your wallet has been updated.",
      color: "green",
    });
  };

  const formatBalance = (balance: string) => {
    const numBalance = parseFloat(balance);
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: walletData.currency || "KES",
    }).format(numBalance);
  };

  const getBalanceColor = () => {
    const amount = parseFloat(form.values.amount);
    if (!amount || isNaN(amount)) return "dimmed";
    return amount > availableBalance ? "red" : "green";
  };

  const selectedTypeConfig = transferTypeOptions.find(
    (opt) => opt?.value === transferType
  );

  return (
    <Stack gap="lg">
      {/* Transfer Form */}
      <Transition
        mounted={!sendMoneyResponse}
        transition="slide-left"
        duration={300}
      >
        {(styles) => (
          <div style={styles}>
            {/* Available Balance Display */}
            <Alert color="blue" icon={<User size={16} />} variant="light">
              <Text size="sm">
                Available Balance:{" "}
                <strong>{formatBalance(walletData.balance)}</strong>
              </Text>
            </Alert>

            {/* Transfer Type Select */}
            <Select
              label="Transfer Type"
              placeholder="Select transfer method"
              data={transferTypeOptions
                .filter((opt) => opt && opt.value && opt.label)
                .map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
              value={transferType}
              onChange={(value) => setTransferType(value || "")}
              styles={{
                label: { color: customStyles.primary, fontWeight: 500 },
                input: { borderColor: customStyles.primary },
              }}
              required
            />

            {/* Show limitations for PesaLink */}
            {transferType === "pesa_link" && (
              <Alert
                icon={<AlertTriangle size={16} />}
                title="PesaLink Limitations"
                color="orange"
                variant="light"
              >
                <Stack gap={4}>
                  {selectedTypeConfig?.limitations?.map((limitation, idx) => (
                    <Text key={idx} size="xs">
                      • {limitation}
                    </Text>
                  ))}
                </Stack>
              </Alert>
            )}

            {/* Payer Account ID Input (Auto-filled or manual) */}
            <TextInput
              label="Your Account ID"
              placeholder="Enter your account ID"
              {...form.getInputProps("payerAccountId")}
              leftSection={<User size={16} />}
              styles={{
                label: { color: customStyles.primary, fontWeight: 500 },
                input: { borderColor: customStyles.primary },
              }}
              readOnly
              required
            />

            {/* Payee Account ID Input */}
            <TextInput
              label={
                transferType === "mpesa" || transferType === "airtel"
                  ? "Phone Number"
                  : transferType === "choice_bank"
                  ? "Bank Account Number"
                  : transferType === "pesa_link"
                  ? "PesaLink Account ID"
                  : "Payee Account ID"
              }
              placeholder={
                selectedTypeConfig?.placeholder || "Enter payee account details"
              }
              {...form.getInputProps("payeeAccountId")}
              leftSection={<User size={16} />}
              styles={{
                label: { color: customStyles.primary, fontWeight: 500 },
                input: { borderColor: customStyles.primary },
              }}
              required
            />

            {/* Payee Account Name Input */}
            <TextInput
              label="Recipient Name"
              placeholder="Enter recipient's full name"
              {...form.getInputProps("payeeAccountName")}
              leftSection={<User size={16} />}
              styles={{
                label: { color: customStyles.primary, fontWeight: 500 },
                input: { borderColor: customStyles.primary },
              }}
              required
            />

            {/* Bank Code Input - Only for Choice Bank */}
            {transferType === "choice_bank" && (
              <TextInput
                label="Bank Code"
                placeholder="Enter bank code (e.g., 46)"
                {...form.getInputProps("payeeBankCode")}
                leftSection={<Building2 size={16} />}
                styles={{
                  label: { color: customStyles.primary, fontWeight: 500 },
                  input: { borderColor: customStyles.primary },
                }}
                required
                description="Enter the specific bank code for the recipient's bank"
              />
            )}

            {/* Amount Input */}
            <div>
              <TextInput
                label="Amount"
                placeholder="Enter amount to send"
                {...form.getInputProps("amount")}
                leftSection={<Text size="sm">{walletData.currency}</Text>}
                type="number"
                min={1}
                max={
                  transferType === "pesa_link"
                    ? Math.min(availableBalance, 999999)
                    : availableBalance
                }
                styles={{
                  label: { color: customStyles.primary, fontWeight: 500 },
                  input: {
                    borderColor:
                      form.values.amount &&
                      parseFloat(form.values.amount) > availableBalance
                        ? "#fa5252"
                        : customStyles.primary,
                  },
                }}
                required
              />
              {form.values.amount && (
                <Text size="xs" c={getBalanceColor()} mt="xs">
                  {parseFloat(form.values.amount) > availableBalance ? (
                    <>
                      <AlertTriangle
                        size={12}
                        style={{ display: "inline", marginRight: "4px" }}
                      />
                      Insufficient balance
                    </>
                  ) : (
                    `Remaining balance: ${formatBalance(
                      (
                        availableBalance - parseFloat(form.values.amount)
                      ).toString()
                    )}`
                  )}
                </Text>
              )}
            </div>

            {/* Mobile for Notification Input */}
            <TextInput
              label="Mobile Number for Notification"
              placeholder="Enter mobile number for SMS notification"
              {...form.getInputProps("payeeMobileForNotification")}
              leftSection={<Smartphone size={16} />}
              styles={{
                label: { color: customStyles.primary, fontWeight: 500 },
                input: { borderColor: customStyles.primary },
              }}
              required
            />

            {/* Remark Input */}
            <Textarea
              label="Remark"
              placeholder="Enter transfer remark (e.g., Payment for services, Loan repayment, etc.)"
              {...form.getInputProps("remark")}
              minRows={2}
              maxRows={4}
              autosize
              styles={{
                label: { color: customStyles.primary, fontWeight: 500 },
                input: { borderColor: customStyles.primary },
              }}
              required
            />

            {/* Action Buttons */}
            <Group justify="space-between" mt="md">
              <Button variant="outline" color="gray" onClick={onBack}>
                Back
              </Button>
              <Button
                onClick={handleSendMoneySubmit}
                loading={isSendMoneyLoading || sendMoneyMutation.isPending}
                style={{ background: customStyles.gradient }}
                leftSection={<ArrowUpRight size={16} />}
                disabled={
                  !transferType ||
                  !form.values.payerAccountId ||
                  !form.values.payeeAccountId ||
                  !form.values.payeeAccountName ||
                  !form.values.amount ||
                  !form.values.remark ||
                  !form.values.payeeMobileForNotification ||
                  (transferType === "choice_bank" &&
                    !form.values.payeeBankCode) ||
                  parseFloat(form.values.amount) > availableBalance ||
                  (transferType === "pesa_link" &&
                    parseFloat(form.values.amount) > 999999)
                }
              >
                Send Money
              </Button>
            </Group>
          </div>
        )}
      </Transition>

      {/* OTP Verification */}
      <Transition
        mounted={showOtpInput && !!sendMoneyResponse}
        transition="slide-left"
        duration={300}
      >
        {(styles) => (
          <div style={styles}>
            {showOtpInput && sendMoneyResponse && (
              <>
                <Alert
                  color="blue"
                  icon={<ArrowUpRight size={16} />}
                  variant="light"
                >
                  <Text size="sm">
                    Transaction initiated successfully! Please enter the OTP
                    sent to your phone to complete the transfer.
                  </Text>
                </Alert>

                <Card withBorder radius="md" p="md">
                  <Stack gap="sm">
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Transaction ID
                      </Text>
                      <Text fw={500}>{sendMoneyResponse?.transaction_id}</Text>
                    </div>

                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Recipient
                      </Text>
                      <Text fw={500}>{sendMoneyResponse?.recipient_name}</Text>
                    </div>

                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Amount
                      </Text>
                      <Text fw={500} style={{ color: customStyles.primary }}>
                        {new Intl.NumberFormat("en-KE", {
                          style: "currency",
                          currency: walletData.currency || "KES",
                        }).format(parseFloat(form.values.amount))}
                      </Text>
                    </div>
                  </Stack>
                </Card>

                <div>
                  <Text size="sm" fw={500} mb="sm">
                    Enter OTP Code
                  </Text>
                  <PinInput
                    size="lg"
                    length={4}
                    value={otpValue}
                    onChange={setOtpValue}
                    placeholder="○"
                    type="number"
                    style={{ display: "flex", justifyContent: "center" }}
                  />
                </div>

                <Group justify="flex-end">
                  <Button variant="light" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleOtpSubmit}
                    loading={isOtpLoading || otpMutation.isPending}
                    style={{ background: customStyles.gradient }}
                    leftSection={<ArrowUpRight size={16} />}
                    disabled={!otpValue || otpValue.length !== 4}
                  >
                    Verify OTP
                  </Button>
                </Group>
              </>
            )}
          </div>
        )}
      </Transition>

      {/* Success State */}
      <Transition
        mounted={!showOtpInput && !!sendMoneyResponse}
        transition="pop"
        duration={300}
      >
        {(styles) => (
          <div style={styles}>
            {!showOtpInput && sendMoneyResponse && (
              <>
                <Stack align="center" gap="lg" py="md">
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: customStyles.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ArrowUpRight size={32} style={{ color: "white" }} />
                  </div>
                  <Text
                    size="xl"
                    fw={600}
                    style={{ color: customStyles.success }}
                  >
                    Transfer Successful!
                  </Text>
                </Stack>

                <Card withBorder radius="md" p="md">
                  <Stack gap="sm">
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Transfer Type
                      </Text>
                      <Text fw={500}>
                        {
                          transferTypeOptions.find(
                            (opt) => opt?.value === transferType
                          )?.label
                        }
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Recipient Account
                      </Text>
                      <Text fw={500}>{form.values.payeeAccountId}</Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Recipient Name
                      </Text>
                      <Text fw={500}>{form.values.payeeAccountName}</Text>
                    </div>
                    {transferType === "choice_bank" && (
                      <div>
                        <Text size="sm" c="dimmed" mb="xs">
                          Bank Code
                        </Text>
                        <Text fw={500}>{form.values.payeeBankCode}</Text>
                      </div>
                    )}
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Notification Mobile
                      </Text>
                      <Text fw={500}>
                        {form.values.payeeMobileForNotification}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Amount Sent
                      </Text>
                      <Text
                        fw={600}
                        size="lg"
                        style={{ color: customStyles.primary }}
                      >
                        {new Intl.NumberFormat("en-KE", {
                          style: "currency",
                          currency: walletData.currency || "KES",
                        }).format(parseFloat(form.values.amount))}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Remark
                      </Text>
                      <Text fw={500}>{form.values.remark}</Text>
                    </div>
                  </Stack>
                </Card>

                <Alert icon={<Shield size={16} />} color="teal" variant="light">
                  <Text size="xs">
                    Your transaction has been completed successfully. You will
                    receive a confirmation message shortly.
                  </Text>
                </Alert>

                <Group justify="flex-end">
                  <Button
                    onClick={handleCompleteSendMoney}
                    style={{ background: customStyles.gradient }}
                    leftSection={<ArrowUpRight size={16} />}
                  >
                    Complete
                  </Button>
                </Group>
              </>
            )}
          </div>
        )}
      </Transition>
    </Stack>
  );
}
