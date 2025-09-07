"use client";
import React from "react";
import { Container, Title, Text, Stack } from "@mantine/core";
import CreateContractForm from "@/components/contract/CreateContractForm";

export default function CreateContractPage() {
  return (
    <Container size="md" className="py-8">
      <Stack gap="lg">
        <div className="text-center">
          <Title order={1} className="text-gray-900 mb-2">
            Create New Contract
          </Title>
          <Text size="lg" c="gray.6">
            Fill out the details to create a contract with your service provider
          </Text>
        </div>
        
        <CreateContractForm />
      </Stack>
    </Container>
  );
}