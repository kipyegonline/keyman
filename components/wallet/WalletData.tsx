"use client";
import { sendOTP, confirmOTP } from "@/api/wallet";
import {
  Container,
  Card,
  Text,
  Button,
  Group,
  Stack,
  Badge,
  Divider,
  TextInput,
  Modal,
  LoadingOverlay,
  Paper,
  Grid,
  Title,
  ActionIcon,
  ThemeIcon,
} from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Wallet,
  RefreshCw,
  History,
  Phone,
  Eye,
  EyeOff,
  Plus,
  ArrowUpRight,
  Shield,
  Clock,
} from "lucide-react";
import { notifications } from "@mantine/notifications";
import LoadingComponent from "@/lib/LoadingComponent";

interface AccountDetails {
  accountId: string;
  accountName: string;
  accountStatus: number;
  accountType: string;
  balance: string;
  createTime: number;
  currency: string;
  dormantStatus: number;
  freezeStatus: number;
  shortCode: string | null;
}

interface WalletDataProps {
  walletData: AccountDetails;
  isLoading?: boolean;
}

export default function WalletData({
  walletData,
  isLoading = false,
}: WalletDataProps) {
  const [verifyPhoneModalOpen, setVerifyPhoneModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const queryClient = useQueryClient();

  // Helper functions for account status
  const getAccountStatusBadge = (status: number) => {
    const statusMap = {
      1: { label: "Active", color: "green" },
      0: { label: "Inactive", color: "red" },
      2: { label: "Suspended", color: "yellow" },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: "Unknown",
      color: "gray",
    };
    return (
      <Badge color={statusInfo.color} variant="light">
        {statusInfo.label}
      </Badge>
    );
  };

  const getAccountTypeBadge = (type: string) => {
    const typeColors = {
      personal: "#3D6B2C",
      business: "#F08C23",
      corporate: "#1976D2",
    };
    const safeType = type || "unknown";
    return (
      <Badge
        style={{
          backgroundColor:
            typeColors[safeType?.toLowerCase() as keyof typeof typeColors] ||
            "#6B7280",
        }}
        variant="filled"
      >
        {safeType.toUpperCase()}
      </Badge>
    );
  };

  const formatBalance = (balance: string) => {
    const numBalance = parseFloat(balance);
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: walletData.currency || "KES",
    }).format(numBalance);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sendOtpMutation = useMutation({
    mutationFn: (phone: string) => sendOTP(phone),
    onSuccess: (data) => {
      if (data.status) {
        setOtpSent(true);
        notifications.show({
          title: "OTP Sent",
          message: "Verification code sent to your phone",
          color: "blue",
        });
      } else {
        notifications.show({
          title: "Error",
          message: data.message || "Failed to send OTP",
          color: "red",
        });
      }
    },
  });

  const confirmOtpMutation = useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      confirmOTP(phone, otp),
    onSuccess: (data) => {
      if (data.status) {
        notifications.show({
          title: "Success",
          message: "Phone number verified successfully!",
          color: "green",
        });
        setVerifyPhoneModalOpen(false);
        setOtpSent(false);
        setOtp("");
        queryClient.invalidateQueries({ queryKey: ["wallet"] });
      } else {
        notifications.show({
          title: "Error",
          message: data.message || "Invalid OTP",
          color: "red",
        });
      }
    },
  });

  const handleSendOTP = () => {
    if (!phoneNumber) {
      notifications.show({
        title: "Error",
        message: "Please enter your phone number",
        color: "red",
      });
      return;
    }
    sendOtpMutation.mutate(phoneNumber);
  };

  const handleConfirmOTP = () => {
    if (!otp) {
      notifications.show({
        title: "Error",
        message: "Please enter the OTP",
        color: "red",
      });
      return;
    }
    confirmOtpMutation.mutate({ phone: phoneNumber, otp });
  };
  if (isLoading) return <LoadingComponent message="Preparing wallet data..." />;
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={1} style={{ color: "#3D6B2C" }}>
              {walletData.accountName || "My Wallet"}
            </Title>
            <Text size="sm" c="dimmed">
              Account ID: {walletData.accountId}
              {walletData.shortCode && ` • Short Code: ${walletData.shortCode}`}
            </Text>
          </div>
          <Group>
            <ActionIcon
              variant="light"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["wallet"] })
              }
              loading={isLoading}
              style={{ backgroundColor: "#3D6B2C15", color: "#3D6B2C" }}
            >
              <RefreshCw size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Account Status Overview */}
        <Paper shadow="sm" radius="lg" p="md" className="bg-gray-50">
          <Group justify="space-between" align="center">
            <Group gap="md">
              {getAccountStatusBadge(walletData.accountStatus)}
              {getAccountTypeBadge(walletData.accountType)}

              {walletData.freezeStatus === 1 && (
                <Badge
                  color="blue"
                  variant="light"
                  leftSection={<Shield size={12} />}
                >
                  Frozen
                </Badge>
              )}

              {walletData.dormantStatus === 1 && (
                <Badge
                  color="orange"
                  variant="light"
                  leftSection={<Clock size={12} />}
                >
                  Dormant
                </Badge>
              )}
            </Group>

            <Text size="xs" c="dimmed">
              Created: {formatDate(walletData.createTime)}
            </Text>
          </Group>
        </Paper>

        {/* Wallet Balance Card */}
        <Paper
          shadow="md"
          radius="lg"
          p="xl"
          className="bg-gradient-to-br from-green-600 to-green-800 text-white"
          style={{
            background: "linear-gradient(135deg, #3D6B2C 0%, #2D5320 100%)",
            color: "white",
          }}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="sm" opacity={0.9} className="mb-1">
                Available Balance
              </Text>
              <Group align="center" gap="xs">
                <Text size="2.5rem" fw="bold" className="leading-none">
                  {showBalance ? formatBalance(walletData.balance) : "••••••"}
                </Text>
                <ActionIcon
                  variant="transparent"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
                </ActionIcon>
              </Group>
              <Text size="xs" opacity={0.8} className="mt-2">
                Currency: {walletData.currency}
              </Text>
            </div>
            <ThemeIcon
              size={80}
              radius="xl"
              variant="light"
              color="white"
              className="bg-white bg-opacity-20"
            >
              <Wallet size={40} />
            </ThemeIcon>
          </Group>
        </Paper>

        {/* Action Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card
              shadow="sm"
              radius="md"
              p="lg"
              className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              style={{ height: "100%" }}
            >
              <Group gap="md" align="center">
                <ThemeIcon
                  size={50}
                  radius="md"
                  style={{ backgroundColor: "#3D6B2C15" }}
                  variant="light"
                >
                  <ArrowUpRight size={24} style={{ color: "#3D6B2C" }} />
                </ThemeIcon>
                <div>
                  <Text fw={600} style={{ color: "#3D6B2C" }}>
                    Send Money
                  </Text>
                  <Text size="sm" c="dimmed">
                    Transfer funds to others
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card
              shadow="sm"
              radius="md"
              p="lg"
              className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              style={{ height: "100%" }}
            >
              <Group gap="md" align="center">
                <ThemeIcon
                  size={50}
                  radius="md"
                  style={{ backgroundColor: "#F08C2315" }}
                  variant="light"
                >
                  <Plus size={24} style={{ color: "#F08C23" }} />
                </ThemeIcon>
                <div>
                  <Text fw={600} style={{ color: "#F08C23" }}>
                    Add Money
                  </Text>
                  <Text size="sm" c="dimmed">
                    Top up your wallet
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card
              shadow="sm"
              radius="md"
              p="lg"
              className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              style={{ height: "100%" }}
              onClick={() => setVerifyPhoneModalOpen(true)}
            >
              <Group gap="md" align="center">
                <ThemeIcon
                  size={50}
                  radius="md"
                  style={{
                    backgroundColor:
                      walletData.accountStatus === 1
                        ? "#3D6B2C15"
                        : "#F08C2315",
                  }}
                  variant="light"
                >
                  <Phone
                    size={24}
                    style={{
                      color:
                        walletData.accountStatus === 1 ? "#3D6B2C" : "#F08C23",
                    }}
                  />
                </ThemeIcon>
                <div>
                  <Text
                    fw={600}
                    style={{
                      color:
                        walletData.accountStatus === 1 ? "#3D6B2C" : "#F08C23",
                    }}
                  >
                    Account Status
                  </Text>
                  <Text size="sm" c="dimmed">
                    Manage verification
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Account Information */}
        <Paper shadow="sm" radius="md" p="lg">
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <ThemeIcon
                size={24}
                style={{ backgroundColor: "#3D6B2C15" }}
                variant="light"
              >
                <History size={16} style={{ color: "#3D6B2C" }} />
              </ThemeIcon>
              <Text fw={600} size="lg" style={{ color: "#3D6B2C" }}>
                Account Information
              </Text>
            </Group>
            <Button
              variant="light"
              size="compact-sm"
              style={{ backgroundColor: "#3D6B2C15", color: "#3D6B2C" }}
            >
              View Details
            </Button>
          </Group>

          <Divider mb="md" />

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <div>
                  <Text size="sm" c="dimmed" className="mb-1">
                    Account Name
                  </Text>
                  <Text fw={500}>{walletData.accountName}</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed" className="mb-1">
                    Account Type
                  </Text>
                  <Text fw={500}>{walletData?.accountType?.toUpperCase()}</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed" className="mb-1">
                    Currency
                  </Text>
                  <Text fw={500}>{walletData.currency}</Text>
                </div>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <div>
                  <Text size="sm" c="dimmed" className="mb-1">
                    Account Status
                  </Text>
                  {getAccountStatusBadge(walletData.accountStatus)}
                </div>
                <div>
                  <Text size="sm" c="dimmed" className="mb-1">
                    Created
                  </Text>
                  <Text fw={500}>{formatDate(walletData.createTime)}</Text>
                </div>
                {walletData.shortCode && (
                  <div>
                    <Text size="sm" c="dimmed" className="mb-1">
                      Short Code
                    </Text>
                    <Text fw={500}>{walletData.shortCode}</Text>
                  </div>
                )}
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Phone Verification Modal */}
        <Modal
          opened={verifyPhoneModalOpen}
          onClose={() => {
            setVerifyPhoneModalOpen(false);
            setOtpSent(false);
            setOtp("");
          }}
          title="Verify Phone Number"
          centered
        >
          <LoadingOverlay
            visible={sendOtpMutation.isPending || confirmOtpMutation.isPending}
          />

          <Stack>
            {!otpSent ? (
              <>
                <TextInput
                  label="Phone Number"
                  placeholder="+254 700 000 000"
                  value={phoneNumber}
                  onChange={(event) =>
                    setPhoneNumber(event.currentTarget.value)
                  }
                  leftSection={<Phone size={16} />}
                />
                <Group justify="flex-end">
                  <Button
                    variant="light"
                    onClick={() => setVerifyPhoneModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendOTP}
                    loading={sendOtpMutation.isPending}
                  >
                    Send OTP
                  </Button>
                </Group>
              </>
            ) : (
              <>
                <Text size="sm" c="dimmed">
                  Enter the verification code sent to {phoneNumber}
                </Text>
                <TextInput
                  label="Verification Code"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(event) => setOtp(event.currentTarget.value)}
                  maxLength={6}
                />
                <Group justify="flex-end">
                  <Button variant="light" onClick={() => setOtpSent(false)}>
                    Back
                  </Button>
                  <Button
                    onClick={handleConfirmOTP}
                    loading={confirmOtpMutation.isPending}
                  >
                    Verify
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
}
