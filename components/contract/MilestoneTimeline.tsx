"use client";
import React, { useState, useMemo } from "react";
import {
  Badge,
  Text,
  Group,
  Card,
  Stack,
  ThemeIcon,
  Timeline,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Checkbox,
  Button,
  Paper,
} from "@mantine/core";
import {
  Target,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  Edit,
  Trash2 as Delete,
  X,
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  name: string;
  description: string;
  status: "completed" | "in_progress" | "pending" | "overdue";
  amount?: number;
  due_date?: string;
  completion_date?: string;
  start_date?: string;
  end_date?: string;
  client_completion_date?: string;
  service_provider_completion_date?: string;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
  canEditMileStone?: boolean;
  serviceProviderSigningDate?: string | null;
  onEditMilestone?: (milestoneId: string) => void;
  onDeleteMilestone?: (milestoneId: string) => void;
  onStatusChange?: (milestoneId: string, action: "start" | "complete") => void;
  onBatchStatusChange?: (
    milestoneIds: string[],
    action: "start" | "complete"
  ) => void;
  userType: string;
  mode: "client" | "service_provider";
}

const getMilestoneStatusConfig = (status: string) => {
  const configs: Record<
    string,
    {
      color: string;
      icon: React.ComponentType<{ size: number; color?: string }>;
    }
  > = {
    completed: { color: "#388E3C", icon: CheckCircle },
    in_progress: { color: "#F08C23", icon: Clock },
    pending: { color: "#9E9E9E", icon: Clock },
    overdue: { color: "#D32F2F", icon: AlertCircle },
  };
  return configs[status.toLowerCase()] || configs.pending;
};

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

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  milestones,
  canEditMileStone = false,
  serviceProviderSigningDate = null,
  onEditMilestone,
  onDeleteMilestone,
  onStatusChange,
  onBatchStatusChange,
  userType,
  //mode,
}) => {
  const [selectedMilestones, setSelectedMilestones] = useState<Set<string>>(
    new Set()
  );

  const completedMilestones = milestones.filter(
    (m: Milestone) => m.status.toLowerCase() === "completed"
  ).length;

  // Determine the current selection mode based on first selected milestone
  const selectionMode = useMemo(() => {
    if (selectedMilestones.size === 0) return null;
    const firstSelectedId = Array.from(selectedMilestones)[0];
    const firstMilestone = milestones.find((m) => m.id === firstSelectedId);
    if (!firstMilestone) return null;

    const status = firstMilestone.status.toLowerCase();
    if (status === "pending") return "start";
    if (status === "in_progress" || status === "supplier_completed")
      return "complete";
    return null;
  }, [selectedMilestones, milestones]);

  // Check if a milestone can be selected based on current selection mode
  const canSelectMilestone = (milestoneId: string) => {
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) return false;

    const status = milestone.status.toLowerCase();
    // Can't select completed milestones
    if (status === "completed") return false;

    // If nothing is selected yet, allow selection
    if (selectionMode === null) return true;

    // Check if this milestone matches the current selection mode
    if (selectionMode === "start") {
      return status === "pending";
    } else if (selectionMode === "complete") {
      return status === "in_progress" || status === "supplier_completed";
    }
    return false;
  };

  // Toggle milestone selection
  const toggleMilestoneSelection = (milestoneId: string) => {
    setSelectedMilestones((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(milestoneId)) {
        // Always allow deselection
        newSet.delete(milestoneId);
      } else {
        // Only add if it matches current selection mode or is first selection
        if (prev.size === 0 || canSelectMilestone(milestoneId)) {
          newSet.add(milestoneId);
        }
      }
      return newSet;
    });
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedMilestones(new Set());
  };

  // Check if any selected milestones can be started (pending status)
  const canStartSelected = useMemo(() => {
    if (
      selectedMilestones.size === 0 ||
      userType !== "customer" ||
      !serviceProviderSigningDate
    )
      return false;
    return Array.from(selectedMilestones).some((id) => {
      const milestone = milestones.find((m) => m.id === id);
      return milestone?.status.toLowerCase() === "pending";
    });
  }, [selectedMilestones, milestones, userType, serviceProviderSigningDate]);

  // Check if any selected milestones can be completed (in_progress or supplier_completed)
  const canCompleteSelected = useMemo(() => {
    if (selectedMilestones.size === 0 || !serviceProviderSigningDate)
      return false;
    return Array.from(selectedMilestones).some((id) => {
      const milestone = milestones.find((m) => m.id === id);
      const status = milestone?.status.toLowerCase();
      return status === "in_progress" || status === "supplier_completed";
    });
  }, [selectedMilestones, milestones, serviceProviderSigningDate]);

  // Get selected milestones that can be started
  const startableMilestones = useMemo(() => {
    return Array.from(selectedMilestones).filter((id) => {
      const milestone = milestones.find((m) => m.id === id);
      return milestone?.status.toLowerCase() === "pending";
    });
  }, [selectedMilestones, milestones]);

  // Get selected milestones that can be completed
  const completableMilestones = useMemo(() => {
    return Array.from(selectedMilestones).filter((id) => {
      const milestone = milestones.find((m) => m.id === id);
      const status = milestone?.status.toLowerCase();
      return status === "in_progress" || status === "supplier_completed";
    });
  }, [selectedMilestones, milestones]);

  if (!milestones || milestones.length === 0) {
    return null;
  }
  const getStatusUpdateText = (status: string) => {
    if (!serviceProviderSigningDate) return "Awaiting acceptance";
    switch (status.toLowerCase()) {
      case "pending":
        return "Awaiting payment";
      case "in_progress":
        return "Started";
      case "supplier_completed":
        return "Supplier Completed";
      case "completed":
        return "Completed";
      default:
        return "pending";
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" className="relative">
      {/* Sticky Action Bar - appears when milestones are selected */}
      {selectedMilestones.size > 0 && (
        <Paper
          shadow="md"
          p="sm"
          mb="md"
          radius="md"
          className="sticky top-0 z-10 border"
          style={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" }}
        >
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <Badge size="lg" variant="filled" color="orange">
                {selectedMilestones.size} selected
              </Badge>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                onClick={clearSelections}
              >
                <X size={16} />
              </ActionIcon>
            </Group>
            <Group gap="sm">
              {canStartSelected && userType === "customer" && (
                <Tooltip
                  label={`Start ${startableMilestones.length} milestone(s)`}
                  position="top"
                  withArrow
                >
                  <Button
                    size="xs"
                    variant="light"
                    color="green"
                    leftSection={<Play size={14} />}
                    onClick={() => {
                      if (onBatchStatusChange) {
                        onBatchStatusChange(startableMilestones, "start");
                        clearSelections();
                      }
                    }}
                  >
                    Start ({startableMilestones.length})
                  </Button>
                </Tooltip>
              )}
              {canCompleteSelected && (
                <Tooltip
                  label={`Complete ${completableMilestones.length} milestone(s)`}
                  position="top"
                  withArrow
                >
                  <Button
                    size="xs"
                    variant="light"
                    color="orange"
                    leftSection={<CheckCircle size={14} />}
                    onClick={() => {
                      if (onBatchStatusChange) {
                        onBatchStatusChange(completableMilestones, "complete");
                        clearSelections();
                      }
                    }}
                  >
                    Complete ({completableMilestones.length})
                  </Button>
                </Tooltip>
              )}
            </Group>
          </Group>
        </Paper>
      )}

      <Group gap="xs" mb="md">
        <ThemeIcon
          size="lg"
          style={{ backgroundColor: "#F08C2315" }}
          variant="light"
        >
          <Target size={20} style={{ color: "#F08C23" }} />
        </ThemeIcon>
        <Text fw={600} size="lg" className="text-gray-800">
          Project Milestones
        </Text>
        {milestones.length > 1 && serviceProviderSigningDate !== null && (
          <Text size="xs" c="dimmed" className="ml-auto">
            Select milestones to batch update
          </Text>
        )}
      </Group>

      <ScrollArea.Autosize mah={400}>
        <Timeline active={completedMilestones} bulletSize={24} lineWidth={2}>
          {milestones.map((milestone) => {
            const config = getMilestoneStatusConfig(milestone.status);
            const IconComponent = config.icon;
            //mode === "client" &&
            /*  const clientVisible =
              userType === "customer" &&
              milestone?.service_provider_completion_date !== null &&
              milestone?.service_provider_completion_date != "" &&
              (milestone?.client_completion_date == "" ||
                milestone?.client_completion_date == null);
            const supplierVisible =
              userType === "supplier" &&
              (milestone?.service_provider_completion_date == "" ||
                milestone?.service_provider_completion_date == null) &&
              milestone.status == "in_progress";*/

            //supplier_completed
            return (
              <Timeline.Item
                key={milestone.id}
                bullet={
                  <ThemeIcon
                    size={24}
                    radius="xl"
                    style={{ backgroundColor: config.color }}
                  >
                    <IconComponent size={14} color="white" />
                  </ThemeIcon>
                }
                title={
                  <Group justify="space-between" align="center">
                    <Text fw={600} size="sm">
                      {milestone.name}
                    </Text>
                    <Text fw={600} size="sm" className="text-gray-800">
                      {milestone.title}
                    </Text>
                    <Group gap="xs" align="center">
                      <Group gap="xs">
                        <Badge
                          variant="light"
                          style={{
                            backgroundColor: `${config.color}15`,
                            color: config.color,
                          }}
                          size="sm"
                        >
                          {getStatusUpdateText(milestone.status)}
                        </Badge>

                        {milestone.amount && (
                          <Badge variant="outline" color="gray" size="sm">
                            {formatCurrency(milestone.amount)}
                          </Badge>
                        )}
                      </Group>
                      {(milestone.status.toLowerCase() === "pending" ||
                        milestone.status.toLowerCase() === "in_progress" ||
                        milestone.status.toLowerCase() ===
                          "supplier_completed") &&
                        (canEditMileStone ||
                          milestone.status.toLowerCase() === "in_progress" ||
                          milestone.status.toLowerCase() ===
                            "supplier_completed") &&
                        serviceProviderSigningDate !== null && (
                          <>
                            {milestone.status.toLowerCase() === "pending" &&
                              userType === "customer" && (
                                <Button
                                  size="compact-xs"
                                  variant="light"
                                  color="green"
                                  leftSection={<Play size={12} />}
                                  onClick={() =>
                                    onStatusChange &&
                                    onStatusChange(milestone.id, "start")
                                  }
                                  styles={{
                                    root: {
                                      fontSize: "11px",
                                      fontWeight: 500,
                                      padding: "4px 8px",
                                    },
                                  }}
                                >
                                  Start
                                </Button>
                              )}
                            {/**||
                                milestone.status.toLowerCase() ===
                                  "supplier_completed" */}
                            {(milestone.status.toLowerCase() ===
                              "in_progress" ||
                              milestone.status.toLowerCase() ===
                                "supplier_completed") && (
                              <Button
                                size="compact-xs"
                                variant="light"
                                color="orange"
                                leftSection={<CheckCircle size={12} />}
                                onClick={() =>
                                  onStatusChange &&
                                  onStatusChange(milestone.id, "complete")
                                }
                                styles={{
                                  root: {
                                    fontSize: "11px",
                                    fontWeight: 500,
                                    padding: "4px 8px",
                                  },
                                }}
                              >
                                Complete
                              </Button>
                            )}
                          </>
                        )}
                      {canEditMileStone &&
                        serviceProviderSigningDate === null &&
                        (milestone.status.toLowerCase() !== "completed" ||
                          milestone.status.toLowerCase() !== "failed") && (
                          <ActionIcon
                            size="sm"
                            variant="light"
                            color="gray"
                            onClick={() =>
                              onEditMilestone && onEditMilestone(milestone.id)
                            }
                          >
                            <Edit size={14} />
                          </ActionIcon>
                        )}
                      {canEditMileStone &&
                        milestone.status.toLowerCase() === "pending" && (
                          <ActionIcon
                            size="sm"
                            variant="light"
                            color="red"
                            onClick={() => {
                              if (onDeleteMilestone) {
                                if (
                                  confirm(
                                    "Are you sure you want to delete this milestone? This action cannot be undone."
                                  )
                                ) {
                                  onDeleteMilestone(milestone.id);
                                }
                              }
                            }}
                          >
                            <Delete size={14} />
                          </ActionIcon>
                        )}
                      {/* Checkbox for batch selection */}
                      {serviceProviderSigningDate !== null &&
                        milestone.status.toLowerCase() !== "completed" && (
                          <Checkbox
                            size="sm"
                            checked={selectedMilestones.has(milestone.id)}
                            disabled={
                              !selectedMilestones.has(milestone.id) &&
                              !canSelectMilestone(milestone.id)
                            }
                            onChange={() =>
                              toggleMilestoneSelection(milestone.id)
                            }
                            styles={{
                              input: {
                                cursor:
                                  canSelectMilestone(milestone.id) ||
                                  selectedMilestones.has(milestone.id)
                                    ? "pointer"
                                    : "not-allowed",
                                borderColor: config.color,
                              },
                            }}
                          />
                        )}
                    </Group>
                  </Group>
                }
              >
                <Stack gap="xs" mt="xs">
                  <Text size="sm" c="dimmed" className="leading-relaxed">
                    {milestone.description}
                  </Text>
                  {milestone.due_date && (
                    <Group gap="xs">
                      <Calendar size={14} className="text-gray-500" />
                      <Text size="xs" c="dimmed">
                        Due: {formatDate(milestone.due_date)}
                      </Text>
                    </Group>
                  )}
                  {milestone.completion_date && (
                    <Group gap="xs">
                      <CheckCircle size={14} className="text-green-600" />
                      <Text size="xs" className="text-green-600">
                        Completed: {formatDate(milestone.completion_date)}
                      </Text>
                    </Group>
                  )}
                </Stack>
              </Timeline.Item>
            );
          })}
        </Timeline>
      </ScrollArea.Autosize>
    </Card>
  );
};

export default MilestoneTimeline;
