import { Container } from "@mantine/core";
import React from "react";
import SupplierClientComponent from "./page.component";
import { NavigationComponent } from "@/components/ui/Navigation";

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
    <Container size="lg" py="md">
      <div className="relative ">
        {" "}
        <NavigationComponent isFixed={false} />
      </div>

      <SupplierClientComponent supplierId={supplier} />
    </Container>
  );
}
