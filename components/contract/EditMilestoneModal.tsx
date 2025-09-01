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
import { Edit, X, Check } from "lucide-react";
import { useState, useEffect } from "react";

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

interface EditMilestoneModalProps {
  opened: boolean;
  onClose: () => void;
  milestone: Milestone | null;
  onSave: (
    milestoneId: string,
    data: {
      name: string;
      description: string;
      amount?: number;
      action?: string;
    }
  ) => Promise<void>;
}

const EditMilestoneModal: React.FC<EditMilestoneModalProps> = ({
  opened,
  onClose,
  milestone,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    amount: "",
  });

  // Reset form when milestone changes or modal opens
  useEffect(() => {
    if (milestone && opened) {
      setFormData({
        name: milestone.name || "",
        description: milestone.description || "",
        amount: milestone.amount || 0,
      });
      setErrors({ name: "", description: "", amount: "" });
    }
  }, [milestone, opened]);

  const validateForm = () => {
    const newErrors = {
      name: "",
      description: "",
      amount: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Milestone name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.amount < 0) {
      newErrors.amount = "Amount cannot be negative";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async () => {
    if (!milestone || !validateForm()) return;

    setIsLoading(true);
    try {
      await onSave(milestone.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        amount: formData.amount > 0 ? formData.amount : undefined,
      });
      // Don't automatically close the modal here
      // Let the parent component (ContractDetails) handle closing on success
    } catch (error) {
      console.error("Error saving milestone:", error);
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
          <Edit size={20} className="text-gray-600" />
          <Text fw={600} size="lg">
            Edit Milestone
          </Text>
        </Group>
      }
      size="md"
      radius="lg"
      centered
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
    >
      {milestone && (
        <Stack gap="md">
          <Group gap="sm" mb="sm">
            <Text size="sm" c="dimmed">
              Editing milestone:
            </Text>
            <Text size="sm" fw={500}>
              {milestone.title}
            </Text>
          </Group>

          <TextInput
            label="Milestone Name"
            placeholder="Enter milestone name"
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
            placeholder="Enter milestone description"
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
            placeholder="Enter amount (optional)"
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
                : "Leave as 0 to remove amount"
            }
          />

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
              disabled={!formData.name.trim() || !formData.description.trim()}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
};

export default EditMilestoneModal;
