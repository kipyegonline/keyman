import { Container } from "@mantine/core";
import React from "react";
import SupplierClientComponent from "./page.component";

export const metadata = {
  title: "Keyman Suppliers",
  description: "Suppliers near me",
  keywords: ["Keyman", "Orders", "Account", "Dashboard"],
};
export default async function Page({
  params,
}: {
  params: Promise<{ supplier: string }>;
}) {
  const { supplier } = await params;

  return (
    <Container>
      <SupplierClientComponent supplierId={supplier} />
    </Container>
  );
}
