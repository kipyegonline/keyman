import { Container } from '@mantine/core'
import React from 'react'
import KeymanResetPassword from './page.component'
export const metadata = {
  title: 'Keyman Account Reset Password', 
  description: 'Reset your Keyman account password to regain access.',
  keywords: ['Keyman', 'Reset Password', 'Account Recovery'],
}
export default function ResetPassword() {
  return (
   <Container>
    <KeymanResetPassword/>
   </Container>
  )
}
