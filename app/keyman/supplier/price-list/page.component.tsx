"use client";
import { getItems } from "@/api/items";
import { getSupplierPriceList } from "@/api/supplier";

import PricelistDashboard, { Pricelist } from "@/components/supplier/priceList";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useTransition } from "react";

export default function PriceListClientcomponent() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isPending, startTransition] = useTransition();
  const supplierId = globalThis?.window?.localStorage.getItem(
    "supplier_id"
  ) as string;
  const { data: prices } = useQuery({
    queryKey: [searchQuery],
    queryFn: async () => await getItems(searchQuery),
    enabled: !!searchQuery,
  });

  const { data: priceList, refetch: refresh } = useQuery({
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
      return prices?.items.map((item: Pricelist) => ({
        ...item,
        isUserOwned: false,
      }));
    } else return [];
  }, [prices]);
  const _priceList = React.useMemo(() => {
    if (priceList?.price_list) return priceList?.price_list;
    return [];
  }, [priceList]);

  return (
    <div className="">
      <PricelistDashboard
        handleSearch={handleSearch}
        isPending={isPending}
        prices={[..._priceList, ...items]}
        refetchPricelist={() => refresh()}
      />
    </div>
  );
}
