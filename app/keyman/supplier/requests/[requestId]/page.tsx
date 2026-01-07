import { Container } from "@mantine/core";
import React from "react";
import RequestItemComponent from "./page.component";
import { getRequestDetails } from "@/api/requests";
import { RequestDeliveryItem } from "@/types";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ requestId: string }>;
}): Promise<Metadata> {
  const { requestId } = await params;
  console.log(requestId, "requestId in supplier request page tsx for metadata");
  try {
    const payload = await getRequestDetails(requestId, "", true);
    const request = payload?.request as RequestDeliveryItem;

    if (!request) {
      return {
        title: "Request Not Found | Keyman",
        description: "The requested item could not be found.",
      };
    }
    console.log(request, "request in supplier request page tsx for metadata");
    const itemsCount = request.items?.length || 0;
    const itemNames = request.items
      ?.slice(0, 3)
      .map((item) => item.name)
      .join(", ");
    const moreItems = itemsCount > 3 ? ` and ${itemsCount - 3} more` : "";

    return {
      title: `Request ${request.code} | Keyman Supplier`,
      description: `View and quote for request ${
        request.code
      }. Items: ${itemNames}${moreItems}. Delivery date: ${new Date(
        request.delivery_date
      ).toLocaleDateString()}.`,
      openGraph: {
        title: `Request ${request.code}`,
        description: `${itemsCount} item${
          itemsCount !== 1 ? "s" : ""
        } requested for delivery on ${new Date(
          request.delivery_date
        ).toLocaleDateString()}`,
        type: "website",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Request Details | Keyman Supplier",
      description: "View request details and submit your quote",
    };
  }
}

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
