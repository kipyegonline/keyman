import React from 'react'
import type{ Metadata } from 'next'
import SupplierComponent from './page.component'


export const metadata:Metadata={ title: "Keyman stores",
  description: "Become Supplier",}
export default function page() {
  return (
   <main className='px-4 md:px-20'>
    <SupplierComponent/>
   </main>
  )
}
