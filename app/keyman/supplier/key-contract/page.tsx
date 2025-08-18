import { Container } from "@mantine/core";
import React from "react";
import SupplierContractPage from "./page.contract";
export const metadata = {
  title: "Key Contract - Supplier",
  description: "Manage supplier contracts",
};

export default function KeyContractPage() {
  return (
    <Container>
      <SupplierContractPage />
    </Container>
  );
}
