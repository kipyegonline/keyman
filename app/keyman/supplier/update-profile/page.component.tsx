"use client"
import { getUserDetails } from '@/api/registration'
import { getSupplierTypes } from '@/api/supplier'
import SupplierUpdateForm from '@/components/supplier/SupplierUpdateForm'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

export default function UpdateSupplierComponent() {

   const {data:supplierTypes}=useQuery({
        queryKey:["supplierTypes"],
        queryFn:getSupplierTypes
         
    })
    const {data:userData}=useQuery({
        queryKey:["user"],
        queryFn:getUserDetails
         
    })
    
    
  return (
    <div >
      <SupplierUpdateForm supplierTypes={supplierTypes?.supplier} initialData={userData?.user?.supplier_details}/>
    </div>
  )
}
