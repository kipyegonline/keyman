"use client"

import {  KeymanSkeleton } from '@/lib/helperComponents'
import DashboardLayout from '@/components/dashboard' 
import { getUser, useAppContext } from '@/providers/AppContext'
import { useRouter } from 'next/navigation'
import React from 'react'
type Props={children:React.ReactNode}
export default function Keymanlayout({children}:Props) {
  
  const {user}=useAppContext()
  const router=useRouter()
  React.useEffect(() => {
    const _user=getUser();
     if(!_user){
   
   router.push('/account/login')
   }
  
 
  }, []);
 
  if(user===null){
    return <KeymanSkeleton />
  }
  return (
   <main className=''>
    <DashboardLayout>{children}</DashboardLayout>
    </main>
  )
}
