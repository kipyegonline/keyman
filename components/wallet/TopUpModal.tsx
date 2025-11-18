"use client";
import {
  Modal,
  TextInput,
  Button,
  Group,
  Stack,
  Text,
  LoadingOverlay,
  Alert,
} from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Phone, Plus, ArrowUpRight } from "lucide-react";
import { notifications } from "@mantine/notifications";
import { notify } from "@/lib/notifications";
import { topUpWallet } from "@/api/wallet";

interface TopUpModalProps {
  opened: boolean;
  onClose: () => void;
  walletData: {
    currency: string;
  };
}

export default function TopUpModal({
  opened,
  onClose,
  walletData,
}: TopUpModalProps) {
  const [topUpForm, setTopUpForm] = useState({
    phoneNumber: "",
    amount: "",
  });
  const [topUpResponse, setTopUpResponse] = useState<null | Record<
    string,
    string | number
  >>(null);
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);

  const queryClient = useQueryClient();

  const topUpMutation = useMutation({
    mutationFn: (data: { phone_number: string; amount: number }) =>
      topUpWallet(data),
    onSuccess: (data) => {
      setIsTopUpLoading(false);

      if (data.status) {
        setTopUpResponse(data);
        notifications.show({
          title: "Success",
          message: data.message,
          color: "green",
        });
      } else {
        notify.error(data.message || "Failed to initiate top up");
      }
    },
    onError: (error) => {
      setIsTopUpLoading(false);
      console.error("Top up error:", error);
      notify.error("Failed to initiate top up. Please try again.");
    },
  });

  const handleTopUpSubmit = () => {
    if (!topUpForm.phoneNumber || !topUpForm.amount) {
      notify.error("Please fill in all fields");
      return;
    }

    const amount = parseFloat(topUpForm.amount);
    if (amount <= 0 || isNaN(amount)) {
      notify.error("Please enter a valid amount");
      return;
    }

    setIsTopUpLoading(true);
    topUpMutation.mutate({
      phone_number: topUpForm.phoneNumber,
      amount: amount,
    });
  };

  const handleCompleteTopUp = () => {
    onClose();
    setTopUpForm({ phoneNumber: "", amount: "" });
    setTopUpResponse(null);
    queryClient.invalidateQueries({ queryKey: ["wallet"] });
    notifications.show({
      title: "Payment Completed",
      message: "Your wallet will be updated shortly.",
      color: "green",
    });
  };

  const handleClose = () => {
    onClose();
    setTopUpForm({ phoneNumber: "", amount: "" });
    setTopUpResponse(null);
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <Plus size={20} style={{ color: "#F08C23" }} />
          <Text fw={600} style={{ color: "#F08C23" }}>
            Top Up Wallet
          </Text>
        </Group>
      }
      centered
    >
      <LoadingOverlay visible={isTopUpLoading || topUpMutation.isPending} />

      <Stack gap="lg">
        {!topUpResponse ? (
          <>
            <TextInput
              label="Phone Number"
              placeholder="+254 700 000 000"
              value={topUpForm?.phoneNumber}
              onChange={(event) => {
                setTopUpForm((prev) => ({
                  ...prev,
                  phoneNumber: event.target?.value,
                }));
              }}
              leftSection={<Phone size={16} />}
              required
            />
            <TextInput
              label="Amount"
              placeholder="Enter amount to top up"
              value={topUpForm?.amount}
              onChange={(event) =>
                setTopUpForm((prev) => ({
                  ...prev,
                  amount: event.target?.value,
                }))
              }
              leftSection={<Text size="sm">{walletData.currency}</Text>}
              type="number"
              min={1}
              required
            />
            <Group justify="flex-end">
              <Button variant="light" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleTopUpSubmit}
                loading={isTopUpLoading || topUpMutation.isPending}
                style={{ backgroundColor: "#F08C23" }}
                leftSection={<Plus size={16} />}
              >
                Top Up
              </Button>
            </Group>
          </>
        ) : (
          <>
            <Alert color="green" icon={<Plus size={16} />}>
              <Text size="sm">
                Top up request initiated! Please complete the payment on your
                phone using STK push.
              </Text>
            </Alert>
            <div>
              <Text size="sm" c="dimmed" mb="xs">
                Phone Number
              </Text>
              <Text fw={500}>{topUpForm.phoneNumber}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed" mb="xs">
                Amount
              </Text>
              <Text fw={500}>
                {new Intl.NumberFormat("en-KE", {
                  style: "currency",
                  currency: walletData.currency || "KES",
                }).format(parseFloat(topUpForm.amount))}
              </Text>
            </div>
            <Group justify="flex-end">
              <Button
                onClick={handleCompleteTopUp}
                style={{ backgroundColor: "#3D6B2C" }}
                leftSection={<ArrowUpRight size={16} />}
              >
                Complete Top Up
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}
