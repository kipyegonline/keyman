

import React from 'react'
import UserDashboardComponent from './page.component'
export const metadata = {
  title: 'Keyman Dashboard',
  description: 'Welcome to the Keyman Dashboard',
  keywords: ['Keyman', 'Dashboard', 'Placeholder'],}
export default function page() {
  return (
    <main className=' px-0 md:px-10  '>
        <UserDashboardComponent/>
    </main>
  )
}
