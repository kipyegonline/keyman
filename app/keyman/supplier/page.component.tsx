"use client"
import React from 'react'
import SupplierDashboard from '@/components/supplier/LandingPage'

import { useQuery } from '@tanstack/react-query';
import { getSupplierDetails } from '@/api/supplier';
import { SupplierDetails } from '@/types';

export default function SupplierComponentDashboard() {
    
   const supplierId= localStorage.getItem("supplier_id") as string;
   
    const {data:supplier,}=useQuery({queryKey:[supplierId],
        queryFn:async()=>await getSupplierDetails(supplierId)
})
        
    const supplierDetails=supplier?.supplier as SupplierDetails
  
  return (
    <div className=' px-0'>
       
      <SupplierDashboard supplierDetails={supplierDetails}/>
    </div>
  )
}
