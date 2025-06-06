import React from 'react'
import ReactQueryProvider from './Tanstack'
;
import MantineAppProvider from './Mantine';
import AppContextProvider from './AppContext';

export default function AppProviders({children}: Readonly<{
  children: React.ReactNode;  }>) {
  return (
    <ReactQueryProvider>
      <MantineAppProvider>
        <AppContextProvider>
          {children}
        </AppContextProvider>
        </MantineAppProvider>
        </ReactQueryProvider>
  )
}
//https://mantine.dev/colors-generator/?color=3D6B2C