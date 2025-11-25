"use client";
import React, { useState } from "react";
import {
  TextInput,
  NumberInput,
  Textarea,
  Button,
  Card,
  Stack,
  Group,
  Title,
  Text,
  Alert,
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
//import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { createContract } from "@/api/contract";
import { notify } from "@/lib/notifications";

interface ContractFormData {
  service_provider_id: string;
  contract_duration_in_duration: number;
  contract_amount: number;
  title: string;
  scope: string;
}

interface CreateContractFormProps {
  keymanId?: string | null;
  onComplete?: (data: ContractFormData) => void;
  initialData?: ContractFormData | null;
  storeName?: string | null;
}

const CreateContractForm: React.FC<CreateContractFormProps> = ({
  keymanId,
  onComplete,
  initialData,
  storeName,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<ContractFormData>({
    initialValues: {
      service_provider_id: initialData?.service_provider_id || keymanId || "",
      contract_duration_in_duration:
        initialData?.contract_duration_in_duration || 0,
      contract_amount: initialData?.contract_amount || 0,
      title: initialData?.title || "",
      scope: initialData?.scope || "",
    },
    validate: {
      /* service_provider_id: (value) =>
        !value.trim() ? "Service Provider ID is required" : null, */
      // contract_amount: (value) =>
      //    !value || value <= 0 ? "Contract amount must be greater than 0" : null,
      //  contract_duration_in_duration: (value) =>
      //      !value || value <= 0 ? "Duration must be greater than 0" : null,
      title: (value) => (!value.trim() ? "Contract title is required" : null),
      scope: (value) => (!value.trim() ? "Project scope is required" : null),
    },
  });
  React.useEffect(() => {
    if (keymanId) {
      form.setFieldValue("service_provider_id", keymanId);
    }
  }, [keymanId]);
  const handleSubmit = async (values: ContractFormData) => {
    setIsLoading(true);

    try {
      // If onComplete is provided, use wizard mode
      if (onComplete) {
        onComplete(values);
        setIsLoading(false);
        return;
      }

      // Original flow - create contract directly
      const contractData = {
        service_provider_id: values.service_provider_id,
        status: "pending",
        contract_duration_in_duration: values.contract_duration_in_duration,
        contract_amount: values.contract_amount,
        contract_json: JSON.stringify({
          title: values.title,
          scope: values.scope,
        }),
      };

      const response = await createContract(contractData);

      if (response.status) {
        notify.success("Contract created successfully");

        // Redirect back to contracts list
        router.push(`/keyman/dashboard/key-contract/${response?.contract?.id}`);
      } else {
        notify.error(
          response.message || "Failed to create contract. Please try again."
        );
      }
    } catch (error) {
      console.error("Error creating contract:", error);
      notify.error("Failed to create contract. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      shadow="sm"
      padding="xl"
      radius="lg"
      withBorder
      className="max-w-2xl mx-auto"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {/* Header */}
          <Title order={2} className="text-gray-800">
            Contract Details
          </Title>

          <Alert
            color="green"
            title="Contract Information"
            icon={<CheckCircle size={16} />}
          >
            <Text size="sm">
              Fill out all the required information to create your contract. The
              service provider will be notified once the contract is created.
            </Text>
          </Alert>

          {/* Contract Information */}
          <div>
            <Title order={4} className="text-gray-700 mb-3">
              Contract Information
            </Title>
            <Stack gap="md">
              <TextInput
                label="Project Title"
                placeholder="e.g., Website Development"
                description="Brief title describing the project"
                required
                {...form.getInputProps("title")}
                disabled={isLoading}
              />

              <Textarea
                label="Project Scope"
                placeholder="Describe the project scope, deliverables, and requirements..."
                description="Detailed description of what work will be performed"
                required
                minRows={4}
                {...form.getInputProps("scope")}
                disabled={isLoading}
              />

              {false && (
                <Group grow>
                  <NumberInput
                    label="Contract Amount (KES)"
                    placeholder="100000"
                    description="Total contract value in Kenyan Shillings"
                    required
                    min={1}
                    step={1000}
                    thousandSeparator=","
                    {...form.getInputProps("contract_amount")}
                    disabled={isLoading}
                  />

                  <NumberInput
                    label="Duration (Days)"
                    placeholder="30"
                    description="Contract duration in days"
                    required
                    min={1}
                    {...form.getInputProps("contract_duration_in_duration")}
                    disabled={isLoading}
                  />
                </Group>
              )}
            </Stack>
            {/* Service Provider Information */}
            <div className="mt-4">
              <Title order={4} className="text-gray-700 mb-3">
                Service Provider Information
              </Title>
              {storeName && (
                <Alert
                  color="orange"
                  title="Selected Store"
                  icon={<CheckCircle size={16} />}
                  mb="md"
                >
                  <Text size="sm" fw={600}>
                    {storeName}
                  </Text>
                </Alert>
              )}
              <TextInput
                label="Service Provider ID (optional)"
                readOnly={!!keymanId}
                placeholder="Enter KS number (e.g., KS12345)"
                description="Enter the unique KS number for your service provider"
                // required
                {...form.getInputProps("service_provider_id")}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Group justify="flex-end" className="pt-4">
            {!onComplete && (
              <Button
                variant="outline"
                color="orange"
                onClick={() => router.push("/keyman/dashboard/key-contract")}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              loading={isLoading}
              color="green"
              className="bg-green-600 hover:bg-green-700 transition-colors duration-300"
              leftSection={
                isLoading ? <Loader size={16} /> : <CheckCircle size={16} />
              }
            >
              {isLoading
                ? "Creating Contract..."
                : onComplete
                ? "Continue"
                : "Create Contract"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
};

export default CreateContractForm;
