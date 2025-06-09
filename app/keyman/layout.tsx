"use client"
import { logOutKeymanUser } from '@/api/registration'
import {  KeymanSkeleton } from '@/lib/helperComponents'
import { navigateTo } from '@/lib/helpers'
import { getUser, useAppContext } from '@/providers/AppContext'
import { Container, Flex,Box } from '@mantine/core'
import { useRouter } from 'next/navigation'
import React from 'react'
type Props={children:React.ReactNode}
export default function Keymanlayout({children}:Props) {
  
  const {logOutUser,user}=useAppContext()
  const router=useRouter()
  React.useEffect(() => {
    const _user=getUser();
     if(!_user){
    console.log("user not found, redirecting to login")
   router.push('/account/login')
   }
  
 
  }, []);
  const handleLogout = () => {
logOutUser()
    // Implement logout logic here
    console.log("Logout clicked");
    navigateTo()
    // For example, you might clear user data and redirect to login page
    //window.location.href = '/account/login';
    router.push('/account/login');
   logOutKeymanUser();
  }
  if(user===null){
    return <KeymanSkeleton />
  }
  return (
    <Container>
      
      <h1>Keyman Dashboard | {user?.name}</h1>
        <Flex>
            <Box>Side menu
              <div> <button onClick={handleLogout}>logout</button></div>
             
            </Box>
            <Box>{children}</Box>
        </Flex>
    </Container>
  )
}
