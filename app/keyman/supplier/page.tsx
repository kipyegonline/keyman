import React from "react";
import type { Metadata } from "next";
import SupplierComponentDashboard from "./page.component";

export const metadata: Metadata = {
  title: "Supplier Dashboard - Keyman Stores",
  description:
    "Manage your supplier profile, orders, and business connections on Keyman's construction commerce platform.",
};

export default function Page() {
  return (
    <main className="px-0 md:px-14  ">
      <SupplierComponentDashboard />
    </main>
  );
}
