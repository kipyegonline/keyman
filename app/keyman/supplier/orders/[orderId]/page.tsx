import { Container } from '@mantine/core'
import React from 'react'
import OrderClientComponent from './page.component'


export const metadata = {
  title: 'Keyman Order',  
  description: 'manage your orders with ease',
  keywords: ['Keyman', 'Orders', 'Account', 'Dashboard'],
}
export default async function Page({params}:{
  params: Promise<{ orderId: string }>
}) {
    const {orderId}=await params
    
  return (
    <Container>
    
        <OrderClientComponent orderId={orderId as string}/>
      
    </Container>
  )
}
