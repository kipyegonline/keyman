"use client";
import { Container } from "@mantine/core";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getRequests } from "@/api/requests";
import RequestsTable from "@/components/requests/CustomerRequests";
import LoadingComponent from "@/lib/LoadingComponent";

export default function RequestClientComponent() {
  const {
    data: requests,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["customer requests"],
    queryFn: async () => await getRequests(),
  });
  console.log(requests, "__customer requests__");
  const _requests = React.useMemo(() => {
    if (requests?.requests?.data?.length > 0) {
      return requests?.requests?.data;
    } else return [];
  }, [requests]);

  if (isError) return <p>Something went wrong, {error?.message}</p>;

  if (isLoading) return <LoadingComponent message="Getting your requests" />;
  return (
    <Container size="lg">
      {_requests?.length > 0 && <RequestsTable requests={_requests} />}
    </Container>
  );
}
