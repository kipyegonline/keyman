import { Container } from "@mantine/core";
import React from "react";
import RequestItemComponent from "./page.component";

export default async function RequestPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;

  return (
    <Container size="lg">
      <RequestItemComponent requestId={requestId} />
    </Container>
  );
}
