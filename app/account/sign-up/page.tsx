
import React from 'react'
import type { Metadata } from 'next'
import KeymanSignupComponent from './page.component'

export const metadata: Metadata = {
  title: "Keyman stores | Sign Up",
  keywords: ["Keyman", "Sign Up", "Account", "Create Account"],
  description: "Buy Smart Build Smart",
};
export default function Page() {
  return (
   <main className=' -m-2'>
   
  <KeymanSignupComponent/>
   </main>
  )
}
