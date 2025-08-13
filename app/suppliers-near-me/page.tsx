import { Container } from "@mantine/core";
import React from "react";
import SuppliersNearMeComponent from "./page.component";
import { NavigationComponent } from "@/components/ui/Navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suppliers Near Me - Keyman Stores",
  description:
    "Find construction suppliers and building materials near your location. Connect with trusted local suppliers for your construction projects.",
};

export default function Page() {
  return (
    <>
      <NavigationComponent isFixed={false} />
      <Container>
        <SuppliersNearMeComponent />
      </Container>
    </>
  );
}
