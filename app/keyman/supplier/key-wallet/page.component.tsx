"use client";
import { getWallet, initializeWallet } from "@/api/wallet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
//import { WalletData as WalletDataType } from "@/components/wallet/types";

// Import wallet components
import WalletLoadingComponent from "@/components/wallet/WalletLoadingComponent";
import WalletNotFound from "@/components/wallet/WalletNotFound";
import WalletOnboarding from "@/components/wallet/WalletOnboarding";
import WalletData from "@/components/wallet/WalletData";
import WalletTypeSelection from "@/components/wallet/WalletTypeSelection";

//import { getUserDetails } from "@/api/registration";
import { notify } from "@/lib/notifications";
import { getUserDetails } from "@/api/registration";
import React from "react";

export default function WalletClientComponent() {
  const queryClient = useQueryClient();

  const [success, setSuccess] = React.useState<null | number>(null);

  const { data: wallet, isLoading: loadingWallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      return await getWallet();
    },
    retry: 2,
  });
  const {
    data: userAccount,
    isLoading: loadingUser,
    refetch: refresh,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => await getUserDetails(),
  });

  const initializeWalletMutation = useMutation({
    mutationFn: (data: {
      type: "personal" | "business";
      payment_method: string;
      phone_number: string;
    }) => initializeWallet(data),
    onSuccess: (response) => {
      if (response.status) {
        refresh();
        notify.success(
          "Payment initiated successfully! Please complete the payment on your phone."
        );
        setSuccess(1);
        queryClient.invalidateQueries({ queryKey: ["wallet"] });
      } else {
        setSuccess(0);
        notify.error(response.message || "Failed to initialize wallet");
      }
    },
    onError: (error) => {
      setSuccess(0);
      console.error("Error initializing wallet:", error);
      notify.error("An error occurred while initializing wallet");
    },
  });

  const handleWalletTypeSelect = (data: {
    type: "personal" | "business";
    payment_method: string;
    phone_number: string;
  }) => {
    initializeWalletMutation.mutate(data);
  };

  //console.log(userAccount, "user loading.....");
  // console.log(wallet, "wl");

  // Loading state
  if (loadingUser) {
    return <WalletLoadingComponent />;
  }
  // we show user wallet data if wallet_account_id exists
  if (
    userAccount &&
    userAccount?.user?.wallet_account_id !== null &&
    userAccount?.user?.wallet_account_id !== undefined &&
    userAccount?.user?.wallet_account_id !== ""
  ) {
    return <WalletData walletData={wallet} isLoading={loadingWallet} />;
  }
  // If user has no wallet_account_id and no wallet_creation_status, show wallet type selection
  if (
    userAccount &&
    !userAccount?.user?.wallet_account_id &&
    !userAccount?.user?.wallet_creation_status
  ) {
    return (
      <WalletTypeSelection
        onTypeSelect={handleWalletTypeSelect}
        isLoading={initializeWalletMutation.isPending}
        success={success}
      />
    );
  } else if (
    userAccount?.user?.wallet_creation_status !== null ||
    userAccount?.user?.wallet_creation_status !== ""
  ) {
    const status = userAccount?.user?.wallet_creation_status;
    const walletAccountId = userAccount?.user?.wallet_account_id;
    if (status === "Verification Fee Paid") {
      return <WalletNotFound />;
    }
    const onBoardingId = userAccount?.user?.onboardingRequestId;
    if (onBoardingId || walletAccountId)
      return (
        <WalletOnboarding
          refresh={() => refresh()}
          onboardingRequestId={onBoardingId}
          otpConfirmed={!!userAccount?.user?.onboarding_otp_confirmation}
        />
      );
    return (
      <WalletTypeSelection
        onTypeSelect={handleWalletTypeSelect}
        isLoading={initializeWalletMutation.isPending}
        success={success}
      />
    );
  }

  return null;
  /*
  // Wallet not found or error states
  if (!wallet?.status) {
    if (wallet?.message === "User not verified") {
      return (
        <WalletTypeSelection
          onTypeSelect={handleWalletTypeSelect}
          isLoading={initializeWalletMutation.isPending}
        />
      );
    }
    if (wallet?.message === "Wallet not found") {
      return <WalletNotFound />;
    } else {
      return <WalletOnboarding onboardingRequestId={onBoardingId} />;
    } 
  }*/

  // Wallet exists - prepare data
  /* const walletData: WalletDataType = wallet.data || {
    balance: 0,
    currency: "KES",
    walletId: "",
    phoneNumber: "",
    isVerified: false,
    transactions: [],
  }; */

  //  return <WalletData walletData={walletData} isLoading={loadingWallet} />;
}
