"use client";
import { getWallet, initializeWallet } from "@/api/wallet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WalletData as WalletDataType } from "@/components/wallet/types";

// Import wallet components
import WalletLoadingComponent from "@/components/wallet/WalletLoadingComponent";
import WalletNotFound from "@/components/wallet/WalletNotFound";
import WalletOnboarding from "@/components/wallet/WalletOnboarding";
import WalletData from "@/components/wallet/WalletData";
import WalletTypeSelection from "@/components/wallet/WalletTypeSelection";

//import { getUserDetails } from "@/api/registration";
import { notify } from "@/lib/notifications";
import { getUserDetails } from "@/api/registration";

export default function WalletClientComponent() {
  const queryClient = useQueryClient();

  const { data: wallet, isLoading: loadingWallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      return await getWallet();
    },
    retry: 2,
  });
  const { data: user } = useQuery({
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
        notify.success(
          "Payment initiated successfully! Please complete the payment on your phone."
        );
        queryClient.invalidateQueries({ queryKey: ["wallet"] });
      } else {
        notify.error(response.message || "Failed to initialize wallet");
      }
    },
    onError: (error) => {
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

  console.log(user, "user loading.....");
  console.log(wallet, "wl");
  return (
    <WalletTypeSelection
      onTypeSelect={handleWalletTypeSelect}
      isLoading={initializeWalletMutation.isPending}
    />
  );
  // Loading state
  if (loadingWallet) {
    return <WalletLoadingComponent />;
  }

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
      return <WalletOnboarding />;
    }
  }

  // Wallet exists - prepare data
  const walletData: WalletDataType = wallet.data || {
    balance: 0,
    currency: "KES",
    walletId: "",
    phoneNumber: "",
    isVerified: false,
    transactions: [],
  };

  return <WalletData walletData={walletData} isLoading={loadingWallet} />;
}
