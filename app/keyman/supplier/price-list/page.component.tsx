"use client"
import { getSupplierPriceList } from '@/api/supplier'
import PricelistDashboard from '@/components/supplier/priceList';
import { useQuery } from '@tanstack/react-query'
import React from 'react'

export default function PriceListClientcomponent() {
    const supplierId= localStorage.getItem("supplier_id") as string;
    const {data:prices}=useQuery({queryKey:["prices"],queryFn:async()=>await getSupplierPriceList(supplierId)})
  console.log(prices,'prices==')
    return (
    <div>
      <PricelistDashboard/>
    </div>
  )
}
