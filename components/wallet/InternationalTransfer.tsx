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
  // ArrowUpRight,
  User,
  AlertTriangle,
  Shield,
  Globe,
  //Coins,
  FileText,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  MessageSquare,
  Building2,
} from "lucide-react";
import { notifications } from "@mantine/notifications";
import { notify } from "@/lib/notifications";
import { sendMoney, confirmOTP } from "@/api/wallet";

interface InternationalTransferProps {
  walletData: {
    currency: string;
    balance: string;
  };
  onClose: () => void;
  onBack: () => void;
}

// Charge type options
const chargeTypes = {
  our: {
    label: "OUR - Sender Pays All Fees",
    description: "You pay all transfer and intermediary bank fees",
    color: "#3D6B2C",
  },
  ben: {
    label: "BEN - Beneficiary Pays All Fees",
    description: "Recipient pays all transfer and intermediary bank fees",
    color: "#F08C23",
  },
  sha: {
    label: "SHA - Shared Fees",
    description: "Fees are shared between sender and recipient",
    color: "#1976D2",
  },
};

// Amount type options
const amountTypes = [
  { value: "0", label: "Debit Account Currency (Source currency)" },
  { value: "1", label: "Credit Account Currency (Beneficiary currency)" },
];

// Payment purpose options
const paymentPurposes = [
  { value: "001", label: "Family Support" },
  { value: "002", label: "Education Fees" },
  { value: "003", label: "Medical Treatment" },
  { value: "004", label: "Investment" },
  { value: "005", label: "Business Payment" },
  { value: "006", label: "Property Purchase" },
  { value: "007", label: "Loan Repayment" },
  { value: "008", label: "Gift" },
  { value: "009", label: "Salary/Wages" },
  { value: "010", label: "Other" },
];

// International currencies
const internationalCurrencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CHF", label: "CHF - Swiss Franc" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "ZAR", label: "ZAR - South African Rand" },
  { value: "TZS", label: "TZS - Tanzanian Shilling" },
  { value: "UGX", label: "UGX - Ugandan Shilling" },
  { value: "RWF", label: "RWF - Rwandan Franc" },
  { value: "KES", label: "KES - Kenyan Shilling" },
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
    description: "Transfer approved for processing",
  },
  REJECTED: {
    label: "Rejected",
    icon: <XCircle size={20} />,
    color: "#D32F2F",
    description: "Transfer rejected",
  },
  IN_TRANSIT: {
    label: "In Transit",
    icon: <Globe size={20} />,
    color: "#1976D2",
    description: "Transfer is being processed via SWIFT network",
  },
};

// Custom styles matching PaymentModal
const customStyles = {
  primary: "#3D6B2C",
  secondary: "#F08C23",
  success: "#388E3C",
  gradient: "linear-gradient(135deg, #3D6B2C 0%, #388E3C 100%)",
};

export default function InternationalTransfer({
  walletData,
  onClose,
  onBack,
}: InternationalTransferProps) {
  const [chargeType, setChargeType] = useState<string>("");
  const [transferForm, setTransferForm] = useState({
    beneficiarySwiftBic: "",
    beneficiaryBankName: "",
    beneficiaryBankCity: "",
    beneficiaryAccountId: "",
    beneficiaryAccountCcy: "",
    beneficiaryName: "",
    beneficiaryEmail: "",
    amount: "",
    amountType: "0",
    paymentPurposeId: "",
    senderAddress: "",
    messageToBeneficiary: "",
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
            "Please enter the OTP sent to your phone to complete the international transfer.",
          color: "blue",
        });
      } else {
        notify.error(data.message || "Failed to initiate transfer");
      }
    },
    onError: (error) => {
      setIsSendMoneyLoading(false);
      console.error("International transfer error:", error);
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
          message: "International transfer is being processed via SWIFT",
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

  const handleInternationalTransferSubmit = () => {
    // Validate all required fields
    if (
      !chargeType ||
      !transferForm.beneficiarySwiftBic ||
      !transferForm.beneficiaryBankName ||
      !transferForm.beneficiaryBankCity ||
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

    // Validate SWIFT/BIC format (basic validation)
    if (
      transferForm.beneficiarySwiftBic.length < 8 ||
      transferForm.beneficiarySwiftBic.length > 11
    ) {
      notify.error("SWIFT/BIC code must be 8 or 11 characters");
      return;
    }

    setIsSendMoneyLoading(true);

    // Send to backend (backend will forward to the SWIFT API)
    sendMoneyMutation.mutate({
      recipient_wallet_id: transferForm.beneficiaryAccountId,
      amount: amount,
      description: `SWIFT - ${chargeType.toUpperCase()} - ${
        transferForm.messageToBeneficiary || "International Transfer"
      }`,
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

  const handleCompleteInternationalTransfer = () => {
    onClose();
    setTransferForm({
      beneficiarySwiftBic: "",
      beneficiaryBankName: "",
      beneficiaryBankCity: "",
      beneficiaryAccountId: "",
      beneficiaryAccountCcy: "",
      beneficiaryName: "",
      beneficiaryEmail: "",
      amount: "",
      amountType: "0",
      paymentPurposeId: "",
      senderAddress: "",
      messageToBeneficiary: "",
    });
    setSendMoneyResponse(null);
    setTransferStatus("SUBMITTED");
    queryClient.invalidateQueries({ queryKey: ["wallet"] });
    notifications.show({
      title: "Transfer Complete",
      message: "Your international transfer has been initiated via SWIFT.",
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
            <Alert color="blue" icon={<Globe size={16} />} variant="light">
              <Text size="sm">
                Available Balance:{" "}
                <strong>{formatBalance(walletData.balance)}</strong>
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                International transfers via SWIFT network
              </Text>
            </Alert>

            {/* Charge Type Selection */}
            <div>
              <Text
                size="sm"
                fw={500}
                mb="xs"
                style={{ color: customStyles.primary }}
              >
                Fee Payment Method *
              </Text>
              <Radio.Group value={chargeType} onChange={setChargeType}>
                <Stack gap="sm">
                  {Object.entries(chargeTypes).map(([key, config]) => (
                    <Card
                      key={key}
                      withBorder
                      radius="md"
                      p="sm"
                      style={{
                        cursor: "pointer",
                        border:
                          chargeType === key
                            ? `2px solid ${customStyles.primary}`
                            : "1px solid #e9ecef",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => setChargeType(key)}
                    >
                      <Radio
                        value={key}
                        label={
                          <div>
                            <Text fw={600} size="sm" mb={4}>
                              {config.label}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {config.description}
                            </Text>
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

            <TextInput
              label="SWIFT/BIC Code"
              placeholder="e.g., BARCGB22XXX (8 or 11 characters)"
              value={transferForm.beneficiarySwiftBic}
              onChange={(e) =>
                setTransferForm((prev) => ({
                  ...prev,
                  beneficiarySwiftBic: e.target.value.toUpperCase(),
                }))
              }
              leftSection={<Building2 size={16} />}
              styles={{
                label: { color: customStyles.primary, fontWeight: 500 },
                input: { borderColor: customStyles.primary },
              }}
              maxLength={11}
              required
            />

            <Group grow>
              <TextInput
                label="Bank Name"
                placeholder="e.g., Barclays Bank"
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
              <TextInput
                label="Bank City"
                placeholder="e.g., London"
                value={transferForm.beneficiaryBankCity}
                onChange={(e) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    beneficiaryBankCity: e.target.value,
                  }))
                }
                leftSection={<MapPin size={16} />}
                styles={{
                  label: { color: customStyles.primary, fontWeight: 500 },
                  input: { borderColor: customStyles.primary },
                }}
                required
              />
            </Group>

            {/* Beneficiary Account Details */}
            <Text
              size="sm"
              fw={600}
              mt="md"
              style={{ color: customStyles.primary }}
            >
              Beneficiary Details
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
                label="Account Number / IBAN"
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
                data={internationalCurrencies}
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
                searchable
                required
              />
            </Group>

            <TextInput
              label="Beneficiary Email (Optional)"
              placeholder="recipient@example.com"
              value={transferForm.beneficiaryEmail}
              onChange={(e) =>
                setTransferForm((prev) => ({
                  ...prev,
                  beneficiaryEmail: e.target.value,
                }))
              }
              leftSection={<Mail size={16} />}
              type="email"
              styles={{
                label: { color: customStyles.primary, fontWeight: 500 },
                input: { borderColor: customStyles.primary },
              }}
            />

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
                value={transferForm.amount}
                onChange={(e) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                leftSection={<Text size="sm">{walletData.currency}</Text>}
                type="number"
                min={1}
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
              label="Amount Type"
              placeholder="Select amount type"
              data={amountTypes}
              value={transferForm.amountType}
              onChange={(value) =>
                setTransferForm((prev) => ({
                  ...prev,
                  amountType: value || "0",
                }))
              }
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
              label="Message to Beneficiary (Optional)"
              placeholder="Optional message to recipient (max 140 characters)"
              value={transferForm.messageToBeneficiary}
              onChange={(e) =>
                setTransferForm((prev) => ({
                  ...prev,
                  messageToBeneficiary: e.target.value,
                }))
              }
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

            {/* Action Buttons */}
            <Group justify="space-between" mt="md">
              <Button variant="outline" color="gray" onClick={onBack}>
                Back
              </Button>
              <Button
                onClick={handleInternationalTransferSubmit}
                loading={isSendMoneyLoading || sendMoneyMutation.isPending}
                style={{ background: customStyles.gradient }}
                leftSection={<Globe size={16} />}
                disabled={
                  !chargeType ||
                  !transferForm.beneficiarySwiftBic ||
                  !transferForm.beneficiaryBankName ||
                  !transferForm.beneficiaryBankCity ||
                  !transferForm.beneficiaryAccountId ||
                  !transferForm.beneficiaryAccountCcy ||
                  !transferForm.beneficiaryName ||
                  !transferForm.amount ||
                  !transferForm.paymentPurposeId ||
                  !transferForm.senderAddress ||
                  parseFloat(transferForm.amount) > availableBalance
                }
              >
                Initiate SWIFT Transfer
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
                    International transfer submitted successfully! Please enter
                    the OTP sent to your phone to validate the transaction.
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
                        Fee Payment
                      </Text>
                      <Text fw={500}>
                        {
                          chargeTypes[chargeType as keyof typeof chargeTypes]
                            ?.label
                        }
                      </Text>
                    </div>

                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Beneficiary Bank
                      </Text>
                      <Text fw={500}>
                        {transferForm.beneficiaryBankName},{" "}
                        {transferForm.beneficiaryBankCity}
                      </Text>
                      <Text size="xs" c="dimmed">
                        SWIFT: {transferForm.beneficiarySwiftBic}
                      </Text>
                    </div>

                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Beneficiary
                      </Text>
                      <Text fw={500}>{transferForm.beneficiaryName}</Text>
                      <Text size="xs" c="dimmed">
                        {transferForm.beneficiaryAccountId} (
                        {transferForm.beneficiaryAccountCcy})
                      </Text>
                    </div>

                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Amount
                      </Text>
                      <Text fw={500} style={{ color: customStyles.primary }}>
                        {new Intl.NumberFormat("en-KE", {
                          style: "currency",
                          currency: walletData.currency || "KES",
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
                        Fee Payment Method
                      </Text>
                      <Text fw={500}>
                        {
                          chargeTypes[chargeType as keyof typeof chargeTypes]
                            ?.label
                        }
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Beneficiary Bank
                      </Text>
                      <Text fw={500}>
                        {transferForm.beneficiaryBankName},{" "}
                        {transferForm.beneficiaryBankCity}
                      </Text>
                      <Text size="xs" c="dimmed">
                        SWIFT: {transferForm.beneficiarySwiftBic}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Beneficiary
                      </Text>
                      <Text fw={500}>{transferForm.beneficiaryName}</Text>
                      <Text size="xs" c="dimmed">
                        {transferForm.beneficiaryAccountId} (
                        {transferForm.beneficiaryAccountCcy})
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
                          currency: walletData.currency || "KES",
                        }).format(parseFloat(transferForm.amount))}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed" mb="xs">
                        Payment Purpose
                      </Text>
                      <Text fw={500}>
                        {
                          paymentPurposes.find(
                            (p) => p.value === transferForm.paymentPurposeId
                          )?.label
                        }
                      </Text>
                    </div>
                    {transferForm.messageToBeneficiary && (
                      <div>
                        <Text size="sm" c="dimmed" mb="xs">
                          Message to Beneficiary
                        </Text>
                        <Text fw={500} size="sm">
                          {transferForm.messageToBeneficiary}
                        </Text>
                      </div>
                    )}
                  </Stack>
                </Card>

                <Alert icon={<Globe size={16} />} color="teal" variant="light">
                  <Text size="xs">
                    Your international transfer is being processed via the SWIFT
                    network. Processing time typically takes 1-5 business days
                    depending on the destination country.
                  </Text>
                </Alert>

                <Group justify="flex-end">
                  <Button
                    onClick={handleCompleteInternationalTransfer}
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
