"use client";
import { Container, Box, Text } from "@mantine/core";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getRequests } from "@/api/requests";
import RequestsTable from "@/components/requests/CustomerRequests";
import LoadingComponent from "@/lib/LoadingComponent";
import Link from "next/link";

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

  //console.log(requests, "__customer requests__");
  const _requests = React.useMemo(() => {
    if (requests?.requests?.data?.length > 0) {
      return requests?.requests?.data;
    } else return [];
  }, [requests]);

  if (isError) return <p>Something went wrong, {error?.message}</p>;

  if (isLoading) return <LoadingComponent message="Getting your requests" />;
  return (
    <Container size="lg">
      {_requests?.length > 0 ? (
        <RequestsTable requests={_requests} />
      ) : (
        <Box p="lg">
          <Text size="md" pb="md">
            You have not created any request
          </Text>
          <Link
            className="p-2 rounded-md bg-keyman-green hover:bg-keyman-accent-hover text-white"
            href={"/keyman/dashboard/requests/create-request"}
          >
            Create your first request
          </Link>
        </Box>
      )}
    </Container>
  );
}
