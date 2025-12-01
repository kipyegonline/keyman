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
  ActionIcon,
  Title,
  Alert,
  Flex,
} from "@mantine/core";
import {
  FileText,
  User,
  DollarSign,
  //Building2,
  Phone,
  Mail,
  Eye,
  Download,
  Share2,
  AlertCircle,
  Activity,
  MoreVertical,
  Plus,
} from "lucide-react";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import EditMilestoneModal from "./EditMilestoneModal";
import EditContractModal from "./EditContractModal";
import MilestoneStatusChangeModal from "./MilestoneStatusChangeModal";
import AcceptContractModal from "./AcceptContractModal";
import MilestoneTimeline from "./MilestoneTimeline";
import AddMaterialsModal from "./AddMaterialsModal";
import AddLabourModal from "./AddLabourModal";
import ContractPaymentModal from "./ContractPaymentModal";
import {
  updateContract,
  updateMilestone,
  createMilestone,
  deleteMilestone,
} from "@/api/contract";
import { notify } from "@/lib/notifications";
import { useAppContext } from "@/providers/AppContext";
import ChatManager from "../chat-manager";
import { WholePriceList } from "../supplier/priceList";
import { getSupplierPriceList } from "@/api/supplier";

// Use the actual API response structure
interface ContractDetails {
  id: string;
  chat_id: string;
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
  service_provider_id: string;
  service_provider: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    photo: string[];
    keyman_number?: string;
  };
  service_provider_signing_date: null | string;

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
  milestones: Milestone[];
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
  client_completion_date?: string;
  service_provider_completion_date?: string;
}

interface MaterialItem {
  id: string;
  name: string;
  description: string;
  amount: number;
  quantity: number;
  unit_price: number;
}

interface LabourItem {
  id: string;
  name: string;
  description: string;
  amount: number;
  quantity: number;
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
  //handleChat,
  onDownload,
  refresh,
  isDownloading = false,
  //onEditMilestone,
}) => {
  const { user } = useAppContext();
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    null
  );
  const [editContractModalOpened, setEditContractModalOpened] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [statusChangeModalOpened, setStatusChangeModalOpened] = useState(false);
  const [milestoneForStatusChange, setMilestoneForStatusChange] =
    useState<Milestone | null>(null);
  const [acceptContractModalOpened, setAcceptContractModalOpened] =
    useState(false);
  const [isAcceptingContract, setIsAcceptingContract] = useState(false);
  const [action, setAction] = useState<"start" | "complete">("start");
  const [chatOpen, setChatOpen] = useState(false);
  const [materialsModalOpened, setMaterialsModalOpened] = useState(false);
  const [labourModalOpened, setLabourModalOpened] = useState(false);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [labourItems, setLabourItems] = useState<LabourItem[]>([]);
  const [paymentModalOpened, setPaymentModalOpened] = useState(false);
  //const supplierId = globalThis?.window?.localStorage.getItem("supplier_id");

  // Initialize query client
  const queryClient = useQueryClient();

  const { data: priceList } = useQuery({
    queryKey: ["pricelist", contract?.service_provider_id],
    queryFn: async () =>
      getSupplierPriceList(contract?.service_provider_id ?? ""),
    enabled: !!contract?.service_provider_id,
  });
  const _priceList = React.useMemo(() => {
    if (priceList?.price_list) {
      return priceList.price_list as WholePriceList[];
    } else return [];
  }, [priceList]);

  // Delete milestone mutation
  const deleteMilestoneMutation = useMutation({
    mutationFn: (milestoneId: string) => deleteMilestone(milestoneId, {}),
    onSuccess: () => {
      notify.success("Milestone deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["suggestedMilestones", contract.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["contract", contract.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["contracts"],
      });
      refresh();
    },
    onError: (error: Error) => {
      console.error("Error deleting milestone:", error);
      notify.error(
        error.message || "An error occurred while deleting the milestone"
      );
    },
  });

  // Update milestone mutation
  const updateMilestoneMutation = useMutation({
    mutationFn: ({
      milestoneId,
      data,
    }: {
      milestoneId: string;
      data: {
        name: string;
        description: string;
        amount?: number;
        action?: string;
      };
    }) => updateMilestone(milestoneId, data),
    onSuccess: (response, variables) => {
      const actionText =
        variables.data.action === "start"
          ? "started, awaiting payment"
          : "updated";
      notify.success(`Milestone ${actionText}`);
      queryClient.invalidateQueries({
        queryKey: ["suggestedMilestones", contract.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["contract", contract.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["contracts"],
      });
      refresh();
      setEditModalOpened(false);
      setSelectedMilestone(null);
    },
    onError: (error: Error) => {
      notify.error(error.message || "Failed to update milestone");
    },
  });

  const handleEditMilestone = (milestoneId: string) => {
    const milestone = contract.milestones?.find((m) => m.id === milestoneId);
    if (milestone) {
      setSelectedMilestone(milestone);
      setEditModalOpened(true);
    }
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    deleteMilestoneMutation.mutate(milestoneId);
  };

  const handleSaveMilestone = async (
    milestoneId: string,
    data: {
      name: string;
      description: string;
      amount?: number;
      action?: string;
    }
  ) => {
    return new Promise<void>((resolve, reject) => {
      updateMilestoneMutation.mutate(
        { milestoneId, data },
        {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        }
      );
    });
  };

  const handleAddMaterials = async (items: MaterialItem[]) => {
    setMaterials((prev) => [...prev, ...items]);

    // Loop through each material and create a milestone
    for (const item of items) {
      const milestoneData = {
        keyman_contract_id: contract.id,
        name: item.name,
        description: item.description || "",
        status: "pending",
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        amount: item.amount * item.quantity,
      };

      await handleSaveNewMilestone(milestoneData);
    }
  };

  const handleAddLabour = async (labour: LabourItem) => {
    setLabourItems((prev) => [...prev, labour]);

    // Create a milestone for the labour item
    const milestoneData = {
      keyman_contract_id: contract.id,
      name: labour.name,
      description: labour.description || "",
      status: "pending",
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      amount: labour.amount * labour.quantity,
    };

    await handleSaveNewMilestone(milestoneData);
  };

  const handleSaveNewMilestone = async (data: {
    keyman_contract_id: string;
    name: string;
    description: string;
    status: string;
    start_date: string;
    end_date: string;
    amount: number;
  }) => {
    const response = await createMilestone(data);
    if (response.status) {
      notify.success("Milestone created successfully");
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ["contract", contract.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["contracts"],
      });
      refresh();
    } else {
      notify.error(response.message);
    }
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
        contract_json: JSON.stringify({ title: data.title }),
      };

      const response = await updateContract(contractId, payload);

      if (response.status) {
        queryClient.invalidateQueries({
          queryKey: ["contract", contract.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["contracts"],
        });
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
  const notifyProvider = async (
    role: "client" | "service_provider",
    isSilent = false
  ) => {
    if (!isSilent) {
      if (!confirm(`Notify ${role}?`)) return;
    }
    setNotifying(true);
    const response = await updateContract(contract.id, { contract_mode: role });
    if (isSilent) {
      setNotifying(false);
      return;
    }
    if (response.status) {
      queryClient.invalidateQueries({
        queryKey: ["contract", contract.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["contracts"],
      });
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
    milestoneId: string,
    action: "start" | "complete"
    //currentStatus: string
  ) => {
    const milestone = contract.milestones?.find((m) => m.id === milestoneId);
    if (milestone) {
      setMilestoneForStatusChange(milestone);
      setStatusChangeModalOpened(true);
      setAction(action);
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
      } else if (
        currentStatus.toLowerCase() === "in_progress" ||
        currentStatus.toLowerCase() === "supplier_completed"
      ) {
        if (userType === "supplier") newStatus = "service_provider_complete";
        else newStatus = "complete";
      } else {
        return; // Already completed or other status
      }

      const response = await updateMilestone(milestoneId, {
        action: newStatus,
      });

      if (response.status) {
        queryClient.invalidateQueries({
          queryKey: ["contract", contract.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["contracts"],
        });
        refresh();
        const actionText = action === "start" ? "started" : "completed";

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
  const handleAcceptContract = () => {
    setAcceptContractModalOpened(true);
  };

  const confirmAcceptContract = async (contractId: string) => {
    setIsAcceptingContract(true);
    try {
      const response = await updateContract(contractId, {
        // status: "active",
        //signature: signature,
        // accepted_by: "service_provider",
        service_provider_signing_date: new Date().toISOString(),
        // accepted_at: new Date().toISOString(),
      });

      if (response.status) {
        notify.success("Contract accepted successfully!");
        queryClient.invalidateQueries({
          queryKey: ["contract", contract.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["contracts"],
        });
        refresh();
        await notifyProvider("client", true);
        setAcceptContractModalOpened(false);
      } else {
        notify.error(response.message || "Failed to accept contract");
        throw new Error(response.message || "Failed to accept contract");
      }
    } catch (error) {
      console.error("Error accepting contract:", error);
      //  notify.error("An error occurred while accepting the contract");
      throw error;
    } finally {
      setIsAcceptingContract(false);
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
  console.log(contract, "con----");
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
  const openChatManager = () => {
    setChatOpen(true);
    setTimeout(() => setChatOpen(false), 1000);
  };

  const canEditMileStone = React.useMemo(() => {
    if (
      contract.status.toLowerCase() !== "completed" ||
      contract.status.toLowerCase() !== "supplier_completed"
    ) {
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
  const inNegotiation = React.useMemo(() => {
    return contract.milestones?.some(
      (milestone) =>
        // milestone.status.toLowerCase() === "in_progress" ||
        milestone.status.toLowerCase() === "pending"
      // milestone.status.toLowerCase() === "failed"
    );
  }, [contract?.milestones]);
  const canNotify = React.useMemo(() => {
    if (
      contract.status.toLowerCase() !== "completed" ||
      contract.status.toLowerCase() !== "supplier_completed"
    ) {
      return !!contract.service_provider_signing_date;
    }
    return false;
  }, []);
  const unpaidMilestones = contract.milestones?.some(
    (milestone) => milestone.status.toLowerCase() === "pending"
  );
  const contractFeePaid = React.useMemo(
    () =>
      contract.milestones?.some(
        (milestone) => milestone.status.toLowerCase() === "in_progress"
      ),
    [contract.milestones]
  );
  console.log(contractFeePaid, "cpaid");
  //console.log(contract, "tract");

  // Contract Accepted Success Alert Component
  const ContractAcceptedAlert = () => {
    if (
      !contract.service_provider_signing_date ||
      contract.status === "completed" ||
      contract?.milestones.length > 0
    ) {
      return null;
    }

    const handleScrollToMilestones = () => {
      const milestonesSection = document.getElementById("milestones-section");
      if (milestonesSection) {
        milestonesSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };

    return (
      <Alert
        variant="light"
        color="green"
        radius="md"
        style={{
          backgroundColor: "#388E3C15",
          borderLeft: "4px solid #388E3C",
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Box style={{ flex: 1, minWidth: "200px" }}>
            <Text size="sm" fw={600} c="#388E3C" mb={4}>
              🎉 Contract Accepted Successfully!
            </Text>
            <Text size="xs" c="dimmed">
              You can now start working on the project milestones below.
            </Text>
          </Box>
          <Button
            size="sm"
            variant="light"
            color="green"
            onClick={handleScrollToMilestones}
            style={{
              backgroundColor: "#388E3C",
              color: "white",
            }}
          >
            Go to Milestones
          </Button>
        </Group>
      </Alert>
    );
  };

  return (
    <Box>
      <Stack gap="xl">
        {/* Header Section */}
        <Card
          shadow="sm"
          p={{ base: "md", md: "xl" }}
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
                {userType === "supplier" &&
                  contract?.service_provider_signing_date === null &&
                  contract.status === "pending" && (
                    <Button
                      onClick={handleAcceptContract}
                      loading={isAcceptingContract}
                      className="!bg-keyman-orange text-white"
                      disabled={isAcceptingContract}
                    >
                      {isAcceptingContract ? "Accepting..." : "Accept Contract"}
                    </Button>
                  )}

                {!!contract?.service_provider_signing_date && (
                  <Button variant="outlined" onClick={openChatManager}>
                    {" "}
                    Chat
                  </Button>
                )}

                {userType === "customer" && (
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
                  className="!invisible"
                  onClick={onShare}
                >
                  <Share2 size={18} />
                </ActionIcon>
                <ActionIcon
                  variant="light"
                  color="gray"
                  size="lg"
                  className="!invisible"
                >
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

        {/* Contract Accepted Success Alert */}
        <ContractAcceptedAlert />

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
                      {contract.initiator?.email && false && (
                        <Group gap="xs" mb="xs">
                          <Mail size={14} className="text-gray-500" />
                          <Text size="xs" c="dimmed">
                            {contract.initiator.email}
                          </Text>
                        </Group>
                      )}
                      {contract.initiator?.phone && false && (
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
                        <Avatar
                          src={contract?.service_provider?.photo?.[0]}
                          alt={contract?.service_provider?.name}
                          size={60}
                          radius="md"
                        />
                        <div>
                          <Text fw={600} size="sm" className="text-gray-800">
                            Service provider
                          </Text>
                          <Text size="xs" c="dimmed">
                            {contract.service_provider?.name || ""}
                          </Text>
                        </div>
                      </Group>
                      {contract.service_provider?.email && false && (
                        <Group gap="xs" mb="xs">
                          <Mail size={14} className="text-gray-500" />
                          <Text size="xs" c="dimmed">
                            {contract.service_provider?.email}
                          </Text>
                        </Group>
                      )}
                      {contract.service_provider?.phone && false && (
                        <Group gap="xs">
                          <Phone size={14} className="text-gray-500" />
                          <Text size="xs" c="dimmed">
                            {contract.service_provider?.phone}
                          </Text>
                        </Group>
                      )}
                      {contract.service_provider?.keyman_number && (
                        <Badge variant="light" color="orange" size="xs">
                          {contract.service_provider?.keyman_number}
                        </Badge>
                      )}
                    </Paper>
                  </Grid.Col>
                </Grid>
              </Card>

              {/* Create Milestone Button */}
              {canEditMileStone && (
                <Card shadow="sm" padding="lg" radius="md">
                  <Group justify="space-between" align="center">
                    <div>
                      <Text fw={600} size="lg" className="text-gray-800">
                        Project Milestones
                      </Text>
                      <Text size="sm" c="dimmed">
                        Add and manage project milestones
                      </Text>
                    </div>
                  </Group>
                </Card>
              )}

              {/* Milestones Timeline */}
              {contract.milestones && contract.milestones.length > 0 && (
                <Box id="milestones-section">
                  <MilestoneTimeline
                    milestones={contract.milestones}
                    canEditMileStone={true}
                    serviceProviderSigningDate={
                      contract.service_provider_signing_date
                    }
                    onEditMilestone={handleEditMilestone}
                    onStatusChange={handleMilestoneStatusChange}
                    onDeleteMilestone={handleDeleteMilestone}
                    userType={userType}
                    mode={contract?.contract_mode ?? "client"}
                  />
                </Box>
              )}

              {true && (
                <>
                  {/* Add Materials and Labour Buttons */}
                  <Flex
                    gap={"md"}
                    direction={{ base: "column", md: "row" }}
                    mt="md"
                  >
                    {_priceList?.length > 0 ? (
                      <Button
                        variant="outline"
                        color="orange"
                        leftSection={<Plus size={16} />}
                        onClick={() => setMaterialsModalOpened(true)}
                        styles={{
                          root: {
                            "&:hover": {
                              backgroundColor: "orange",
                              color: "white",
                            },
                          },
                        }}
                      >
                        Add Materials
                      </Button>
                    ) : (
                      <Alert
                        variant="light"
                        color="orange"
                        radius="md"
                        icon={<AlertCircle size={16} />}
                        style={{ flex: 1 }}
                      >
                        <Text size="sm">No items available in the store</Text>
                      </Alert>
                    )}
                    <Button
                      variant="outline"
                      color="orange"
                      leftSection={<Plus size={16} />}
                      onClick={() => setLabourModalOpened(true)}
                      styles={{
                        root: {
                          "&:hover": {
                            backgroundColor: "orange",
                            color: "white",
                          },
                        },
                      }}
                    >
                      Services/Labour
                    </Button>

                    <ChatManager
                      chatId={contract?.chat_id}
                      currentUserId={user?.id ?? 0}
                      open={chatOpen}
                    />
                  </Flex>

                  {/* Display added items count */}
                  {(materials.length > 0 || labourItems.length > 0) &&
                    false && (
                      <Group gap="md" mt="sm">
                        {materials.length > 0 && (
                          <Text size="sm" c="dimmed">
                            Materials: {materials.length}
                          </Text>
                        )}
                        {labourItems.length > 0 && (
                          <Text size="sm" c="dimmed">
                            Labour: {labourItems.length}
                          </Text>
                        )}
                      </Group>
                    )}
                </>
              )}
              {/**Actions */}
              {false && inNegotiation && userType === "customer"
                ? canNotify && (
                    <Button
                      loading={notifying}
                      onClick={() => notifyProvider("service_provider")}
                      className="bg-keyman-orange text-white"
                    >
                      Notify Provider of changes
                    </Button>
                  )
                : null}

              {false && inNegotiation && userType === "supplier"
                ? canNotify && (
                    <Button
                      loading={notifying}
                      onClick={() => notifyProvider("client")}
                      className="bg-keyman-orange text-white"
                    >
                      Notify Client of changes
                    </Button>
                  )
                : null}
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
                  <Text size="xs" c="dimmed" fs="italic">
                    *One-time contract fee of KES 200 applies
                  </Text>

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
                                  {milestone.name}
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
                    display={"none"}
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

                  {/* Pay Full Amount Button */}
                  {unpaidMilestones && userType === "customer" && (
                    <Button
                      fullWidth
                      size="md"
                      style={{ backgroundColor: "#F08C23" }}
                      onClick={() => setPaymentModalOpened(true)}
                    >
                      Pay Full Amount (
                      {formatCurrency(
                        Number(contract.contract_amount) +
                          (contractFeePaid ? 0 : 200)
                      )}
                      )
                    </Button>
                  )}
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
                  {userType === "supplier" &&
                    contract?.service_provider_signing_date === null &&
                    contract.status === "pending" && (
                      <Button
                        onClick={handleAcceptContract}
                        loading={isAcceptingContract}
                        className="!bg-keyman-orange text-white"
                        disabled={isAcceptingContract}
                      >
                        {isAcceptingContract
                          ? "Accepting..."
                          : "Accept Contract"}
                      </Button>
                    )}
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
                  <Box>
                    <Text size="sm" c="dimmed">
                      Contract Status
                    </Text>
                    <Badge
                      variant="filled"
                      style={{
                        backgroundColor: statusConfig.bg,
                        color: statusConfig.color,
                      }}
                    >
                      {statusConfig.label}
                    </Badge>
                  </Box>

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
        providerName={contract?.service_provider?.name}
        initiatorName={contract?.initiator?.name}
      />

      {/* Accept Contract Modal */}
      <AcceptContractModal
        opened={acceptContractModalOpened}
        onClose={() => {
          setAcceptContractModalOpened(false);
        }}
        contract={contract}
        onAccept={confirmAcceptContract}
      />

      {/* Add Materials Modal */}
      <AddMaterialsModal
        opened={materialsModalOpened}
        onClose={() => setMaterialsModalOpened(false)}
        onSave={handleAddMaterials}
        priceList={_priceList as WholePriceList[]}
      />

      {/* Add Labour Modal */}
      <AddLabourModal
        opened={labourModalOpened}
        onClose={() => setLabourModalOpened(false)}
        onSave={handleAddLabour}
      />

      {/* Contract Payment Modal */}
      <ContractPaymentModal
        opened={paymentModalOpened}
        onClose={() => setPaymentModalOpened(false)}
        contractId={contract.id}
        contractTitle={contract?.contract_json?.title || "Contract Payment"}
        amount={Number(contract.contract_amount)}
        contractFee={contractFeePaid ? 0 : 200}
        onPaymentSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["contract", contract.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["contracts"],
          });
          refresh();
          setPaymentModalOpened(false);
        }}
      />
    </Box>
  );
};

export default ContractDetails;
