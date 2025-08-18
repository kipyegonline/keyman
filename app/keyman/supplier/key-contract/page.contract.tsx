"use client";
import { getContracts } from "@/api/contract";
import { ContractChatBot } from "@/components/contract";

import ContractList from "@/components/contract/Contractlist";

import { getToken } from "@/providers/AppContext";
import { Container } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import React from "react";
export const kandarasi = [
  {
    id: "0198a018-fe7c-7316-8d9f-378c3fe06d90",
    code: "KMC003",
    initiator_id: 4,
    service_provider_id: null,
    status: "pending",
    pdf_path: null,
    contractor_signing_date: null,
    service_provider_signing_date: null,
    contract_duration_in_duration: 30,
    contract_amount: "100000.00",
    contract_json: {
      title: "Website build test",
      scope: "Design and development",
    },
    created_at: "2025-08-12T21:04:09.000000Z",
    updated_at: "2025-08-12T21:04:09.000000Z",
  },
  {
    id: "0198a08b-2c85-73a1-b714-46eb84270f1d",
    code: "KMC004",
    initiator_id: 4,
    service_provider_id: null,
    status: "pending",
    pdf_path: null,
    contractor_signing_date: null,
    service_provider_signing_date: null,
    contract_duration_in_duration: 0,
    contract_amount: "2500000.00",
    contract_json: {
      agreement_summary:
        "Build a cowshed for 10 cows with timber, mabati, and cemented floor structure.",
      payment_terms: "To be determined.",
      additional_terms: "",
    },
    created_at: "2025-08-12T23:08:52.000000Z",
    updated_at: "2025-08-12T23:08:52.000000Z",
  },
];

export default function SupplierContractPage() {
  const [showContract, setShowContract] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["customerContracts"],
    queryFn: async () => {
      const contracts = await getContracts();
      return contracts;
    },
  });
  const contracts = React.useMemo(() => {
    if (data && data?.status) return data?.contracts;
    return [];
  }, [data]);
  const handleCreateContract = () => {
    console.log("Create new contract......");
    setShowContract(true);
    // Navigate to contract creation page
  };
  const handleViewContract = (contractId: string) => {
    console.log("View contract:", contractId);
    // Navigate to contract details page
  };
  const handleDownloadContract = (contractId: string) => {
    console.log("Download contract:", contractId);
    // Trigger contract download
  };
  const handleShareContract = (contractId: string) => {
    console.log("Share contract:", contractId);
    // Open share modal
  };
  const token = getToken();
  return (
    <Container>
      {showContract && (
        <ContractChatBot
          userToken={token ?? ""}
          sessionId={token ?? ""}
          userType="supplier"
          supplierId={localStorage.getItem("supplier_id") ?? ""}
          onClose={() => setShowContract(false)}
        />
      )}

      <ContractList
        contracts={[...contracts]}
        userType="supplier"
        isLoading={isLoading}
        onCreateContract={handleCreateContract}
        onViewContract={handleViewContract}
        onDownloadContract={handleDownloadContract}
        onShareContract={handleShareContract}
      />
    </Container>
  );
}
