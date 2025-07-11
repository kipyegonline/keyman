import React from "react";
import { AwardSuccessComponent } from "./QuotesList";
import PaymentModal from "../Tokens";
import { notify } from "@/lib/notifications";
import LoadingComponent from "@/lib/LoadingComponent";
import { Card, Text, Button } from "@mantine/core";
import { createOrders } from "@/api/orders";
import { useRouter } from "next/navigation";
interface AwardQuoteCardProps {
  requestId: string;
  totalAmount: number;
  requestRefetch: () => void;

  isCompleted: boolean;
}

export default function AwardQuoteCard({
  requestId,
  totalAmount,
  requestRefetch,

  isCompleted,
}: AwardQuoteCardProps) {
  const [open, setOpen] = React.useState(false);
  const [createOrderLoading, setCreateOrderLoading] = React.useState(false);
  const [ordered, setOrdered] = React.useState(false);
  const resetAwardResult = () => {
    // setAwardResult(null);
  };
  const router = useRouter();
  const createOrder = async () => {
    // make payment
    setCreateOrderLoading(true);
    setOrdered(false);

    const result = await createOrders({
      request_id: requestId,
      delivery_type: "TUKTUK",
    });

    if (result.status) {
      notify.success("Order created successfully");
      setOpen(false);
      setCreateOrderLoading(false);
      setOrdered(true);
      requestRefetch();
    } else {
      notify.error(result.message || "Failed to create order");
      setCreateOrderLoading(false);
    }
  };
  // Show success screen
  if (ordered) {
    return (
      <Card p="lg" className="text-center">
        <Text> ✅ Order created successfully</Text>
        <Button
          onClick={() => router.push("/keyman/dashboard/requests")}
          className="mt-4"
          variant="light"
        >
          Back to Requests
        </Button>
      </Card>
    );
  }

  if (createOrderLoading)
    return <LoadingComponent message="Creating order..." variant="pulse" />;
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
        supplierName={""}
        itemName={"item"}
        isCompleted={isCompleted}
      />
    </div>
  );
}
