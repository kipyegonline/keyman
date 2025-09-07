"use client";
import React from "react";
import {
  Modal,
  Button,
  Stack,
  Text,
  Card,
  Group,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { Bot, FileText, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/lib/helpers";

interface CreateContractModalProps {
  opened: boolean;
  onClose: () => void;
  onCreateWithAI: () => void;
}

const CreateContractModal: React.FC<CreateContractModalProps> = ({
  opened,
  onClose,
  onCreateWithAI,
}) => {
  const router = useRouter();

  const handleManualCreation = () => {
    onClose();
    router.push("/keyman/dashboard/key-contract/create");
    navigateTo();
  };

  const handleAICreation = () => {
    onClose();
    onCreateWithAI();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Title order={3} className="text-gray-800">
          Create New Contract
        </Title>
      }
      size="md"
      radius="lg"
      centered
      padding="xl"
    >
      <Stack gap="lg">
        <Text size="md" c="gray.6" className="text-center">
          Choose how{`you'd`} like to create your contract
        </Text>

        <Stack gap="md">
          {/* AI Creation Option */}
          <Card
            padding="lg"
            radius="lg"
            withBorder
            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-green-300 group bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200"
            onClick={handleAICreation}
          >
            <Group gap="md">
              <ThemeIcon
                size={60}
                radius="lg"
                className="bg-green-500 group-hover:bg-green-600 transition-all duration-300"
                color="green"
              >
                <Bot
                  size={28}
                  className="text-green-500 bg-white rounded-full p-1"
                />
              </ThemeIcon>
              <div className="flex-1">
                <Group justify="space-between" align="center">
                  <div>
                    <Text size="lg" fw={600} className="text-gray-900 mb-1">
                      Create with Keyman Assistant
                    </Text>
                    <Text size="sm" c="gray.6">
                      Let our AI assistant help you create a contract through
                      conversation
                    </Text>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300"
                  />
                </Group>
              </div>
            </Group>
          </Card>

          {/* Manual Creation Option */}
          <Card
            padding="lg"
            radius="lg"
            withBorder
            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-orange-300 group bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200"
            onClick={handleManualCreation}
          >
            <Group gap="md">
              <ThemeIcon
                size={60}
                radius="lg"
                className="bg-orange-500 group-hover:bg-orange-600 transition-all duration-300"
                color="orange"
              >
                <FileText
                  size={28}
                  className="text-orange-500 bg-white rounded-full p-1"
                />
              </ThemeIcon>
              <div className="flex-1">
                <Group justify="space-between" align="center">
                  <div>
                    <Text size="lg" fw={600} className="text-gray-900 mb-1">
                      Create Manually
                    </Text>
                    <Text size="sm" c="gray.6">
                      Fill out the contract details using a structured form
                    </Text>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-300"
                  />
                </Group>
              </div>
            </Group>
          </Card>
        </Stack>

        <Group justify="center" className="mt-4">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default CreateContractModal;
