"use client";
import React from "react";
import { Container, Loader, Text, Alert, Breadcrumbs } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { downloadContract, getContractDetails } from "@/api/contract";
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
  const [isDownloading, setIsDownloading] = React.useState(false);
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

  const handleDownloadContract = async (id: string) => {
    try {
      setIsDownloading(true);
      console.log("Starting download for contract:", id);
      const result = await downloadContract(id);

      if (result.status && result.data) {
        // Create blob from the PDF data
        const blob = new Blob([result.data], { type: "application/pdf" });

        // Create download URL
        const url = window.URL.createObjectURL(blob);

        // Create temporary link element
        const link = document.createElement("a");
        link.href = url;
        link.download = `contract-${contract?.code || id}.pdf`;

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object
        window.URL.revokeObjectURL(url);

        console.log("Contract downloaded successfully");
      } else {
        console.error("Error downloading contract:", result.message);
        // You can add a toast notification here
        alert("Failed to download contract. Please try again.");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("An error occurred while downloading the contract.");
    } finally {
      setIsDownloading(false);
    }
  };

  const breadcrumbs = (
    <Breadcrumbs separator="/">
      <Link href="/keyman/dashboard/key-contract" className="text-keyman-green">
        Contracts
      </Link>
      <Link href="/" inert>
        Contract details {contract?.code ?? ""}
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
          sessionId={`user-${contract.id}`}
          contractId={contract.id}
          userType="user"
          //supplierId={localStorage.getItem("supplier_id") ?? ""}
          onClose={() => setShowContract(false)}
        />
      )}
      <ContractDetails
        contract={contract}
        userType="customer" // You can determine this based on user context
        onEdit={() => {
          // Handle edit action

          setShowContract(true);
        }}
        onViewDocuments={() => {
          // Handle view documents action
          console.log("View documents for contract:", contract.id);
        }}
        onShare={() => {
          // Handle share action
          console.log("Share contract:", contract.id);
        }}
        onDownload={handleDownloadContract}
        isDownloading={isDownloading}
      />
    </Container>
  );
}
