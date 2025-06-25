import React from "react";
import RequestClientComponent from "./page.component";

export const metadata = {
  title: "Keyman Dashboard",
  description: "Keyman Dashboard Requests",
  keywords: ["Keyman", "Dashboard", "requests"],
};
export default function RequestsPage() {
  return (
    <div>
      <RequestClientComponent />
    </div>
  );
}
