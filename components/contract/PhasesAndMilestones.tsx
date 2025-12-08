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
  Grid,
  ThemeIcon,
  Divider,
  Avatar,
} from "@mantine/core";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  BadgeCheck,
  DollarSign,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSupplierPriceList } from "@/api/supplier";
import { WholePriceList } from "../supplier/priceList";
import LabourSection, { LabourItem } from "./LabourSection";
import ItemsSection, { MaterialItem } from "./ItemsSection";
import AddMaterialsModal from "./AddMaterialsModal";
import AddLabourModal from "./AddLabourModal";

interface MilestoneItem {
  id: string;
  name: string;
  description: string;
  amount: number;
  quantity: number;
  type: "materials" | "labour";
  unit_price?: number;
}

interface MaterialInput {
  id: string;
  name: string;
  description: string;
  amount: number;
  quantity: number;
  unit_price: number;
}

interface LabourInput {
  id: string;
  name: string;
  description: string;
  amount: number;
  quantity: number;
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
  description: string;
  amount: number;
  quantity: number;
  type: "materials" | "labour";
  duration_in_days: number;
  supplier_id?: string;
  supplier_name?: string;
  verified?: boolean;
  unit_price?: number;
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
  initialPhases?: Phase[];
}

const PhasesAndMilestones: React.FC<PhasesAndMilestonesProps> = ({
  contractData,
  onComplete,
  onBack,
  supplier,
  initialPhases,
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

  // Initialize milestones from initialPhases if provided
  const [milestones, setMilestones] = useState<MilestoneItem[]>(() => {
    if (
      initialPhases &&
      initialPhases.length > 0 &&
      initialPhases[0].milestones
    ) {
      return initialPhases[0].milestones.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description || m.deliverables,
        amount: m.amount,
        quantity: m.quantity,
        type: m.type,
        unit_price: m.unit_price,
      }));
    }
    return [];
  });
  const [materialsModalOpened, setMaterialsModalOpened] = useState(false);
  const [labourModalOpened, setLabourModalOpened] = useState(false);

  // Separate materials and labour for display
  const materials = milestones.filter((m) => m.type === "materials");
  const labourItems = milestones.filter((m) => m.type === "labour");

  // Transform milestones to display format for components
  const materialsForDisplay: MaterialItem[] = materials.map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    amount: m.unit_price || m.amount / m.quantity,
    quantity: m.quantity,
  }));

  const labourForDisplay: LabourItem[] = labourItems.map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    amount: m.unit_price || m.amount / m.quantity,
    quantity: m.quantity,
  }));

  const handleAddMaterials = (items: MaterialInput[]) => {
    const materialItems: MilestoneItem[] = items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      amount: item.amount,
      quantity: item.quantity,
      type: "materials" as const,
      unit_price: item.unit_price,
    }));
    setMilestones([...milestones, ...materialItems]);
  };

  const handleAddLabour = (labour: LabourInput) => {
    const newLabour: MilestoneItem = {
      id: labour.id,
      name: labour.name,
      description: labour.description,
      amount: labour.amount * labour.quantity, // Total amount
      quantity: labour.quantity,
      type: "labour" as const,
      unit_price: labour.amount, // Store unit price
    };
    setMilestones([...milestones, newLabour]);
  };

  const handleRemoveItem = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleContinue = () => {
    // Validate at least one milestone exists
    if (milestones.length === 0) {
      // Show error notification
      return;
    }

    // Build phases with milestones
    const phases: Phase[] = [
      {
        id: "1",
        name: "Phase 1",
        description: "",
        milestones: milestones.map((m) => ({
          id: m.id,
          name: m.name,
          deliverables: m.description,
          description: m.description,
          amount: m.amount,
          quantity: m.quantity,
          type: m.type,
          duration_in_days: 1,
          unit_price: m.unit_price,
        })),
      },
    ];

    onComplete(phases);
  };
  // Calculate totals
  const materialsTotal = materials.reduce(
    (sum, m) => sum + m.amount * m.quantity,
    0
  );
  const labourTotal = milestones
    .filter((m) => m.type === "labour")
    .reduce((sum, m) => sum + m.amount, 0);
  const grandTotal = materialsTotal + labourTotal;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };
  console.log(materials, "materials");
  return (
    <Box>
      <Grid gutter="lg">
        {/* Main Content - Left Column */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="sm" padding="lg" radius="lg">
            <Stack gap="xl">
              {/* Header */}
              <Box>
                <Title order={2} mb="xs">
                  Phases & Milestones
                </Title>
                <Text size="sm" c="dimmed">
                  Divide your contract into phases. Receive payment in escrow
                  upon completion of each phase.
                </Text>

                <Paper p="md" mt="md" radius="md" bg="orange.0">
                  <Group gap="xs">
                    <Badge color="orange" variant="light" size="sm">
                      ✓
                    </Badge>
                    <Text size="sm" c="orange.8">
                      This contract follows the Keyman Stores 12 Principles of
                      Fair Trade
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
                      <Text size="sm" c="dimmed" display="none">
                        {contractData.contract_duration_in_duration} days
                      </Text>
                    </Box>
                    <Box ta="right" display="none">
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
                    <Group gap="md" align="center">
                      {/* Supplier Avatar */}
                      <Avatar
                        src={supplier.photo?.[0]}
                        alt={supplier.name}
                        size={60}
                        radius="md"
                      />
                      {/* Title with verification and keyman number on same line */}
                      <Group gap="md" align="center">
                        <Group gap="xs">
                          <Title
                            order={2}
                            style={{ color: "#3D6B2C", fontWeight: 700 }}
                          >
                            {supplier.name}
                          </Title>
                          {supplier.is_user_verified > 0 && (
                            <BadgeCheck
                              size={28}
                              fill="#3D6B2C"
                              stroke="white"
                            />
                          )}
                        </Group>
                        <Badge
                          color="orange"
                          variant="filled"
                          size="lg"
                          style={{ fontSize: "15px", fontWeight: 600 }}
                        >
                          {supplier.keyman_number}
                        </Badge>
                      </Group>
                    </Group>
                    <Group
                      gap="md"
                      //style={{ flexDirection: "row" }}
                      className="flex-col sm:flex-row"
                    >
                      {_priceList?.length > 0 && (
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
                    </Group>
                  </Group>
                </Paper>
              )}

              {/* Items Display Sections */}
              <ItemsSection
                items={materialsForDisplay}
                onRemoveItem={handleRemoveItem}
                title="Materials"
              />
              <LabourSection
                labourItems={labourForDisplay}
                onRemoveLabour={handleRemoveItem}
                title="Services / Labour"
              />

              {/* Add Materials Modal */}
              <AddMaterialsModal
                opened={materialsModalOpened}
                onClose={() => setMaterialsModalOpened(false)}
                onSave={handleAddMaterials}
                priceList={_priceList}
              />

              {/* Add Labour Modal */}
              <AddLabourModal
                opened={labourModalOpened}
                onClose={() => setLabourModalOpened(false)}
                onSave={handleAddLabour}
              />

              {/* Add More Phases */}
              {false && (
                <Button
                  variant="subtle"
                  color="green.7"
                  leftSection={<Plus size={16} />}
                  fullWidth
                >
                  Add Phase
                </Button>
              )}

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
        </Grid.Col>

        {/* Sidebar - Right Column */}
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
                  Cost Summary
                </Text>
              </Group>

              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Total Cost
                  </Text>
                  <Text size="lg" fw={700} className="text-green-700">
                    {formatCurrency(grandTotal)}
                  </Text>
                </Group>

                {(materials.length > 0 ||
                  milestones.some((m) => m.type === "labour")) && (
                  <>
                    <Divider />
                    <div>
                      <Text
                        size="sm"
                        fw={600}
                        mb="xs"
                        className="text-gray-700"
                      >
                        Cost Breakdown
                      </Text>

                      {materials.length > 0 && (
                        <Group justify="space-between" mb="xs">
                          <Text size="xs" c="dimmed">
                            Materials ({materials.length} items)
                          </Text>
                          <Text size="xs" fw={500}>
                            {formatCurrency(materialsTotal)}
                          </Text>
                        </Group>
                      )}

                      {labourTotal > 0 && (
                        <Group justify="space-between" mb="xs">
                          <Text size="xs" c="dimmed">
                            Labour (
                            {
                              milestones.filter((m) => m.type === "labour")
                                .length
                            }{" "}
                            items)
                          </Text>
                          <Text size="xs" fw={500}>
                            {formatCurrency(labourTotal)}
                          </Text>
                        </Group>
                      )}
                    </div>
                  </>
                )}

                {milestones.length === 0 && (
                  <Paper
                    p="md"
                    className="bg-white border border-gray-200"
                    radius="md"
                  >
                    <Text size="sm" c="dimmed" ta="center">
                      No items added yet
                    </Text>
                  </Paper>
                )}

                {milestones.length > 0 && (
                  <Paper
                    p="sm"
                    className="bg-white border border-green-100"
                    radius="md"
                  >
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Total Items
                      </Text>
                      <Badge variant="light" color="green" size="lg">
                        {milestones.length}
                      </Badge>
                    </Group>
                  </Paper>
                )}
              </Stack>
            </Card>

            {/* Phase Information */}
            <Card shadow="sm" padding="lg" radius="md">
              <Text fw={600} size="lg" className="text-gray-800 mb-md">
                Phase Details
              </Text>

              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Current Phase
                  </Text>
                  <Badge variant="light" color="blue">
                    Phase 1
                  </Badge>
                </Group>

                <Divider />

                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Materials
                  </Text>
                  <Text size="sm" fw={500}>
                    {materials.length}
                  </Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Labour Items
                  </Text>
                  <Text size="sm" fw={500}>
                    {milestones.filter((m) => m.type === "labour").length}
                  </Text>
                </Group>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default PhasesAndMilestones;
