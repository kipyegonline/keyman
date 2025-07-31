"use client";
import SuppliersNearMe from "@/components/supplier/SuppliersNearMe";
import React from "react";
export const metadata = {
  title: "Keyman stores| Suppliers Near Me",
  description: "Buy Smart Build Smart",
};
export default function SuppliersNearMeComponent() {
  return (
    <div>
      <SuppliersNearMe url="/supplier/" />
    </div>
  );
}
