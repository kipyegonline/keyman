"use client";
import React, { useState } from "react";
import {
  Text,
  Button,
  Stack,
  Group,
  Badge,
  Grid,
  Card,
  Transition,
  Container,
  Loader,
  Modal,
  ActionIcon,
  Tooltip,
  Divider,
  ThemeIcon,
  Title,
} from "@mantine/core";
import CreateContractModal from "./CreateContractModal";
import {
  FileText,
  Plus,
  Calendar,
  Eye,
  Download,
  Share2,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  Briefcase,
  Users,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/lib/helpers";

// Contract interface based on API response
export interface Contract {
  id: string;
  code: string;
  initiator_id: number;
  service_provider_id: number | null;
  status: "pending" | "active" | "completed" | "expired" | "cancelled";
  pdf_path: string | null;
  contractor_signing_date: string | null;
  service_provider_signing_date: string | null;
  contract_duration_in_duration: number;
  contract_amount: string;
  contract_json: {
    title: string;
    scope: string;
    [key: string]: string | number | boolean; // for additional fields in contract_json
  };
  created_at: string;
  updated_at: string;
}

interface ContractListProps {
  contracts: Contract[];
  userType?: "customer" | "supplier";
  isLoading?: boolean;
  onCreateContract?: () => void;
  onCreateWithAI?: () => void;
  onViewContract?: (contractId: string) => void;
  onDownloadContract?: (contractId: string) => void;
  onShareContract?: (contractId: string) => void;
}

const ContractList: React.FC<ContractListProps> = ({
  contracts,
  userType = "customer",
  isLoading = false,
  onCreateContract,
  onCreateWithAI,
  onViewContract,
  onDownloadContract,
  onShareContract,
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedContract] = useState<Contract | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "pending":
        return "yellow";
      case "completed":
        return "blue";
      case "expired":
        return "red";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle size={16} />;
      case "pending":
        return <Clock size={16} />;
      case "completed":
        return <CheckCircle size={16} />;
      case "expired":
        return <AlertCircle size={16} />;
      case "cancelled":
        return <AlertCircle size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: string | number) => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(numericAmount);
  };
  const createContract = () => {
    navigateTo();
    router.push("/keyman/dashboard/key-contract/create");
  };

  if (isLoading) {
    return (
      <Container size="lg" className="py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader size="lg" className="mx-auto mb-4" />
            <Text size="lg" c="gray.6">
              Loading contracts...
            </Text>
          </div>
        </div>
      </Container>
    );
  }

  // Empty state
  if (!contracts || contracts.length === 0) {
    return (
      <Container size="lg" className="py-8">
        <div className="min-h-[500px] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            {/* Animated Icon */}
            <div className="relative mb-8">
              <div className="absolute inset-0 animate-pulse">
                <ThemeIcon
                  size={120}
                  radius="xl"
                  className="mx-auto opacity-20 bg-gradient-to-br from-green-100 to-blue-100"
                >
                  <FileText size={60} className="text-gray-400" />
                </ThemeIcon>
              </div>
              <ThemeIcon
                size={120}
                radius="xl"
                className="mx-auto bg-gradient-to-br from-green-50 to-blue-50 border-2 border-gray-100"
              >
                <FileText size={60} className="text-gray-600" />
              </ThemeIcon>
              <div className="absolute -top-2 -right-2 animate-bounce">
                <ThemeIcon
                  size={32}
                  radius="xl"
                  color="orange"
                  className="shadow-lg"
                >
                  <Plus size={16} />
                </ThemeIcon>
              </div>
            </div>

            {/* Content */}
            <Title order={2} className="text-gray-800 mb-4">
              {userType === "customer"
                ? "No Contracts Yet"
                : "No Contracts Available"}
            </Title>
            <Text size="lg" c="gray.6" className="mb-6 pb-4 leading-relaxed">
              {userType === "customer"
                ? "You haven't created any contracts yet. Start by creating your first contract to streamline your construction projects."
                : "No contracts have been created yet. You will see contracts here when customers create them and assign you as a service provider."}
            </Text>

            {/* CTA Button - Only show for customers */}
            {userType === "customer" && (
              <Button
                size="lg"
                radius="xl"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                leftSection={<Plus size={20} />}
                onClick={createContract}
              >
                Create Your First Contract
              </Button>
            )}
            {/* CTA Button - Only show for suppliers */}
            {userType === "supplier" && (
              <Button
                size="lg"
                radius="xl"
                className="mt-4 bg-gradient-to-r  from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                leftSection={<Plus size={20} />}
                onClick={onCreateContract}
              >
                Initiate chat
              </Button>
            )}

            {/* Benefits */}
            <div
              className={`${
                userType === "customer" ? "mt-8" : "mt-6"
              } grid grid-cols-1 sm:grid-cols-3 gap-4`}
            >
              {(userType === "customer"
                ? [
                    { icon: Shield, text: "Secure & Legal" },
                    { icon: Sparkles, text: "Easy to Use" },
                    { icon: Zap, text: "Quick Setup" },
                  ]
                : [
                    { icon: Eye, text: "View Contracts" },
                    { icon: Download, text: "Download PDFs" },
                    { icon: CheckCircle, text: "Track Progress" },
                  ]
              ).map((benefit, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <ThemeIcon size={40} radius="xl" color="gray" variant="light">
                    <benefit.icon size={20} />
                  </ThemeIcon>
                  <Text size="sm" c="gray.7" className="mt-2">
                    {benefit.text}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Create Contract Modal */}
        <CreateContractModal
          opened={createModalOpened}
          onClose={() => setCreateModalOpened(false)}
          onCreateWithAI={() => onCreateWithAI?.()}
        />
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-8">
      {/* Header */}
      <div className="mb-8">
        <Group justify="space-between" className="mb-4">
          <div>
            <Title order={1} className="text-gray-900 mb-2">
              {userType === "customer" ? "My Contracts" : "Active Contracts"}
            </Title>
            <Text size="lg" c="gray.6">
              {contracts.length}{" "}
              {contracts.length === 1 ? "contract" : "contracts"} found
            </Text>
          </div>
          {/* Only show Create Contract button for customers */}
          {userType === "customer" && (
            <Button
              size="md"
              radius="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300"
              leftSection={<Plus size={18} />}
              onClick={createContract}
            >
              New Contract
            </Button>
          )}
          {userType === "supplier" && (
            <Button
              size="md"
              radius="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300"
              leftSection={<Plus size={18} />}
              onClick={onCreateContract}
            >
              Initiate Chat
            </Button>
          )}
        </Group>
        <Divider />
      </div>

      {/* Contracts Grid */}
      <Grid gutter="md">
        {contracts.map((contract) => (
          <Grid.Col
            key={contract.id}
            span={{ base: 12, md: 6, lg: 4 }}
            onClick={() => {
              navigateTo();
              if (userType === "customer")
                router.push(`/keyman/dashboard/key-contract/${contract.id}`);
              else if (userType === "supplier")
                router.push(`/keyman/supplier/key-contract/${contract.id}`);
            }}
          >
            <Transition
              mounted={true}
              transition="slide-up"
              duration={300}
              timingFunction="ease-out"
            >
              {(styles) => (
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="lg"
                  withBorder
                  style={styles}
                  className={`
                    cursor-pointer transition-all duration-300 hover:shadow-xl
                    ${
                      hoveredCard === contract.id
                        ? "transform -translate-y-2 shadow-2xl"
                        : ""
                    }
                    border-gray-200 hover:border-green-300
                  `}
                  onMouseEnter={() => setHoveredCard(contract.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Contract Header */}
                  <Group justify="space-between" className="mb-3">
                    <Badge
                      color={getStatusColor(contract.status)}
                      variant="light"
                      leftSection={getStatusIcon(contract.status)}
                      radius="md"
                      className="transition-all duration-200"
                    >
                      {contract.status.charAt(0).toUpperCase() +
                        contract.status.slice(1)}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Text size="xs" c="gray.6">
                        {contract.code}
                      </Text>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle menu actions
                        }}
                        className="hover:bg-gray-100 transition-colors duration-200"
                      >
                        <MoreVertical size={16} />
                      </ActionIcon>
                    </div>
                  </Group>

                  {/* Contract Icon & Title */}
                  <div className="flex items-start space-x-3 mb-4">
                    <ThemeIcon
                      size={50}
                      radius="lg"
                      className="bg-gradient-to-br from-green-100 to-blue-100"
                    >
                      <FileText size={24} className="text-green-700" />
                    </ThemeIcon>
                    <div className="flex-1 min-w-0">
                      <Text
                        size="lg"
                        fw={600}
                        className="text-gray-900 truncate"
                        title={contract?.contract_json?.title}
                      >
                        {contract?.contract_json?.title}
                      </Text>
                      <Text size="sm" c="gray.6" className="truncate">
                        {contract?.contract_json?.scope}
                      </Text>
                    </div>
                  </div>

                  {/* Contract Details */}
                  <Stack gap="xs" className="mb-4">
                    {/* Date */}
                    <Group gap="xs">
                      <Calendar size={14} className="text-gray-500" />
                      <Text size="sm" c="gray.6">
                        Created {formatDate(contract?.created_at)}
                      </Text>
                    </Group>

                    {/* Duration */}
                    <Group gap="xs">
                      <Clock size={14} className="text-gray-500" />
                      <Text size="sm" c="gray.6">
                        Duration: {contract?.contract_duration_in_duration} days
                      </Text>
                    </Group>

                    {/* Contract Amount */}
                    <Group gap="xs">
                      <Briefcase size={14} className="text-gray-500" />
                      <Text size="sm" c="gray.6" fw={500}>
                        {formatCurrency(contract.contract_amount)}
                      </Text>
                    </Group>

                    {/* Service Provider Status */}
                    <Group gap="xs">
                      <Users size={14} className="text-gray-500" />
                      <Text size="sm" c="gray.6">
                        {contract.service_provider_id
                          ? "Service Provider Assigned"
                          : "Awaiting Service Provider"}
                      </Text>
                    </Group>
                  </Stack>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <Group gap="xs">
                      <Tooltip label="View Contract">
                        <ActionIcon
                          display={"none"}
                          variant="subtle"
                          color="blue"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewContract?.(contract.id);
                          }}
                          className="hover:bg-blue-50 transition-colors duration-200"
                        >
                          <Eye size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Download">
                        <ActionIcon
                          variant="subtle"
                          display={"none"}
                          color="green"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownloadContract?.(contract.id);
                          }}
                          className="hover:bg-green-50 transition-colors duration-200"
                        >
                          <Download size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Share">
                        <ActionIcon
                          display={"none"}
                          variant="subtle"
                          color="orange"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onShareContract?.(contract.id);
                          }}
                          className="hover:bg-orange-50 transition-colors duration-200"
                        >
                          <Share2 size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                    <ArrowRight
                      size={16}
                      className={`text-gray-400 transition-all duration-300 ${
                        hoveredCard === contract.id
                          ? "transform translate-x-1 text-green-600"
                          : ""
                      }`}
                    />
                  </div>
                </Card>
              )}
            </Transition>
          </Grid.Col>
        ))}
      </Grid>

      {/* Contract Details Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={selectedContract?.contract_json?.title || "Contract Details"}
        size="lg"
        radius="lg"
        className="contract-modal"
      >
        {selectedContract && (
          <div className="space-y-4">
            <Group justify="space-between">
              <Badge
                color={getStatusColor(selectedContract.status)}
                variant="light"
                leftSection={getStatusIcon(selectedContract.status)}
                size="lg"
              >
                {selectedContract.status.charAt(0).toUpperCase() +
                  selectedContract.status.slice(1)}
              </Badge>
              <Text size="sm" c="gray.6">
                Code: {selectedContract.code}
              </Text>
            </Group>

            <div>
              <Text size="sm" fw={600} className="mb-2">
                Scope
              </Text>
              <Text size="sm" c="gray.7">
                {selectedContract.contract_json.scope}
              </Text>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text size="sm" fw={600} className="mb-1">
                  Created
                </Text>
                <Text size="sm" c="gray.7">
                  {formatDate(selectedContract.created_at)}
                </Text>
              </div>
              <div>
                <Text size="sm" fw={600} className="mb-1">
                  Amount
                </Text>
                <Text size="sm" c="gray.7" fw={500}>
                  {formatCurrency(selectedContract.contract_amount)}
                </Text>
              </div>
              <div>
                <Text size="sm" fw={600} className="mb-1">
                  Duration
                </Text>
                <Text size="sm" c="gray.7">
                  {selectedContract.contract_duration_in_duration} days
                </Text>
              </div>
              <div>
                <Text size="sm" fw={600} className="mb-1">
                  Status
                </Text>
                <Text size="sm" c="gray.7">
                  {selectedContract.service_provider_id
                    ? "Service Provider Assigned"
                    : "Awaiting Service Provider"}
                </Text>
              </div>
            </div>

            {selectedContract.pdf_path && (
              <div>
                <Text size="sm" fw={600} className="mb-1">
                  Document
                </Text>
                <Text size="sm" c="gray.7">
                  PDF available for download
                </Text>
              </div>
            )}

            <Group className="pt-4">
              <Button
                leftSection={<Eye size={16} />}
                onClick={() => onViewContract?.(selectedContract.id)}
              >
                View Full Contract
              </Button>
              {selectedContract.pdf_path && (
                <Button
                  variant="outline"
                  leftSection={<Download size={16} />}
                  onClick={() => onDownloadContract?.(selectedContract.id)}
                >
                  Download PDF
                </Button>
              )}
            </Group>
          </div>
        )}
      </Modal>

      {/* Create Contract Modal */}
      <CreateContractModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onCreateWithAI={() => onCreateWithAI?.()}
      />
    </Container>
  );
};

export default ContractList;
