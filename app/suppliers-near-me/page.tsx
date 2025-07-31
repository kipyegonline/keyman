import { Container } from "@mantine/core";
import React from "react";
import SuppliersNearMeComponent from "./page.component";
import { NavigationComponent } from "@/components/ui/Navigation";
export const metadata = {};
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
