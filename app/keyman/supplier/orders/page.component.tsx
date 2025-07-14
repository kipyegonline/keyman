"use client";
import { getOrders } from "@/api/orders";
import OrdersTable from "@/components/orders/OrdersList";
import LoadingComponent from "@/lib/LoadingComponent";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Box, Text } from "@mantine/core";

export default function OrdersClientcomponent() {
  const supplierId = globalThis?.window?.localStorage.getItem(
    "supplier_id"
  ) as string;
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => await getOrders(supplierId, true),
  });

  const ordersList = React.useMemo(() => {
    if (orders?.orders) {
      return orders.orders;
    } else return [];
  }, [orders]);

  if (isLoading) return <LoadingComponent message="Loading your orders..." />;

  return (
    <div className="px-4 md:px-14">
      {ordersList.length > 0 ? (
        <OrdersTable orders={ordersList} isSupplier={true} />
      ) : (
        <Box p="lg">
          <Text size="md" pb="md">
            You have no orders at the moment.
          </Text>
        </Box>
      )}
    </div>
  );
}
