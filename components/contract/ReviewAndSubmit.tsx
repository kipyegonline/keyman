"use client";
import React, { useState } from "react";
import {
  Card,
  Stack,
  Group,
  Button,
  Title,
  Text,
  Paper,
  Box,
  Badge,
  Divider,
  Alert,
  Loader,
} from "@mantine/core";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ContractData {
  service_provider_id: string;
  contract_duration_in_duration: number;
  contract_amount: number;
  title: string;
  scope: string;
}

interface Milestone {
  id: string;
  name: string;
  deliverables: string;
  amount: number;
  duration_in_days: number;
  supplier_id?: string;
  supplier_name?: string;
  verified?: boolean;
}

interface Phase {
  id: string;
  name: string;
  description?: string;
  milestones: Milestone[];
}

interface ReviewAndSubmitProps {
  contractData: ContractData | null;
  phases: Phase[];
  onBack: () => void;
}

const ReviewAndSubmit: React.FC<ReviewAndSubmitProps> = ({
  contractData,
  phases,
  onBack,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Submit contract logic will be implemented here
      // await createContract({ contractData, phases });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to contracts list or success page
      router.push("/keyman/dashboard/key-contract");
    } catch (err) {
      setError("Failed to create contract. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPhaseAmount = phases.reduce(
    (sum, phase) =>
      sum +
      phase.milestones.reduce((mSum, milestone) => mSum + milestone.amount, 0),
    0
  );

  return (
    <Card shadow="sm" padding="lg" radius="lg">
      <Stack gap="xl">
        {/* Header */}
        <Box>
          <Title order={2} mb="xs">
            Review & Submit
          </Title>
          <Text size="sm" c="dimmed">
            Review your contract details before submission
          </Text>
        </Box>

        {error && (
          <Alert
            icon={<AlertCircle size={16} />}
            title="Submission Error"
            color="red"
            variant="filled"
          >
            {error}
          </Alert>
        )}

        {/* Contract Details */}
        {contractData && (
          <Paper p="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Contract Title
                </Text>
                <Text fw={600}>{contractData.title}</Text>
              </Group>

              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Duration
                </Text>
                <Text fw={600}>
                  {contractData.contract_duration_in_duration} days
                </Text>
              </Group>

              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Total Amount
                </Text>
                <Text fw={700} size="lg" c="green.7">
                  Ksh {contractData.contract_amount.toLocaleString()}
                </Text>
              </Group>

              <Divider />

              <Box>
                <Text size="sm" c="dimmed" mb="xs">
                  Scope of Work
                </Text>
                <Text size="sm">{contractData.scope}</Text>
              </Box>
            </Stack>
          </Paper>
        )}

        {/* Phases Summary */}
        <Box>
          <Text fw={600} mb="md">
            Phases & Milestones Summary
          </Text>
          <Stack gap="md">
            {phases.map((phase) => (
              <Paper key={phase.id} p="md" radius="md" withBorder>
                <Group justify="space-between" mb="sm">
                  <Text fw={600}>{phase.name}</Text>
                  <Badge color="green" variant="light">
                    {phase.milestones.length} milestone
                    {phase.milestones.length !== 1 ? "s" : ""}
                  </Badge>
                </Group>

                <Stack gap="xs" pl="md">
                  {phase.milestones.map((milestone) => (
                    <Group key={milestone.id} justify="space-between">
                      <Text size="sm" c="dimmed">
                        • {milestone.name}
                      </Text>
                      <Group gap="md">
                        <Text size="sm">
                          Ksh {milestone.amount.toLocaleString()}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {milestone.duration_in_days} day
                          {milestone.duration_in_days !== 1 ? "s" : ""}
                        </Text>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            ))}
          </Stack>

          <Paper p="md" mt="md" radius="md" bg="green.0">
            <Group justify="space-between">
              <Text fw={600} c="green.8">
                Total Phase Amount
              </Text>
              <Text fw={700} size="lg" c="green.8">
                Ksh {totalPhaseAmount.toLocaleString()}
              </Text>
            </Group>
          </Paper>
        </Box>

        {/* Fair Trade Badge */}
        <Paper p="md" radius="md" bg="blue.0">
          <Group gap="xs">
            <CheckCircle2 size={16} color="var(--mantine-color-blue-7)" />
            <Text size="sm" c="blue.8">
              This contract follows the Keyman Stores 12 Principles of Fair
              Trade
            </Text>
          </Group>
        </Paper>

        {/* Actions */}
        <Group justify="space-between" mt="xl">
          <Button
            variant="subtle"
            leftSection={<ArrowLeft size={16} />}
            onClick={onBack}
            color="gray"
            disabled={isSubmitting}
          >
            Back
          </Button>

          <Button
            rightSection={
              isSubmitting ? (
                <Loader size="xs" color="white" />
              ) : (
                <CheckCircle2 size={16} />
              )
            }
            onClick={handleSubmit}
            color="green.7"
            size="md"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Contract"}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};

export default ReviewAndSubmit;
