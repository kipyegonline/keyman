import React from 'react'
interface AppContext{darkMode:boolean,toggleDarkMode:()=>void}
const AppContext=React.createContext({} as AppContext);
export const useAppContext=()=>React.useContext(AppContext)
type Props={children:React.ReactNode}
export default function AppContextProvider({children}:Props) {
     const [darkMode, setDarkMode] = React.useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  return (
   <AppContext value={{toggleDarkMode,darkMode}}>{children}</AppContext>
  )
}
