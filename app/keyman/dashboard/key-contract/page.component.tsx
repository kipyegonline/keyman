"use client";
import { getContracts } from "@/api/contract";
import { ContractChatBot } from "@/components/contract";

import ContractList from "@/components/contract/Contractlist";

import { getToken } from "@/providers/AppContext";
import { Container } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export default function CustomerContract() {
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
          userType="user"
          onClose={() => setShowContract(false)}
        />
      )}

      <ContractList
        contracts={[...contracts]}
        userType="customer"
        isLoading={isLoading}
        onCreateContract={handleCreateContract}
        onViewContract={handleViewContract}
        onDownloadContract={handleDownloadContract}
        onShareContract={handleShareContract}
      />
    </Container>
  );
}
