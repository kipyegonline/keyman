"use client";
import {
  Badge,
  Box,
  Text,
  Group,
  Paper,
  Grid,
  Card,
  Stack,
  Avatar,
  ThemeIcon,
  Button,
  Progress,
  Divider,
  Timeline,
  ScrollArea,
  ActionIcon,
  Title,
  Alert,
  Tooltip,
} from "@mantine/core";
import {
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  User,
  DollarSign,
  Target,
  Building2,
  Phone,
  Mail,
  Eye,
  Download,
  Share2,
  AlertCircle,
  Activity,
  MoreVertical,
  Edit,
  Play,
} from "lucide-react";
import React, { useState } from "react";
import EditMilestoneModal from "./EditMilestoneModal";
import EditContractModal from "./EditContractModal";
import MilestoneStatusChangeModal from "./MilestoneStatusChangeModal";
import { updateContract, updateMilestone } from "@/api/contract";
import { notify } from "@/lib/notifications";

// Use the actual API response structure
interface ContractDetails {
  id: string;
  code: string;
  title: string;
  description?: string;
  status:
    | "pending"
    | "active"
    | "completed"
    | "expired"
    | "cancelled"
    | "on_hold";
  contract_type?: string;
  duration?: string;
  start_date?: string;
  end_date?: string;
  total_amount: number;
  contract_duration_in_duration: number;

  contract_amount: number;
  payment_status?: "paid" | "pending" | "partial";
  initiator: { id: string; name: string; email?: string; phone?: string };
  service_provider: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  contract_json?: {
    agreement_summary?: string;
    title?: string;
  };
  contract_mode: null | "client" | "service_provider";
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  supplier?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  milestones?: Milestone[];
  created_at: string;
  updated_at: string;
}

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
}

interface ContractDetailsProps {
  contract: ContractDetails;
  userType?: "customer" | "supplier";
  onEdit?: () => void;
  onViewDocuments?: () => void;
  onShare?: () => void;
  handleChat?: () => void;
  onDownload?: (contractId: string) => void;
  isDownloading?: boolean;
  onEditMilestone?: (milestoneId: string) => void;
  refresh: () => void;
}

const getStatusConfig = (status: string) => {
  const configs: Record<string, { color: string; bg: string; label: string }> =
    {
      pending: { color: "#F08C23", bg: "#F08C2315", label: "Pending" },
      active: { color: "#388E3C", bg: "#388E3C15", label: "Active" },
      completed: { color: "#1976D2", bg: "#1976D215", label: "Completed" },
      cancelled: { color: "#D32F2F", bg: "#D32F2F15", label: "Cancelled" },
      on_hold: { color: "#FF9800", bg: "#FF980015", label: "On Hold" },
    };
  return configs[status] || configs.pending;
};

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

const ContractDetails: React.FC<ContractDetailsProps> = ({
  contract,
  userType = "customer",
  //onEdit,
  onViewDocuments,
  onShare,
  handleChat,
  onDownload,
  refresh,
  isDownloading = false,
  //onEditMilestone,
}) => {
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    null
  );
  const [editContractModalOpened, setEditContractModalOpened] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [statusChangeModalOpened, setStatusChangeModalOpened] = useState(false);
  const [milestoneForStatusChange, setMilestoneForStatusChange] =
    useState<Milestone | null>(null);

  const handleEditMilestone = (milestoneId: string) => {
    const milestone = contract.milestones?.find((m) => m.id === milestoneId);
    if (milestone) {
      setSelectedMilestone(milestone);
      setEditModalOpened(true);
    }
  };

  const handleSaveMilestone = async (
    milestoneId: string,
    data: { name: string; description: string; amount?: number }
  ) => {
    // This function will be called when the user saves the milestone
    // You can implement the API call logic here

    const response = await updateMilestone(milestoneId, data);
    if (response.status) {
      notify.success("Milestone updated successfully");
      refresh();
      setEditModalOpened(false);
      setSelectedMilestone(null);
    } else {
      notify.error(response.message);
    }

    // If onEditMilestone prop is provided, call it
    /*
    if (onEditMilestone) {
      onEditMilestone(milestoneId);
    }*/

    // Close the modal after saving
  };

  const handleEditContract = () => {
    setEditContractModalOpened(true);
  };

  const handleSaveContract = async (
    contractId: string,
    data: {
      title: string;
      contract_amount: number;
      contract_duration_in_duration: number;
    }
  ) => {
    try {
      const payload = {
        ...data,
        status: "pending",
        contract_json: { title: data.title },
      };

      const response = await updateContract(contractId, payload);

      if (response.status) {
        refresh();
        notify.success("Contract updated successfully");
        // Only close modal on success
        setEditContractModalOpened(false);
      } else {
        notify.error("Failed to update contract");
        // Keep modal open on failure so user can retry
      }
    } catch (error) {
      console.error("Error updating contract:", error);
      notify.error("An error occurred while updating the contract");
      // Keep modal open on error so user can retry
    }
  };
  const notifyProvider = async (role: "client" | "service_provider") => {
    if (!confirm(`Notify ${role}?`)) return;
    setNotifying(true);
    const response = await updateContract(contract.id, { contract_mode: role });
    if (response.status) {
      refresh();
      if (role === "client") {
        notify.success("Client has been notified");
      } else {
        notify.success("Service provider has been notified");
      }
    } else {
      notify.error("Failed to notify");
    }
    setNotifying(false);
  };

  const handleMilestoneStatusChange = (
    milestoneId: string
    //currentStatus: string
  ) => {
    const milestone = contract.milestones?.find((m) => m.id === milestoneId);
    if (milestone) {
      setMilestoneForStatusChange(milestone);
      setStatusChangeModalOpened(true);
    }
  };

  const confirmMilestoneStatusChange = async (
    milestoneId: string
    //signature: string
  ) => {
    if (!milestoneForStatusChange) return;

    try {
      let newStatus = "";
      const currentStatus = milestoneForStatusChange.status;

      if (currentStatus.toLowerCase() === "pending") {
        newStatus = "start";
      } else if (currentStatus.toLowerCase() === "in_progress") {
        newStatus = "completed";
      } else {
        return; // Already completed or other status
      }

      const response = await updateMilestone(milestoneId, {
        action: newStatus,
      });

      if (response.status) {
        refresh();
        const actionText =
          newStatus === "in_progress" ? "started" : "completed";
        notify.success(`Milestone ${actionText} successfully`);
        // Close modal on success
        setStatusChangeModalOpened(false);
        setMilestoneForStatusChange(null);
      } else {
        notify.error(response.message || "Failed to update milestone status");
        // Keep modal open on failure
      }
    } catch (error) {
      console.error("Error updating milestone status:", error);
      notify.error("An error occurred while updating milestone status");
      // Keep modal open on error
    }
  };

  const statusConfig = getStatusConfig(contract.status);
  const completedMilestones =
    contract.milestones?.filter(
      (m: Milestone) => m.status.toLowerCase() === "completed"
    ).length || 0;
  const totalMilestones = contract.milestones?.length || 0;
  const progressPercentage =
    totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  //console.log(contract, editModalOpened, "con");
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-UK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Extract start and end dates from the first milestone or use contract dates
  const getProjectDates = () => {
    if (contract.milestones && contract.milestones.length > 0) {
      const firstMilestone = contract.milestones[0];
      return {
        startDate: firstMilestone?.start_date,
        endDate: firstMilestone?.end_date,
        //contract.milestones[contract.milestones.length - 1]?.due_date ||
        // contract.end_date,
      };
    }
    return {
      startDate: contract.start_date,
      endDate: contract.end_date,
    };
  };

  // Calculate duration between start and end dates
  const calculateDuration = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return "N/A";

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    } else if (diffDays < 365) {
      const months = Math.round(diffDays / 30);
      return `${months} month${months !== 1 ? "s" : ""}`;
    } else {
      const years = Math.round(diffDays / 365);
      const remainingMonths = Math.round((diffDays % 365) / 30);
      if (remainingMonths > 0) {
        return `${years} year${
          years !== 1 ? "s" : ""
        } ${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
      }
      return `${years} year${years !== 1 ? "s" : ""}`;
    }
  };

  const projectDates = getProjectDates();
  const projectDuration = calculateDuration(
    projectDates.startDate,
    projectDates.endDate
  );

  const canEditMileStone = React.useMemo(() => {
    if (contract.status.toLowerCase() !== "completed") {
      if (
        userType === "customer" &&
        (contract.contract_mode === "client" || contract.contract_mode === null)
      ) {
        return true;
      } else if (
        userType === "supplier" &&
        contract.contract_mode === "service_provider"
      ) {
        return true;
      }
    }
    return false;
  }, [userType, contract.status]);

  return (
    <Box>
      <Stack gap="xl">
        {/* Header Section */}
        <Card
          shadow="sm"
          padding="xl"
          radius="md"
          className="bg-gradient-to-r from-gray-50 to-white"
        >
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Group gap="md" mb="md">
                <ThemeIcon
                  size={60}
                  radius="lg"
                  className="bg-gradient-to-br from-green-100 to-blue-100"
                >
                  <FileText size={32} className="text-green-700" />
                </ThemeIcon>
                <div>
                  <Title order={2} className="text-gray-800 mb-2">
                    {contract?.contract_json?.title || "Contract Overview"}
                  </Title>
                  <Group gap="sm">
                    <Badge
                      variant="light"
                      style={{
                        backgroundColor: statusConfig.bg,
                        color: statusConfig.color,
                        fontWeight: 600,
                      }}
                      size="lg"
                    >
                      {statusConfig.label}
                    </Badge>
                    <Text
                      size="sm"
                      c="dimmed"
                      className="flex items-center gap-1"
                    >
                      <FileText size={14} />
                      {contract.code}
                    </Text>
                  </Group>
                </div>
              </Group>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Group justify="flex-end" gap="sm">
                {userType === "supplier" && (
                  <Button variant="outlined" onClick={handleChat}>
                    {" "}
                    Chat
                  </Button>
                )}
                {userType === "customer" && false && (
                  <Button
                    variant="light"
                    style={{ backgroundColor: "#3D6B2C15", color: "#3D6B2C" }}
                    onClick={handleEditContract}
                  >
                    Edit Contract
                  </Button>
                )}
                <ActionIcon
                  variant="light"
                  color="gray"
                  size="lg"
                  onClick={onShare}
                >
                  <Share2 size={18} />
                </ActionIcon>
                <ActionIcon variant="light" color="gray" size="lg">
                  <MoreVertical size={18} />
                </ActionIcon>
              </Group>
            </Grid.Col>
          </Grid>

          {/* Progress Overview */}
          <Paper
            p="md"
            radius="md"
            className="bg-white border border-gray-100 mt-md"
          >
            <Group justify="space-between" mb="sm">
              <Text fw={600} size="sm" className="text-gray-700">
                Contract Progress
              </Text>
              <Text size="sm" c="dimmed">
                {completedMilestones} of {totalMilestones} milestones completed
              </Text>
            </Group>
            <Progress
              value={progressPercentage}
              color={progressPercentage === 100 ? "green" : "#F08C23"}
              size="lg"
              radius="xl"
              className="mb-sm"
            />
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                {progressPercentage.toFixed(0)}% Complete
              </Text>
              <Text size="xs" c="dimmed">
                Est. completion:{" "}
                {projectDates.endDate
                  ? formatDate(projectDates.endDate)
                  : "TBD"}
              </Text>
            </Group>
          </Paper>
        </Card>

        <Grid>
          {/* Left Column - Main Details */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              {/* Contract Information */}
              <Card shadow="sm" padding="lg" radius="md">
                <Group gap="xs" mb="md">
                  <ThemeIcon
                    size="lg"
                    style={{ backgroundColor: "#388E3C15" }}
                    variant="light"
                  >
                    <FileText size={20} style={{ color: "#388E3C" }} />
                  </ThemeIcon>
                  <Text fw={600} size="lg" className="text-gray-800">
                    Contract Details
                  </Text>
                </Group>

                <Grid gutter="md">
                  <Grid.Col span={6}>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Contract Type
                      </Text>
                      <Text size="sm" fw={500}>
                        {contract.contract_type || "Standard"}
                      </Text>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Duration
                      </Text>
                      <Text size="sm" fw={500}>
                        {projectDuration}
                      </Text>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Start Date
                      </Text>
                      <Text size="sm" fw={500}>
                        {projectDates.startDate
                          ? formatDate(projectDates.startDate)
                          : "TBD"}
                      </Text>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        End Date
                      </Text>
                      <Text size="sm" fw={500}>
                        {projectDates.endDate
                          ? formatDate(projectDates.endDate)
                          : "TBD"}
                      </Text>
                    </Group>
                  </Grid.Col>
                </Grid>

                {contract.contract_json?.agreement_summary && (
                  <>
                    <Divider my="md" />
                    <div>
                      <Text
                        size="sm"
                        fw={600}
                        mb="xs"
                        className="text-gray-700"
                      >
                        Description
                      </Text>
                      <Text size="sm" className="text-gray-600 leading-relaxed">
                        {contract.contract_json?.agreement_summary}
                      </Text>
                    </div>
                  </>
                )}
              </Card>

              {/* Parties Information */}
              <Card shadow="sm" padding="lg" radius="md">
                <Group gap="xs" mb="md">
                  <ThemeIcon
                    size="lg"
                    style={{ backgroundColor: "#1976D215" }}
                    variant="light"
                  >
                    <User size={20} style={{ color: "#1976D2" }} />
                  </ThemeIcon>
                  <Text fw={600} size="lg" className="text-gray-800">
                    Contract Parties
                  </Text>
                </Group>

                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper
                      p="md"
                      className="bg-blue-50 border border-blue-100"
                      radius="md"
                    >
                      <Group gap="sm" mb="sm">
                        <Avatar size={40} color="blue">
                          <User size={20} />
                        </Avatar>
                        <div>
                          <Text fw={600} size="sm" className="text-gray-800">
                            Initiator
                          </Text>
                          <Text size="xs" c="dimmed">
                            {contract?.initiator?.name || "Customer Name"}
                          </Text>
                        </div>
                      </Group>
                      {contract.initiator?.email && (
                        <Group gap="xs" mb="xs">
                          <Mail size={14} className="text-gray-500" />
                          <Text size="xs" c="dimmed">
                            {contract.initiator.email}
                          </Text>
                        </Group>
                      )}
                      {contract.initiator?.phone && (
                        <Group gap="xs">
                          <Phone size={14} className="text-gray-500" />
                          <Text size="xs" c="dimmed">
                            {contract.initiator.phone}
                          </Text>
                        </Group>
                      )}
                    </Paper>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper
                      p="md"
                      className="bg-green-50 border border-green-100"
                      radius="md"
                    >
                      <Group gap="sm" mb="sm">
                        <Avatar size={40} color="green">
                          <Building2 size={20} />
                        </Avatar>
                        <div>
                          <Text fw={600} size="sm" className="text-gray-800">
                            Service provider
                          </Text>
                          <Text size="xs" c="dimmed">
                            {contract.service_provider?.name || ""}
                          </Text>
                        </div>
                      </Group>
                      {contract.service_provider?.email && (
                        <Group gap="xs" mb="xs">
                          <Mail size={14} className="text-gray-500" />
                          <Text size="xs" c="dimmed">
                            {contract.service_provider?.email}
                          </Text>
                        </Group>
                      )}
                      {contract.service_provider?.phone && (
                        <Group gap="xs">
                          <Phone size={14} className="text-gray-500" />
                          <Text size="xs" c="dimmed">
                            {contract.service_provider?.phone}
                          </Text>
                        </Group>
                      )}
                    </Paper>
                  </Grid.Col>
                </Grid>
              </Card>

              {/* Milestones Timeline */}
              {contract.milestones && contract.milestones.length > 0 && (
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
                    <Timeline
                      active={completedMilestones}
                      bulletSize={24}
                      lineWidth={2}
                    >
                      {contract.milestones.map((milestone) => {
                        const config = getMilestoneStatusConfig(
                          milestone.status
                        );
                        const IconComponent = config.icon;

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
                                <Text
                                  fw={600}
                                  size="sm"
                                  className="text-gray-800"
                                >
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
                                      <Badge
                                        variant="outline"
                                        color="gray"
                                        size="sm"
                                      >
                                        {formatCurrency(milestone.amount)}
                                      </Badge>
                                    )}
                                  </Group>
                                  {(milestone.status.toLowerCase() ===
                                    "pending" ||
                                    milestone.status.toLowerCase() ===
                                      "in_progress") &&
                                    canEditMileStone && (
                                      <Tooltip
                                        label={
                                          milestone.status.toLowerCase() ===
                                          "pending"
                                            ? "Start milestone"
                                            : "Complete milestone"
                                        }
                                        position="top"
                                        withArrow
                                      >
                                        <ActionIcon
                                          size="sm"
                                          variant="light"
                                          color="green"
                                          onClick={() =>
                                            handleMilestoneStatusChange(
                                              milestone.id
                                              //milestone.status
                                            )
                                          }
                                        >
                                          <Play size={12} />
                                        </ActionIcon>
                                      </Tooltip>
                                    )}
                                  {canEditMileStone && (
                                    <ActionIcon
                                      size="sm"
                                      variant="light"
                                      color="gray"
                                      onClick={() =>
                                        handleEditMilestone(milestone.id)
                                      }
                                    >
                                      <Edit size={14} />
                                    </ActionIcon>
                                  )}
                                </Group>
                              </Group>
                            }
                          >
                            <Stack gap="xs" mt="xs">
                              <Text
                                size="sm"
                                c="dimmed"
                                className="leading-relaxed"
                              >
                                {milestone.description}
                              </Text>
                              {milestone.due_date && (
                                <Group gap="xs">
                                  <Calendar
                                    size={14}
                                    className="text-gray-500"
                                  />
                                  <Text size="xs" c="dimmed">
                                    Due: {formatDate(milestone.due_date)}
                                  </Text>
                                </Group>
                              )}
                              {milestone.completion_date && (
                                <Group gap="xs">
                                  <CheckCircle
                                    size={14}
                                    className="text-green-600"
                                  />
                                  <Text size="xs" className="text-green-600">
                                    Completed:{" "}
                                    {formatDate(milestone.completion_date)}
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
              )}
              {/**Actions */}
              {userType === "customer" ? (
                canEditMileStone && (
                  <Button
                    loading={notifying}
                    onClick={() => notifyProvider("service_provider")}
                    className="bg-keyman-orange text-white"
                  >
                    Notify Provider
                  </Button>
                )
              ) : (
                <Button
                  loading={notifying}
                  onClick={() => notifyProvider("client")}
                  className="bg-keyman-orange text-white"
                >
                  Notify Client
                </Button>
              )}
            </Stack>
          </Grid.Col>

          {/* Right Column - Financial & Actions */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              {/* Financial Summary */}
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                className="bg-gradient-to-br from-green-50 to-emerald-50"
              >
                <Group gap="xs" mb="md">
                  <ThemeIcon
                    size="lg"
                    style={{ backgroundColor: "#388E3C" }}
                    variant="filled"
                  >
                    <DollarSign size={20} color="white" />
                  </ThemeIcon>
                  <Text fw={600} size="lg" className="text-gray-800">
                    Financial Summary
                  </Text>
                </Group>

                <Stack gap="md">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Total Value
                    </Text>
                    <Text size="lg" fw={700} className="text-green-700">
                      {formatCurrency(Number(contract.contract_amount))}
                    </Text>
                  </Group>

                  {contract.milestones && contract.milestones.length > 0 && (
                    <>
                      <Divider />
                      <div>
                        <Text
                          size="sm"
                          fw={600}
                          mb="xs"
                          className="text-gray-700"
                        >
                          Milestone Breakdown
                        </Text>
                        {contract.milestones.map(
                          (milestone) =>
                            milestone.amount && (
                              <Group
                                justify="space-between"
                                key={milestone.id}
                                mb="xs"
                              >
                                <Text size="xs" c="dimmed" className="truncate">
                                  {milestone.title}
                                </Text>
                                <Text size="xs" fw={500}>
                                  {formatCurrency(milestone.amount)}
                                </Text>
                              </Group>
                            )
                        )}
                      </div>
                    </>
                  )}

                  <Paper
                    p="sm"
                    className="bg-white border border-green-100"
                    radius="md"
                  >
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Payment Status
                      </Text>
                      <Badge
                        variant="light"
                        style={{
                          backgroundColor:
                            contract.payment_status === "paid"
                              ? "#388E3C15"
                              : "#F08C2315",
                          color:
                            contract.payment_status === "paid"
                              ? "#388E3C"
                              : "#F08C23",
                        }}
                      >
                        {contract.payment_status || "Pending"}
                      </Badge>
                    </Group>
                  </Paper>
                </Stack>
              </Card>

              {/* Quick Actions */}
              <Card shadow="sm" padding="lg" radius="md">
                <Text fw={600} size="lg" className="text-gray-800 mb-md">
                  Quick Actions
                </Text>

                <Stack gap="sm" mt="md">
                  <Button
                    fullWidth
                    variant="light"
                    style={{
                      backgroundColor: "#3D6B2C15",
                      color: "#3D6B2C",
                      display: "none",
                    }}
                    leftSection={<Eye size={16} />}
                    onClick={onViewDocuments}
                  >
                    View Documents
                  </Button>

                  <Button
                    fullWidth
                    variant="outline"
                    color="gray"
                    loading={isDownloading}
                    disabled={isDownloading}
                    onClick={() =>
                      onDownload
                        ? onDownload(contract.id)
                        : console.log("Download feature coming soon!")
                    }
                    leftSection={!isDownloading && <Download size={16} />}
                  >
                    {isDownloading ? "Downloading..." : "Download Contract"}
                  </Button>
                  {/**Actions */}
                  {/* userType === "customer" ? (
                    canEditMileStone && (
                      <Button
                        loading={notifying}
                        onClick={() => notifyProvider("service_provider")}
                        className="bg-keyman-green text-white"
                      >
                        Notify Provider
                      </Button>
                    )
                  ) : (
                    <Button
                      loading={notifying}
                      onClick={() => notifyProvider("client")}
                      className="bg-keyman-orange text-white animate-pulse"
                    >
                      Approve Changes
                    </Button>
                  )*/}

                  {userType === "customer" && contract.status === "active" && (
                    <Button
                      fullWidth
                      variant="light"
                      style={{ backgroundColor: "#F08C2315", color: "#F08C23" }}
                      leftSection={<Activity size={16} />}
                    >
                      Request Changes
                    </Button>
                  )}

                  <Button
                    fullWidth
                    variant="light"
                    color="blue"
                    leftSection={<Share2 size={16} />}
                    onClick={onShare}
                    className="invisible"
                  >
                    Share Contract
                  </Button>
                </Stack>
              </Card>

              {/* Status Alert */}
              {contract.status === "pending" && false && (
                <Alert
                  icon={<AlertCircle size={16} />}
                  title="Action Required"
                  color="orange"
                  radius="md"
                >
                  <Text size="sm">
                    This contract is pending approval.{" "}
                    {userType === "customer"
                      ? "Please review and approve to proceed."
                      : "Waiting for customer approval."}
                  </Text>
                </Alert>
              )}

              {contract.status === "on_hold" && (
                <Alert
                  icon={<AlertCircle size={16} />}
                  title="Contract On Hold"
                  color="yellow"
                  radius="md"
                >
                  <Text size="sm">
                    This contract has been temporarily paused. Contact support
                    for more information.
                  </Text>
                </Alert>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Edit Milestone Modal */}
      <EditMilestoneModal
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false);
          setSelectedMilestone(null);
        }}
        milestone={selectedMilestone}
        onSave={handleSaveMilestone}
      />

      {/* Edit Contract Modal */}
      <EditContractModal
        opened={editContractModalOpened}
        onClose={() => {
          setEditContractModalOpened(false);
        }}
        contract={contract}
        onSave={handleSaveContract}
      />

      {/* Milestone Status Change Modal */}
      <MilestoneStatusChangeModal
        opened={statusChangeModalOpened}
        onClose={() => {
          setStatusChangeModalOpened(false);
          setMilestoneForStatusChange(null);
        }}
        milestone={milestoneForStatusChange}
        currentStatus={milestoneForStatusChange?.status || ""}
        onConfirm={confirmMilestoneStatusChange}
      />
    </Box>
  );
};

export default ContractDetails;
