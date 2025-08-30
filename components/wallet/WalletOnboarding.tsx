"use client";
import React from "react";
import {
  Container,
  Stack,
  Card,
  Title,
  Text,
  Badge,
  Group,
  Progress,
  Box,
  Paper,
  Center,
  Button,
  CopyButton,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Wallet,
  Shield,
  FileText,
  User,
  LucideProps,
} from "lucide-react";

interface WalletOnboardingProps {
  onboardingRequestId: string;
}

export default function WalletOnboarding({
  onboardingRequestId,
}: WalletOnboardingProps) {
  const onboardingSteps = [
    { icon: User, label: "Identity Verification", status: "completed" },
    { icon: FileText, label: "Document Review", status: "in-progress" },
    { icon: Shield, label: "Security Setup", status: "pending" },
    { icon: Wallet, label: "Wallet Activation", status: "pending" },
  ];

  const getStepIcon = (
    status: string,
    IconComponent: React.FC<LucideProps>
  ) => {
    if (status === "completed") {
      return <CheckCircle size={20} color="#4CAF50" />;
    }
    if (status === "in-progress") {
      return (
        <IconComponent size={20} color="#F08C23" className="animate-pulse" />
      );
    }
    return <IconComponent size={20} color="gray" />;
  };

  const getProgressPercentage = () => {
    const completedSteps = onboardingSteps.filter(
      (step) => step.status === "completed"
    ).length;
    const inProgressSteps = onboardingSteps.filter(
      (step) => step.status === "in-progress"
    ).length;
    return (
      ((completedSteps + inProgressSteps * 0.5) / onboardingSteps.length) * 100
    );
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header Section */}
        <Card shadow="sm" padding="xl" radius="md">
          <Stack align="center" gap="md">
            <div className="relative">
              <div className="animate-spin-slow">
                <Clock size={48} color="#F08C23" />
              </div>
              <div className="absolute -top-1 -right-1 animate-bounce">
                <Badge
                  size="xs"
                  style={{ backgroundColor: "#F08C23" }}
                  variant="filled"
                >
                  Processing
                </Badge>
              </div>
            </div>

            <Title order={2} ta="center" style={{ color: "#3D6B2C" }}>
              Account Onboarding in Progress
            </Title>

            <Text size="lg" ta="center" c="dimmed" maw={500}>
              {` We're setting up your wallet account. This process typically takes
              24-48 hours. You'll receive notifications as we progress through
              each step.`}
            </Text>
          </Stack>
        </Card>

        {/* Progress Overview */}
        <Card shadow="sm" padding="lg" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600}>Onboarding Progress</Text>
              <Badge
                style={{ backgroundColor: "#4CAF50", color: "white" }}
                variant="filled"
              >
                {Math.round(getProgressPercentage())}% Complete
              </Badge>
            </Group>

            <Progress
              value={getProgressPercentage()}
              size="lg"
              radius="xl"
              animated
              color="#4CAF50"
            />

            <Text size="sm" c="dimmed">
              Estimated completion: 24-48 hours
            </Text>
          </Stack>
        </Card>

        {/* Onboarding Steps */}
        <Card shadow="sm" padding="lg" radius="md">
          <Stack gap="lg">
            <Text fw={600} size="lg">
              Onboarding Steps
            </Text>

            <Stack gap="md">
              {onboardingSteps.map((step, index) => (
                <Paper key={index} p="md" radius="sm" withBorder>
                  <Group gap="md">
                    <Center>{getStepIcon(step.status, step.icon)}</Center>

                    <Box flex={1}>
                      <Text fw={500}>{step.label}</Text>
                      {step.status === "in-progress" && (
                        <Text size="sm" style={{ color: "#F08C23" }}>
                          Currently processing...
                        </Text>
                      )}
                      {step.status === "completed" && (
                        <Text size="sm" style={{ color: "#4CAF50" }}>
                          Completed
                        </Text>
                      )}
                      {step.status === "pending" && (
                        <Text size="sm" c="dimmed">
                          Pending
                        </Text>
                      )}
                    </Box>

                    <Badge
                      style={{
                        backgroundColor:
                          step.status === "completed"
                            ? "#4CAF50"
                            : step.status === "in-progress"
                            ? "#F08C23"
                            : "#gray",
                        color: "white",
                      }}
                      variant={step.status === "pending" ? "light" : "filled"}
                      size="sm"
                    >
                      {step.status === "completed"
                        ? "Done"
                        : step.status === "in-progress"
                        ? "Processing"
                        : "Waiting"}
                    </Badge>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Card>

        {/* Request ID Section */}
        <Card shadow="sm" padding="lg" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600}>Reference Information</Text>
              <AlertCircle size={16} color="#3D6B2C" />
            </Group>

            <Text size="sm" c="dimmed">
              Keep this reference ID for tracking your onboarding status:
            </Text>

            <Paper p="sm" radius="sm" bg="gray.0" withBorder>
              <Group justify="space-between">
                <Text ff="monospace" fw={500}>
                  {onboardingRequestId}
                </Text>

                <CopyButton value={onboardingRequestId}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? "Copied!" : "Copy ID"}>
                      <ActionIcon
                        style={{
                          backgroundColor: copied ? "#4CAF50" : "#F08C23",
                          color: "white",
                        }}
                        variant="filled"
                        onClick={copy}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
            </Paper>

            <Text size="xs" c="dimmed">
              You can use this ID to check your onboarding status with our
              support team.
            </Text>
          </Stack>
        </Card>

        {/* Support Section */}
        <Card
          shadow="sm"
          padding="lg"
          display={"none"}
          radius="md"
          style={{ backgroundColor: "#f8fdf6" }}
        >
          <Stack gap="md">
            <Text fw={600} style={{ color: "#3D6B2C" }}>
              Need Help?
            </Text>

            <Text size="sm">
              If you have questions about your onboarding or need to provide
              additional information, our support team is ready to assist you.
            </Text>

            <Group>
              <Button
                style={{ backgroundColor: "#4CAF50" }}
                variant="filled"
                size="sm"
              >
                Contact Support
              </Button>
              <Button
                style={{ borderColor: "#F08C23", color: "#F08C23" }}
                variant="outline"
                size="sm"
              >
                View FAQ
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
