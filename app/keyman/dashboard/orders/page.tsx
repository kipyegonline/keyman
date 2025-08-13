import React from "react";
import OrdersClientcomponent from "./page.component";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders - Keyman Stores",
  description:
    "Track and manage your construction material orders with ease. View order status, delivery information, and payment details.",
};

export default function Page() {
  return (
    <div>
      <OrdersClientcomponent />
    </div>
  );
}
