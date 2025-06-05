import React from 'react'
import ReactQueryProvider from './Tanstack'
;
import MantineAppProvider from './Mantine';

export default function AppProviders({children}: Readonly<{
  children: React.ReactNode;  }>) {
  return (
    <ReactQueryProvider><MantineAppProvider>{children}</MantineAppProvider></ReactQueryProvider>
  )
}
//https://mantine.dev/colors-generator/?color=3D6B2C