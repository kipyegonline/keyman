"use client"
import { getOrders } from '@/api/orders'
import OrdersTable from '@/components/orders/OrdersList'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

export default function OrdersClientcomponent() {
    const {data:orders,isLoading}=useQuery({
        queryKey:["orders"],
        queryFn:async()=>await getOrders()
    })
   
   
    const ordersList=React.useMemo(()=>{
        if(orders?.orders){
            console.log(orders.orders,'orders')
            return orders.orders
        }
            
        else return []

},[orders])
const supplierId=localStorage.getItem('supplier_id')
console.log(isLoading,orders,supplierId,'isloading')
if(isLoading) return "loading...."

  return (
    <div className='px-4 md:px-14'>
       {ordersList.length>0 && <OrdersTable orders={ordersList}/>}
      
    </div>
  )
}
