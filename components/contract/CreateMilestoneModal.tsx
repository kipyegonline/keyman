"use client";
import {
  Modal,
  Group,
  Text,
  Stack,
  TextInput,
  Textarea,
  Button,
  NumberInput,
} from "@mantine/core";
import { Plus, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { DatePickerInput } from "@mantine/dates";

interface CreateMilestoneModalProps {
  opened: boolean;
  onClose: () => void;
  contractId: string;
  onSave: (data: {
    keyman_contract_id: string;
    name: string;
    description: string;
    status: string;
    start_date: string;
    end_date: string;
    amount: number;
  }) => Promise<void>;
}

const CreateMilestoneModal: React.FC<CreateMilestoneModalProps> = ({
  opened,
  onClose,
  contractId,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: 0,
    start_date: null as Date | null,
    end_date: null as Date | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    amount: "",
    start_date: "",
    end_date: "",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (opened) {
      setFormData({
        name: "",
        description: "",
        amount: 0,
        start_date: null,
        end_date: null,
      });
      setErrors({
        name: "",
        description: "",
        amount: "",
        start_date: "",
        end_date: "",
      });
    }
  }, [opened]);

  const validateForm = () => {
    const newErrors = {
      name: "",
      description: "",
      amount: "",
      start_date: "",
      end_date: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Milestone name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }

    if (
      formData.start_date &&
      formData.end_date &&
      formData.start_date >= formData.end_date
    ) {
      newErrors.end_date = "End date must be after start date";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      console.log(formData);
      await onSave({
        keyman_contract_id: contractId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: "pending",
        start_date: new Date(formData.start_date!).toISOString(),
        end_date: new Date(formData.end_date!).toISOString(),
        amount: formData.amount,
      });
    } catch (error) {
      console.error("Error creating milestone:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <Plus size={20} className="text-gray-600" />
          <Text fw={600} size="lg">
            Create New Milestone
          </Text>
        </Group>
      }
      size="md"
      radius="lg"
      centered
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed" mb="sm">
          Create a new milestone for this contract
        </Text>

        <TextInput
          label="Milestone Name"
          placeholder="e.g., Design Phase"
          value={formData.name}
          onChange={(event) =>
            setFormData({ ...formData, name: event.currentTarget.value })
          }
          error={errors.name}
          required
          disabled={isLoading}
        />

        <Textarea
          label="Description"
          placeholder="e.g., Complete UI/UX designs"
          value={formData.description}
          onChange={(event) =>
            setFormData({
              ...formData,
              description: event.currentTarget.value,
            })
          }
          error={errors.description}
          required
          minRows={3}
          maxRows={5}
          disabled={isLoading}
        />

        <NumberInput
          label="Amount"
          placeholder="Enter milestone amount"
          value={formData.amount}
          onChange={(value) =>
            setFormData({ ...formData, amount: Number(value) || 0 })
          }
          error={errors.amount}
          min={0}
          prefix="KES "
          thousandSeparator=","
          decimalScale={2}
          disabled={isLoading}
          description={
            formData.amount > 0
              ? `Formatted: ${formatCurrency(formData.amount)}`
              : "Enter the milestone payment amount"
          }
          required
        />

        <Group grow>
          <DatePickerInput
            label="Start Date"
            placeholder="Select start date"
            value={formData.start_date}
            onChange={(date) =>
              setFormData({ ...formData, start_date: date as unknown as Date })
            }
            error={errors.start_date}
            required
            disabled={isLoading}
            minDate={new Date()}
          />

          <DatePickerInput
            label="End Date"
            placeholder="Select end date"
            value={formData.end_date}
            onChange={(date) =>
              setFormData({ ...formData, end_date: date as unknown as Date })
            }
            error={errors.end_date}
            required
            disabled={isLoading}
            minDate={formData.start_date || new Date()}
          />
        </Group>

        <Group justify="space-between" mt="lg">
          <Button
            variant="light"
            color="gray"
            leftSection={<X size={16} />}
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            color="#3D6B2C"
            leftSection={<Check size={16} />}
            onClick={handleSubmit}
            loading={isLoading}
            disabled={
              !formData.name.trim() ||
              !formData.description.trim() ||
              formData.amount <= 0 ||
              !formData.start_date ||
              !formData.end_date
            }
          >
            Create Milestone
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default CreateMilestoneModal;
