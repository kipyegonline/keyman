import React from 'react'
import OrdersClientcomponent from './page.component'

export const metadata = {
  title: 'Keyman Orders',  
  description: 'manage your orders with ease',
  keywords: ['Keyman', 'Orders', 'Account', 'Dashboard'],
}
export default function Page() {
  return (
    <div>
        <OrdersClientcomponent/>
      
    </div>
  )
}
