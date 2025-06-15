"use client"
import { getUserDetails } from '@/api/registration'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import MainContent from '@/components/dashboard/content'

export default function UserDashboardComponent() {
    
    const {data:userDetails}=useQuery({queryKey:["user"],queryFn:getUserDetails})
    console.log(userDetails,'user details')
  return (
    <div>
      <MainContent />
    </div>
  )
}
