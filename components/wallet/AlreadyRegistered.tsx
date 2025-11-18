"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Group,
  ThemeIcon,
  Card,
  Divider,
} from "@mantine/core";
import {
  CheckCircle,
  Wallet,
  ArrowRight,
  Shield,
  CreditCard,
} from "lucide-react";

interface AlreadyRegisteredProps {
  userName?: string;
  walletType?: "personal" | "keyman" | "business";
}

export default function AlreadyRegistered({
  userName,
  walletType = "keyman",
}: AlreadyRegisteredProps) {
  const router = useRouter();

  const handleNavigateToWallet = () => {
    router.push("/keyman/dashboard/key-wallet");
  };

  const walletTypeName =
    walletType === "personal" ? "Personal Current Account" : "Keyman Wallet";

  return (
    <Container size="md" py={{ base: "xl", md: "80px" }}>
      <Paper
        shadow="xl"
        radius="lg"
        p={{ base: "xl", md: "60px" }}
        className="bg-white border-2"
        style={{ borderColor: "#3D6B2C20" }}
      >
        <Stack align="center" gap="xl">
          {/* Success Icon */}
          <ThemeIcon
            size={120}
            radius="xl"
            style={{ backgroundColor: "#3D6B2C15" }}
          >
            <CheckCircle size={70} color="#3D6B2C" strokeWidth={2} />
          </ThemeIcon>

          {/* Main Message */}
          <div className="text-center">
            <Title
              order={1}
              size="h2"
              style={{ color: "#3D6B2C" }}
              className="mb-3"
            >
              🎉 You&apos;re Already Registered!
            </Title>
            <Text size="lg" c="dimmed" className="max-w-md mx-auto">
              {userName ? `Welcome back, ${userName}! ` : "Great news! "}
              You already have an active {walletTypeName} with us.
            </Text>
          </div>

          <Divider
            className="w-full"
            label="Your Wallet Details"
            labelPosition="center"
            size="sm"
            color="#3D6B2C"
          />

          {/* Wallet Info Cards */}
          <Group justify="center" gap="md" className="w-full">
            <Card
              className="flex-1 border-2 hover:shadow-md transition-shadow"
              radius="md"
              p="lg"
              style={{ borderColor: "#3D6B2C30", minWidth: "200px" }}
            >
              <Stack align="center" gap="xs">
                <ThemeIcon
                  size={50}
                  radius="md"
                  style={{ backgroundColor: "#3D6B2C" }}
                >
                  <Wallet size={28} color="white" />
                </ThemeIcon>
                <Text size="sm" fw={600} c="dimmed">
                  Wallet Status
                </Text>
                <Text size="lg" fw={700} style={{ color: "#3D6B2C" }}>
                  Active ✓
                </Text>
              </Stack>
            </Card>

            <Card
              className="flex-1 border-2 hover:shadow-md transition-shadow"
              radius="md"
              p="lg"
              style={{ borderColor: "#F08C2330", minWidth: "200px" }}
            >
              <Stack align="center" gap="xs">
                <ThemeIcon
                  size={50}
                  radius="md"
                  style={{ backgroundColor: "#F08C23" }}
                >
                  <Shield size={28} color="white" />
                </ThemeIcon>
                <Text size="sm" fw={600} c="dimmed">
                  Account Type
                </Text>
                <Text size="lg" fw={700} style={{ color: "#F08C23" }}>
                  {walletTypeName}
                </Text>
              </Stack>
            </Card>
          </Group>

          {/* Info Alert */}
          <Card
            className="w-full bg-blue-50 border"
            radius="md"
            p="lg"
            style={{ borderColor: "#3B82F620" }}
          >
            <Group gap="md" wrap="nowrap">
              <div className="text-2xl">💡</div>
              <div>
                <Text size="sm" fw={600} className="mb-1">
                  What you can do now:
                </Text>
                <Text size="sm" c="dimmed">
                  Access your wallet dashboard to view transactions, manage your
                  account, create contracts, and explore all available features.
                </Text>
              </div>
            </Group>
          </Card>

          {/* CTA Buttons */}
          <Stack gap="md" className="w-full max-w-md mt-4">
            <Button
              size="lg"
              fullWidth
              onClick={handleNavigateToWallet}
              rightSection={<ArrowRight size={20} />}
              style={{ backgroundColor: "#3D6B2C" }}
              className="hover:opacity-90 transition-opacity"
              leftSection={<CreditCard size={20} />}
            >
              Go to My Wallet Dashboard
            </Button>

            <Button
              size="md"
              fullWidth
              variant="light"
              color="gray"
              onClick={() => router.push("/keyman/dashboard")}
            >
              Return to Dashboard
            </Button>
          </Stack>

          {/* Footer Note */}
          <Text size="xs" c="dimmed" ta="center" className="mt-4">
            Need help? Contact our support team or visit the help center for
            assistance.
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
}
