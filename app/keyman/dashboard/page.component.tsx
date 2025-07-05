"use client";

import React from "react";
import MainContent from "@/components/dashboard/content";
import KeymanBanner from "@/components/Banner";

export default function UserDashboardComponent() {
  return (
    <div>
      <KeymanBanner />
      <MainContent />
    </div>
  );
}
