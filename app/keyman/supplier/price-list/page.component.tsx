"use client";
import { getItems } from "@/api/items";
import { getSupplierPriceList } from "@/api/supplier";

import PricelistDashboard from "@/components/supplier/priceList";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useTransition } from "react";

export default function PriceListClientcomponent() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isPending, startTransition] = useTransition();
  const supplierId = localStorage.getItem("supplier_id") as string;
  const { data: prices } = useQuery({
    queryKey: [searchQuery],
    queryFn: async () => await getItems(searchQuery),
    enabled: !!searchQuery,
  });

  const { data: priceList } = useQuery({
    queryKey: ["pricelist", supplierId],
    queryFn: async () => getSupplierPriceList(supplierId),
    enabled: !!supplierId,
  });

  const handleSearch = (val: string) => {
    //if (val.length > 2) setSearchQuery(val);
    startTransition(() => {
      setSearchQuery(val);
    });
  };

  const items = React.useMemo(() => {
    if (prices?.items) {
      return prices?.items;
    } else return [];
  }, [prices]);
  console.log(priceList);
  return (
    <div className="">
      <PricelistDashboard
        handleSearch={handleSearch}
        isPending={isPending}
        prices={items}
      />
    </div>
  );
}
