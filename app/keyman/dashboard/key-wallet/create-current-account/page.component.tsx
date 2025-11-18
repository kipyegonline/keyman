"use client";

import { getUserDetails } from "@/api/registration";
import AlreadyRegistered from "@/components/wallet/AlreadyRegistered";
import CreatePersonalWallet from "@/components/wallet/CreatePersonalWallet";
import WalletLoadingComponent from "@/components/wallet/WalletLoadingComponent";
import { useQuery } from "@tanstack/react-query";
import React from "react";

// current (business)
export default function CreateWalletComponent() {
  const { data: userAccount, isLoading: loadingUser } = useQuery({
    queryKey: ["user"],
    queryFn: async () => await getUserDetails(),
  });

  if (loadingUser) return <WalletLoadingComponent />;
  if (
    userAccount?.user?.onboardingRequestId &&
    userAccount?.user?.account_type === "business"
  )
    return (
      <AlreadyRegistered
        userName={userAccount?.user?.name}
        walletType="business"
      />
    );
  return <CreatePersonalWallet />;
}
