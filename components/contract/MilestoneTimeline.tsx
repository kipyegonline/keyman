"use client";
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
} from "lucide-react";
import React from "react";

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
  userType,
  mode,
}) => {
  const completedMilestones = milestones.filter(
    (m: Milestone) => m.status.toLowerCase() === "completed"
  ).length;

  if (!milestones || milestones.length === 0) {
    return null;
  }

  return (
    <Card shadow="sm" padding="lg" radius="md">
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
      </Group>

      <ScrollArea.Autosize mah={400}>
        <Timeline active={completedMilestones} bulletSize={24} lineWidth={2}>
          {milestones.map((milestone) => {
            const config = getMilestoneStatusConfig(milestone.status);
            const IconComponent = config.icon;
            const clientVisible =
              userType === "customer" &&
              mode === "client" &&
              milestone?.service_provider_completion_date !== null &&
              milestone?.service_provider_completion_date != "" &&
              (milestone?.client_completion_date == "" ||
                milestone?.client_completion_date == null);
            const supplierVisible =
              userType === "supplier" &&
              (milestone?.service_provider_completion_date == "" ||
                milestone?.service_provider_completion_date == null) &&
              milestone.status == "in_progress";

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
                          {milestone.status.replace("_", " ")}
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
                            {milestone.status.toLowerCase() === "pending" && (
                              <Tooltip
                                label={"Start milestone"}
                                position="top"
                                withArrow
                              >
                                <ActionIcon
                                  size="sm"
                                  // variant="light"
                                  //color="green"
                                  onClick={() =>
                                    onStatusChange &&
                                    onStatusChange(milestone.id, "start")
                                  }
                                >
                                  <Play size={12} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                            {(milestone.status.toLowerCase() ===
                              "in_progress" ||
                              milestone.status.toLowerCase() ===
                                "supplier_completed") &&
                              (clientVisible || supplierVisible) && (
                                <Tooltip
                                  label={"Complete milestone"}
                                  position="top"
                                  withArrow
                                >
                                  <ActionIcon
                                    size="sm"
                                    // variant="light"
                                    //color="green"
                                    onClick={() =>
                                      onStatusChange &&
                                      onStatusChange(milestone.id, "complete")
                                    }
                                  >
                                    <CheckCircle size={12} />
                                  </ActionIcon>
                                </Tooltip>
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
                      {canEditMileStone && (
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
