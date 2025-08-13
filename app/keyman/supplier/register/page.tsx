import React from "react";
import type { Metadata } from "next";
import SupplierComponent from "./page.component";

export const metadata: Metadata = {
  title: "Become a Supplier - Keyman Stores",
  description:
    "Join Keyman as a construction material supplier. Register your business and connect with builders looking for quality materials.",
};

export default function page() {
  return (
    <main className="px-4 md:px-20">
      <SupplierComponent />
    </main>
  );
}
