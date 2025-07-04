"use client";
import { getBalance } from "@/api/coin";
import { getProjects } from "@/api/projects";
import RequestCreator from "@/components/requests/create";
import InsufficientKeys from "@/components/requests/InsufficientKeys";
import LoadingComponent from "@/lib/LoadingComponent";
import { Container } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export default function CreateRequestClientComponent() {
  const { data: locations, isLoading: loadingLocations } = useQuery({
    queryKey: ["locations"],
    queryFn: getProjects,
  });

  const {
    data: balance,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["balance"],
    queryFn: async () => getBalance(""),
    refetchOnWindowFocus: false,
  });

  const _locations = React.useMemo(() => {
    if (locations?.projects?.length > 0) return locations.projects;
    else return [];
  }, [locations]);
  if (isLoading) return <LoadingComponent />;
  if (balance?.balance?.total === 0)
    return <InsufficientKeys refetchBalance={() => refetch()} />;
  return (
    <Container>
      {loadingLocations ? (
        <LoadingComponent message="Preparing your request..." />
      ) : (
        <RequestCreator locations={_locations} />
      )}
    </Container>
  );
}
