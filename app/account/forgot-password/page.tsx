import { Container } from '@mantine/core'

import React from 'react'
import KeymanForgotPassword from './page.component'
export const metadata = {
  title: 'Keyman Account Forgot Password',
  description: 'Reset your Keyman account password to regain access.',
  keywords: ['Keyman', 'Forgot Password', 'Account Recovery'],}
export default function ForgotPassword() {
  return (
    <Container>
        <KeymanForgotPassword/>
    </Container>
  )
}
