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
  Radio,
  FileButton,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowUpRight,
  User,
  AlertTriangle,
  Shield,
  Building2,
  Coins,
  FileText,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  MessageSquare,
  Upload,
} from "lucide-react";
import { notifications } from "@mantine/notifications";
import { notify } from "@/lib/notifications";
import { domesticBankTransfer, confirmOTP } from "@/api/wallet";

interface BankTransferProps {
  walletData: {
    currency: string;
    balance: string;
    account_id?: string;
  };
  onClose: () => void;
  onBack: () => void;
}

// Payment channel options
const paymentChannels = {
  rtgs: {
    label: "RTGS (Real-Time Gross Settlement)",
    description: "Real-time settlement, up to KES 100M, immediate transfer",
    features: [
      "Immediate settlement",
      "No upper limit (up to KES 100M)",
      "Higher fees",
      "Best for high-value transactions",
    ],
    color: "#3D6B2C",
  },
  eft: {
    label: "EFT (Electronic Funds Transfer)",
    description: "Batch processing, T+1 settlement, lower fees",
    features: [
      "Next-day settlement (T+1)",
      "Lower fees",
      "Batch processing",
      "Best for large volume transfers",
    ],
    color: "#F08C23",
  },
};

// Payment purpose options
const paymentPurposes = [
  { value: "001", label: "Salary Payment" },
  { value: "002", label: "Supplier Payment" },
  { value: "003", label: "Loan Repayment" },
  { value: "004", label: "Investment" },
  { value: "005", label: "Business Payment" },
  { value: "006", label: "Personal Transfer" },
  { value: "007", label: "Rent Payment" },
  { value: "008", label: "Utility Payment" },
  { value: "009", label: "Other" },
];

// Supported currencies for beneficiary
const beneficiaryCurrencies = [
  { value: "KES", label: "KES - Kenyan Shilling" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "TZS", label: "TZS - Tanzanian Shilling" },
  { value: "UGX", label: "UGX - Ugandan Shilling" },
  { value: "RWF", label: "RWF - Rwandan Franc" },
];

// Amount type options
const amountTypes = [
  { value: "0", label: "Debit Account Currency (Source currency)" },
  { value: "1", label: "Credit Account Currency (Beneficiary currency)" },
];

// Transfer status configurations
const statusConfig = {
  SUBMITTED: {
    label: "Submitted",
    icon: <FileText size={20} />,
    color: "#1976D2",
    description: "Transfer request submitted successfully",
  },
  VALIDATING: {
    label: "Validating",
    icon: <Clock size={20} />,
    color: "#F08C23",
    description: "Verifying OTP and validating transfer details",
  },
  APPROVED: {
    label: "Approved",
    icon: <CheckCircle size={20} />,
    color: "#388E3C",
    description: "Transfer approved by bank",
  },
  REJECTED: {
    label: "Rejected",
    icon: <XCircle size={20} />,
    color: "#D32F2F",
    description: "Transfer rejected",
  },
  IN_TRANSIT: {
    label: "In Transit",
    icon: <ArrowUpRight size={20} />,
    color: "#1976D2",
    description: "Transfer is being processed",
  },
};

// Custom styles matching PaymentModal
const customStyles = {
  primary: "#3D6B2C",
  secondary: "#F08C23",
  success: "#388E3C",
  gradient: "linear-gradient(135deg, #3D6B2C 0%, #388E3C 100%)",
};

export default function BankTransfer({
  walletData,
  onClose,
  onBack,
}: BankTransferProps) {
  const form = useForm({
    initialValues: {
      accountId: walletData.account_id || "",
      paymentChannel: "",
      beneficiaryBankCode: "",
      beneficiaryBankName: "",
      beneficiaryBranchCode: "",
      beneficiaryAccountId: "",
      beneficiaryAccountCcy: "",
      beneficiaryName: "",
      beneficiaryEmail: "",
      amount: "",
      amountType: "0",
      messageToBeneficiary: "",
      paymentPurposeId: "",
      senderAddress: "",
      supportDocument: "",
      supportDocumentType: "",
    },
    validate: {
      paymentChannel: (value) =>
        !value ? "Payment channel is required" : null,
      beneficiaryBankCode: (value) => (!value ? "Bank code is required" : null),
      beneficiaryBankName: (value) => (!value ? "Bank name is required" : null),
      beneficiaryBranchCode: (value) =>
        !value ? "Branch code is required" : null,
      beneficiaryAccountId: (value) =>
        !value ? "Account number is required" : null,
      beneficiaryAccountCcy: (value) =>
        !value ? "Account currency is required" : null,
      beneficiaryName: (value) =>
        !value ? "Beneficiary name is required" : null,
      beneficiaryEmail: (value) =>
        value && !/^\S+@\S+$/.test(value) ? "Invalid email format" : null,
      amount: (value) => {
        if (!value) return "Amount is required";
        const amount = parseFloat(value);
        if (isNaN(amount) || amount <= 0)
          return "Amount must be greater than 0";
        if (amount > parseFloat(walletData.balance))
          return "Insufficient balance";
        if (amount <= 999999) return "Minimum recommended: KES 1,000,000";
        return null;
      },
      paymentPurposeId: (value) =>
        !value ? "Payment purpose is required" : null,
      senderAddress: (value) => (!value ? "Sender address is required" : null),
    },
  });

  const [sendMoneyResponse, setSendMoneyResponse] = useState<null | Record<
    string,
    string | number
  >>(null);
  const [isSendMoneyLoading, setIsSendMoneyLoading] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [transferStatus, setTransferStatus] = useState<string>("SUBMITTED");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const queryClient = useQueryClient();
  const availableBalance = parseFloat(walletData.balance);

  const transferMutation = useMutation({
    mutationFn: domesticBankTransfer,
    onSuccess: (data) => {
      setIsSendMoneyLoading(false);
      if (data.status) {
        setSendMoneyResponse(data);
        setShowOtpInput(true);
        setTransferStatus("SUBMITTED");
        notifications.show({
          title: "Transfer Submitted",
          message:
            "Please enter the OTP sent to your phone to complete the transaction.",
          color: "blue",
        });
      } else {
        notify.error(data.message || "Failed to initiate transfer");
      }
    },
    onError: (error) => {
      setIsSendMoneyLoading(false);
      console.error("Bank transfer error:", error);
      notify.error("Failed to initiate transfer. Please try again.");
    },
  });

  const otpMutation = useMutation({
    mutationFn: (data: { otp: string; businessId: string }) =>
      confirmOTP(data.otp, data.businessId),
    onSuccess: (data) => {
      setIsOtpLoading(false);
      if (data.status) {
        setShowOtpInput(false);
        setTransferStatus("VALIDATING");

        // Simulate status progression
        setTimeout(() => setTransferStatus("APPROVED"), 2000);
        setTimeout(() => setTransferStatus("IN_TRANSIT"), 4000);

        notifications.show({
          title: "OTP Verified",
          message: "Transfer is being processed",
          color: "green",
        });
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

  const handleBankTransferSubmit = form.onSubmit((values) => {
    // Additional currency compatibility validation
    if (
      walletData.currency !== "KES" &&
      walletData.currency !== values.beneficiaryAccountCcy
    ) {
      notify.error(
        "Source and beneficiary currencies must match, or source must be KES"
      );
      return;
    }

    setIsSendMoneyLoading(true);

    // Get payment purpose label
    const paymentPurpose =
      paymentPurposes.find((p) => p.value === values.paymentPurposeId)?.label ||
      "";

    // Construct the payload
    const payload = {
      accountId: values.accountId,
      beneficiaryBankCode: values.beneficiaryBankCode,
      beneficiaryBankName: values.beneficiaryBankName,
      beneficiaryBranchCode: values.beneficiaryBranchCode,
      beneficiaryAccountId: values.beneficiaryAccountId,
      beneficiaryAccountCcy: values.beneficiaryAccountCcy,
      beneficiaryName: values.beneficiaryName,
      beneficiaryEmail: values.beneficiaryEmail,
      amount: parseFloat(values.amount),
      amountType: parseInt(values.amountType),
      messageToBeneficiary: values.messageToBeneficiary,
      paymentChannel: values.paymentChannel.toUpperCase(),
      paymentPurposeId: values.paymentPurposeId,
      paymentPurpose: paymentPurpose,
      senderAddress: values.senderAddress,
      supportDocument: values.supportDocument || "",
      supportDocumentType: values.supportDocumentType || "",
    };

    // Send to backend
    transferMutation.mutate(payload);
  });

  const handleOtpSubmit = () => {
    if (!otpValue || otpValue.trim().length !== 4) {
      notify.error("Please enter a valid 4-digit OTP");
      return;
    }

    if (!sendMoneyResponse?.transaction_id) {
      notify.error("Transaction ID not found. Please try again.");
      return;
    }

    setIsOtpLoading(true);
    otpMutation.mutate({
      otp: otpValue,
      businessId: sendMoneyResponse.transaction_id as string,
    });
  };

  const handleCompleteBankTransfer = () => {
    onClose();
    form.reset();
    setUploadedFile(null);
    setSendMoneyResponse(null);
    setTransferStatus("SUBMITTED");
    queryClient.invalidateQueries({ queryKey: ["wallet"] });
    notifications.show({
      title: "Transfer Complete",
      message: "Your bank transfer has been processed.",
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

  return (
    <Stack gap="lg">
      {/* Transfer Form */}
      <Transition
        mounted={!sendMoneyResponse}
        transition="slide-left"
        duration={300}
      >
        {(styles) => (
          <form style={styles} onSubmit={handleBankTransferSubmit}>
            {/* Available Balance Display */}
            <Alert color="blue" icon={<Coins size={16} />} variant="light">
              <Text size="sm">
                Available Balance:{" "}
                <strong>{formatBalance(walletData.balance)}</strong>
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Recommended for transfers exceeding KES 999,999
              </Text>
            </Alert>

            {/* Payment Channel Selection */}
            <div>
              <Text
                size="sm"
                fw={500}
                mb="xs"
                style={{ color: customStyles.primary }}
              >
                Payment Channel *
              </Text>
              <Radio.Group {...form.getInputProps("paymentChannel")}>
                <Stack gap="sm">
                  {Object.entries(paymentChannels).map(([key, config]) => (
                    <Card
                      key={key}
                      withBorder
                      radius="md"
                      p="sm"
                      style={{
                        cursor: "pointer",
                        border:
                          form.values.paymentChannel === key
                            ? `2px solid ${customStyles.primary}`
                            : "1px solid #e9ecef",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => form.setFieldValue("paymentChannel", key)}
                    >
                      <Radio
                        value={key}
                        label={
                          <div>
                            <Text fw={600} size="sm" mb={4}>
                              {config.label}
                            </Text>
                            <Text size="xs" c="dimmed" mb={8}>
                              {config.description}
                            </Text>
                            <Group gap={6}>
                              {config.features.map((feature, idx) => (
                                <Text
                                  key={idx}
                                  size="xs"
                                  style={{
                                    background: "#f1f3f5",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    color: "#495057",
                                  }}
                                >
                                  {feature}
                                </Text>
                              ))}
                            </Group>
                          </div>
                        }
                      />
                    </Card>
                  ))}
                </Stack>
              </Radio.Group>
            </div>

            {/* Beneficiary Bank Details */}
            <Text
              size="sm"
              fw={600}
              mt="md"
              style={{ color: customStyles.primary }}
            >
              Beneficiary Bank Details
            </Text>

            <Group grow>
              <TextInput
                label="Bank Code"
                placeholder="e.g., 03001"
                {...form.getInputProps("beneficiaryBankCode")}
                leftSection={<Building2 size={16} />}
                styles={{
                  label: { color: customStyles.primary, fontWeight: 500 },
                  input: { borderColor: customStyles.primary },
                }}
                required
              />
              <TextInput
                label="Bank Name"
                placeholder="e.g., Equity Bank"
                {...form.getInputProps("beneficiaryBankName")}
                leftSection={<Building2 size={16} />}
                styles={{
                  label: { color: customStyles.primary, fontWeight: 500 },
                  input: { borderColor: customStyles.primary },
                }}
                required
              />
            </Group>

            <TextInput
              label="Branch Code"
              placeholder="e.g., 001"
              {...form.getInputProps("beneficiaryBranchCode")}
              leftSection={<Building2 size={16} />}
              styles={{
                label: { color: customStyles.primary, fontWeight: 500 },
                input: { borderColor: customStyles.primary },
              }}
              required
            />

            {/* Beneficiary Account Details */}
            <Text
              size="sm"
              fw={600}
              mt="md"
              style={{ color: customStyles.primary }}
            >
              Beneficiary Account Details
            </Text>

            <TextInput
              label="Beneficiary Name"
              placeholder="Full name of recipient"
              {...form.getInputProps("beneficiaryName")}
              leftSection={<User size={16} />}
              styles={{
                label: { color: customStyles.primary, fontWeight: 500 },
                input: { borderColor: customStyles.primary },
              }}
              required
            />

            <Group grow>
              <TextInput
                label="Account Number"
                placeholder="Beneficiary account number"
                {...form.getInputProps("beneficiaryAccountId")}
                leftSection={<User size={16} />}
                styles={{
                  label: { color: customStyles.primary, fontWeight: 500 },
                  input: { borderColor: customStyles.primary },
                }}
                required
              />
              <Select
                label="Account Currency"
                placeholder="Select currency"
                data={beneficiaryCurrencies}
                {...form.getInputProps("beneficiaryAccountCcy")}
                styles={{
                  label: { color: customStyles.primary, fontWeight: 500 },
                  input: { borderColor: customStyles.primary },
                }}
                required
              />
            </Group>

            <TextInput
              label="Beneficiary Email (Optional)"
              placeholder="recipient@example.com"
              {...form.getInputProps("beneficiaryEmail")}
              leftSection={<Mail size={16} />}
              type="email"
              styles={{
                label: { color: customStyles.primary, fontWeight: 500 },
                input: { borderColor: customStyles.primary },
              }}
            />

            {/* Currency compatibility notice */}
            {form.values.beneficiaryAccountCcy &&
              walletData.currency !== "KES" &&
              walletData.currency !== form.values.beneficiaryAccountCcy && (
                <Alert
                  icon={<AlertTriangle size={16} />}
                  color="orange"
                  variant="light"
                >
                  <Text size="xs">
                    Source currency must be KES or match beneficiary currency
                  </Text>
                </Alert>
              )}

            {/* Transfer Details */}
            <Text
              size="sm"
              fw={600}
              mt="md"
              style={{ color: customStyles.primary }}
            >
              Transfer Details
            </Text>

            <div>
              <TextInput
                label="Amount"
                placeholder="Enter amount to transfer"
                {...form.getInputProps("amount")}
                leftSection={<Text size="sm">{walletData.currency}</Text>}
                type="number"
                min={1000000}
                max={availableBalance}
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

            <Select
              label="Amount Type"
              placeholder="Select amount type"
              data={amountTypes}
              {...form.getInputProps("amountType")}
              styles={{
                label: { color: customStyles.primary, fontWeight: 500 },
                input: { borderColor: customStyles.primary },
              }}
              required
            />

            <Select
              label="Payment Purpose"
              placeholder="Select payment purpose"
              data={paymentPurposes}
              {...form.getInputProps("paymentPurposeId")}
              styles={{
                label: { color: customStyles.primary, fontWeight: 500 },
                input: { borderColor: customStyles.primary },
              }}
              required
            />

            <TextInput
              label="Sender Address"
              placeholder="Your physical address"
              {...form.getInputProps("senderAddress")}
              leftSection={<MapPin size={16} />}
              styles={{
                label: { color: customStyles.primary, fontWeight: 500 },
                input: { borderColor: customStyles.primary },
              }}
              required
            />

            <Textarea
              label="Message to Beneficiary (Optional)"
              placeholder="Optional message to recipient (max 140 characters)"
              {...form.getInputProps("messageToBeneficiary")}
              leftSection={<MessageSquare size={16} />}
              minRows={2}
              maxRows={3}
              maxLength={140}
              autosize
              styles={{
                label: { color: customStyles.primary, fontWeight: 500 },
                input: { borderColor: customStyles.primary },
              }}
            />

            {/* Supporting Document Upload */}
            <div>
              <Text
                size="sm"
                fw={500}
                mb="xs"
                style={{ color: customStyles.primary }}
              >
                Supporting Document (Optional)
              </Text>
              <FileButton
                onChange={(file) => {
                  setUploadedFile(file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64 = reader.result as string;
                      const base64Data = base64.split(",")[1];
                      form.setFieldValue("supportDocument", base64Data);
                      form.setFieldValue(
                        "supportDocumentType",
                        file.type.includes("pdf")
                          ? "PDF"
                          : file.type.includes("image")
                          ? "IMAGE"
                          : "DOCUMENT"
                      );
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                accept="application/pdf,image/*"
              >
                {(props) => (
                  <Button
                    {...props}
                    variant="light"
                    leftSection={<Upload size={16} />}
                    style={{
                      borderColor: customStyles.primary,
                      color: customStyles.primary,
                    }}
                  >
                    {uploadedFile
                      ? `Selected: ${uploadedFile.name}`
                      : "Upload Document (PDF or Image)"}
                  </Button>
                )}
              </FileButton>
              {uploadedFile && (
                <Text size="xs" c="dimmed" mt="xs">
                  File: {uploadedFile.name} (
                  {(uploadedFile.size / 1024).toFixed(2)} KB)
                </Text>
              )}
            </div>

            {/* Action Buttons */}
            <Group justify="space-between" mt="md">
              <Button variant="outline" color="gray" onClick={onBack}>
                Back
              </Button>
              <Button
                type="submit"
                loading={isSendMoneyLoading || transferMutation.isPending}
                style={{ background: customStyles.gradient }}
                leftSection={<ArrowUpRight size={16} />}
              >
                Initiate Transfer
              </Button>
            </Group>
          </form>
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
                {/* Status Indicator */}
                <Card withBorder radius="md" p="md" mb="md">
                  <Group>
                    <div
                      style={{
                        color:
                          statusConfig[
                            transferStatus as keyof typeof statusConfig
                          ]?.color,
                      }}
                    >
                      {
                        statusConfig[
                          transferStatus as keyof typeof statusConfig
                        ]?.icon
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text fw={600} size="sm">
                        Status:{" "}
                        {
                          statusConfig[
                            transferStatus as keyof typeof statusConfig
                          ]?.label
                        }
                      </Text>
                      <Text size="xs" c="dimmed">
                        {
                          statusConfig[
                            transferStatus as keyof typeof statusConfig
                          ]?.description
                        }
                      </Text>
                    </div>
                  </Group>
                </Card>

                <Alert color="blue" icon={<Shield size={16} />} variant="light">
                  <Text size="sm">
                    Transfer submitted successfully! Please enter the OTP sent
                    to your phone to validate the transaction.
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
                        Payment Channel
                      </Text>
                      <Text fw={500}>
                        {
                          paymentChannels[
                            form.values
                              .paymentChannel as keyof typeof paymentChannels
                          ]?.label
                        }
                      </Text>
                    </div>

                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Beneficiary
                      </Text>
                      <Text fw={500}>{form.values.beneficiaryName}</Text>
                      <Text size="xs" c="dimmed">
                        {form.values.beneficiaryBankName} -{" "}
                        {form.values.beneficiaryAccountId}
                      </Text>
                    </div>

                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Amount
                      </Text>
                      <Text fw={500} style={{ color: customStyles.primary }}>
                        {new Intl.NumberFormat("en-KE", {
                          style: "currency",
                          currency: form.values.beneficiaryAccountCcy || "KES",
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
                    leftSection={<Shield size={16} />}
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

      {/* Status Progression & Success State */}
      <Transition
        mounted={!showOtpInput && !!sendMoneyResponse}
        transition="pop"
        duration={300}
      >
        {(styles) => (
          <div style={styles}>
            {!showOtpInput && sendMoneyResponse && (
              <>
                {/* Status Progression */}
                <Card withBorder radius="md" p="lg" mb="md">
                  <Stack gap="md">
                    <Group>
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background: customStyles.gradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {
                          statusConfig[
                            transferStatus as keyof typeof statusConfig
                          ]?.icon
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text
                          size="xl"
                          fw={600}
                          style={{ color: customStyles.success }}
                        >
                          {
                            statusConfig[
                              transferStatus as keyof typeof statusConfig
                            ]?.label
                          }
                        </Text>
                        <Text size="sm" c="dimmed">
                          {
                            statusConfig[
                              transferStatus as keyof typeof statusConfig
                            ]?.description
                          }
                        </Text>
                      </div>
                    </Group>

                    {/* Status Timeline */}
                    <Stack gap="xs" mt="sm">
                      {[
                        "SUBMITTED",
                        "VALIDATING",
                        "APPROVED",
                        "IN_TRANSIT",
                      ].map((status, idx) => (
                        <Group key={status} gap="sm">
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              background:
                                Object.keys(statusConfig).indexOf(
                                  transferStatus
                                ) >= idx
                                  ? customStyles.gradient
                                  : "#e9ecef",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                          >
                            {Object.keys(statusConfig).indexOf(transferStatus) >
                            idx
                              ? "✓"
                              : idx + 1}
                          </div>
                          <Text
                            size="sm"
                            fw={
                              Object.keys(statusConfig).indexOf(
                                transferStatus
                              ) >= idx
                                ? 600
                                : 400
                            }
                            c={
                              Object.keys(statusConfig).indexOf(
                                transferStatus
                              ) >= idx
                                ? "dark"
                                : "dimmed"
                            }
                          >
                            {
                              statusConfig[status as keyof typeof statusConfig]
                                ?.label
                            }
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                  </Stack>
                </Card>

                <Card withBorder radius="md" p="md">
                  <Stack gap="sm">
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Payment Channel
                      </Text>
                      <Text fw={500}>
                        {
                          paymentChannels[
                            form.values
                              .paymentChannel as keyof typeof paymentChannels
                          ]?.label
                        }
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Beneficiary Bank
                      </Text>
                      <Text fw={500}>
                        {form.values.beneficiaryBankName} (
                        {form.values.beneficiaryBankCode})
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Beneficiary Account
                      </Text>
                      <Text fw={500}>{form.values.beneficiaryName}</Text>
                      <Text size="xs" c="dimmed">
                        {form.values.beneficiaryAccountId} -{" "}
                        {form.values.beneficiaryAccountCcy}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Amount Transferred
                      </Text>
                      <Text
                        fw={600}
                        size="lg"
                        style={{ color: customStyles.primary }}
                      >
                        {new Intl.NumberFormat("en-KE", {
                          style: "currency",
                          currency: form.values.beneficiaryAccountCcy || "KES",
                        }).format(parseFloat(form.values.amount))}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Payment Purpose
                      </Text>
                      <Text fw={500}>
                        {
                          paymentPurposes.find(
                            (p) => p.value === form.values.paymentPurposeId
                          )?.label
                        }
                      </Text>
                    </div>
                  </Stack>
                </Card>

                <Alert icon={<Shield size={16} />} color="teal" variant="light">
                  <Text size="xs">
                    Your bank transfer is being processed. Settlement time
                    depends on the payment channel selected (RTGS: immediate,
                    EFT: T+1).
                  </Text>
                </Alert>

                <Group justify="flex-end">
                  <Button
                    onClick={handleCompleteBankTransfer}
                    style={{ background: customStyles.gradient }}
                    leftSection={<CheckCircle size={16} />}
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
