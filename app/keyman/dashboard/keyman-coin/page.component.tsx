"use client";
import { getBalance } from "@/api/coin";
import PaymentModal from "@/components/Tokens";
import KeyUsageDashboard from "@/components/Tokens/KeyUsageDashboard";
import LoadingComponent from "@/lib/LoadingComponent";
import { notify } from "@/lib/notifications";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export default function KeyManCoinDashboard() {
  const [open, setOpen] = React.useState(false);
  const {
    data: balance,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["balance"],
    queryFn: async () => getBalance(""),
    refetchOnWindowFocus: false,
  });

  const _balance = React.useMemo(() => {
    if (balance?.balance) {
      return balance.balance;
    } else return {};
  }, [balance]);
  if (isLoading)
    return <LoadingComponent message="Loading Keyman Coin Dashboard..." />;
  return (
    <div>
      <PaymentModal
        isOpen={open}
        onClose={() => setOpen(false)}
        type="user"
        typeId=""
        amount={0}
        description=""
        availablePaymentMethods={["mpesa", "airtel_money", "t_kash"]}
        onPaymentSuccess={() => {
          refetch();
          notify.success(
            "Your payment has been received. It will reflect in your account shortly."
          );
        }}
        onPaymentError={() => {}}
      />
      <KeyUsageDashboard
        onTopUp={() => {
          setOpen(true);
        }}
        data={{
          currentBalance: _balance?.total || 0,
          freeKeys: Number(_balance?.breakdown?.free) || 0,
          topUpKeys: Number(_balance?.breakdown?.topup) || 0,
          totalKeys: 47,
          usedThisMonth: 18,
          monthlyLimit: 100,
          userTier: "professional",
          lastTopUp: {
            amount: 50,
            date: "2024-06-28",
          },
        }}
      />
    </div>
  );
}
