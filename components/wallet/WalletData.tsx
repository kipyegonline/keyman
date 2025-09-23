"use client";
import { sendOTP, confirmOTP, upgradeWalletAccount } from "@/api/wallet";
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
  FileInput,
  Alert,
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
  TrendingUp,
  Upload,
  X,
  Camera,
  FileText,
} from "lucide-react";
import { notifications } from "@mantine/notifications";
import LoadingComponent from "@/lib/LoadingComponent";
import { toDataUrlFromFile } from "@/lib/FileHandlers";
import { notify } from "@/lib/notifications";
import TopUpModal from "./TopUpModal";

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
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeForm, setUpgradeForm] = useState({
    kraPin: "",
    selfiePhoto: null as File | null,
    frontSidePhoto: null as File | null,
    backSidePhoto: null as File | null,
  });
  const [photoPreview, setPhotoPreview] = useState<{ [key: string]: string }>(
    {}
  );
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);

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

  const upgradeMutation = useMutation({
    mutationFn: (formData: FormData) => upgradeWalletAccount(formData),
    onSuccess: (data) => {
      if (data.status || data.success) {
        notifications.show({
          title: "Success",
          message: "Wallet account upgrade submitted successfully!",
          color: "green",
        });
        setUpgradeModalOpen(false);
        setUpgradeForm({
          kraPin: "",
          selfiePhoto: null,
          frontSidePhoto: null,
          backSidePhoto: null,
        });
        setPhotoPreview({});
        queryClient.invalidateQueries({ queryKey: ["wallet"] });
      } else {
        notify.error(data.message || "Failed to upgrade account");
      }
    },
    onError: (error) => {
      console.error("Upgrade error:", error);
      notify.error("Failed to upgrade account. Please try again.");
    },
  });


  const handleSendOTP = () => {
    if (!phoneNumber) {
      notify.error("Please enter your phone number");
      return;
    }
    sendOtpMutation.mutate(phoneNumber);
  };

  const handleConfirmOTP = () => {
    if (!otp) {
      notify.error("Please enter the OTP");

      return;
    }
    confirmOtpMutation.mutate({ phone: phoneNumber, otp });
  };

  const handleFilePreview = (file: File | null, fieldName: string) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview((prev) => ({
          ...prev,
          [fieldName]: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview((prev) => {
        const newPreview = { ...prev };
        delete newPreview[fieldName];
        return newPreview;
      });
    }
  };

  const handleUpgradeSubmit = async () => {
    if (!upgradeForm.kraPin || !upgradeForm.selfiePhoto) {
      notifications.show({
        title: "Error",
        message: "Please fill in all required fields",
        color: "red",
      });
      return;
    }

    setIsUpgrading(true);
    try {
      const formData = new FormData();
      formData.append("kraPin", upgradeForm.kraPin);

      if (upgradeForm.selfiePhoto) {
        const base64 = await toDataUrlFromFile(upgradeForm.selfiePhoto);
        formData.append("selfiePhoto", (base64 as string).split(",")[1]);
      }

      if (upgradeForm.frontSidePhoto) {
        const base64 = await toDataUrlFromFile(upgradeForm.frontSidePhoto);
        formData.append("frontSidePhoto", (base64 as string).split(",")[1]);
      }

      if (upgradeForm.backSidePhoto) {
        const base64 = await toDataUrlFromFile(upgradeForm.backSidePhoto);
        formData.append("backSidePhoto", (base64 as string).split(",")[1]);
      }

      upgradeMutation.mutate(formData);
    } catch (error) {
      console.error("File processing error:", error);

      notify.error("Failed to process files. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
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
            <Button
              variant="light"
              leftSection={<TrendingUp size={16} />}
              onClick={() => setUpgradeModalOpen(true)}
              style={{ backgroundColor: "#F08C2315", color: "#F08C23" }}
              size="sm"
            >
              Upgrade Account
            </Button>
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
              onClick={() => setTopUpModalOpen(true)}
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

        {/* Upgrade Account Modal */}
        <Modal
          opened={upgradeModalOpen}
          onClose={() => {
            setUpgradeModalOpen(false);
            setUpgradeForm({
              kraPin: "",
              selfiePhoto: null,
              frontSidePhoto: null,
              backSidePhoto: null,
            });
            setPhotoPreview({});
          }}
          title={
            <Group gap="sm">
              <TrendingUp size={20} style={{ color: "#F08C23" }} />
              <Text fw={600} style={{ color: "#F08C23" }}>
                Upgrade to Current Account
              </Text>
            </Group>
          }
          centered
          size="lg"
        >
          <LoadingOverlay visible={isUpgrading || upgradeMutation.isPending} />

          <Stack gap="lg">
            <Alert color="blue" icon={<TrendingUp size={16} />}>
              <Text size="sm">
                Upgrade your wallet to a current account for enhanced features
                and higher transaction limits. All fields marked with * are
                required.
              </Text>
            </Alert>

            {/* KRA PIN Field */}
            <TextInput
              label="KRA PIN"
              placeholder="A00668857W"
              maxLength={11}
              leftSection={<FileText size={16} />}
              value={upgradeForm.kraPin}
              onChange={(event) =>
                setUpgradeForm((prev) => ({
                  ...prev,
                  kraPin: event.currentTarget.value,
                }))
              }
              required
            />

            <Divider label="Document Uploads" labelPosition="center" />

            {/* Selfie Photo - Required */}
            <div>
              <Text
                size="sm"
                fw={500}
                mb="xs"
                className="flex items-center gap-2"
              >
                <Camera size={16} />
                Selfie Photo <span className="text-red-500">*</span>
              </Text>
              <FileInput
                placeholder="Choose selfie photo"
                accept="image/*"
                value={upgradeForm.selfiePhoto}
                onChange={(file) => {
                  setUpgradeForm((prev) => ({ ...prev, selfiePhoto: file }));
                  handleFilePreview(file, "selfiePhoto");
                }}
                leftSection={<Upload size={16} />}
              />
              {photoPreview.selfiePhoto && (
                <Card className="mt-3 p-3 border border-gray-200">
                  <Group justify="space-between" mb="xs">
                    <Text size="xs" c="dimmed">
                      Selfie Preview
                    </Text>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => {
                        setUpgradeForm((prev) => ({
                          ...prev,
                          selfiePhoto: null,
                        }));
                        handleFilePreview(null, "selfiePhoto");
                      }}
                    >
                      <X size={14} />
                    </ActionIcon>
                  </Group>
                  <img
                    src={photoPreview.selfiePhoto}
                    alt="Selfie Preview"
                    className="max-h-32 w-auto mx-auto rounded"
                  />
                </Card>
              )}
            </div>

            {/* Front Side Photo - Optional */}
            <div>
              <Text
                size="sm"
                fw={500}
                mb="xs"
                className="flex items-center gap-2"
              >
                <Upload size={16} />
                ID Front Side Photo (Optional)
              </Text>
              <FileInput
                placeholder="Choose front side photo"
                accept="image/*"
                value={upgradeForm.frontSidePhoto}
                onChange={(file) => {
                  setUpgradeForm((prev) => ({ ...prev, frontSidePhoto: file }));
                  handleFilePreview(file, "frontSidePhoto");
                }}
                leftSection={<Upload size={16} />}
              />
              {photoPreview.frontSidePhoto && (
                <Card className="mt-3 p-3 border border-gray-200">
                  <Group justify="space-between" mb="xs">
                    <Text size="xs" c="dimmed">
                      Front Side Preview
                    </Text>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => {
                        setUpgradeForm((prev) => ({
                          ...prev,
                          frontSidePhoto: null,
                        }));
                        handleFilePreview(null, "frontSidePhoto");
                      }}
                    >
                      <X size={14} />
                    </ActionIcon>
                  </Group>
                  <img
                    src={photoPreview.frontSidePhoto}
                    alt="Front Side Preview"
                    className="max-h-32 w-auto mx-auto rounded"
                  />
                </Card>
              )}
            </div>

            {/* Back Side Photo - Optional */}
            <div>
              <Text
                size="sm"
                fw={500}
                mb="xs"
                className="flex items-center gap-2"
              >
                <Upload size={16} />
                ID Back Side Photo (Optional)
              </Text>
              <FileInput
                placeholder="Choose back side photo"
                accept="image/*"
                value={upgradeForm.backSidePhoto}
                onChange={(file) => {
                  setUpgradeForm((prev) => ({ ...prev, backSidePhoto: file }));
                  handleFilePreview(file, "backSidePhoto");
                }}
                leftSection={<Upload size={16} />}
              />
              {photoPreview.backSidePhoto && (
                <Card className="mt-3 p-3 border border-gray-200">
                  <Group justify="space-between" mb="xs">
                    <Text size="xs" c="dimmed">
                      Back Side Preview
                    </Text>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => {
                        setUpgradeForm((prev) => ({
                          ...prev,
                          backSidePhoto: null,
                        }));
                        handleFilePreview(null, "backSidePhoto");
                      }}
                    >
                      <X size={14} />
                    </ActionIcon>
                  </Group>
                  <img
                    src={photoPreview.backSidePhoto}
                    alt="Back Side Preview"
                    className="max-h-32 w-auto mx-auto rounded"
                  />
                </Card>
              )}
            </div>

            {/* Action Buttons */}
            <Group justify="flex-end" mt="xl">
              <Button
                variant="light"
                onClick={() => {
                  setUpgradeModalOpen(false);
                  setUpgradeForm({
                    kraPin: "",
                    selfiePhoto: null,
                    frontSidePhoto: null,
                    backSidePhoto: null,
                  });
                  setPhotoPreview({});
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpgradeSubmit}
                loading={isUpgrading || upgradeMutation.isPending}
                style={{ backgroundColor: "#F08C23" }}
                leftSection={<TrendingUp size={16} />}
              >
                Submit Upgrade
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Top Up Wallet Modal */}
        <TopUpModal
          opened={topUpModalOpen}
          onClose={() => setTopUpModalOpen(false)}
          walletData={walletData}
        />
      </Stack>
    </Container>
  );
}
