"use client";
import {
  Modal,
  Group,
  Text,
  Stack,
  Textarea,
  Button,
  Select,
} from "@mantine/core";
import { AlertTriangle, X, Send } from "lucide-react";
import { useState, useEffect } from "react";

interface Milestone {
  id: string;
  name: string;
  status: string;
}

interface RaiseComplaintModalProps {
  opened: boolean;
  onClose: () => void;
  contractId: string;
  milestones: Milestone[];
  onSubmit: (data: {
    contract_id: string;
    milestone_id: string;
    reason: string;
    summary: string;
    complainant_type?: string;
  }) => Promise<void>;
  usertype?: string;
}

const RaiseComplaintModal: React.FC<RaiseComplaintModalProps> = ({
  opened,
  onClose,
  contractId,
  milestones,
  onSubmit,
  usertype,
}) => {
  const [formData, setFormData] = useState({
    milestone_id: "",
    reason: "",
    summary: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    milestone_id: "",
    reason: "",
    summary: "",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (opened) {
      setFormData({
        milestone_id: "",
        reason: "",
        summary: "",
      });
      setErrors({
        milestone_id: "",
        reason: "",
        summary: "",
      });
    }
  }, [opened]);

  const validateForm = () => {
    const newErrors = {
      milestone_id: "",
      reason: "",
      summary: "",
    };

    if (!formData.milestone_id) {
      newErrors.milestone_id = "Please select a milestone";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Reason is required";
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = "Reason must be at least 10 characters";
    }

    if (!formData.summary.trim()) {
      newErrors.summary = "Summary is required";
    } else if (formData.summary.trim().length < 20) {
      newErrors.summary = "Summary must be at least 20 characters";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit({
        contract_id: contractId,
        milestone_id: formData.milestone_id,
        reason: formData.reason.trim(),
        summary: formData.summary.trim(),
        complainant_type: usertype === "supplier" ? "supplier" : "customer",
      });
    } catch (error) {
      console.error("Error submitting complaint:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Prepare milestone options for Select
  const milestoneOptions = milestones.map((milestone) => ({
    value: milestone.id,
    label: milestone.name,
  }));

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <AlertTriangle size={20} className="text-orange-500" />
          <Text fw={600} size="lg">
            Raise a Complaint
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
          Please provide details about your complaint. Our team will review and
          respond within 24-48 hours.
        </Text>

        <Select
          label="Select Milestone"
          placeholder="Choose the milestone related to your complaint"
          data={milestoneOptions}
          value={formData.milestone_id}
          onChange={(value) =>
            setFormData({ ...formData, milestone_id: value || "" })
          }
          error={errors.milestone_id}
          required
          disabled={isLoading}
          searchable
          nothingFoundMessage="No milestones found"
        />

        <Textarea
          label="Reason for Complaint"
          placeholder="Briefly describe the reason for your complaint..."
          value={formData.reason}
          onChange={(event) =>
            setFormData({
              ...formData,
              reason: event.currentTarget.value,
            })
          }
          error={errors.reason}
          required
          minRows={2}
          maxRows={4}
          disabled={isLoading}
        />

        <Textarea
          label="Detailed Summary"
          placeholder="Provide a detailed summary of your complaint, including any relevant dates, conversations, or evidence..."
          value={formData.summary}
          onChange={(event) =>
            setFormData({
              ...formData,
              summary: event.currentTarget.value,
            })
          }
          error={errors.summary}
          required
          minRows={4}
          maxRows={8}
          disabled={isLoading}
        />

        <Group justify="flex-end" gap="sm" mt="md">
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
            style={{ backgroundColor: "#F08C23" }}
            leftSection={<Send size={16} />}
            onClick={handleSubmit}
            loading={isLoading}
          >
            Submit Complaint
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default RaiseComplaintModal;
