import React from "react";
import UserDashboardComponent from "./page.component";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Dashboard - Keyman Stores",
  description:
    "Welcome to your Keyman Dashboard. Manage your construction projects, orders, and supplier connections.",
};

export default function page() {
  return (
    <main className=" px-0 md:px-10  ">
      <UserDashboardComponent />
    </main>
  );
}
