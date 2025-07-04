"use client";
import { getItems } from "@/api/items";

import PricelistDashboard from "@/components/supplier/priceList";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useTransition } from "react";

export default function PriceListClientcomponent() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isPending, startTransition] = useTransition();

  const { data: prices } = useQuery({
    queryKey: [searchQuery],
    queryFn: async () => await getItems(searchQuery),
    enabled: !!searchQuery,
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
  console.log(items, "adonai");
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
