"use client";
import { NavigationComponent } from "@/components/ui/Navigation";
//import { CheckAuthenticated } from '@/lib/helperComponents';
import { getUser } from "@/providers/AppContext";
import React from "react";
type Props = {
  children: React.ReactNode;
};

export default function AccountLayout({ children }: Props) {
  const user = getUser();
  React.useLayoutEffect(() => {
    if (user) {
      window.location.href = "/keyman/dashboard";
    }
  }, []);
  return (
    <main>
      <NavigationComponent isFixed />
      <div className="pt-18" />

      {children}
    </main>
  );
}
