"use client";
import { getOrderDetails } from "@/api/orders";
import OrderDetails from "@/components/orders/OrderComponent";
import LoadingComponent from "@/lib/LoadingComponent";
import { Breadcrumbs } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";

export default function OrderClientComponent({ orderId }: { orderId: string }) {
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => getOrderDetails(orderId),
    enabled: !!orderId,
  });
  const _order = React.useMemo(() => {
    if (order?.order) return order?.order;
    else return [];
  }, [order]);

  if (isLoading) return <LoadingComponent message="Loading order details..." />;
  return (
    <div>
      <Breadcrumbs separator="/">
        <Link href="/keyman/supplier/orders" className="text-keyman-green">
          Orders
        </Link>
        <Link href="/" inert>
          Order details {_order?.code ?? ""}
        </Link>
      </Breadcrumbs>
      {_order && "id" in _order && <OrderDetails order={_order} />}
    </div>
  );
}
