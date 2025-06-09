
import { KeymanUser } from '@/types';
import React from 'react'

interface AppContext{
  darkMode:boolean,
  toggleDarkMode:()=>void,
  user:KeymanUser|null,
  loginUser:(user:KeymanUser,token:string)=>void
  logOutUser:()=>void}

const AppContext=React.createContext({} as AppContext);
export const useAppContext=()=>React.useContext(AppContext)
type Props={children:React.ReactNode}
const token_name="auth_token";
const keymanUser="keyman_user";
export const getUser=()=>JSON.parse(localStorage.getItem(keymanUser)||"null") as KeymanUser|null;  
export const setUser=(user:KeymanUser)=>localStorage.setItem(keymanUser,JSON.stringify(user));
export const removeUser=()=>localStorage.removeItem(keymanUser);
export const getToken=()=>localStorage.getItem(token_name) || null;
export const setToken=(token:string)=>localStorage.setItem(token_name,token);
export const removeToken=()=>localStorage.removeItem(token_name);

export default function AppContextProvider({children}:Props) {
     const [darkMode, setDarkMode] = React.useState(false);
     const [user, _setUser] = React.useState<KeymanUser|null>(null);
      React.useEffect(() => {
        const storedUser = getUser();
        if (storedUser) {
          _setUser(storedUser);
        }
      }, []);
      

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  const loginUser=(user:KeymanUser,token:string)=>{
    setUser(user);  
  _setUser(user);
    setToken(token);}
    const logOutUser=()=>{
    removeUser();
    removeToken();
    _setUser(null);}
  return (
   <AppContext value={{toggleDarkMode,darkMode,user,loginUser,logOutUser}}>{children}</AppContext>
  )
}
