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
  Badge,
  Group,
  Progress,
} from "@mantine/core";
import {
  CheckCircle,
  Wallet,
  ArrowRight,
  AlertCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import OTPInput from "./OTPInput";
//import { sendOTP } from "@/api/wallet";
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

// Standalone component for manual review status
const UnderReview = ({ userName }: { userName?: string }) => {
  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header Section */}
        <Card shadow="sm" padding="xl" radius="md">
          <Stack align="center" gap="md">
            <div className="relative">
              <div className="animate-spin-slow">
                <CheckCircle size={48} color="#F08C23" />
              </div>
              <div className="absolute -top-1 -right-1 animate-bounce">
                <Badge
                  size="xs"
                  style={{ backgroundColor: "#F08C23" }}
                  variant="filled"
                >
                  Reviewing
                </Badge>
              </div>
            </div>

            <Title order={2} ta="center" style={{ color: "#3D6B2C" }}>
              Account Under Review
            </Title>

            <Text size="lg" ta="center" c="dimmed" maw={500}>
              Dear {userName}, your account is currently under manual review.
              This process typically takes 24-48 hours. {`You'll`} receive
              notifications as we progress.
            </Text>
          </Stack>
        </Card>

        {/* Progress Overview */}
        <Card shadow="sm" padding="lg" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600}>Review Progress</Text>
              <Badge
                style={{ backgroundColor: "#F08C23", color: "white" }}
                variant="filled"
              >
                In Review
              </Badge>
            </Group>

            <Box>
              <Progress
                value={50}
                size="lg"
                radius="xl"
                animated
                color="#F08C23"
                striped
              />
            </Box>

            <Text size="sm" c="dimmed">
              Estimated completion: 24-48 hours
            </Text>
          </Stack>
        </Card>

        {/* Review Steps */}
        <Card shadow="sm" padding="lg" radius="md">
          <Stack gap="lg">
            <Text fw={600} size="lg">
              Review Steps
            </Text>

            <Stack gap="md">
              <Paper p="md" radius="sm" withBorder>
                <Group gap="md">
                  <CheckCircle size={20} color="#4CAF50" />
                  <Box flex={1}>
                    <Text fw={500}>Document Submission</Text>
                    <Text size="sm" style={{ color: "#4CAF50" }}>
                      Completed
                    </Text>
                  </Box>
                  <Badge
                    style={{ backgroundColor: "#4CAF50", color: "white" }}
                    variant="filled"
                    size="sm"
                  >
                    Done
                  </Badge>
                </Group>
              </Paper>

              <Paper p="md" radius="sm" withBorder>
                <Group gap="md">
                  <CheckCircle
                    size={20}
                    color="#F08C23"
                    className="animate-pulse"
                  />
                  <Box flex={1}>
                    <Text fw={500}>Manual Verification</Text>
                    <Text size="sm" style={{ color: "#F08C23" }}>
                      Currently processing...
                    </Text>
                  </Box>
                  <Badge
                    style={{ backgroundColor: "#F08C23", color: "white" }}
                    variant="filled"
                    size="sm"
                  >
                    Processing
                  </Badge>
                </Group>
              </Paper>

              <Paper p="md" radius="sm" withBorder>
                <Group gap="md">
                  <Wallet size={20} color="gray" />
                  <Box flex={1}>
                    <Text fw={500}>Wallet Activation</Text>
                    <Text size="sm" c="dimmed">
                      Pending
                    </Text>
                  </Box>
                  <Badge variant="light" size="sm" color="gray">
                    Waiting
                  </Badge>
                </Group>
              </Paper>
            </Stack>
          </Stack>
        </Card>

        {/* Information Card */}
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          style={{ backgroundColor: "#FFF4E6", borderColor: "#F08C23" }}
          withBorder
        >
          <Stack gap="sm">
            <Group gap="xs">
              <AlertCircle size={18} color="#F08C23" />
              <Text fw={600} style={{ color: "#F08C23" }}>
                What happens next?
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              Our team is carefully reviewing your documents to ensure
              everything meets our security standards. {`You'll`} receive an
              email notification once the review is complete.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

// Standalone component for processing status
const Processing = ({ userName }: { userName?: string }) => {
  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header Section */}
        <Card shadow="sm" padding="xl" radius="md">
          <Stack align="center" gap="md">
            <div className="relative">
              <div className="animate-pulse">
                <CheckCircle size={48} color="#2196F3" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Badge
                  size="xs"
                  style={{ backgroundColor: "#2196F3" }}
                  variant="filled"
                >
                  Processing
                </Badge>
              </div>
            </div>

            <Title order={2} ta="center" style={{ color: "#3D6B2C" }}>
              Account Processing
            </Title>

            <Text size="lg" ta="center" c="dimmed" maw={500}>
              Dear {userName}, your account is being processed. {`We're`}{" "}
              setting up your wallet and finalizing your account details. This
              should only take a few moments.
            </Text>
          </Stack>
        </Card>

        {/* Progress Overview */}
        <Card shadow="sm" padding="lg" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600}>Processing Status</Text>
              <Badge
                style={{ backgroundColor: "#2196F3", color: "white" }}
                variant="filled"
              >
                In Progress
              </Badge>
            </Group>

            <Box>
              <Progress
                value={75}
                size="lg"
                radius="xl"
                animated
                color="#2196F3"
              />
            </Box>

            <Text size="sm" c="dimmed">
              Almost complete...
            </Text>
          </Stack>
        </Card>

        {/* Processing Steps */}
        <Card shadow="sm" padding="lg" radius="md">
          <Stack gap="lg">
            <Text fw={600} size="lg">
              Processing Steps
            </Text>

            <Stack gap="md">
              <Paper p="md" radius="sm" withBorder>
                <Group gap="md">
                  <CheckCircle size={20} color="#4CAF50" />
                  <Box flex={1}>
                    <Text fw={500}>Document Verification</Text>
                    <Text size="sm" style={{ color: "#4CAF50" }}>
                      Completed
                    </Text>
                  </Box>
                  <Badge
                    style={{ backgroundColor: "#4CAF50", color: "white" }}
                    variant="filled"
                    size="sm"
                  >
                    Done
                  </Badge>
                </Group>
              </Paper>

              <Paper p="md" radius="sm" withBorder>
                <Group gap="md">
                  <CheckCircle size={20} color="#4CAF50" />
                  <Box flex={1}>
                    <Text fw={500}>Account Setup</Text>
                    <Text size="sm" style={{ color: "#4CAF50" }}>
                      Completed
                    </Text>
                  </Box>
                  <Badge
                    style={{ backgroundColor: "#4CAF50", color: "white" }}
                    variant="filled"
                    size="sm"
                  >
                    Done
                  </Badge>
                </Group>
              </Paper>

              <Paper p="md" radius="sm" withBorder>
                <Group gap="md">
                  <CheckCircle
                    size={20}
                    color="#2196F3"
                    className="animate-pulse"
                  />
                  <Box flex={1}>
                    <Text fw={500}>Wallet Activation</Text>
                    <Text size="sm" style={{ color: "#2196F3" }}>
                      Processing...
                    </Text>
                  </Box>
                  <Badge
                    style={{ backgroundColor: "#2196F3", color: "white" }}
                    variant="filled"
                    size="sm"
                  >
                    Processing
                  </Badge>
                </Group>
              </Paper>
            </Stack>
          </Stack>
        </Card>

        {/* Information Card */}
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          style={{ backgroundColor: "#E3F2FD", borderColor: "#2196F3" }}
          withBorder
        >
          <Stack gap="sm">
            <Group gap="xs">
              <AlertCircle size={18} color="#2196F3" />
              <Text fw={600} style={{ color: "#2196F3" }}>
                Almost there!
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              {`We're`} finalizing your wallet setup. This process is automated
              and should complete within the next few minutes. Please refresh
              the page shortly.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

// Standalone component for pending status
const Pending = ({ userName }: { userName?: string }) => {
  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header Section */}
        <Card shadow="sm" padding="xl" radius="md">
          <Stack align="center" gap="md">
            <div className="relative">
              <CheckCircle size={48} color="#9E9E9E" />
            </div>

            <Title order={2} ta="center" style={{ color: "#3D6B2C" }}>
              Account Pending
            </Title>

            <Text size="lg" ta="center" c="dimmed" maw={500}>
              Dear {userName}, your account setup is pending. {`We've`} received
              your application and will begin processing it shortly.
            </Text>
          </Stack>
        </Card>

        {/* Progress Overview */}
        <Card shadow="sm" padding="lg" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600}>Application Status</Text>
              <Badge color="gray" variant="filled">
                Pending
              </Badge>
            </Group>

            <Box>
              <Progress value={25} size="lg" radius="xl" color="gray" />
            </Box>

            <Text size="sm" c="dimmed">
              Your application is in queue
            </Text>
          </Stack>
        </Card>

        {/* Pending Steps */}
        <Card shadow="sm" padding="lg" radius="md">
          <Stack gap="lg">
            <Text fw={600} size="lg">
              Application Steps
            </Text>

            <Stack gap="md">
              <Paper p="md" radius="sm" withBorder>
                <Group gap="md">
                  <CheckCircle size={20} color="#4CAF50" />
                  <Box flex={1}>
                    <Text fw={500}>Application Submitted</Text>
                    <Text size="sm" style={{ color: "#4CAF50" }}>
                      Completed
                    </Text>
                  </Box>
                  <Badge
                    style={{ backgroundColor: "#4CAF50", color: "white" }}
                    variant="filled"
                    size="sm"
                  >
                    Done
                  </Badge>
                </Group>
              </Paper>

              <Paper p="md" radius="sm" withBorder>
                <Group gap="md">
                  <Wallet size={20} color="#9E9E9E" />
                  <Box flex={1}>
                    <Text fw={500}>Initial Review</Text>
                    <Text size="sm" c="dimmed">
                      Waiting to start
                    </Text>
                  </Box>
                  <Badge variant="light" size="sm" color="gray">
                    Pending
                  </Badge>
                </Group>
              </Paper>

              <Paper p="md" radius="sm" withBorder>
                <Group gap="md">
                  <Wallet size={20} color="#9E9E9E" />
                  <Box flex={1}>
                    <Text fw={500}>Document Verification</Text>
                    <Text size="sm" c="dimmed">
                      Waiting
                    </Text>
                  </Box>
                  <Badge variant="light" size="sm" color="gray">
                    Pending
                  </Badge>
                </Group>
              </Paper>

              <Paper p="md" radius="sm" withBorder>
                <Group gap="md">
                  <Wallet size={20} color="#9E9E9E" />
                  <Box flex={1}>
                    <Text fw={500}>Wallet Activation</Text>
                    <Text size="sm" c="dimmed">
                      Waiting
                    </Text>
                  </Box>
                  <Badge variant="light" size="sm" color="gray">
                    Pending
                  </Badge>
                </Group>
              </Paper>
            </Stack>
          </Stack>
        </Card>

        {/* Information Card */}
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          style={{ backgroundColor: "#F5F5F5", borderColor: "#9E9E9E" }}
          withBorder
        >
          <Stack gap="sm">
            <Group gap="xs">
              <AlertCircle size={18} color="#9E9E9E" />
              <Text fw={600} c="dimmed">
                What to expect
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              Your application is in our queue and will be reviewed in the order
              it was received. You can check back here anytime for updates, or
              {`we'll`} send you an email when there are changes to your
              application status.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

// Standalone component for rejected status with page reload
const Rejected = ({
  userName,
  onReload,
}: {
  userName?: string;
  onReload?: () => void;
}) => {
  const hasReloaded = useRef(false);

  useEffect(() => {
    // Reload page once when component mounts
    if (!hasReloaded.current) {
      hasReloaded.current = true;
      if (onReload) {
        onReload();
      }
    }
  }, [onReload]);

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header Section */}
        <Card shadow="sm" padding="xl" radius="md">
          <Stack align="center" gap="md">
            <div className="relative">
              <XCircle size={48} color="#F44336" />
            </div>

            <Title order={2} ta="center" style={{ color: "#F44336" }}>
              Application Rejected
            </Title>

            <Text size="lg" ta="center" c="dimmed" maw={500}>
              Dear {userName}, unfortunately your wallet application has been
              rejected. Please review the reasons below and consider reapplying
              with corrected information.
            </Text>
          </Stack>
        </Card>

        {/* Status Overview */}
        <Card shadow="sm" padding="lg" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600}>Application Status</Text>
              <Badge color="red" variant="filled">
                Rejected
              </Badge>
            </Group>

            <Box>
              <Progress value={100} size="lg" radius="xl" color="red" />
            </Box>

            <Text size="sm" c="dimmed">
              Application review completed
            </Text>
          </Stack>
        </Card>

        {/* Rejection Reasons */}
        <Card shadow="sm" padding="lg" radius="md">
          <Stack gap="lg">
            <Text fw={600} size="lg">
              Common Rejection Reasons
            </Text>

            <Stack gap="md">
              <Paper p="md" radius="sm" withBorder>
                <Group gap="md">
                  <XCircle size={20} color="#F44336" />
                  <Box flex={1}>
                    <Text fw={500}>Document Quality</Text>
                    <Text size="sm" c="dimmed">
                      Photos may be blurry, cropped, or illegible
                    </Text>
                  </Box>
                </Group>
              </Paper>

              <Paper p="md" radius="sm" withBorder>
                <Group gap="md">
                  <XCircle size={20} color="#F44336" />
                  <Box flex={1}>
                    <Text fw={500}>Information Mismatch</Text>
                    <Text size="sm" c="dimmed">
                      Details provided {`don't`} match official documents
                    </Text>
                  </Box>
                </Group>
              </Paper>

              <Paper p="md" radius="sm" withBorder>
                <Group gap="md">
                  <XCircle size={20} color="#F44336" />
                  <Box flex={1}>
                    <Text fw={500}>Incomplete Documentation</Text>
                    <Text size="sm" c="dimmed">
                      Required documents are missing or incomplete
                    </Text>
                  </Box>
                </Group>
              </Paper>

              <Paper p="md" radius="sm" withBorder>
                <Group gap="md">
                  <XCircle size={20} color="#F44336" />
                  <Box flex={1}>
                    <Text fw={500}>Verification Failed</Text>
                    <Text size="sm" c="dimmed">
                      Unable to verify identity or business information
                    </Text>
                  </Box>
                </Group>
              </Paper>
            </Stack>
          </Stack>
        </Card>

        {/* Action Card */}
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          style={{ backgroundColor: "#FFEBEE", borderColor: "#F44336" }}
          withBorder
        >
          <Stack gap="sm">
            <Group gap="xs">
              <AlertCircle size={18} color="#F44336" />
              <Text fw={600} style={{ color: "#F44336" }}>
                What can you do next?
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              Review the reasons above and ensure all your documents are clear,
              complete, and accurate. You can submit a new application with
              corrected information.
            </Text>
          </Stack>
        </Card>

        {/* Reload Button */}
        <Card shadow="sm" padding="lg" radius="md">
          <Stack gap="md" align="center">
            <Text size="sm" ta="center" c="dimmed">
              Check if you have received an email with specific details about
              the rejection. Click below to refresh your application status.
            </Text>
            <Button
              size="lg"
              onClick={() => window.location.reload()}
              leftSection={<RefreshCw size={20} />}
              style={{ backgroundColor: "#3D6B2C" }}
              className="hover:opacity-90"
            >
              Refresh Status
            </Button>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default function RegistrationSuccess({
  onClose,
  phoneNumber,
  resubmit,
  idType = "101",
}: RegistrationSuccessProps) {
  const router = useRouter();
  const [, setShowOTPInput] = useState(false);
  //const [otpSent, setOtpSent] = useState(false);
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
    router.push("/keyman/dashboard/key-wallet");
  };
  /*
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
  };*/

  const handleOTPVerificationSuccess = () => {
    setWalletActivated(true);
    setShowOTPInput(false);
    notify.success("Wallet activated successfully!");
    refresh();
  };

  const handleOTPVerificationError = (error: string) => {
    notify.error(error);
  };

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
    if (userAccount?.user?.kyc_documents_okay.toLowerCase() === "completed") {
      const status = userAccount?.user?.wallet_creation_status?.toLowerCase();

      switch (status) {
        case "manual_reviewing":
          return <UnderReview userName={userAccount?.user?.name} />;

        case "processing":
          return <Processing userName={userAccount?.user?.name} />;

        case "pending":
          return <Pending userName={userAccount?.user?.name} />;

        case "rejected":
          return (
            <Rejected userName={userAccount?.user?.name} onReload={refresh} />
          );

        default:
          return ReadyWallet;
      }
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
    } else if (
      userAccount?.user?.kyc_documents_okay?.toLowerCase() === "pending"
    ) {
      return (
        <Box p="xl">
          <Text>Dear {userAccount?.user?.name},</Text>
          <Text>
            Your KYC documents are under review. Please wait for approval.
          </Text>
        </Box>
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
          phoneNumber={phoneNumber}
          businessId={userAccount?.user?.onboardingRequestId}
        />
      );
    }
  }
  return null;
}
