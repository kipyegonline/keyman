"use client";
import React, { useState, useMemo } from "react";
import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Chip,
  ThemeIcon,
  Divider,
  Box,
} from "@mantine/core";
import { Gift, Users, Sparkles, Send, Check } from "lucide-react";

// Keyman brand colors
const KEYMAN_GREEN = "#3D6B2C";
const KEYMAN_GREEN_LIGHT = "#3D6B2C15";
const KEYMAN_ORANGE = "#F08C23";
const KEYMAN_ORANGE_LIGHT = "#F08C2315";

interface ReferralCashbackProps {
  referrerKsNumber: string;
  totalAmount: number;
  onClaimCashback?: (amount: number) => void;
  isLoading?: boolean;
}

/**
 * Calculate cashback amount based on total contract amount
 * - 1,000 to 50,000: Cashback options of 20, 40, 60 KES
 * - Above 50,000: Cashback options of 160, 180, 200 KES
 */
const getCashbackOptions = (totalAmount: number): number[] => {
  if (totalAmount < 1000) {
    return []; // No cashback for amounts below 1000
  }

  if (totalAmount <= 50000) {
    // For amounts between 1,000 and 50,000
    // Scale the base cashback based on amount
    if (totalAmount < 5000) {
      return [20];
    } else if (totalAmount < 15000) {
      return [20, 40];
    } else {
      return [20, 40, 60];
    }
  } else {
    // For amounts above 50,000
    // Scale the premium cashback based on amount
    if (totalAmount < 100000) {
      return [160];
    } else if (totalAmount < 200000) {
      return [160, 180];
    } else {
      return [160, 180, 200];
    }
  }
};

/**
 * Get the recommended cashback amount (highest available)
 */
const getRecommendedCashback = (options: number[]): number => {
  return options.length > 0 ? Math.max(...options) : 0;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount);
};

const ReferralCashback: React.FC<ReferralCashbackProps> = ({
  referrerKsNumber,
  totalAmount,
  onClaimCashback,
  isLoading = false,
}) => {
  const cashbackOptions = useMemo(
    () => getCashbackOptions(totalAmount),
    [totalAmount]
  );

  const recommendedCashback = useMemo(
    () => getRecommendedCashback(cashbackOptions),
    [cashbackOptions]
  );

  const [selectedCashback, setSelectedCashback] = useState<number | null>(null);

  // Set recommended as default when options change
  React.useEffect(() => {
    if (recommendedCashback > 0 && selectedCashback === null) {
      setSelectedCashback(recommendedCashback);
    }
  }, [recommendedCashback, selectedCashback]);

  const handleClaimCashback = () => {
    if (onClaimCashback) onClaimCashback(10);
    if (selectedCashback && onClaimCashback) {
      // onClaimCashback(selectedCashback);
    }
  };

  // Don't render if no cashback options available
  //(cashbackOptions.length === 0)
  if (false) {
    return (
      <Paper
        p="md"
        radius="md"
        withBorder
        style={{
          background: `linear-gradient(135deg, ${KEYMAN_ORANGE_LIGHT} 0%, #FEF3C7 100%)`,
          borderColor: KEYMAN_ORANGE,
        }}
      >
        <Group gap="sm">
          <ThemeIcon
            size="lg"
            radius="xl"
            style={{ backgroundColor: KEYMAN_ORANGE }}
          >
            <Users size={18} color="white" />
          </ThemeIcon>
          <Box style={{ flex: 1 }}>
            <Text size="sm" fw={600} style={{ color: KEYMAN_ORANGE }}>
              Referred by {referrerKsNumber}
            </Text>
            <Text size="xs" c="dimmed">
              Thank you for using a referral! Cashback available for contracts
              above KES 1,000.
            </Text>
          </Box>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper
      p="md"
      radius="lg"
      withBorder
      style={{
        background: `linear-gradient(135deg, ${KEYMAN_GREEN_LIGHT} 0%, #E8F5E9 100%)`,
        borderColor: KEYMAN_GREEN,
        overflow: "hidden",
      }}
    >
      <Stack gap="md">
        {/* Referral Header */}
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <ThemeIcon
              size="xl"
              radius="xl"
              style={{
                backgroundColor: KEYMAN_GREEN,
                boxShadow: `0 4px 14px ${KEYMAN_GREEN}40`,
              }}
            >
              <Gift size={22} color="white" />
            </ThemeIcon>
            <Box>
              <Group gap="xs">
                <Text size="md" fw={700} style={{ color: KEYMAN_GREEN }}>
                  Referral Reward!
                </Text>
                <Sparkles size={16} color={KEYMAN_ORANGE} />
              </Group>
              <Text size="sm" c="dimmed">
                This contract was referred by{" "}
                <Text span fw={600} style={{ color: KEYMAN_GREEN }}>
                  {referrerKsNumber}
                </Text>
              </Text>
            </Box>
          </Group>
          <Badge
            size="lg"
            variant="filled"
            style={{ backgroundColor: KEYMAN_ORANGE }}
          >
            Eligible
          </Badge>
        </Group>

        <Divider style={{ borderColor: `${KEYMAN_GREEN}30` }} />

        {/* Cashback Info */}
        <Box>
          <Text size="sm" style={{ color: KEYMAN_GREEN }} fw={500} mb="xs">
            Send a thank-you cashback to your referrer:
          </Text>
          <Text size="xs" c="dimmed" mb="sm">
            Contract value: {formatCurrency(totalAmount)}
          </Text>

          {/* Cashback Options as Chips */}
          <Chip.Group
            multiple={false}
            value={selectedCashback?.toString() || ""}
            onChange={(value) => setSelectedCashback(Number(value))}
          >
            <Group gap="xs">
              {cashbackOptions.map((amount) => (
                <Chip
                  key={amount}
                  value={amount.toString()}
                  variant="filled"
                  size="md"
                  styles={{
                    label: {
                      fontWeight: 600,
                      padding: "8px 16px",
                      backgroundColor:
                        selectedCashback === amount
                          ? KEYMAN_GREEN
                          : KEYMAN_GREEN_LIGHT,
                      color:
                        selectedCashback === amount ? "white" : KEYMAN_GREEN,
                    },
                  }}
                >
                  {formatCurrency(amount)}
                  {amount === recommendedCashback && (
                    <Badge
                      size="xs"
                      variant="filled"
                      ml={4}
                      style={{
                        textTransform: "none",
                        backgroundColor: KEYMAN_ORANGE,
                      }}
                    >
                      Best
                    </Badge>
                  )}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        </Box>

        {/* Selected Amount Display */}
        {selectedCashback && (
          <Paper
            p="sm"
            radius="md"
            style={{
              backgroundColor: KEYMAN_GREEN_LIGHT,
              border: `1px dashed ${KEYMAN_GREEN}`,
            }}
          >
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <Check size={16} color={KEYMAN_GREEN} />
                <Text size="sm" style={{ color: KEYMAN_GREEN }}>
                  <Text span fw={600}>
                    {referrerKsNumber}
                  </Text>{" "}
                  will receive
                </Text>
              </Group>
              <Text size="lg" fw={700} style={{ color: KEYMAN_GREEN }}>
                {formatCurrency(selectedCashback)}
              </Text>
            </Group>
          </Paper>
        )}

        {/* CTA Button */}
        <Button
          fullWidth
          size="md"
          loading={isLoading}
          //  disabled={!selectedCashback}
          onClick={handleClaimCashback}
          leftSection={<Send size={18} />}
          style={{
            backgroundColor: KEYMAN_ORANGE,
            boxShadow: `0 4px 14px ${KEYMAN_ORANGE}40`,
          }}
        >
          Send{" "}
          {selectedCashback ? formatCurrency(selectedCashback) : "Cashback"} to{" "}
          {referrerKsNumber}
        </Button>

        {/* Terms Note */}
        <Text size="xs" c="dimmed" ta="center">
          Cashback will be sent to {referrerKsNumber}&apos;s wallet after
          contract completion
        </Text>
      </Stack>
    </Paper>
  );
};

export default ReferralCashback;

// Export utility functions for use elsewhere
export { getCashbackOptions, getRecommendedCashback };
