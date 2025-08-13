import React from "react";
import PriceListClientcomponent from "./page.component";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Price List - Keyman Stores",
  description:
    "Manage your supplier price list for construction materials. Update pricing, add new items, and maintain your product catalog.",
};

export default function PriceListPage() {
  return (
    <div className="px-2 md:px-20 ">
      <PriceListClientcomponent />
    </div>
  );
}
