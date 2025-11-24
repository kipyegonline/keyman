"use client";
import React, { useState } from "react";
import {
  Container,
  Stepper,
  Box,
  Paper,
  Stack,
  Button,
  Group,
} from "@mantine/core";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import CreateContractForm from "./CreateContractForm";
import StoreSearch from "./StoreSearch";
import PhasesAndMilestones from "./PhasesAndMilestones";
import ReviewAndSubmit from "./ReviewAndSubmit";

interface ContractWizardProps {
  keymanId?: string | null;
  supplier: ISupplierContact | null;
}

interface ContractData {
  service_provider_id: string;
  contract_duration_in_duration: number;
  contract_amount: number;
  title: string;
  scope: string;
}

interface Phase {
  id: string;
  name: string;
  description?: string;
  milestones: Milestone[];
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

const ContractWizard: React.FC<ContractWizardProps> = ({
  keymanId,
  supplier,
}) => {
  const [active, setActive] = useState(0);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [selectedStore, setSelectedStore] = useState<ISupplierContact | null>(
    null
  );
  const [phases, setPhases] = useState<Phase[]>([]);
  React.useEffect(() => {
    if (supplier) {
      setSelectedStore(supplier);
      setActive(1);
    }
  }, [supplier]);

  const handleContractComplete = (data: ContractData) => {
    setContractData(data);
    setActive(2);
  };

  const handleStoreSelect = (store: ISupplierContact) => {
    setSelectedStore(store);
    setActive(1);
  };

  const handlePhasesComplete = (phasesData: Phase[]) => {
    setPhases(phasesData);
    setActive(3);
  };

  const handleBack = (step: number) => {
    setActive(step);
  };

  const router = useRouter();

  const handleBackToContracts = () => {
    router.push("/keyman/dashboard/key-contract");
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Back to Contracts Button */}
        <Group justify="flex-end">
          <Button
            variant="light"
            color="orange"
            leftSection={<ArrowLeft size={16} />}
            onClick={handleBackToContracts}
          >
            Back to Contracts
          </Button>
        </Group>

        {/* Stepper */}
        <Paper shadow="xs" p="md" radius="lg">
          <Stepper
            active={active}
            onStepClick={setActive}
            size="md"
            radius="md"
            color="green.7"
            completedIcon={<CheckCircle2 size={20} />}
          >
            <Stepper.Step label="Select Store" description="Choose a store">
              {/* Step 0 content is rendered below */}
            </Stepper.Step>
            <Stepper.Step
              label="Contract Details"
              description="Basic information"
            >
              {/* Step 1 content is rendered below */}
            </Stepper.Step>
            <Stepper.Step
              label="Phases & Milestones"
              description="Define deliverables"
            >
              {/* Step 2 content is rendered below */}
            </Stepper.Step>
            <Stepper.Step
              label="Review & Submit"
              description="Final confirmation"
            >
              {/* Step 3 content is rendered below */}
            </Stepper.Step>
          </Stepper>
        </Paper>

        {/* Step Content */}
        <Box>
          {active === 0 && (
            <StoreSearch
              onComplete={handleStoreSelect}
              onBack={() => window.history.back()}
              initialStoreId={keymanId}
            />
          )}

          {active === 1 && (
            <CreateContractForm
              keymanId={selectedStore?.keyman_number || null}
              onComplete={handleContractComplete}
            />
          )}

          {active === 2 && (
            <PhasesAndMilestones
              contractData={contractData}
              onComplete={handlePhasesComplete}
              onBack={() => handleBack(1)}
              supplier={selectedStore}
            />
          )}

          {active === 3 && (
            <ReviewAndSubmit
              contractData={contractData}
              phases={phases}
              onBack={() => handleBack(2)}
            />
          )}
        </Box>
      </Stack>
    </Container>
  );
};

export default ContractWizard;
