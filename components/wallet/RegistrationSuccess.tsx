"use client";
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Card,
  Box,
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
import KYCResubmissionModal from "./KYCResubmissionModal";

interface RegistrationSuccessProps {
  onClose?: () => void;
  phoneNumber?: string;
  resubmit?: () => void;
  idType?: string;
}

export default function RegistrationSuccess({
  onClose,
  phoneNumber,
  resubmit,
  idType = "101",
}: RegistrationSuccessProps) {
  const router = useRouter();
  const [, setShowOTPInput] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [, setWalletActivated] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);

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
      const response = await sendOTP(phoneNumber.slice(-9)); // Send last 9 digits
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
  //console.log(userAccount, "user loading.....");
  const ReadyWallet = (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        <Paper shadow="md" radius="lg" p="xl" className="bg-white text-center">
          <Stack gap="lg" align="center">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={48} className="text-green-600" />
            </div>

            <div>
              <Title order={2} style={{ color: "#3D6B2C" }} className="mb-3">
                Wallet Activated! 🎉
              </Title>
              <Text size="lg" c="dimmed" className="max-w-md mx-auto">
                Your wallet has been successfully activated and is ready to use!
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

  if (loadingUser) return <LoadingComponent message="verifying wallet..." />;

  //for current account....
  if (userAccount?.user?.account_type === "business") {
    if (userAccount?.user?.kyc_documents_okay === "completed") {
      return ReadyWallet;
    } else if (
      userAccount?.user?.kyc_documents_okay?.toLowerCase() === "failed"
    ) {
      return (
        <>
          <Container size="sm" py="xl">
            <Paper
              shadow="md"
              radius="lg"
              p="xl"
              className="bg-white text-center"
            >
              <Stack gap="lg" align="center">
                <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 flex items-center justify-center">
                  <CheckCircle size={48} className="text-orange-600" />
                </div>

                <div>
                  <Title
                    order={2}
                    style={{ color: "#F08C23" }}
                    className="mb-3"
                  >
                    KYC Documents Required
                  </Title>
                  <Text size="lg" c="dimmed" className="max-w-md mx-auto">
                    Dear {userAccount?.user?.name}, your KYC verification
                    failed. Please upload new documents to continue.
                  </Text>
                </div>

                <Card
                  className="w-full max-w-md bg-orange-50 border border-orange-200"
                  radius="md"
                >
                  <Text
                    size="sm"
                    fw={500}
                    style={{ color: "#F08C23" }}
                    className="mb-2"
                  >
                    Document Upload Required
                  </Text>
                  <Text size="sm" c="dimmed">
                    Upload clear, high-quality photos of your identification
                    documents to complete verification.
                  </Text>
                </Card>

                <Stack gap="sm" className="w-full max-w-sm">
                  <Button
                    size="lg"
                    onClick={() => setShowKYCModal(true)}
                    style={{ backgroundColor: "#F08C23" }}
                    className="hover:opacity-90 w-full"
                  >
                    Upload Documents
                  </Button>

                  {onClose && (
                    <Button
                      variant="light"
                      size="md"
                      onClick={onClose}
                      className="w-full"
                    >
                      Go Back
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Paper>
          </Container>

          <KYCResubmissionModal
            opened={showKYCModal}
            onClose={() => {
              setShowKYCModal(false);
              refresh(); // Refresh user data after upload
            }}
            idType={idType}
          />
        </>
      );
    } else {
      return (
        <Box p="xl">
          <Box>
            <Text mb="md">
              Dear {userAccount?.user?.name}, Your KYC verification has failed
              or is incomplete.
            </Text>
            <Text>Please resubmit request again</Text>
          </Box>

          <Button onClick={resubmit}>Resubmit</Button>
        </Box>
      );
    }
  }
  // for personal accounts
  if (userAccount?.user?.account_type === "personal") {
    if (!!userAccount?.user?.onboarding_otp_confirmation) {
      return ReadyWallet;
    } else {
      return (
        <OTPInput
          onVerificationSuccess={handleOTPVerificationSuccess}
          onVerificationError={handleOTPVerificationError}
        />
      );
    }
  }
  return null;
}
