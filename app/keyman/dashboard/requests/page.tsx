import React from "react";
import RequestClientComponent from "./page.component";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Requests - Keyman Stores",
  description:
    "View and manage your construction material requests, track quotes, and award suppliers.",
};

export default function RequestsPage() {
  return (
    <div>
      <RequestClientComponent />
    </div>
  );
}
