import React from "react";
import PriceListClientcomponent from "./page.component";

export const metadata = {
  title: "Keyman Dashboard | manage my store",
  description: "Manage supplier price list",
  keywords: ["Keyman", "Dashboard", "Placeholder"],
};
export default function PriceListPage() {
  return (
    <div className="px-2 md:px-20 ">
      <PriceListClientcomponent />
    </div>
  );
}
