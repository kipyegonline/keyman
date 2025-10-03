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
} from "@mantine/core";
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
} from "lucide-react";
import { notifications } from "@mantine/notifications";
import { notify } from "@/lib/notifications";
import { sendMoney, confirmOTP } from "@/api/wallet";

interface BankTransferProps {
  walletData: {
    currency: string;
    balance: string;
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
  const [paymentChannel, setPaymentChannel] = useState<string>("");
  const [transferForm, setTransferForm] = useState({
    beneficiaryBankCode: "",
    beneficiaryBankName: "",
    beneficiaryAccountId: "",
    beneficiaryAccountCcy: "",
    beneficiaryName: "",
    amount: "",
    paymentPurposeId: "",
    senderAddress: "",
    description: "",
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

  const queryClient = useQueryClient();
  const availableBalance = parseFloat(walletData.balance);

  const sendMoneyMutation = useMutation({
    mutationFn: (data: {
      recipient_wallet_id: string;
      amount: number;
      description: string;
    }) => sendMoney(data),
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

  const handleBankTransferSubmit = () => {
    // Validate all required fields
    if (
      !paymentChannel ||
      !transferForm.beneficiaryBankCode ||
      !transferForm.beneficiaryBankName ||
      !transferForm.beneficiaryAccountId ||
      !transferForm.beneficiaryAccountCcy ||
      !transferForm.beneficiaryName ||
      !transferForm.amount ||
      !transferForm.paymentPurposeId ||
      !transferForm.senderAddress
    ) {
      notify.error("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(transferForm.amount);
    if (amount <= 0 || isNaN(amount)) {
      notify.error("Please enter a valid amount");
      return;
    }

    if (amount > availableBalance) {
      notify.error("Insufficient balance. Please enter a lower amount.");
      return;
    }

    // Validate minimum amount for bank transfers
    if (amount <= 999999) {
      notify.error(
        "Bank Transfer is recommended for amounts exceeding KES 999,999. Please use PesaLink for lower amounts."
      );
      return;
    }

    // Validate currency compatibility
    if (
      walletData.currency !== "KES" &&
      walletData.currency !== transferForm.beneficiaryAccountCcy
    ) {
      notify.error(
        "Source and beneficiary currencies must match, or source must be KES"
      );
      return;
    }

    setIsSendMoneyLoading(true);

    // Send to backend (backend will forward to the bank API)
    sendMoneyMutation.mutate({
      recipient_wallet_id: transferForm.beneficiaryAccountId,
      amount: amount,
      description: `${paymentChannel.toUpperCase()} - ${transferForm.description}`,
    });
  };

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
    setTransferForm({
      beneficiaryBankCode: "",
      beneficiaryBankName: "",
      beneficiaryAccountId: "",
      beneficiaryAccountCcy: "",
      beneficiaryName: "",
      amount: "",
      paymentPurposeId: "",
      senderAddress: "",
      description: "",
    });
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
    const amount = parseFloat(transferForm.amount);
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
          <div style={styles}>
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
              <Text size="sm" fw={500} mb="xs" style={{ color: customStyles.primary }}>
                Payment Channel *
              </Text>
              <Radio.Group value={paymentChannel} onChange={setPaymentChannel}>
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
                          paymentChannel === key
                            ? `2px solid ${customStyles.primary}`
                            : "1px solid #e9ecef",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => setPaymentChannel(key)}
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
            <Text size="sm" fw={600} mt="md" style={{ color: customStyles.primary }}>
              Beneficiary Bank Details
            </Text>

            <Group grow>
              <TextInput
                label="Bank Code"
                placeholder="e.g., 11"
                value={transferForm.beneficiaryBankCode}
                onChange={(e) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    beneficiaryBankCode: e.target.value,
                  }))
                }
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
                value={transferForm.beneficiaryBankName}
                onChange={(e) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    beneficiaryBankName: e.target.value,
                  }))
                }
                leftSection={<Building2 size={16} />}
                styles={{
                  label: { color: customStyles.primary, fontWeight: 500 },
                  input: { borderColor: customStyles.primary },
                }}
                required
              />
            </Group>

            {/* Beneficiary Account Details */}
            <Text size="sm" fw={600} mt="md" style={{ color: customStyles.primary }}>
              Beneficiary Account Details
            </Text>

            <TextInput
              label="Beneficiary Name"
              placeholder="Full name of recipient"
              value={transferForm.beneficiaryName}
              onChange={(e) =>
                setTransferForm((prev) => ({
                  ...prev,
                  beneficiaryName: e.target.value,
                }))
              }
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
                value={transferForm.beneficiaryAccountId}
                onChange={(e) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    beneficiaryAccountId: e.target.value,
                  }))
                }
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
                value={transferForm.beneficiaryAccountCcy}
                onChange={(value) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    beneficiaryAccountCcy: value || "",
                  }))
                }
                styles={{
                  label: { color: customStyles.primary, fontWeight: 500 },
                  input: { borderColor: customStyles.primary },
                }}
                required
              />
            </Group>

            {/* Currency compatibility notice */}
            {transferForm.beneficiaryAccountCcy &&
              walletData.currency !== "KES" &&
              walletData.currency !== transferForm.beneficiaryAccountCcy && (
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
            <Text size="sm" fw={600} mt="md" style={{ color: customStyles.primary }}>
              Transfer Details
            </Text>

            <div>
              <TextInput
                label="Amount"
                placeholder="Enter amount to transfer"
                value={transferForm.amount}
                onChange={(e) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                leftSection={<Text size="sm">{walletData.currency}</Text>}
                type="number"
                min={1000000}
                max={availableBalance}
                styles={{
                  label: { color: customStyles.primary, fontWeight: 500 },
                  input: {
                    borderColor:
                      transferForm.amount &&
                      parseFloat(transferForm.amount) > availableBalance
                        ? "#fa5252"
                        : customStyles.primary,
                  },
                }}
                required
                error={
                  transferForm.amount &&
                  parseFloat(transferForm.amount) > availableBalance
                    ? "Amount exceeds available balance"
                    : transferForm.amount &&
                      parseFloat(transferForm.amount) <= 999999
                    ? "Minimum recommended: KES 1,000,000"
                    : undefined
                }
              />
              {transferForm.amount && (
                <Text size="xs" c={getBalanceColor()} mt="xs">
                  {parseFloat(transferForm.amount) > availableBalance ? (
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
                        availableBalance - parseFloat(transferForm.amount)
                      ).toString()
                    )}`
                  )}
                </Text>
              )}
            </div>

            <Select
              label="Payment Purpose"
              placeholder="Select payment purpose"
              data={paymentPurposes}
              value={transferForm.paymentPurposeId}
              onChange={(value) =>
                setTransferForm((prev) => ({
                  ...prev,
                  paymentPurposeId: value || "",
                }))
              }
              styles={{
                label: { color: customStyles.primary, fontWeight: 500 },
                input: { borderColor: customStyles.primary },
              }}
              required
            />

            <TextInput
              label="Sender Address"
              placeholder="Your physical address"
              value={transferForm.senderAddress}
              onChange={(e) =>
                setTransferForm((prev) => ({
                  ...prev,
                  senderAddress: e.target.value,
                }))
              }
              leftSection={<MapPin size={16} />}
              styles={{
                label: { color: customStyles.primary, fontWeight: 500 },
                input: { borderColor: customStyles.primary },
              }}
              required
            />

            <Textarea
              label="Description (Optional)"
              placeholder="Additional notes about this transfer"
              value={transferForm.description}
              onChange={(e) =>
                setTransferForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              minRows={2}
              maxRows={3}
              autosize
              styles={{
                label: { color: customStyles.primary, fontWeight: 500 },
                input: { borderColor: customStyles.primary },
              }}
            />

            {/* Action Buttons */}
            <Group justify="space-between" mt="md">
              <Button variant="outline" color="gray" onClick={onBack}>
                Back
              </Button>
              <Button
                onClick={handleBankTransferSubmit}
                loading={isSendMoneyLoading || sendMoneyMutation.isPending}
                style={{ background: customStyles.gradient }}
                leftSection={<ArrowUpRight size={16} />}
                disabled={
                  !paymentChannel ||
                  !transferForm.beneficiaryBankCode ||
                  !transferForm.beneficiaryBankName ||
                  !transferForm.beneficiaryAccountId ||
                  !transferForm.beneficiaryAccountCcy ||
                  !transferForm.beneficiaryName ||
                  !transferForm.amount ||
                  !transferForm.paymentPurposeId ||
                  !transferForm.senderAddress ||
                  parseFloat(transferForm.amount) > availableBalance ||
                  parseFloat(transferForm.amount) <= 999999
                }
              >
                Initiate Transfer
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
                {/* Status Indicator */}
                <Card withBorder radius="md" p="md" mb="md">
                  <Group>
                    <div style={{ color: statusConfig[transferStatus as keyof typeof statusConfig]?.color }}>
                      {statusConfig[transferStatus as keyof typeof statusConfig]?.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text fw={600} size="sm">
                        Status: {statusConfig[transferStatus as keyof typeof statusConfig]?.label}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {statusConfig[transferStatus as keyof typeof statusConfig]?.description}
                      </Text>
                    </div>
                  </Group>
                </Card>

                <Alert
                  color="blue"
                  icon={<Shield size={16} />}
                  variant="light"
                >
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
                        {paymentChannels[paymentChannel as keyof typeof paymentChannels]?.label}
                      </Text>
                    </div>

                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Beneficiary
                      </Text>
                      <Text fw={500}>{transferForm.beneficiaryName}</Text>
                      <Text size="xs" c="dimmed">
                        {transferForm.beneficiaryBankName} - {transferForm.beneficiaryAccountId}
                      </Text>
                    </div>

                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Amount
                      </Text>
                      <Text fw={500} style={{ color: customStyles.primary }}>
                        {new Intl.NumberFormat("en-KE", {
                          style: "currency",
                          currency: transferForm.beneficiaryAccountCcy || "KES",
                        }).format(parseFloat(transferForm.amount))}
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
                        {statusConfig[transferStatus as keyof typeof statusConfig]?.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text size="xl" fw={600} style={{ color: customStyles.success }}>
                          {statusConfig[transferStatus as keyof typeof statusConfig]?.label}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {statusConfig[transferStatus as keyof typeof statusConfig]?.description}
                        </Text>
                      </div>
                    </Group>

                    {/* Status Timeline */}
                    <Stack gap="xs" mt="sm">
                      {["SUBMITTED", "VALIDATING", "APPROVED", "IN_TRANSIT"].map((status, idx) => (
                        <Group key={status} gap="sm">
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              background:
                                Object.keys(statusConfig).indexOf(transferStatus) >= idx
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
                            {Object.keys(statusConfig).indexOf(transferStatus) > idx ? "✓" : idx + 1}
                          </div>
                          <Text
                            size="sm"
                            fw={Object.keys(statusConfig).indexOf(transferStatus) >= idx ? 600 : 400}
                            c={Object.keys(statusConfig).indexOf(transferStatus) >= idx ? "dark" : "dimmed"}
                          >
                            {statusConfig[status as keyof typeof statusConfig]?.label}
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
                        {paymentChannels[paymentChannel as keyof typeof paymentChannels]?.label}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Beneficiary Bank
                      </Text>
                      <Text fw={500}>
                        {transferForm.beneficiaryBankName} ({transferForm.beneficiaryBankCode})
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Beneficiary Account
                      </Text>
                      <Text fw={500}>{transferForm.beneficiaryName}</Text>
                      <Text size="xs" c="dimmed">
                        {transferForm.beneficiaryAccountId} - {transferForm.beneficiaryAccountCcy}
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
                          currency: transferForm.beneficiaryAccountCcy || "KES",
                        }).format(parseFloat(transferForm.amount))}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Payment Purpose
                      </Text>
                      <Text fw={500}>
                        {paymentPurposes.find(
                          (p) => p.value === transferForm.paymentPurposeId
                        )?.label}
                      </Text>
                    </div>
                  </Stack>
                </Card>

                <Alert icon={<Shield size={16} />} color="teal" variant="light">
                  <Text size="xs">
                    Your bank transfer is being processed. Settlement time depends on
                    the payment channel selected (RTGS: immediate, EFT: T+1).
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
