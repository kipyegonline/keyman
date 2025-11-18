"use client";

import { getUserDetails } from "@/api/registration";
import AlreadyRegistered from "@/components/wallet/AlreadyRegistered";
import CreateWallet from "@/components/wallet/CreateWallet";
import WalletLoadingComponent from "@/components/wallet/WalletLoadingComponent";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export default function CreateWalletComponent() {
  const { data: userAccount, isLoading: loadingUser } = useQuery({
    queryKey: ["user"],
    queryFn: async () => await getUserDetails(),
  });

  if (loadingUser) return <WalletLoadingComponent />;
  if (
    userAccount?.user?.onboardingRequestId &&
    userAccount?.user?.account_type === "personal"
  )
    return (
      <AlreadyRegistered
        userName={userAccount?.user?.name}
        walletType="personal"
      />
    );

  return <CreateWallet />;
}
