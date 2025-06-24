"use client"
import { getItems } from '@/api/items';

import PricelistDashboard from '@/components/supplier/priceList';
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useTransition } from 'react';

export default function PriceListClientcomponent() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isPending, startTransition] = useTransition();

  const { data: prices } = useQuery({
    queryKey: ["prices", searchQuery],
    queryFn: async () => await getItems(searchQuery),
    //enabled: !!searchQuery,
  });

  const handleSearch = (val: string) => {
    startTransition(() => {
      setSearchQuery(val);
    });
  };
 
  const items=React.useMemo(()=>{
    if(prices?.items){
      return prices?.items}
      else return []
  },[prices])
   console.log(items,'adonai')
  return (
    <div className='border-green'>
      <PricelistDashboard handleSearch={handleSearch} isPending={isPending} prices={items} />
    </div>
  )
}
