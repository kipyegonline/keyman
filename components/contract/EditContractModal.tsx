"use client";
import {
  Modal,
  Group,
  Text,
  Stack,
  TextInput,
  Button,
  NumberInput,
} from "@mantine/core";
import { FileText, X, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface ContractData {
  id: string;
  title: string;
  contract_amount: number;
  contract_duration_in_duration: number;
  service_provider_id?: string;
  contract_json?: {
    title?: string;
  };
}

interface EditContractModalProps {
  opened: boolean;
  onClose: () => void;
  contract: ContractData | null;
  onSave: (
    contractId: string,
    data: {
      title: string;
      contract_amount: number;
      contract_duration_in_duration: number;
      service_provider_id?: string;
    }
  ) => Promise<void>;
}

const EditContractModal: React.FC<EditContractModalProps> = ({
  opened,
  onClose,
  contract,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    contract_amount: 0,
    contract_duration_in_duration: 0,
    service_provider_id: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    contract_amount: "",
    contract_duration_in_duration: "",
  });

  // Reset form when contract changes or modal opens
  useEffect(() => {
    if (contract && opened) {
      setFormData({
        title: contract.contract_json?.title || contract.title || "",
        contract_amount: contract.contract_amount || 0,
        contract_duration_in_duration:
          contract.contract_duration_in_duration || 0,
        service_provider_id: "",
      });
      setErrors({
        title: "",
        contract_amount: "",
        contract_duration_in_duration: "",
      });
    }
  }, [contract, opened]);

  const validateForm = () => {
    const newErrors = {
      title: "",
      contract_amount: "",
      contract_duration_in_duration: "",
    };

    if (!formData.title.trim()) {
      newErrors.title = "Contract title is required";
    }

    if (formData.contract_amount <= 0) {
      newErrors.contract_amount = "Contract amount must be greater than 0";
    }

    if (formData.contract_duration_in_duration <= 0) {
      newErrors.contract_duration_in_duration =
        "Duration must be greater than 0 months";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async () => {
    if (!contract || !validateForm()) return;

    setIsLoading(true);
    try {
      const payload: {
        title: string;
        contract_amount: number;
        contract_duration_in_duration: number;
        service_provider_id?: string;
      } = {
        title: formData.title.trim(),
        contract_amount: formData.contract_amount,
        contract_duration_in_duration: formData.contract_duration_in_duration,
      };
      if (formData.service_provider_id?.trim() !== "") {
        payload.service_provider_id = formData.service_provider_id?.trim();
      }
      await onSave(contract.id, payload);
      // Don't automatically close the modal here
      // Let the parent component handle closing on success
    } catch (error) {
      console.error("Error saving contract:", error);
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

  const formatDuration = (months: number) => {
    if (months < 12) {
      return `${months} month${months !== 1 ? "s" : ""}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? "s" : ""}`;
      }
      return `${years} year${years !== 1 ? "s" : ""} ${remainingMonths} month${
        remainingMonths !== 1 ? "s" : ""
      }`;
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <FileText size={20} className="text-gray-600" />
          <Text fw={600} size="lg">
            Edit Contract
          </Text>
        </Group>
      }
      size="md"
      radius="lg"
      centered
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
    >
      {contract && (
        <Stack gap="md">
          <Group gap="sm" mb="sm">
            <Text size="sm" c="dimmed">
              Editing contract:
            </Text>
            <Text size="sm" fw={500}>
              {contract.id}
            </Text>
          </Group>

          <TextInput
            label="Contract Title"
            placeholder="Enter contract title"
            value={formData.title}
            onChange={(event) =>
              setFormData({ ...formData, title: event.currentTarget.value })
            }
            error={errors.title}
            required
            disabled={isLoading}
          />

          <NumberInput
            label="Contract Amount"
            placeholder="Enter contract amount"
            value={formData.contract_amount}
            onChange={(value) =>
              setFormData({ ...formData, contract_amount: Number(value) || 0 })
            }
            error={errors.contract_amount}
            required
            min={0}
            prefix="KES "
            thousandSeparator=","
            decimalScale={2}
            disabled={isLoading}
            description={
              formData.contract_amount > 0
                ? `Formatted: ${formatCurrency(formData.contract_amount)}`
                : ""
            }
          />

          <NumberInput
            label="Contract Duration (Months)"
            placeholder="Enter duration in months"
            value={formData.contract_duration_in_duration}
            onChange={(value) =>
              setFormData({
                ...formData,
                contract_duration_in_duration: Number(value) || 0,
              })
            }
            error={errors.contract_duration_in_duration}
            required
            min={1}
            max={240} // 20 years max
            disabled={isLoading}
            description={
              formData.contract_duration_in_duration > 0
                ? `Duration: ${formatDuration(
                    formData.contract_duration_in_duration
                  )}`
                : "Enter duration in months (e.g., 12 for 1 year)"
            }
          />
          <TextInput
            disabled={isLoading}
            label="Enter service provider number (KS number)"
            value={formData.service_provider_id}
            placeholder="Enter service provider number"
            onChange={(event) =>
              setFormData({
                ...formData,
                service_provider_id: event.currentTarget.value,
              })
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
              disabled={
                !formData.title.trim() ||
                formData.contract_amount <= 0 ||
                formData.contract_duration_in_duration <= 0
              }
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
};

export default EditContractModal;
