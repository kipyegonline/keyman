import { Container } from "@mantine/core";
import React from "react";
import ClientContractPage from "./page.component";

interface PageProps {
  params: Promise<{ contract: string }>;
}

export default async function ContractPage({ params }: PageProps) {
  const { contract } = await params;

  return (
    <Container>
      <ClientContractPage contractId={contract} />
    </Container>
  );
}
