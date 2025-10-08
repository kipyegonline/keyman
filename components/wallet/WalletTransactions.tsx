"use client";
import {
  Card,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  Grid,
  Paper,
  //ActionIcon,
  Tooltip,
  Divider,
  ThemeIcon,
  Modal,
  TextInput,
  Pagination,
  //Loader,
  //Center,
  Skeleton,
  Alert,
} from "@mantine/core";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Calendar,
  Hash,
  AlertCircle,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

interface Transaction {
  id: string;
  payable_type: string;
  payable_id: string;
  msisdn: string;
  status: string;
  checkout_request_id: string;
  merchant_request_id: string;
  transaction_code: string;
  payment_type: string;
  amount: string;
  currency: string;
  description: string;
  meta: Record<string, unknown> | null;
  callback_meta: string;
  created_at: string;
  updated_at: string;
  payment_for: string;
}

interface PaginationData {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

interface WalletTransactionsProps {
  transactions: Transaction[];
  pagination?: PaginationData | null;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function WalletTransactions({
  transactions,
  pagination,
  onPageChange,
  isLoading = false,
  error = null,
}: WalletTransactionsProps) {
  const [reverseModalOpen, setReverseModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [reversalReason, setReversalReason] = useState("");
  const [reversalLoading, setReversalLoading] = useState(false);

  const getStatusConfig = (status: string) => {
    const statusMap: Record<
      string,
      { color: string; label: string; icon: React.ReactNode }
    > = {
      completed: {
        color: "green",
        label: "Completed",
        icon: <CheckCircle size={14} />,
      },
      pending: { color: "yellow", label: "Pending", icon: <Clock size={14} /> },
      failed: { color: "red", label: "Failed", icon: <XCircle size={14} /> },
      reversed: {
        color: "gray",
        label: "Reversed",
        icon: <RotateCcw size={14} />,
      },
      processing: {
        color: "blue",
        label: "Processing",
        icon: <Clock size={14} />,
      },
    };

    return (
      statusMap[status.toLowerCase()] || {
        color: "gray",
        label: status,
        icon: <AlertCircle size={14} />,
      }
    );
  };

  const getPaymentTypeConfig = (type: string) => {
    const isDebit =
      type?.toLowerCase().includes("debit") ||
      type?.toLowerCase().includes("withdraw") ||
      type?.toLowerCase().includes("send");
    return {
      icon: isDebit ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />,
      color: isDebit ? "#F08C23" : "#3D6B2C",
      bgColor: isDebit ? "#F08C2315" : "#3D6B2C15",
      label: isDebit ? "Debit" : "Credit",
    };
  };

  const formatAmount = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency || "KES",
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    // Show relative time for recent transactions
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return `${diffInMinutes} min${diffInMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    }

    return date.toLocaleDateString("en-KE", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReverseClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setReverseModalOpen(true);
  };

  const handleReverseSubmit = async () => {
    if (!selectedTransaction) return;

    if (!reversalReason.trim()) {
      notifications.show({
        title: "Error",
        message: "Please provide a reason for reversal",
        color: "red",
      });
      return;
    }

    setReversalLoading(true);
    try {
      // TODO: Implement actual reversal API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      notifications.show({
        title: "Reversal Requested",
        message: "Your reversal request has been submitted successfully",
        color: "green",
      });

      setReverseModalOpen(false);
      setReversalReason("");
      setSelectedTransaction(null);
    } catch (error) {
      console.error(error);
      notifications.show({
        title: "Error",
        message: "Failed to submit reversal request",
        color: "red",
      });
    } finally {
      setReversalLoading(false);
    }
  };

  const canReverse = (transaction: Transaction) => {
    // Only allow reversal for completed transactions
    return (
      transaction.status.toLowerCase() === "completed" &&
      transaction.payment_type.toLowerCase().includes("debit")
    );
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Stack gap="md">
        {[1, 2, 3].map((index) => (
          <Card
            key={index}
            shadow="sm"
            radius="md"
            p="lg"
            style={{ border: "1px solid #e9ecef" }}
          >
            <Grid align="center" gutter="md">
              <Grid.Col span={{ base: 12, xs: 2, sm: 1 }}>
                <Skeleton height={50} width={50} radius="md" />
              </Grid.Col>
              <Grid.Col span={{ base: 12, xs: 10, sm: 5 }}>
                <Stack gap={8}>
                  <Skeleton height={20} width="70%" />
                  <Skeleton height={14} width="50%" />
                  <Skeleton height={12} width="40%" />
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 6, sm: 3 }}>
                <Stack gap={4}>
                  <Skeleton height={24} width="80%" />
                  <Skeleton height={12} width="60%" />
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 6, sm: 3 }}>
                <Group justify="flex-end">
                  <Skeleton height={36} width={100} radius="sm" />
                </Group>
              </Grid.Col>
            </Grid>
          </Card>
        ))}
      </Stack>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert
        icon={<AlertTriangle size={20} />}
        title="Failed to Load Transactions"
        color="red"
        variant="light"
        radius="md"
      >
        <Stack gap="sm">
          <Text size="sm">{error}</Text>
          <Button
            size="sm"
            variant="light"
            color="red"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Stack>
      </Alert>
    );
  }

  // Empty state
  if (!transactions || transactions.length === 0) {
    return (
      <Paper
        shadow="sm"
        radius="md"
        p="xl"
        style={{
          textAlign: "center",
          background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
        }}
      >
        <Stack align="center" gap="md">
          <ThemeIcon
            size={80}
            radius="xl"
            variant="light"
            style={{
              backgroundColor: "#3D6B2C15",
              color: "#3D6B2C",
            }}
          >
            <Receipt size={40} />
          </ThemeIcon>
          <div>
            <Text fw={600} size="lg" style={{ color: "#3D6B2C" }}>
              No Transactions Yet
            </Text>
            <Text size="sm" c="dimmed" mt="xs" maw={400} mx="auto">
              Your transaction history will appear here once you start making
              payments, transfers, or top-ups.
            </Text>
          </div>
        </Stack>
      </Paper>
    );
  }

  return (
    <>
      <Stack gap="md">
        {transactions.map((transaction, index) => {
          const statusConfig = getStatusConfig(transaction.status);
          const typeConfig = getPaymentTypeConfig(transaction.payment_type);

          return (
            <Card
              key={transaction.id}
              shadow="sm"
              radius="md"
              p="lg"
              className="transaction-card"
              style={{
                border: "1px solid #e9ecef",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                animation: `slideIn 0.4s ease-out ${index * 0.05}s backwards`,
              }}
            >
              <Grid align="center" gutter="md">
                {/* Icon & Type */}
                <Grid.Col span={{ base: 12, xs: 2, sm: 1 }}>
                  <ThemeIcon
                    size={50}
                    radius="md"
                    style={{
                      backgroundColor: typeConfig.bgColor,
                      color: typeConfig.color,
                      transition: "transform 0.3s ease",
                    }}
                    className="transaction-icon"
                  >
                    {typeConfig.icon}
                  </ThemeIcon>
                </Grid.Col>

                {/* Transaction Details */}
                <Grid.Col span={{ base: 12, xs: 10, sm: 5 }}>
                  <Stack gap={4}>
                    <Group gap="xs">
                      <Text fw={600} size="md" lineClamp={1}>
                        {transaction.description || transaction.payment_for}
                      </Text>
                      <Badge
                        color={statusConfig.color}
                        variant="light"
                        leftSection={statusConfig.icon}
                        size="sm"
                      >
                        {statusConfig.label}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {transaction.payment_type} • {transaction.msisdn}
                    </Text>
                    {transaction.transaction_code && (
                      <Group gap={4}>
                        <Hash size={12} style={{ color: "#868e96" }} />
                        <Text size="xs" c="dimmed" className="font-mono">
                          {transaction.transaction_code}
                        </Text>
                      </Group>
                    )}
                  </Stack>
                </Grid.Col>

                {/* Amount */}
                <Grid.Col span={{ base: 6, sm: 3 }}>
                  <Stack gap={2}>
                    <Text
                      fw={700}
                      size="lg"
                      style={{
                        color: typeConfig.color,
                      }}
                    >
                      {typeConfig.label === "Debit" ? "-" : "+"}
                      {formatAmount(transaction.amount, transaction.currency)}
                    </Text>
                    <Group gap={4}>
                      <Calendar size={12} style={{ color: "#868e96" }} />
                      <Text size="xs" c="dimmed">
                        {formatDate(transaction.created_at)}
                      </Text>
                    </Group>
                  </Stack>
                </Grid.Col>

                {/* Action Button */}
                <Grid.Col span={{ base: 6, sm: 3 }}>
                  <Group justify="flex-end">
                    {canReverse(transaction) ? (
                      <Tooltip label="Request Reversal" position="left">
                        <Button
                          variant="light"
                          color="orange"
                          size="sm"
                          leftSection={<RotateCcw size={16} />}
                          onClick={() => handleReverseClick(transaction)}
                          style={{
                            transition: "all 0.3s ease",
                          }}
                          className="reverse-btn"
                        >
                          Reverse
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip
                        label={
                          transaction.status.toLowerCase() === "reversed"
                            ? "Already reversed"
                            : "Cannot reverse this transaction"
                        }
                        position="left"
                      >
                        <Button
                          variant="subtle"
                          color="gray"
                          size="sm"
                          disabled
                          leftSection={<RotateCcw size={16} />}
                        >
                          Reverse
                        </Button>
                      </Tooltip>
                    )}
                  </Group>
                </Grid.Col>
              </Grid>
            </Card>
          );
        })}
      </Stack>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <Group justify="space-between" align="center" mt="xl">
          <Text size="sm" c="dimmed">
            Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
            transactions
          </Text>
          <Pagination
            total={pagination.last_page}
            value={pagination.current_page}
            onChange={(page) => onPageChange?.(page)}
            color="#3D6B2C"
            size="sm"
            radius="md"
            withEdges
          />
        </Group>
      )}

      {/* Reversal Modal */}
      <Modal
        opened={reverseModalOpen}
        onClose={() => {
          setReverseModalOpen(false);
          setReversalReason("");
          setSelectedTransaction(null);
        }}
        title={
          <Group gap="sm">
            <RotateCcw size={20} style={{ color: "#F08C23" }} />
            <Text fw={600} style={{ color: "#F08C23" }}>
              Request Transaction Reversal
            </Text>
          </Group>
        }
        centered
      >
        <Stack gap="md">
          <Paper p="md" style={{ backgroundColor: "#FFF3E0" }} radius="md">
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                Transaction Details
              </Text>
              <Divider />
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Amount:
                </Text>
                <Text size="sm" fw={600}>
                  {selectedTransaction &&
                    formatAmount(
                      selectedTransaction.amount,
                      selectedTransaction.currency
                    )}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Transaction Code:
                </Text>
                <Text size="sm" fw={500} className="font-mono">
                  {selectedTransaction?.transaction_code}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Date:
                </Text>
                <Text size="sm">
                  {selectedTransaction &&
                    formatDate(selectedTransaction.created_at)}
                </Text>
              </Group>
            </Stack>
          </Paper>

          <TextInput
            label="Reason for Reversal"
            placeholder="Please explain why you want to reverse this transaction"
            value={reversalReason}
            onChange={(e) => setReversalReason(e.currentTarget.value)}
            required
          />

          <Text size="xs" c="dimmed">
            Note: Reversal requests are subject to review and may take 1-3
            business days to process.
          </Text>

          <Group justify="flex-end" mt="md">
            <Button
              variant="light"
              onClick={() => {
                setReverseModalOpen(false);
                setReversalReason("");
                setSelectedTransaction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReverseSubmit}
              loading={reversalLoading}
              style={{ backgroundColor: "#F08C23" }}
              leftSection={<RotateCcw size={16} />}
            >
              Submit Request
            </Button>
          </Group>
        </Stack>
      </Modal>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .transaction-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
          transform: translateY(-2px);
        }

        .transaction-card:hover .transaction-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .reverse-btn:hover {
          transform: scale(1.05);
        }

        .font-mono {
          font-family: "Courier New", monospace;
        }

        /* Pagination styling */
        .mantine-Pagination-control[data-active="true"] {
          background-color: #3d6b2c !important;
          border-color: #3d6b2c !important;
        }

        .mantine-Pagination-control:hover:not([data-active="true"]) {
          background-color: #3d6b2c15 !important;
          border-color: #3d6b2c !important;
        }
      `}</style>
    </>
  );
}
