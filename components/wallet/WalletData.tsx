"use client";
import { sendOTP, confirmOTP } from "@/api/wallet";
import { WalletData as WalletDataType } from "./types";
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
  ActionIcon
} from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Wallet, 
  Send, 
  RefreshCw, 
  CreditCard,
  History,
  Phone,
  Eye,
  EyeOff
} from "lucide-react";
import { notifications } from "@mantine/notifications";

interface WalletDataProps {
  walletData: WalletDataType;
  isLoading?: boolean;
}

export default function WalletData({ walletData, isLoading = false }: WalletDataProps) {
  const [verifyPhoneModalOpen, setVerifyPhoneModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  
  const queryClient = useQueryClient();

  const sendOtpMutation = useMutation({
    mutationFn: (phone: string) => sendOTP(phone),
    onSuccess: (data) => {
      if (data.status) {
        setOtpSent(true);
        notifications.show({
          title: 'OTP Sent',
          message: 'Verification code sent to your phone',
          color: 'blue'
        });
      } else {
        notifications.show({
          title: 'Error',
          message: data.message || 'Failed to send OTP',
          color: 'red'
        });
      }
    },
  });

  const confirmOtpMutation = useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) => confirmOTP(phone, otp),
    onSuccess: (data) => {
      if (data.status) {
        notifications.show({
          title: 'Success',
          message: 'Phone number verified successfully!',
          color: 'green'
        });
        setVerifyPhoneModalOpen(false);
        setOtpSent(false);
        setOtp("");
        queryClient.invalidateQueries({ queryKey: ["wallet"] });
      } else {
        notifications.show({
          title: 'Error',
          message: data.message || 'Invalid OTP',
          color: 'red'
        });
      }
    },
  });

  const handleSendOTP = () => {
    if (!phoneNumber) {
      notifications.show({
        title: 'Error',
        message: 'Please enter your phone number',
        color: 'red'
      });
      return;
    }
    sendOtpMutation.mutate(phoneNumber);
  };

  const handleConfirmOTP = () => {
    if (!otp) {
      notifications.show({
        title: 'Error',
        message: 'Please enter the OTP',
        color: 'red'
      });
      return;
    }
    confirmOtpMutation.mutate({ phone: phoneNumber, otp });
  };

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Title order={1}>My Wallet</Title>
          <Group>
            <ActionIcon
              variant="light"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["wallet"] })}
              loading={isLoading}
            >
              <RefreshCw size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Wallet Balance Card */}
        <Paper shadow="md" radius="lg" p="xl" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="sm" opacity={0.8}>Available Balance</Text>
              <Group align="center" gap="xs">
                <Text size="2.5rem" fw="bold">
                  {showBalance ? formatCurrency(walletData.balance, walletData.currency) : '••••••'}
                </Text>
                <ActionIcon 
                  variant="transparent" 
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
                </ActionIcon>
              </Group>
              <Group gap="xs" mt="xs">
                <Badge 
                  color={walletData.isVerified ? "green" : "yellow"} 
                  variant="light"
                  size="sm"
                >
                  {walletData.isVerified ? "Verified" : "Unverified"}
                </Badge>
              </Group>
            </div>
            <Wallet size={60} opacity={0.3} />
          </Group>
        </Paper>

        {/* Action Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card shadow="sm" radius="md" p="lg" style={{ cursor: 'pointer', height: '100%' }}>
              <Group gap="sm">
                <Send size={32} style={{ color: '#228be6' }} />
                <div>
                  <Text fw="bold">Send Money</Text>
                  <Text size="sm" c="dimmed">Transfer funds to others</Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card shadow="sm" radius="md" p="lg" style={{ cursor: 'pointer', height: '100%' }}>
              <Group gap="sm">
                <CreditCard size={32} style={{ color: '#40c057' }} />
                <div>
                  <Text fw="bold">Add Money</Text>
                  <Text size="sm" c="dimmed">Top up your wallet</Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card 
              shadow="sm" 
              radius="md" 
              p="lg" 
              style={{ cursor: 'pointer', height: '100%' }}
              onClick={() => !walletData.isVerified && setVerifyPhoneModalOpen(true)}
            >
              <Group gap="sm">
                <Phone size={32} style={{ color: walletData.isVerified ? '#40c057' : '#fd7e14' }} />
                <div>
                  <Text fw="bold">
                    {walletData.isVerified ? 'Phone Verified' : 'Verify Phone'}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {walletData.isVerified ? 'Your phone is verified' : 'Verify your phone number'}
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Recent Transactions */}
        <Paper shadow="sm" radius="md" p="lg">
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <History size={24} />
              <Text fw="bold" size="lg">Recent Transactions</Text>
            </Group>
            <Button variant="light" size="compact-sm">View All</Button>
          </Group>

          <Divider mb="md" />

          {walletData.transactions && walletData.transactions.length > 0 ? (
            <Stack gap="sm">
              {walletData.transactions.slice(0, 5).map((transaction) => (
                <Paper key={transaction.id} p="sm" radius="sm" style={{ border: '1px solid #e0e0e0' }}>
                  <Group justify="space-between">
                    <div>
                      <Text fw="500">{transaction.description}</Text>
                      <Text size="sm" c="dimmed">{new Date(transaction.date).toLocaleDateString()}</Text>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Text 
                        fw="bold" 
                        c={transaction.type === 'credit' ? 'green' : 'red'}
                      >
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount, walletData.currency)}
                      </Text>
                      <Badge 
                        color={
                          transaction.status === 'completed' ? 'green' : 
                          transaction.status === 'pending' ? 'yellow' : 'red'
                        }
                        size="xs"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </Group>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Text c="dimmed" ta="center" py="xl">
              No transactions yet
            </Text>
          )}
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
          <LoadingOverlay visible={sendOtpMutation.isPending || confirmOtpMutation.isPending} />
          
          <Stack>
            {!otpSent ? (
              <>
                <TextInput
                  label="Phone Number"
                  placeholder="+254 700 000 000"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.currentTarget.value)}
                  leftSection={<Phone size={16} />}
                />
                <Group justify="flex-end">
                  <Button variant="light" onClick={() => setVerifyPhoneModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendOTP} loading={sendOtpMutation.isPending}>
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
                  <Button onClick={handleConfirmOTP} loading={confirmOtpMutation.isPending}>
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