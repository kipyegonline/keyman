"use client";
import { getRequestDetails } from "@/api/requests";
import RequestDetailSuplier from "@/components/requests/RequestDetailSuppliet";
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
  } = useQuery({
    queryKey: ["request", requestId],
    queryFn: async () => await getRequestDetails(requestId, supplierId, true),
  });
  const request = payload?.request as RequestDeliveryItem;

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
        <Link href="/keyman/supplier/requests" className="!text-keyman-green">
          Requests
        </Link>
        <Link href="/" inert>
          {request?.code}
        </Link>
      </Breadcrumbs>
      <RequestDetailSuplier request={request} requestId={requestId} />
    </div>
  );
}
