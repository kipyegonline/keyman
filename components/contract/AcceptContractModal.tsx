"use client";
import {
  Modal,
  Button,
  Stack,
  Text,
  TextInput,
  Paper,
  Group,
  Alert,
  Divider,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { CheckCircle, AlertTriangle, FileCheck, User } from "lucide-react";
import { useState } from "react";

interface AcceptContractModalProps {
  opened: boolean;
  onClose: () => void;
  contract: {
    id: string;
    title?: string;
    contract_amount: number;
    code: string;
    contract_json?: {
      title?: string;
      agreement_summary?: string;
    };
  };
  onAccept: (contractId: string, signature: string) => Promise<void>;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

export default function AcceptContractModal({
  opened,
  onClose,
  contract,
  onAccept,
}: AcceptContractModalProps) {
  const [isAccepting, setIsAccepting] = useState(false);

  const form = useForm({
    initialValues: {
      signature: "",
      agreement: false,
    },
    validate: {
      signature: (value) =>
        !value || value.trim().length < 2
          ? "Please enter your full name as signature"
          : null,
    },
  });

  const handleSubmit = async (values: { signature: string }) => {
    setIsAccepting(true);
    try {
      await onAccept(contract.id, values.signature);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error accepting contract:", error);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <FileCheck size={24} className="text-green-600" />
          <Title order={3} className="text-gray-800">
            Accept Contract Agreement
          </Title>
        </Group>
      }
      size="md"
      centered
      closeOnClickOutside={false}
      closeOnEscape={!isAccepting}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {/* Contract Summary */}
          <Paper p="md" className="bg-blue-50 border border-blue-200" radius="md">
            <Text fw={600} size="sm" className="text-blue-800 mb-2">
              Contract Summary
            </Text>
            <div className="space-y-2">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Contract:
                </Text>
                <Text size="sm" fw={500}>
                  {contract.contract_json?.title || contract.code}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Total Value:
                </Text>
                <Text size="sm" fw={600} className="text-green-700">
                  {formatCurrency(contract.contract_amount)}
                </Text>
              </Group>
            </div>
          </Paper>

          {/* Agreement Text */}
          <Alert
            icon={<AlertTriangle size={16} />}
            color="orange"
            title="Contract Agreement"
            radius="md"
          >
            <Text size="sm" className="mb-3">
              By accepting this contract, you agree to:
            </Text>
            <ul className="text-sm space-y-1 ml-4 list-disc">
              <li>Complete all project milestones as specified</li>
              <li>Deliver work according to the agreed timeline</li>
              <li>Maintain professional standards throughout the project</li>
              <li>Communicate promptly regarding any issues or changes</li>
              <li>Comply with all terms and conditions outlined in the contract</li>
            </ul>
          </Alert>

          {/* Agreement Summary */}
          {contract.contract_json?.agreement_summary && (
            <Paper p="md" className="bg-gray-50 border border-gray-200" radius="md">
              <Text fw={600} size="sm" className="text-gray-800 mb-2">
                Project Description
              </Text>
              <Text size="sm" className="text-gray-600 leading-relaxed">
                {contract.contract_json.agreement_summary}
              </Text>
            </Paper>
          )}

          <Divider />

          {/* Signature Section */}
          <div>
            <Group gap="sm" mb="md">
              <User size={18} className="text-gray-600" />
              <Text fw={600} size="sm" className="text-gray-800">
                Digital Signature Required
              </Text>
            </Group>
            
            <TextInput
              label="Full Name (Digital Signature)"
              placeholder="Enter your full name to sign this agreement"
              required
              {...form.getInputProps("signature")}
              leftSection={<User size={16} />}
              description="By entering your name, you are digitally signing this contract agreement"
            />
          </div>

          {/* Action Buttons */}
          <Group justify="space-between" mt="lg">
            <Button
              variant="light"
              onClick={onClose}
              disabled={isAccepting}
              color="gray"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isAccepting}
              rightSection={<CheckCircle size={16} />}
              className="bg-green-600 hover:bg-green-700"
              disabled={!form.values.signature.trim()}
            >
              {isAccepting ? "Accepting Contract..." : "Accept & Sign Contract"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}