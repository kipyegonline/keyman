"use client";
import { getProjects } from "@/api/projects";
import RequestCreator from "@/components/requests/create";
import { Container } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export default function CreateRequestClientComponent() {
  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: getProjects,
  });

  const _locations = React.useMemo(() => {
    if (locations?.projects?.length > 0) return locations.projects;
    else return [];
  }, [locations]);
  return (
    <Container>
      <RequestCreator locations={_locations} />
    </Container>
  );
}
