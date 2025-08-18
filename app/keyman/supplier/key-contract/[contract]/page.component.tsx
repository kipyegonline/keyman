"use client";
import React from "react";
import { Container, Loader, Text, Alert, Breadcrumbs } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { getContractDetails } from "@/api/contract";
import ContractDetails from "@/components/contract/contractDetails";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { ContractChatBot } from "@/components/contract";
import { getToken } from "@/providers/AppContext";

export default function ClientContractPage({
  contractId,
}: {
  contractId: string;
}) {
  const [showContract, setShowContract] = React.useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ["contract", contractId],
    queryFn: async () => await getContractDetails(contractId),
  });

  const contract = React.useMemo(() => {
    if (data && data?.status) {
      return data.contract;
    }
    return null;
  }, [data]);

  const breadcrumbs = (
    <Breadcrumbs separator="/">
      <Link href="/keyman/supplier/key-contract" className="text-keyman-green">
        Contracts
      </Link>
      <Link href="/" inert>
        Contract {contract?.code ?? ""}
      </Link>
    </Breadcrumbs>
  );
  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader size="lg" className="mx-auto mb-4" />
            <Text size="lg" c="gray.6">
              Loading contract details...
            </Text>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        {breadcrumbs}
        <Alert
          icon={<AlertCircle size={16} />}
          title="Error Loading Contract"
          color="red"
          radius="md"
        >
          <Text size="sm">
            Unable to load contract details. Please try again later.
          </Text>
        </Alert>
      </Container>
    );
  }

  if (!contract) {
    return (
      <Container className="py-8">
        {breadcrumbs}
        <Alert
          icon={<AlertCircle size={16} />}
          title="Contract Not Found"
          color="orange"
          radius="md"
        >
          <Text size="sm">The requested contract could not be found.</Text>
        </Alert>
      </Container>
    );
  }
  const token = getToken();
  return (
    <Container size="xl" className="py-6">
      {breadcrumbs}
      {showContract && (
        <ContractChatBot
          userToken={token ?? ""}
          sessionId={token ?? ""}
          contractId={contract.id}
          userType="supplier"
          supplierId={localStorage.getItem("supplier_id") ?? ""}
          onClose={() => setShowContract(false)}
        />
      )}
      <ContractDetails
        contract={contract}
        userType="supplier" // You can determine this based on user context
        onEdit={() => {
          // Handle edit action
          console.log("Edit contract:", contract.id);
        }}
        onViewDocuments={() => {
          // Handle view documents action
          console.log("View documents for contract:", contract.id);
        }}
        onShare={() => {
          // Handle share action
          console.log("Share contract:", contract.id);
        }}
        handleChat={() => {
          setShowContract(true);
        }}
      />
    </Container>
  );
}
