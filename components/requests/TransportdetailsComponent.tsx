import React, { useState, useEffect } from "react";
import {
  Checkbox,
  Select,
  NumberInput,
  Button,
  Card,
  Text,
  Group,
  Stack,
  Divider,
  Badge,
  ActionIcon,
  Collapse,
  Alert,
  Grid,
  Paper,
  ThemeIcon,
  Transition,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  Truck,
  //MapPin,
  DollarSign,
  Package,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Bike,
  Car,
  Navigation,
  Calculator,
} from "lucide-react";
import DistanceCalculator from "./Distancecalculator";

// Types
interface TransportDetails {
  offers_transport: boolean;
  transport_type: "SUPPLIER_DELIVERY" | "KEYMAN_DELIVERY" | "";
  transport_vehicle: "motorbike" | "tuktuk" | "pickup" | "truck";
  transport_cost: number;
  transport_distance: number;
  minimum_quantity: number;
}

interface TransportFormProps {
  onTransportChange: (data: TransportDetails) => void;
  onSubmit: (payload: TransportDetails) => void;
  isSubmitting?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  coords: [number, number];
}
const defaultState: TransportDetails = {
  offers_transport: false,
  transport_type: "SUPPLIER_DELIVERY",
  transport_vehicle: "tuktuk",
  transport_cost: 0,
  transport_distance: 1,
  minimum_quantity: 0,
};

const TransportDetailsForm: React.FC<TransportFormProps> = ({
  onTransportChange,
  onSubmit,
  isSubmitting = false,
  isOpen,
  onToggle,
  coords,
}) => {
  const [showTransportFields, setShowTransportFields] = useState(false);

  const form = useForm<TransportDetails>({
    initialValues: defaultState,
    validate: {
      transport_type: (value, values) => {
        if (values.offers_transport && !value) {
          return "Transport type is required when offering transport";
        }
        return null;
      },
      transport_cost: (value, values) => {
        if (values.offers_transport && (!value || value <= 0)) {
          return "Transport cost must be greater than 0";
        }
        return null;
      },
      transport_distance: (value, values) => {
        if (values.offers_transport && (!value || value <= 0)) {
          return "Transport distance must be greater than 0";
        }
        return null;
      },
      minimum_quantity(value, values) {
        if (values.offers_transport && (!value || value <= 0)) {
          return "Minimum quantity must be greater than 0";
        }
        return null;
      },
    },
  });

  // Vehicle options with icons and descriptions
  const vehicleOptions = [
    {
      value: "motorbike",
      label: "Motorbike",
      icon: Bike,
      description: "Small items, quick delivery",
      capacity: "Up to 50kg",
    },
    {
      value: "tuktuk",
      label: "Tuk Tuk",
      icon: Car,
      description: "Medium items, city delivery",
      capacity: "Up to 300kg",
    },
    {
      value: "pickup",
      label: "Pickup Truck",
      icon: Truck,
      description: "Large items, versatile",
      capacity: "Up to 1000kg",
    },
    {
      value: "truck",
      label: "Truck",
      icon: Truck,
      description: "Heavy items, bulk delivery",
      capacity: "Up to 5000kg",
    },
  ];

  const transportTypeOptions = [
    {
      value: "SUPPLIER_DELIVERY",
      label: "Supplier Delivery",
      description: "We deliver directly to customer",
    },
    {
      value: "KEYMAN_DELIVERY",
      label: "Keyman Delivery",
      description: "Keyman handles the delivery",
    },
  ];

  // Update parent component when form values change
  useEffect(() => {
    onTransportChange(form.values);
  }, [form.values, onTransportChange]);

  // Handle transport offer toggle
  const handleTransportToggle = (checked: boolean) => {
    form.setFieldValue("offers_transport", checked);
    setShowTransportFields(checked);

    if (!checked) {
      // Reset transport fields when unchecked
      form.setValues(defaultState);
    }
  };

  const handleSubmit = () => {
    const validation = form.validate();
    if (!validation.hasErrors) {
      onSubmit(form.values);
    }
  };

  const selectedVehicle = vehicleOptions.find(
    (v) => v.value === form.values.transport_vehicle
  );
  const selectedTransportType = transportTypeOptions.find(
    (t) => t.value === form.values.transport_type
  );

  return (
    <div className="w-full">
      {/* Transport Section Header */}
      <Paper
        className="mb-4 border border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 hover:shadow-md transition-all duration-300"
        p="md"
      >
        <Group justify="space-between" align="center">
          <Group>
            <ThemeIcon size="lg" radius="md" className="bg-[#3D6B2C]">
              <Truck size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={600} className="text-gray-800">
                Transport & Delivery
              </Text>
              <Text size="sm" c="dimmed">
                Configure delivery options for your quote
              </Text>
            </div>
          </Group>
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={onToggle}
            className="text-[#3D6B2C] hover:bg-[#3D6B2C]/10"
          >
            {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </ActionIcon>
        </Group>
      </Paper>

      {/* Collapsible Transport Form */}
      <Collapse in={isOpen}>
        <Card className="border border-gray-200 shadow-lg">
          <div>
            <Stack gap="lg">
              {/* Transport Offer Toggle */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                <Checkbox
                  label={
                    <div className="ml-2">
                      <Text size="md" fw={500} className="text-gray-800">
                        I offer transport/delivery services
                      </Text>
                      <Text size="sm" c="dimmed">
                        Check this if you can deliver items to the customer
                      </Text>
                    </div>
                  }
                  checked={form.values.offers_transport}
                  onChange={(event) =>
                    handleTransportToggle(event.currentTarget.checked)
                  }
                  className="items-start"
                  styles={{
                    input: {
                      backgroundColor: "#3D6B2C",
                      borderColor: "#3D6B2C",
                    },
                  }}
                />
              </div>

              {/* Transport Details Fields */}
              <Transition
                mounted={showTransportFields}
                timingFunction="slide-down"
                duration={300}
              >
                {(styles) => (
                  <div style={styles}>
                    <Stack gap="md">
                      <Divider
                        label="Transport Details"
                        labelPosition="center"
                      />

                      <Grid>
                        {/* Transport Type */}
                        <Grid.Col span={{ base: 12, md: 6 }}>
                          <Select
                            display={"none"}
                            label={
                              <Group gap="xs">
                                <Package size={16} className="text-[#3D6B2C]" />
                                <Text size="sm" fw={500}>
                                  Minimum
                                </Text>
                              </Group>
                            }
                            placeholder="Select transport type"
                            data={transportTypeOptions.map((option) => ({
                              value: option.value,
                              label: option.label,
                            }))}
                            {...form.getInputProps("transport_type")}
                            className="transition-all duration-200 hover:scale-[1.02]"
                          />
                          {selectedTransportType && (
                            <Text size="xs" c="dimmed" mt={4}>
                              {selectedTransportType.description}
                            </Text>
                          )}
                          {/**minimum quantity */}
                          <TextInput
                            label={
                              <Group gap="xs">
                                <Package size={16} className="text-[#3D6B2C]" />
                                <Text size="sm" fw={500}>
                                  Enter minimum quantity (KES)
                                </Text>
                              </Group>
                            }
                            {...form.getInputProps("minimum_quantity")}
                            className="transition-all duration-200 hover:scale-[1.02]"
                            placeholder="Minimum quantity quote"
                          />
                        </Grid.Col>

                        {/* Transport Vehicle */}
                        <Grid.Col span={{ base: 12, md: 6 }}>
                          <Select
                            label={
                              <Group gap="xs">
                                <Car size={16} className="text-[#3D6B2C]" />
                                <Text size="sm" fw={500}>
                                  Vehicle Type
                                </Text>
                              </Group>
                            }
                            placeholder="Select vehicle"
                            data={vehicleOptions.map((option) => ({
                              value: option.value,
                              label: option.label,
                            }))}
                            {...form.getInputProps("transport_vehicle")}
                            className="transition-all duration-200 hover:scale-[1.02]"
                          />
                          {selectedVehicle && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-md">
                              <Text size="xs" c="dimmed">
                                {selectedVehicle.description}
                              </Text>
                              <Badge
                                size="xs"
                                variant="light"
                                color="blue"
                                mt={2}
                              >
                                {selectedVehicle.capacity}
                              </Badge>
                            </div>
                          )}
                        </Grid.Col>

                        {/* Transport Cost */}
                        <Grid.Col span={{ base: 12, md: 6 }}>
                          <NumberInput
                            label={
                              <Group gap="xs">
                                <DollarSign
                                  size={16}
                                  className="text-[#3D6B2C]"
                                />
                                <Text size="sm" fw={500}>
                                  Transport Cost (KES)
                                </Text>
                              </Group>
                            }
                            placeholder="Enter cost"
                            min={0}
                            step={50}
                            {...form.getInputProps("transport_cost")}
                            className="transition-all duration-200 hover:scale-[1.02]"
                            leftSection={<Text size="sm">KES</Text>}
                          />
                        </Grid.Col>

                        {/* Transport Distance */}
                        <Grid.Col span={{ base: 12, md: 6 }}>
                          {form.values.offers_transport && (
                            <DistanceCalculator
                              coords={coords}
                              sendDistance={(distance) =>
                                form.setFieldValue(
                                  "transport_distance",
                                  distance
                                )
                              }
                            />
                          )}
                          {form.values.transport_distance > 0 && (
                            <Text c="dimmed" size="sm">
                              Distance:
                              {form.values.transport_distance.toLocaleString()}
                              {"  km"}
                            </Text>
                          )}
                          <NumberInput
                            label={
                              <Group gap="xs">
                                <Navigation
                                  size={16}
                                  className="text-[#3D6B2C]"
                                />
                                <Text size="sm" fw={500}>
                                  Distance (KM)
                                </Text>
                              </Group>
                            }
                            placeholder="Enter distance"
                            min={0}
                            disabled
                            step={0.5}
                            decimalScale={1}
                            {...form.getInputProps("transport_distance")}
                            className="transition-all duration-200 hover:scale-[1.02] hidden"
                            leftSection={<Text size="sm">KM</Text>}
                          />
                        </Grid.Col>
                      </Grid>

                      {/* Cost Calculation Summary */}
                      {form.values.transport_cost > 0 &&
                        form.values.transport_distance > 0 && (
                          <Alert
                            icon={<Calculator size={16} />}
                            color="blue"
                            variant="light"
                            className="bg-blue-50 border-blue-200"
                          >
                            <Group justify="space-between">
                              <Text size="sm">
                                Cost per KM:{" "}
                                <strong>
                                  KES{" "}
                                  {(
                                    form.values.transport_cost /
                                    form.values.transport_distance
                                  ).toFixed(2)}
                                </strong>
                              </Text>
                              <Badge color="blue" variant="light">
                                Total: KES {form.values.transport_cost}
                              </Badge>
                            </Group>
                          </Alert>
                        )}
                    </Stack>
                  </div>
                )}
              </Transition>

              <Divider />

              {/* Submit Button */}
              <Group justify="space-between" align="center">
                <div>
                  {form.values.offers_transport ? (
                    <Group gap="xs">
                      <CheckCircle size={16} className="text-green-500" />
                      <Text size="sm" c="green">
                        Transport service included
                      </Text>
                    </Group>
                  ) : (
                    <Group gap="xs">
                      <AlertCircle size={16} className="text-gray-400" />
                      <Text size="sm" c="dimmed">
                        No transport service
                      </Text>
                    </Group>
                  )}
                </div>

                <Button
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  size="md"
                  className="bg-[#F08C23] hover:bg-[#e67e1a] transition-all duration-200 hover:scale-105"
                  rightSection={<Package size={16} />}
                >
                  {isSubmitting ? "Submitting Quote..." : "Submit Quote"}
                </Button>
              </Group>
            </Stack>
          </div>
        </Card>
      </Collapse>
    </div>
  );
};

export default TransportDetailsForm;
