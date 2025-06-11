
import MainContent from '@/components/dashboard/content'
import React from 'react'
export const metadata = {
  title: 'Keyman Dashboard',
  description: 'Welcome to the Keyman Dashboard',
  keywords: ['Keyman', 'Dashboard', 'Placeholder'],}
export default function page() {
  return (
    <main className=' px-4 md:px-10 '>
        <MainContent/>
    </main>
  )
}
