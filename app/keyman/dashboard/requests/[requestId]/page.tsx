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

  try {
    const payload = await getRequestDetails(requestId, "");
    const request = payload?.request as RequestDeliveryItem;

    if (!request) {
      return {
        title: "Request Not Found | Keyman",
        description: "The requested item could not be found.",
      };
    }

    const itemsCount = request.items?.length || 0;
    const itemNames = request.items
      ?.slice(0, 3)
      .map((item) => item.name)
      .join(", ");
    const moreItems = itemsCount > 3 ? ` and ${itemsCount - 3} more` : "";

    return {
      title: `Request ${request.code} | Keyman Dashboard`,
      description: `Manage request ${
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
      title: "Request Details | Keyman Dashboard",
      description: "View and manage your request details",
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
