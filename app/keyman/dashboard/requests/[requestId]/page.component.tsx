"use client";
import { getRequestDetails } from "@/api/requests";
import RequestDetail from "@/components/requests/RequestDetail";
import LoadingComponent from "@/lib/LoadingComponent";
import { RequestDeliveryItem } from "@/types";
import { Breadcrumbs } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";

export default function RequestItemComponent({
  requestId,
}: {
  requestId: string;
}) {
  const supplierId = globalThis?.window?.localStorage.getItem(
    "supplier_id"
  ) as string;
  const {
    data: payload,
    isError,
    isLoading,
    refetch: refresh,
  } = useQuery({
    queryKey: ["request", requestId],
    queryFn: async () => await getRequestDetails(requestId, supplierId),
  });
  const request = payload?.request as RequestDeliveryItem;
  React.useEffect(() => {
    if (payload?.status) {
      document.title = `Request ${request.code} | Keyman Supplier`;
    }
  }, [request]);
  const handleRefresh = () => {
    refresh();
  };
  //console.log({ isError, error, request }, "sr");
  if (isError) return <p>Error...</p>;
  if (isLoading)
    return (
      <LoadingComponent
        message="loading request details"
        variant="construction"
      />
    );
  return (
    <div>
      <Breadcrumbs separator="/" p="md">
        <Link href="/keyman/dashboard/requests" className="!text-keyman-green">
          Requests
        </Link>
        <Link href="/" inert>
          {request?.code}
        </Link>
      </Breadcrumbs>
      <RequestDetail request={request} refresh={handleRefresh} />
    </div>
  );
}
