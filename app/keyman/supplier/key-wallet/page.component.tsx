"use client";
import { getWallet } from "@/api/wallet";
import { useQuery } from "@tanstack/react-query";
import { WalletData as WalletDataType } from "@/components/wallet/types";

// Import wallet components
import WalletLoadingComponent from "@/components/wallet/WalletLoadingComponent";
import WalletNotFound from "@/components/wallet/WalletNotFound";
import WalletOnboarding from "@/components/wallet/WalletOnboarding";
import WalletData from "@/components/wallet/WalletData";

export default function WalletClientComponent() {
  const { data: wallet, isLoading: loadingWallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      return await getWallet();
    },
    retry: 2,
  });

  // Loading state
  if (loadingWallet) {
    return <WalletLoadingComponent />;
  }

  // Wallet not found or error states
  if (!wallet?.status) {
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
