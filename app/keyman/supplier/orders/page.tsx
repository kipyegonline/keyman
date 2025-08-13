import React from "react";
import OrdersClientcomponent from "./page.component";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supplier Orders - Keyman Stores",
  description:
    "Manage incoming orders as a supplier. Track order fulfillment, delivery status, and customer communications.",
};

export default function Page() {
  return (
    <div>
      <OrdersClientcomponent />
    </div>
  );
}
