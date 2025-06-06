import React from 'react'

const AppContext=React.createContext({});
type Props={children:React.ReactNode}
export default function AppContextProvider({children}:Props) {
  return (
   <AppContext.Provider value={{}}>{children}</AppContext.Provider>
  )
}
