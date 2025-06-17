import { Container } from '@mantine/core';
import React from 'react'

export default async function RequestPage({params}:{params:Promise<{requestId:string}>}) {
    const {requestId} = await params;
    
  return (
    <Container size="lg" > <div>
     param is: {requestId}
    </div></Container>
   
  )
}
