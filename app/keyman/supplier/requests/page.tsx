import React from "react";
import RequestClientComponent from "./page.component";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supplier Requests - Keyman Stores",
  description:
    "View and respond to construction material requests. Submit quotes and manage your supplier business opportunities.",
};

export default function RequestsPage() {
  return (
    <div>
      <RequestClientComponent />
    </div>
  );
}
