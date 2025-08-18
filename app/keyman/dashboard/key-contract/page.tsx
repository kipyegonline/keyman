import { Container } from "@mantine/core";
import React from "react";
import CustomerContractCreation from "./page.component";
export const metadata = {
  title: "Key Contract - Customer",
  description: "Manage customer contracts",
};
export default function KeyContractPage() {
  return (
    <Container>
      <CustomerContractCreation />
    </Container>
  );
}
