"use client";
import { Container } from "@mantine/core";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getNearbyRequests } from "@/api/requests";

import LoadingComponent from "@/lib/LoadingComponent";
import SupplierRequestsTable from "@/components/requests/supplierRequests";

export default function RequestClientComponent() {
  const supplierId = localStorage.getItem("supplier_id") as string;
  const {
    data: requests,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["supplier requests", supplierId],
    queryFn: async () => await getNearbyRequests(supplierId),
  });

  const _requests = React.useMemo(() => {
    if (requests?.request) {
      return requests?.request?.data;
    }
  }, [requests?.status]);

  if (isError) return <p>Something went wrong, {error?.message}</p>;

  if (isLoading) return <LoadingComponent message="Getting your requests" />;
  return (
    <Container size="lg">
      {_requests?.length > 0 && <SupplierRequestsTable requests={_requests} />}
    </Container>
  );
}
