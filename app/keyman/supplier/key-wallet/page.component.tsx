"use client";
import { getWallet } from "@/api/wallet";
import { Container } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export default function WalletClientComponent() {
  const { data: wallet, isLoading: loadingWallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      return await getWallet();
    },
  });
  //console.log(data, "wall");
  if (loadingWallet) return "loading wallet....";
  if (!wallet?.status) {
    if (wallet?.message === "Wallet not found")
      return "You do not have a wallet. feature coming soon";
    else return "Onboarding process is under way";
  }
  return <Container>Lets display wallet details</Container>;
}
