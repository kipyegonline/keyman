import { Container } from "@mantine/core";
import React from "react";
import CreateContractPage from "./page.component";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Contract - Keyman Stores",
  description:
    "Create a new construction contract manually by filling out the form with service provider details, amount, and project scope.",
  keywords: [
    "create contract",
    "manual contract creation",
    "construction contracts",
    "project agreements",
    "service provider",
    "Keyman",
    "contract form"
  ],
};

export default function CreateContractRoute() {
  return (
    <Container>
      <CreateContractPage />
    </Container>
  );
}