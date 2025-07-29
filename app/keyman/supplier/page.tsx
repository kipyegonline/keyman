import React from "react";

import SupplierComponentDashboard from "./page.component";

export const metadata = {
  title: "Keyman Suppliers",
  description: "Suppliers profile",
  keywords: ["Keyman", "Profile", "Account", "Dashboard"],
};

export default function Page() {
  return (
    <main className="px-0 md:px-14  ">
      <SupplierComponentDashboard />
    </main>
  );
}
