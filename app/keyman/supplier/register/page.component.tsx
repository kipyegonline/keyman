"use client"
import { getSupplierTypes } from '@/api/supplier'
import SupplierRegistrationForm from '@/components/supplier/SupplierRegistrationForm'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

export default function SupplierComponent() {
    const {data:supplierTypes}=useQuery({
        queryKey:["supplier"],
        queryFn:getSupplierTypes
         
    })
   
  return (
    <div>
        <SupplierRegistrationForm supplierTypes={supplierTypes?.supplier}/>
      
    </div>
  )
}
