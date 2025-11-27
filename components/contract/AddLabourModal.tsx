"use client";
import React, { useState } from "react";
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  NumberInput,
  Button,
  Group,
  Text,
} from "@mantine/core";
import { Plus, X } from "lucide-react";

interface LabourItem {
  id: string;
  name: string;
  description: string;
  amount: number;
  quantity: number;
}

interface AddLabourModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (labour: LabourItem) => void;
}

const AddLabourModal: React.FC<AddLabourModalProps> = ({
  opened,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: 0,
    quantity: 1,
  });

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    amount: "",
    quantity: "",
  });

  const validateForm = () => {
    const newErrors = {
      name: "",
      description: "",
      amount: "",
      quantity: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Labour name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = "Quantity must be at least 1";
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave({
        name: formData.name,
        description: formData.description,
        amount: formData.amount,
        quantity: formData.quantity,
        id: Date.now().toString(),
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        amount: 0,
        quantity: 1,
      });

      onClose();
    }
  };

  const handleClose = () => {
    // Reset form on close
    setFormData({
      name: "",
      description: "",
      amount: 0,
      quantity: 1,
    });
    setErrors({
      name: "",
      description: "",
      amount: "",
      quantity: "",
    });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text size="lg" fw={600}>
          Add Labour/Services
        </Text>
      }
      size="md"
      radius="lg"
      centered
    >
      <Stack gap="md">
        {/* Labour Name */}
        <TextInput
          label="Labour Name"
          placeholder="e.g., Mason, Plumber, Electrician"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.currentTarget.value })
          }
          error={errors.name}
          required
          size="md"
        />

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Describe the labour work to be done..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.currentTarget.value })
          }
          error={errors.description}
          required
          minRows={3}
          maxRows={6}
          size="md"
        />

        {/* Quantity and Amount */}
        <Group grow>
          <NumberInput
            label="Labour"
            placeholder="Number needed"
            value={formData.quantity}
            onChange={(value) =>
              setFormData({ ...formData, quantity: value as number })
            }
            error={errors.quantity}
            required
            min={1}
            size="md"
            description="Number of labourers needed"
          />

          <NumberInput
            label="Unit price (KES)"
            placeholder="Enter cost per labourer"
            value={formData.amount}
            onChange={(value) =>
              setFormData({ ...formData, amount: value as number })
            }
            error={errors.amount}
            required
            min={0}
            thousandSeparator=","
            size="md"
            leftSection={<Text size="sm">Ksh</Text>}
          />
        </Group>

        {/* Total Cost Display */}
        {formData.quantity > 0 && formData.amount > 0 && (
          <Group
            justify="space-between"
            p="sm"
            style={{ backgroundColor: "#f0fdf4", borderRadius: "8px" }}
          >
            <Text size="sm" fw={500} c="dimmed">
              Total Cost
            </Text>
            <Text size="lg" fw={700} c="green.7">
              Ksh {(formData.quantity * formData.amount).toLocaleString()}
            </Text>
          </Group>
        )}

        {/* Actions */}
        <Group justify="flex-end" mt="md">
          <Button
            variant="subtle"
            color="gray"
            leftSection={<X size={16} />}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            color="green.7"
            leftSection={<Plus size={16} />}
            onClick={handleSubmit}
          >
            Add Labour
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default AddLabourModal;
