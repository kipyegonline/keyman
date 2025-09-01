"use client";
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Card,
} from "@mantine/core";
import { CheckCircle, Wallet, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import OTPInput from "./OTPInput";
import { sendOTP } from "@/api/wallet";
import { notify } from "@/lib/notifications";
import { getUserDetails } from "@/api/registration";
import { useQuery } from "@tanstack/react-query";
import LoadingComponent from "@/lib/LoadingComponent";

interface RegistrationSuccessProps {
  onClose?: () => void;
  phoneNumber?: string;
}

export default function RegistrationSuccess({
  onClose,
  phoneNumber,
}: RegistrationSuccessProps) {
  const router = useRouter();
  const [, setShowOTPInput] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [, setWalletActivated] = useState(false);

  const {
    data: userAccount,
    isLoading: loadingUser,
    refetch: refresh,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => await getUserDetails(),
  });

  const handleNavigateToWallet = () => {
    router.push("/keyman/supplier/key-wallet");
  };

  useEffect(() => {
    // Auto-send OTP when component mounts if phone number is provided
    if (phoneNumber && !otpSent) {
      handleSendOTP();
    }
  }, [phoneNumber, otpSent]);

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      notify.error("Phone number is required");
      return;
    }

    try {
      const response = await sendOTP(phoneNumber);
      if (response.status) {
        setOtpSent(true);
        setShowOTPInput(true);
        notify.success("OTP sent to your phone number");
      } else {
        notify.error(response.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      notify.error("Failed to send OTP. Please try again.");
    }
  };

  const handleOTPVerificationSuccess = () => {
    setWalletActivated(true);
    setShowOTPInput(false);
    notify.success("Wallet activated successfully!");
    refresh();
  };

  const handleOTPVerificationError = (error: string) => {
    notify.error(error);
  };
  if (loadingUser) return <LoadingComponent message="verifying wallet" />;
  if (!!userAccount?.user?.onboarding_otp_confirmation) {
    return (
      <Container size="sm" py="xl">
        <Stack gap="xl">
          <Paper
            shadow="md"
            radius="lg"
            p="xl"
            className="bg-white text-center"
          >
            <Stack gap="lg" align="center">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle size={48} className="text-green-600" />
              </div>

              <div>
                <Title order={2} style={{ color: "#3D6B2C" }} className="mb-3">
                  Wallet Activated! 🎉
                </Title>
                <Text size="lg" c="dimmed" className="max-w-md mx-auto">
                  Your wallet has been successfully activated and is ready to
                  use!
                </Text>
              </div>

              <Card
                className="w-full max-w-md bg-green-50 border border-green-200"
                radius="md"
              >
                <Text
                  size="sm"
                  fw={500}
                  style={{ color: "#3D6B2C" }}
                  className="mb-2"
                >
                  Ready to Go!
                </Text>
                <Text size="sm" c="dimmed">
                  You can now access your digital wallet and start making secure
                  transactions.
                </Text>
              </Card>

              <Stack gap="sm" className="w-full max-w-sm">
                <Button
                  size="lg"
                  onClick={handleNavigateToWallet}
                  rightSection={<ArrowRight size={20} />}
                  style={{ backgroundColor: "#3D6B2C" }}
                  className="hover:opacity-90 w-full"
                >
                  Go to My Wallet
                </Button>

                {onClose && (
                  <Button
                    variant="light"
                    size="md"
                    onClick={onClose}
                    className="w-full"
                  >
                    Create Another Wallet
                  </Button>
                )}
              </Stack>

              <div className="flex items-center gap-2 text-green-600">
                <Wallet size={16} />
                <Text size="xs" c="dimmed">
                  Powered by Keyman Stores Secure Wallet System
                </Text>
              </div>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    );
  } else {
    return (
      <OTPInput
        onVerificationSuccess={handleOTPVerificationSuccess}
        onVerificationError={handleOTPVerificationError}
      />
    );
  }
}
