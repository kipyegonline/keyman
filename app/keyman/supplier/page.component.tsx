"use client"
import React from 'react'
import SupplierDashboard from '@/components/supplier/LandingPage'
import { useAppContext } from '@/providers/AppContext'
import { useQuery } from '@tanstack/react-query';
import { getSupplierDetails } from '@/api/supplier';
import { SupplierDetails } from '@/types';
export default function SupplierComponentDashboard() {
    const {user}=useAppContext();
    const {data:supplier,}=useQuery({queryKey:["supplier"],
        queryFn:async()=>await getSupplierDetails(user?.supplier_details?.id as string)
})
        
    const supplierDetails=supplier?.supplier as SupplierDetails
  
  return (
    <div className=' px-0'>
        
      <SupplierDashboard supplierDetails={supplierDetails}/>
    </div>
  )
}
