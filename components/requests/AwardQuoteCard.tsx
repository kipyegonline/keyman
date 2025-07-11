import React from "react";
import { AwardSuccessComponent, Quote } from "./QuotesList";
import PaymentModal from "../Tokens";
import { notify } from "@/lib/notifications";
interface AwardQuoteCardProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  requestId: string;
  totalAmount: number;
  requestRefetch: () => void;
  awardee: Quote;
  isCompleted: boolean;
  createOrder: () => void;
  resetAwardResult: () => void;
}

export default function AwardQuoteCard({
  open,
  setOpen,
  requestId,
  totalAmount,
  requestRefetch,
  awardee,
  isCompleted,
  createOrder,
  resetAwardResult,
}: AwardQuoteCardProps) {
  return (
    <div>
      <PaymentModal
        isOpen={open}
        onClose={() => setOpen(false)}
        type="request"
        typeId={requestId}
        amount={totalAmount}
        description=""
        availablePaymentMethods={["mpesa", "airtel_money", "t_kash"]}
        onPaymentSuccess={() => {
          setOpen(false);

          notify.success("Your payment will be processed shortly");
          //refetchBalance();
          // Handle payment success logic here
          requestRefetch();
        }}
        onPaymentError={(error) => {
          notify.error(error || "An error occurred while processing payment");
          // Handle payment error logic here
        }}
      />

      <AwardSuccessComponent
        onBackToRequests={resetAwardResult}
        onMakePayment={() => setOpen(true)}
        createOrder={createOrder}
        supplierName={awardee ? awardee.detail.name : ""}
        itemName={"item"}
        isCompleted={isCompleted}
      />
    </div>
  );
}
