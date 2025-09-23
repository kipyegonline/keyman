"use client";
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Text,
  LoadingOverlay,
  Alert,
} from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowUpRight, User, AlertTriangle } from "lucide-react";
import { notifications } from "@mantine/notifications";
import { notify } from "@/lib/notifications";
import { sendMoney } from "@/api/wallet";

interface SendMoneyModalProps {
  opened: boolean;
  onClose: () => void;
  walletData: {
    currency: string;
    balance: string;
  };
}

export default function SendMoneyModal({
  opened,
  onClose,
  walletData,
}: SendMoneyModalProps) {
  const [sendMoneyForm, setSendMoneyForm] = useState({
    accountId: "",
    amount: "",
    description: "",
  });
  const [sendMoneyResponse, setSendMoneyResponse] = useState<null | Record<
    string,
    string | number
  >>(null);
  const [isSendMoneyLoading, setIsSendMoneyLoading] = useState(false);

  const queryClient = useQueryClient();
  const availableBalance = parseFloat(walletData.balance);

  const sendMoneyMutation = useMutation({
    mutationFn: (data: { recipient_wallet_id: string; amount: number; description: string }) =>
      sendMoney(data),
    onSuccess: (data) => {
      setIsSendMoneyLoading(false);
      if (data.success) {
        setSendMoneyResponse(data);
        notifications.show({
          title: "Success",
          message: "Money sent successfully!",
          color: "green",
        });
      } else {
        notify.error(data.message || "Failed to send money");
      }
    },
    onError: (error) => {
      setIsSendMoneyLoading(false);
      console.error("Send money error:", error);
      notify.error("Failed to send money. Please try again.");
    },
  });

  const handleSendMoneySubmit = () => {
    if (!sendMoneyForm.accountId || !sendMoneyForm.amount || !sendMoneyForm.description) {
      notify.error("Please fill in all fields");
      return;
    }

    const amount = parseFloat(sendMoneyForm.amount);
    if (amount <= 0 || isNaN(amount)) {
      notify.error("Please enter a valid amount");
      return;
    }

    // Check if user has sufficient balance
    if (amount > availableBalance) {
      notify.error("Insufficient balance. Please enter a lower amount.");
      return;
    }

    setIsSendMoneyLoading(true);
    sendMoneyMutation.mutate({
      recipient_wallet_id: sendMoneyForm.accountId,
      amount: amount,
      description: sendMoneyForm.description,
    });
  };

  const handleCompleteSendMoney = () => {
    onClose();
    setSendMoneyForm({ accountId: "", amount: "", description: "" });
    setSendMoneyResponse(null);
    queryClient.invalidateQueries({ queryKey: ["wallet"] });
    notifications.show({
      title: "Transaction Completed",
      message: "Your wallet has been updated.",
      color: "green",
    });
  };

  const handleClose = () => {
    onClose();
    setSendMoneyForm({ accountId: "", amount: "", description: "" });
    setSendMoneyResponse(null);
  };

  const formatBalance = (balance: string) => {
    const numBalance = parseFloat(balance);
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: walletData.currency || "KES",
    }).format(numBalance);
  };

  const getBalanceColor = () => {
    const amount = parseFloat(sendMoneyForm.amount);
    if (!amount || isNaN(amount)) return "dimmed";
    return amount > availableBalance ? "red" : "green";
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <ArrowUpRight size={20} style={{ color: "#3D6B2C" }} />
          <Text fw={600} style={{ color: "#3D6B2C" }}>
            Send Money
          </Text>
        </Group>
      }
      centered
    >
      <LoadingOverlay
        visible={isSendMoneyLoading || sendMoneyMutation.isPending}
      />

      <Stack gap="lg">
        {!sendMoneyResponse ? (
          <>
            {/* Available Balance Display */}
            <Alert color="blue" icon={<User size={16} />}>
              <Text size="sm">
                Available Balance:{" "}
                <strong>{formatBalance(walletData.balance)}</strong>
              </Text>
            </Alert>

            <TextInput
              label="Account ID"
              placeholder="Enter recipient's account ID"
              value={sendMoneyForm.accountId}
              onChange={(event) =>
                setSendMoneyForm((prev) => ({
                  ...prev,
                  accountId: event.target?.value || "",
                }))
              }
              leftSection={<User size={16} />}
              required
            />

            <div>
              <TextInput
                label="Amount"
                placeholder="Enter amount to send"
                value={sendMoneyForm.amount}
                onChange={(event) =>
                  setSendMoneyForm((prev) => ({
                    ...prev,
                    amount: event.target?.value || "",
                  }))
                }
                leftSection={<Text size="sm">{walletData.currency}</Text>}
                type="number"
                min={1}
                max={availableBalance}
                required
                error={
                  sendMoneyForm.amount &&
                  parseFloat(sendMoneyForm.amount) > availableBalance
                    ? "Amount exceeds available balance"
                    : undefined
                }
              />
              {sendMoneyForm.amount && (
                <Text size="xs" c={getBalanceColor()} mt="xs">
                  {parseFloat(sendMoneyForm.amount) > availableBalance ? (
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
                        availableBalance - parseFloat(sendMoneyForm.amount)
                      ).toString()
                    )}`
                  )}
                </Text>
              )}
            </div>

            <Textarea
              label="Description"
              placeholder="Enter transfer description (e.g., Payment for services, Loan repayment, etc.)"
              value={sendMoneyForm.description}
              onChange={(event) =>
                setSendMoneyForm((prev) => ({
                  ...prev,
                  description: event.target?.value || "",
                }))
              }
              minRows={2}
              maxRows={4}
              autosize
              required
            />

            <Group justify="flex-end">
              <Button variant="light" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSendMoneySubmit}
                loading={isSendMoneyLoading || sendMoneyMutation.isPending}
                style={{ backgroundColor: "#3D6B2C" }}
                leftSection={<ArrowUpRight size={16} />}
                disabled={
                  !sendMoneyForm.accountId ||
                  !sendMoneyForm.amount ||
                  !sendMoneyForm.description ||
                  parseFloat(sendMoneyForm.amount) > availableBalance
                }
              >
                Send Money
              </Button>
            </Group>
          </>
        ) : (
          <>
            <Alert color="green" icon={<ArrowUpRight size={16} />}>
              <Text size="sm">
                Money sent successfully! The transaction has been completed.
              </Text>
            </Alert>
            <div>
              <Text size="sm" c="dimmed" mb="xs">
                Recipient Account ID
              </Text>
              <Text fw={500}>{sendMoneyForm.accountId}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed" mb="xs">
                Amount Sent
              </Text>
              <Text fw={500}>
                {new Intl.NumberFormat("en-KE", {
                  style: "currency",
                  currency: walletData.currency || "KES",
                }).format(parseFloat(sendMoneyForm.amount))}
              </Text>
            </div>
            <div>
              <Text size="sm" c="dimmed" mb="xs">
                Description
              </Text>
              <Text fw={500}>{sendMoneyForm.description}</Text>
            </div>
            <Group justify="flex-end">
              <Button
                onClick={handleCompleteSendMoney}
                style={{ backgroundColor: "#3D6B2C" }}
                leftSection={<ArrowUpRight size={16} />}
              >
                Complete Transaction
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}
