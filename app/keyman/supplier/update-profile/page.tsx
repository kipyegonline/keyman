import React from "react";
import UpdateSupplierComponent from "./page.component";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Update Profile - Keyman Stores",
  description:
    "Update your supplier profile information, business details, and contact information on Keyman's construction marketplace.",
};

export default function UpdatePage() {
  return (
    <main className="px-0 md:px-12 ">
      <UpdateSupplierComponent />
    </main>
  );
}
