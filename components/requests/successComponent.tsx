"use client";
import React from "react";
import {
  Box,
  Text,
  Button,
  Stack,
  ThemeIcon,
  Group,
  Paper,
  Badge,
  Container,
  Divider,
  Avatar,
  Card,
  Center,
} from "@mantine/core";
import {
  CheckCircle,
  ArrowRight,
  FileText,
  Clock,
  Bell,
  Star,
  Sparkles,
} from "lucide-react";

interface QuoteSuccessProps {
  quoteId?: string;
  requestCode?: string;
  submittedAt?: string;
  onContinue?: () => void;
  redirectUrl?: string;
  estimatedResponseTime?: string;
}

const QuoteSuccess: React.FC<QuoteSuccessProps> = ({
  quoteId = "QT-2024-0001",
  requestCode = "REQ-2024-001",
  submittedAt = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }),
  onContinue,
  redirectUrl = "/keyman/supplier/requests",
  estimatedResponseTime = "24-48 hours",
}) => {
  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  return (
    <Container size="sm" py="sm">
      <Card
        shadow="xl"
        padding="sm"
        radius="lg"
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #f8fffe 0%, #f0fff4 100%)",
          border: "1px solid #e6fffa",
        }}
      >
        {/* Decorative background elements */}
        <Box
          className="absolute top-0 right-0 opacity-10"
          style={{
            width: "200px",
            height: "200px",
            background: "radial-gradient(circle, #3D6B2C 0%, transparent 70%)",
            transform: "translate(25%, -25%)",
          }}
        />
        <Box
          className="absolute bottom-0 left-0 opacity-5"
          style={{
            width: "150px",
            height: "150px",
            background: "radial-gradient(circle, #F08C23 0%, transparent 70%)",
            transform: "translate(-25%, 25%)",
          }}
        />

        <Stack gap="sm" className="relative z-10">
          {/* Success Icon and Header */}
          <Center>
            <Stack gap="sm" align="center">
              <Box className="relative">
                <ThemeIcon
                  size={80}
                  radius="xl"
                  className="animate-pulse"
                  style={{
                    background:
                      "linear-gradient(135deg, #3D6B2C 0%, #4ade80 100%)",
                    boxShadow: "0 8px 32px rgba(61, 107, 44, 0.3)",
                  }}
                >
                  <CheckCircle size={40} color="white" />
                </ThemeIcon>
                <ThemeIcon
                  size={24}
                  radius="xl"
                  className="absolute -top-1 -right-1 animate-bounce"
                  style={{
                    backgroundColor: "#F08C23",
                    boxShadow: "0 4px 16px rgba(240, 140, 35, 0.4)",
                  }}
                >
                  <Sparkles size={12} color="white" />
                </ThemeIcon>
              </Box>

              <Stack gap="xs" align="center">
                <Text
                  size="xl"
                  fw={700}
                  className="text-center"
                  style={{ color: "#1f2937" }}
                >
                  🎉 Quote Submitted Successfully!
                </Text>
                <Text
                  size="md"
                  c="dimmed"
                  className="text-center max-w-md"
                  style={{ lineHeight: 1.6 }}
                >
                  Your quote has been sent to the client. You'll receive a
                  notification once they respond.
                </Text>
              </Stack>
            </Stack>
          </Center>

          <Divider variant="dashed" color="gray.3" className="opacity-50" />

          {/* Quote Details */}
          <Stack gap="md">
            <Group justify="space-between" className="flex-wrap">
              <Group gap="sm">
                <Avatar
                  size="sm"
                  radius="md"
                  style={{ backgroundColor: "#3D6B2C15" }}
                >
                  <FileText size={16} style={{ color: "#3D6B2C" }} />
                </Avatar>
                <Stack gap={2}>
                  <Text size="sm" fw={600} style={{ color: "#374151" }}>
                    Quote ID
                  </Text>
                  <Text size="xs" c="dimmed">
                    Reference number
                  </Text>
                </Stack>
              </Group>
              <Badge
                size="lg"
                variant="light"
                radius="md"
                style={{
                  backgroundColor: "#3D6B2C15",
                  color: "#3D6B2C",
                  fontWeight: 600,
                }}
              >
                {quoteId}
              </Badge>
            </Group>

            <Group justify="space-between" className="flex-wrap">
              <Group gap="sm">
                <Avatar
                  size="sm"
                  radius="md"
                  style={{ backgroundColor: "#F08C2315" }}
                >
                  <Clock size={16} style={{ color: "#F08C23" }} />
                </Avatar>
                <Stack gap={2}>
                  <Text size="sm" fw={600} style={{ color: "#374151" }}>
                    Request Code
                  </Text>
                  <Text size="xs" c="dimmed">
                    Original request
                  </Text>
                </Stack>
              </Group>
              <Badge
                size="lg"
                variant="light"
                radius="md"
                style={{
                  backgroundColor: "#F08C2315",
                  color: "#F08C23",
                  fontWeight: 600,
                }}
              >
                {requestCode}
              </Badge>
            </Group>

            <Group justify="space-between" className="flex-wrap">
              <Group gap="sm">
                <Avatar
                  size="sm"
                  radius="md"
                  style={{ backgroundColor: "#388E3C15" }}
                >
                  <Bell size={16} style={{ color: "#388E3C" }} />
                </Avatar>
                <Stack gap={2}>
                  <Text size="sm" fw={600} style={{ color: "#374151" }}>
                    Submitted At
                  </Text>
                  <Text size="xs" c="dimmed">
                    Timestamp
                  </Text>
                </Stack>
              </Group>
              <Text size="sm" fw={500} style={{ color: "#374151" }}>
                {submittedAt}
              </Text>
            </Group>
          </Stack>

          {/* Info Card */}
          <Paper
            p="md"
            radius="md"
            className="border-l-4"
            style={{
              backgroundColor: "#fffbeb",
              borderLeftColor: "#F08C23",
              border: "1px solid #fed7aa",
            }}
          >
            <Group gap="sm" align="flex-start">
              <ThemeIcon
                size="sm"
                variant="light"
                style={{ backgroundColor: "#F08C2315", color: "#F08C23" }}
              >
                <Star size={14} />
              </ThemeIcon>
              <Stack gap={4}>
                <Text size="sm" fw={600} style={{ color: "#92400e" }}>
                  What happens next?
                </Text>
                <Text size="xs" style={{ color: "#a16207", lineHeight: 1.5 }}>
                  The client will review your quote and respond within{" "}
                  <strong>{estimatedResponseTime}</strong>. You'll receive an
                  email and in-app notification when they make a decision.
                </Text>
              </Stack>
            </Group>
          </Paper>

          {/* Action Buttons */}
          <Stack gap="sm" mt="md">
            <Button
              size="md"
              radius="md"
              rightSection={<ArrowRight size={16} />}
              onClick={handleContinue}
              className="transition-all duration-200 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #3D6B2C 0%, #4ade80 100%)",
                border: "none",
                boxShadow: "0 4px 20px rgba(61, 107, 44, 0.3)",
              }}
            >
              Continue to Dashboard
            </Button>

            <Button
              variant="light"
              size="sm"
              radius="md"
              style={{
                backgroundColor: "#f3f4f6",
                color: "#6b7280",
                border: "1px solid #e5e7eb",
              }}
              className="transition-all duration-200 hover:bg-gray-100 !hidden"
            >
              📋 View Quote Details
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Container>
  );
};

export default QuoteSuccess;
