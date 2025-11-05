"use client";
import React from "react";
import {
  Modal,
  Text,
  Box,
  Stack,
  Group,
  ActionIcon,
  Badge,
  Loader,
  Paper,
  Button,
} from "@mantine/core";
import {
  Plus,
  Calendar,
  DollarSign,
  FileText,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { ISuggestedMilestone } from "@/api/contract";

interface AiSuggestionsModalProps {
  opened: boolean;
  onClose: () => void;
  suggestions: ISuggestedMilestone[];
  isLoading: boolean;
  onSelectMilestone: (milestone: ISuggestedMilestone) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-UK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const AiSuggestionsModal: React.FC<AiSuggestionsModalProps> = ({
  opened,
  onClose,
  suggestions,
  isLoading,
  onSelectMilestone,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <Box className="relative">
            <Sparkles
              size={24}
              className="text-orange-500 animate-pulse"
              style={{ filter: "drop-shadow(0 0 8px rgba(240, 140, 35, 0.6))" }}
            />
          </Box>
          <Box>
            <Text size="lg" fw={700} className="text-gray-800">
              AI Suggested Milestones
            </Text>
            <Text size="xs" c="dimmed" fw={400}>
              Smart recommendations based on your contract
            </Text>
          </Box>
        </Group>
      }
      size="lg"
      centered
      classNames={{
        content: "!rounded-xl !overflow-hidden",
        header: "!bg-gradient-to-r !from-orange-50 !to-green-50 !pb-4",
        body: "!p-0",
      }}
      transitionProps={{
        transition: "slide-up",
        duration: 300,
        timingFunction: "ease-out",
      }}
    >
      <Box className="relative">
        {/* Decorative gradient overlay */}
        <Box className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-green-500 to-orange-500 animate-pulse" />

        <Box p="xl" className="max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <Box className="flex flex-col items-center justify-center py-16">
              <Loader size="lg" color="#F08C23" />
              <Text size="sm" c="dimmed" mt="lg">
                Generating AI suggestions...
              </Text>
            </Box>
          ) : suggestions.length === 0 ? (
            <Box className="flex flex-col items-center justify-center py-16">
              <Box className="mb-4 p-4 rounded-full bg-gray-100">
                <FileText size={48} className="text-gray-400" />
              </Box>
              <Text size="lg" fw={600} className="text-gray-700 mb-2">
                No Suggestions Available
              </Text>
              <Text size="sm" c="dimmed" ta="center" maw={400} mb="md">
                We couldn&apos;t generate milestone suggestions at this time.
                Please try again later or create milestones manually.
              </Text>
              <Box
                className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
                maw={450}
              >
                <Group gap="xs" mb="xs">
                  <Sparkles size={16} className="text-blue-600" />
                  <Text size="sm" fw={600} className="text-blue-700">
                    Pro Tip
                  </Text>
                </Group>
                <Text size="xs" c="dimmed" ta="center">
                  You can use the AI chat button on this page to ask for
                  milestone suggestions tailored to your contract requirements.
                </Text>
              </Box>
              <Button
                onClick={onClose}
                size="md"
                radius="xl"
                className="!bg-gradient-to-r !from-orange-500 !to-orange-600 hover:!from-orange-600 hover:!to-orange-700"
                style={{ color: "white" }}
              >
                Close
              </Button>
            </Box>
          ) : (
            <Stack gap="md">
              <Box className="flex items-center gap-2 px-2">
                <TrendingUp size={16} className="text-green-600" />
                <Text size="sm" c="dimmed">
                  {suggestions.length} smart milestone
                  {suggestions.length !== 1 ? "s" : ""} detected
                </Text>
              </Box>

              {/* Container query wrapper for responsive cards */}
              <Box
                className="milestone-suggestions-container"
                style={{
                  containerType: "inline-size",
                }}
              >
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                  @container (min-width: 600px) {
                    .milestone-card {
                      grid-template-columns: 1fr auto;
                    }
                  }
                  @container (max-width: 599px) {
                    .milestone-card {
                      grid-template-columns: 1fr;
                    }
                    .milestone-card-actions {
                      justify-content: flex-end;
                      width: 100%;
                    }
                  }
                  @keyframes slideInUp {
                    from {
                      opacity: 0;
                      transform: translateY(20px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                `,
                  }}
                />

                {suggestions.map((milestone, index) => (
                  <Paper
                    key={index}
                    className={`
                      milestone-card
                      p-4 rounded-xl border border-gray-200 
                      hover:border-orange-300 hover:shadow-lg
                      transition-all duration-300 ease-out
                      hover:scale-[1.02]
                      group cursor-pointer
                      grid gap-4 items-start
                    `}
                    style={{
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
                      animation: `slideInUp 0.4s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    {/* Main Content */}
                    <Box className="space-y-3">
                      {/* Header */}
                      <Group justify="space-between" wrap="nowrap">
                        <Box className="flex-1 min-w-0">
                          <Group gap="xs" mb={4}>
                            <Badge
                              size="xs"
                              variant="light"
                              color="orange"
                              className="animate-pulse"
                            >
                              AI Generated
                            </Badge>
                            <Badge
                              size="xs"
                              variant="light"
                              style={{
                                backgroundColor:
                                  milestone.status === "pending"
                                    ? "#F08C2315"
                                    : "#3D6B2C15",
                                color:
                                  milestone.status === "pending"
                                    ? "#F08C23"
                                    : "#3D6B2C",
                              }}
                            >
                              {milestone.status}
                            </Badge>
                          </Group>
                          <Text
                            size="md"
                            fw={700}
                            className="text-gray-800 line-clamp-2"
                          >
                            {milestone.name}
                          </Text>
                        </Box>
                      </Group>

                      {/* Description */}
                      <Text
                        size="sm"
                        c="dimmed"
                        className="line-clamp-2 leading-relaxed"
                      >
                        {milestone.description}
                      </Text>

                      {/* Info Grid */}
                      <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <Group gap="xs" wrap="nowrap">
                          <Box className="p-2 rounded-lg bg-green-50">
                            <DollarSign size={16} className="text-green-600" />
                          </Box>
                          <Box className="min-w-0">
                            <Text size="xs" c="dimmed" className="truncate">
                              Amount
                            </Text>
                            <Text
                              size="sm"
                              fw={600}
                              className="text-green-700 truncate"
                            >
                              {formatCurrency(milestone.amount)}
                            </Text>
                          </Box>
                        </Group>

                        <Group gap="xs" wrap="nowrap">
                          <Box className="p-2 rounded-lg bg-blue-50">
                            <Calendar size={16} className="text-blue-600" />
                          </Box>
                          <Box className="min-w-0">
                            <Text size="xs" c="dimmed" className="truncate">
                              Duration
                            </Text>
                            <Text size="sm" fw={500} className="truncate">
                              {formatDate(milestone.start_date)} -{" "}
                              {formatDate(milestone.end_date)}
                            </Text>
                          </Box>
                        </Group>
                      </Box>
                    </Box>

                    {/* Action Button */}
                    <Box className="milestone-card-actions flex items-center justify-center">
                      <ActionIcon
                        size="xl"
                        radius="xl"
                        onClick={() => onSelectMilestone(milestone)}
                        className="
                          !bg-gradient-to-br !from-orange-500 !to-orange-600
                          hover:!from-orange-600 hover:!to-orange-700
                          !shadow-lg hover:!shadow-xl
                          !transition-all !duration-300
                          group-hover:scale-110
                          active:scale-95
                        "
                        style={{
                          color: "white",
                        }}
                      >
                        <Plus
                          size={24}
                          className="transition-transform duration-300 group-hover:rotate-90"
                        />
                      </ActionIcon>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Stack>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default AiSuggestionsModal;
