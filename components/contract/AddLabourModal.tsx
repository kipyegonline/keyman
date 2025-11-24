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
}

interface AddLabourModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (labour: Omit<LabourItem, "id">) => void;
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
  });

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    amount: "",
  });

  const validateForm = () => {
    const newErrors = {
      name: "",
      description: "",
      amount: "",
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

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave({
        name: formData.name,
        description: formData.description,
        amount: formData.amount,
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        amount: 0,
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
    });
    setErrors({
      name: "",
      description: "",
      amount: "",
    });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text size="lg" fw={600}>
          Add Labour
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

        {/* Amount */}
        <NumberInput
          label="Amount (KES)"
          placeholder="Enter labour cost"
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
