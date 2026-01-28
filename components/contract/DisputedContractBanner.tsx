"use client";
import {
  Box,
  Text,
  Group,
  Card,
  Stack,
  ThemeIcon,
  Button,
  Progress,
  Badge,
  Paper,
  Title,
  SimpleGrid,
} from "@mantine/core";
import {
  AlertTriangle,
  Clock,
  MessageSquare,
  Shield,
  Users,
  FileText,
  Phone,
  ArrowRight,
  Snowflake,
  Scale,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import styles from "./DisputedContractBanner.module.css";

interface DisputedContractBannerProps {
  contractTitle?: string;
  contractCode?: string;
  disputeRaisedAt?: string;
  onContactSupport?: () => void;
  onViewDetails?: () => void;
  initiatorName?: string;
  providerName?: string;
}

const DisputedContractBanner: React.FC<DisputedContractBannerProps> = ({
  contractTitle = "Contract",
  contractCode,
  disputeRaisedAt,
  onContactSupport,
  onViewDetails,
  initiatorName,
  providerName,
}) => {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 24,
    minutes: 0,
    seconds: 0,
  });
  const [progressValue, setProgressValue] = useState(100);

  // Calculate time remaining based on disputeRaisedAt
  useEffect(() => {
    if (!disputeRaisedAt) return;

    const calculateTimeRemaining = () => {
      const disputeTime = new Date(disputeRaisedAt).getTime();
      const expiryTime = disputeTime + 24 * 60 * 60 * 1000; // 24 hours after dispute
      const now = Date.now();
      const remaining = expiryTime - now;

      if (remaining <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        setProgressValue(0);
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
      setProgressValue((remaining / (24 * 60 * 60 * 1000)) * 100);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [disputeRaisedAt]);

  const formatTimeUnit = (value: number) => value.toString().padStart(2, "0");

  return (
    <Box className={styles.container}>
      {/* Animated Background */}
      <div className={styles.animatedBackground}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.gradientOrb3} />
      </div>

      {/* Main Content */}
      <Stack gap="xl" className={styles.content}>
        {/* Header Alert */}
        <Card
          shadow="xl"
          radius="lg"
          className={styles.alertCard}
          p={{ base: "md", md: "xl" }}
        >
          <Group justify="center" mb="md">
            <div className={styles.iconPulse}>
              <ThemeIcon
                size={80}
                radius="xl"
                className={styles.warningIcon}
                variant="gradient"
                gradient={{ from: "orange", to: "red", deg: 45 }}
              >
                <AlertTriangle size={44} strokeWidth={2.5} />
              </ThemeIcon>
            </div>
          </Group>

          <Stack align="center" gap="sm">
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: "orange", to: "red" }}
              className={styles.disputeBadge}
            >
              <Group gap="xs">
                <Snowflake size={14} />
                CONTRACT FROZEN
              </Group>
            </Badge>

            <Title order={2} ta="center" className={styles.title} c="dark">
              Dispute Under Review
            </Title>

            <Text
              size="lg"
              ta="center"
              c="dimmed"
              maw={500}
              className={styles.subtitle}
            >
              A complaint has been raised on &quot;{contractTitle}&quot;. All
              activities are temporarily frozen while we review the situation.
            </Text>

            {contractCode && (
              <Badge variant="light" color="gray" size="lg" mt="xs">
                <Group gap="xs">
                  <FileText size={14} />
                  {contractCode}
                </Group>
              </Badge>
            )}
          </Stack>
        </Card>

        {/* Countdown Timer */}
        <Card
          shadow="md"
          radius="lg"
          className={styles.timerCard}
          p={{ base: "md", md: "xl" }}
        >
          <Group justify="center" mb="lg">
            <ThemeIcon size="lg" variant="light" color="orange" radius="xl">
              <Clock size={20} />
            </ThemeIcon>
            <Text fw={600} size="lg">
              Resolution Window
            </Text>
          </Group>

          <Group justify="center" gap="md" mb="lg">
            <div className={styles.timeBlock}>
              <Text className={styles.timeValue}>
                {formatTimeUnit(timeRemaining.hours)}
              </Text>
              <Text size="xs" c="dimmed" tt="uppercase">
                Hours
              </Text>
            </div>
            <Text className={styles.timeSeparator}>:</Text>
            <div className={styles.timeBlock}>
              <Text className={styles.timeValue}>
                {formatTimeUnit(timeRemaining.minutes)}
              </Text>
              <Text size="xs" c="dimmed" tt="uppercase">
                Minutes
              </Text>
            </div>
            <Text className={styles.timeSeparator}>:</Text>
            <div className={styles.timeBlock}>
              <Text className={styles.timeValue}>
                {formatTimeUnit(timeRemaining.seconds)}
              </Text>
              <Text size="xs" c="dimmed" tt="uppercase">
                Seconds
              </Text>
            </div>
          </Group>

          <Progress
            value={progressValue}
            color={
              progressValue > 50
                ? "orange"
                : progressValue > 25
                  ? "yellow"
                  : "red"
            }
            size="lg"
            radius="xl"
            animated
            className={styles.progressBar}
          />

          <Text size="sm" ta="center" c="dimmed" mt="md">
            Time remaining to resolve this dispute amicably
          </Text>
        </Card>

        {/* Info Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          <Paper
            p="lg"
            radius="md"
            className={styles.infoCard}
            style={{ "--delay": "0.1s" } as React.CSSProperties}
          >
            <Group mb="sm">
              <ThemeIcon
                size="lg"
                radius="xl"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
              >
                <Shield size={20} />
              </ThemeIcon>
              <Text fw={600}>Protection Active</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Both parties are protected during this review period. No funds
              will be released until the dispute is resolved.
            </Text>
          </Paper>

          <Paper
            p="lg"
            radius="md"
            className={styles.infoCard}
            style={{ "--delay": "0.2s" } as React.CSSProperties}
          >
            <Group mb="sm">
              <ThemeIcon
                size="lg"
                radius="xl"
                variant="gradient"
                gradient={{ from: "violet", to: "purple" }}
              >
                <MessageSquare size={20} />
              </ThemeIcon>
              <Text fw={600}>Open Communication</Text>
            </Group>
            <Text size="sm" c="dimmed">
              We encourage both parties to communicate and reach a mutual
              agreement before the review period ends.
            </Text>
          </Paper>

          <Paper
            p="lg"
            radius="md"
            className={styles.infoCard}
            style={{ "--delay": "0.3s" } as React.CSSProperties}
          >
            <Group mb="sm">
              <ThemeIcon
                size="lg"
                radius="xl"
                variant="gradient"
                gradient={{ from: "teal", to: "green" }}
              >
                <Scale size={20} />
              </ThemeIcon>
              <Text fw={600}>Fair Resolution</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Our team will review all evidence and ensure a fair outcome for
              everyone involved in this contract.
            </Text>
          </Paper>
        </SimpleGrid>

        {/* Parties Involved */}
        {(initiatorName || providerName) && (
          <Card shadow="sm" radius="lg" p="lg" className={styles.partiesCard}>
            <Group justify="center" mb="md">
              <ThemeIcon size="lg" variant="light" color="gray" radius="xl">
                <Users size={20} />
              </ThemeIcon>
              <Text fw={600}>Parties Involved</Text>
            </Group>

            <Group justify="center" gap="xl" wrap="wrap">
              {initiatorName && (
                <div className={styles.partyBadge}>
                  <Text size="xs" c="dimmed" mb={4}>
                    Client
                  </Text>
                  <Badge size="lg" variant="light" color="blue">
                    {initiatorName}
                  </Badge>
                </div>
              )}

              <div className={styles.vsCircle}>
                <Text size="xs" fw={700} c="dimmed">
                  VS
                </Text>
              </div>

              {providerName && (
                <div className={styles.partyBadge}>
                  <Text size="xs" c="dimmed" mb={4}>
                    Service Provider
                  </Text>
                  <Badge size="lg" variant="light" color="green">
                    {providerName}
                  </Badge>
                </div>
              )}
            </Group>
          </Card>
        )}

        {/* Action Buttons */}
        <Card
          shadow="md"
          radius="lg"
          p={{ base: "md", md: "xl" }}
          className={styles.actionCard}
        >
          <Stack align="center" gap="md">
            <Text size="lg" fw={600} ta="center">
              Need Help Resolving This Dispute?
            </Text>
            <Text size="sm" c="dimmed" ta="center" maw={400}>
              Our support team is available 24/7 to help mediate and find a
              solution that works for everyone.
            </Text>

            <Group gap="md" mt="md">
              <Button
                variant="gradient"
                gradient={{ from: "orange", to: "red" }}
                size="lg"
                leftSection={<Phone size={18} />}
                onClick={onContactSupport}
                className={styles.actionButton}
              >
                Contact Support
              </Button>
              <Button
                variant="light"
                color="gray"
                size="lg"
                rightSection={<ArrowRight size={18} />}
                onClick={onViewDetails}
                className={styles.actionButton}
              >
                View Complaint Details
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* Footer Note */}
        <Text size="xs" c="dimmed" ta="center" className={styles.footerNote}>
          💡 Tip: Most disputes are resolved quickly through open communication.
          Reach out to the other party and try to find common ground.
        </Text>
      </Stack>
    </Box>
  );
};

export default DisputedContractBanner;
