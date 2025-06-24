"use client"
import { Container } from '@mantine/core'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {  getRequests } from '@/api/requests'
import RequestsTable from '@/components/requests/CustomerRequests'
import LoadingComponent from '@/lib/LoadingComponent'

export default function RequestClientComponent() {
     const {data:requests,isLoading,isError,error}=useQuery({queryKey:["requests"],queryFn:async()=>await getRequests()})
      
      

  const _requests=React.useMemo(()=>{
    if(requests?.status){
       
        return requests.requests.data
    }
  },[requests?.status])

   if(isError)return <p>Something went wrong, {error?.message}</p>
  
    if(isLoading) return <LoadingComponent message="Getting your requests"/>
      return (
    <Container size="lg">
      {_requests?.length>0 && <RequestsTable requests={_requests}/>}
    </Container>
  )
}
