"use client";
import SuppliersNearMe from "@/components/supplier/SuppliersNearMe";
import React from "react";
import { useSearchParams } from "next/navigation";

export default function SuppliersNearMeComponent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  return (
    <div>
      <SuppliersNearMe initialSearchQuery={searchQuery} />
    </div>
  );
}
