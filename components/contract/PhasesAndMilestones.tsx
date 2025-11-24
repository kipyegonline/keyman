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
} from "@mantine/core";
import { ArrowLeft, ArrowRight, Plus, BadgeCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSupplierPriceList } from "@/api/supplier";
import { WholePriceList } from "../supplier/priceList";
import LabourSection from "./LabourSection";
import AddMaterialsModal from "./AddMaterialsModal";

interface MaterialItem {
  id: string;
  name: string;
  description: string;
  amount: number;
  quantity: number;
  unit_price: number;
}

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

interface ISupplierContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  keyman_number: string;
  comments: string | null;
  photo?: string[];
  supplier_rating: null | string;
  is_user_verified: number;
}

interface PhasesAndMilestonesProps {
  contractData: ContractData | null;
  onComplete: (phases: Phase[]) => void;
  onBack: () => void;
  supplier: ISupplierContact | null;
}

const PhasesAndMilestones: React.FC<PhasesAndMilestonesProps> = ({
  contractData,
  onComplete,
  onBack,
  supplier,
}) => {
  const { data: priceList } = useQuery({
    queryKey: ["pricelist", supplier?.id],
    queryFn: async () => getSupplierPriceList(supplier?.id ?? ""),
    enabled: !!supplier?.id,
  });
  const _priceList = React.useMemo(() => {
    if (priceList?.price_list) {
      return priceList.price_list as WholePriceList[];
    } else return [];
  }, [priceList]);
  const [phases] = useState<Phase[]>([
    {
      id: "1",
      name: "Phase 1",
      description: "",
      milestones: [],
    },
  ]);

  const [materialsModalOpened, setMaterialsModalOpened] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialItem[]>(
    []
  );

  const handleAddMaterials = (materials: MaterialItem[]) => {
    setSelectedMaterials(materials);
  };

  const handleContinue = () => {
    // Validate phases have at least one milestone
    const hasValidPhases = phases.some((phase) => phase.milestones.length > 0);

    if (!hasValidPhases) {
      // Show error notification
      return;
    }

    onComplete(phases);
  };
  console.log(_priceList);
  return (
    <Card shadow="sm" padding="lg" radius="lg">
      <Stack gap="xl">
        {/* Header */}
        <Box>
          <Title order={2} mb="xs">
            Phases & Milestones
          </Title>
          <Text size="sm" c="dimmed">
            Divide your contract into phases. Receive payment in escrow upon
            completion of each phase.
          </Text>

          <Paper p="md" mt="md" radius="md" bg="green.0">
            <Group gap="xs">
              <Badge color="green" variant="light" size="sm">
                ✓
              </Badge>
              <Text size="sm" c="green.8">
                This contract follows the Keyman Stores 12 Principles of Fair
                Trade
              </Text>
            </Group>
          </Paper>
        </Box>

        {/* Contract Summary */}
        {contractData && (
          <Paper p="md" radius="md" withBorder>
            <Group justify="space-between">
              <Box>
                <Text size="lg" fw={600}>
                  {contractData.title}
                </Text>
                <Text size="sm" c="dimmed">
                  {contractData.contract_duration_in_duration} days
                </Text>
              </Box>
              <Box ta="right">
                <Text size="xs" c="dimmed">
                  Total Value
                </Text>
                <Text size="xl" fw={700} c="green.7">
                  Ksh {contractData.contract_amount.toLocaleString()}
                </Text>
              </Box>
            </Group>
          </Paper>
        )}

        {/* Supplier Information */}
        {supplier && (
          <Paper p="lg" radius="md" withBorder>
            <Group justify="space-between" align="center" mb="md">
              <Box>
                <Group gap="xs" mb="xs">
                  <Title order={3} style={{ color: "#3D6B2C" }}>
                    {supplier.name}{" "}
                    {(supplier?.is_user_verified as number) > 0 && false && (
                      <BadgeCheck
                        size={28}
                        fill="#3D6B2C"
                        stroke="white"
                        className="inline-block relative -top-1"
                      />
                    )}
                  </Title>
                  {supplier.is_user_verified > 0 && (
                    <BadgeCheck size={24} fill="#3D6B2C" stroke="white" />
                  )}
                </Group>
                <Badge color="orange" variant="light" size="md">
                  {supplier.keyman_number}
                </Badge>
              </Box>
              {_priceList?.length > 0 && (
                <Button
                  variant="outline"
                  color="green.7"
                  leftSection={<Plus size={16} />}
                  onClick={() => setMaterialsModalOpened(true)}
                >
                  Add Materials
                </Button>
              )}
            </Group>
          </Paper>
        )}

        {/* Selected Materials Display */}
        {selectedMaterials.length > 0 && (
          <Paper p="lg" radius="md" withBorder bg="blue.0">
            <Group justify="space-between" mb="md">
              <Text size="sm" fw={600}>
                Selected Materials ({selectedMaterials.length})
              </Text>
              <Text size="lg" fw={700} c="green.7">
                Ksh{" "}
                {selectedMaterials
                  .reduce((sum, m) => sum + m.amount, 0)
                  .toLocaleString()}
              </Text>
            </Group>
            <Stack gap="xs">
              {selectedMaterials.map((material) => (
                <Paper
                  key={material.id}
                  p="sm"
                  radius="md"
                  withBorder
                  bg="white"
                >
                  <Group justify="space-between">
                    <Box style={{ flex: 1 }}>
                      <Text size="sm" fw={600}>
                        {material.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {material.description}
                      </Text>
                    </Box>
                    <Group gap="md">
                      <Badge size="lg" variant="light" color="blue">
                        Qty: {material.quantity}
                      </Badge>
                      <Text size="sm" fw={600} c="green.7">
                        Ksh {material.amount.toLocaleString()}
                      </Text>
                    </Group>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Paper>
        )}

        {/* Phase 1 Section */}
        <LabourSection phaseName="Phase 1" />

        {/* Add Materials Modal */}
        <AddMaterialsModal
          opened={materialsModalOpened}
          onClose={() => setMaterialsModalOpened(false)}
          onSave={handleAddMaterials}
          priceList={_priceList}
        />

        {/* Add More Phases */}
        <Button
          variant="subtle"
          color="green.7"
          leftSection={<Plus size={16} />}
          fullWidth
        >
          Add Phase
        </Button>

        {/* Actions */}
        <Group justify="space-between" mt="xl">
          <Button
            variant="subtle"
            leftSection={<ArrowLeft size={16} />}
            onClick={onBack}
            color="gray"
          >
            Back
          </Button>

          <Button
            rightSection={<ArrowRight size={16} />}
            onClick={handleContinue}
            color="green.7"
            size="md"
          >
            Continue to Review
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};

export default PhasesAndMilestones;
