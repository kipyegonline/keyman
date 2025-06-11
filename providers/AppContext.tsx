
import { KeymanUser } from '@/types';
import React from 'react'

interface AppContext{
  activeItem:string,
  setActiveItem:(item:string)=>void,
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
export const getUser=()=>{
  if(globalThis?.window){ return JSON.parse(localStorage.getItem(keymanUser)||"null") as KeymanUser|null;  }else return null;
} 
export const setUser=(user:KeymanUser)=>{
  if(globalThis?.window){ return localStorage.setItem(keymanUser,JSON.stringify(user));}else return null;
}
export const removeUser=()=>{
  if(globalThis?.window){ return localStorage.removeItem(keymanUser); }else return null;
}
export const getToken=()=>{
  if(globalThis?.window){ return localStorage.getItem(token_name) || null; }else return null;
}
export const setToken=(token:string)=>{
  if(globalThis?.window){ return localStorage.setItem(token_name,token); }else return null;
}
export const removeToken=()=>{
  if(globalThis?.window){ return localStorage.removeItem(token_name); }else return null;
}

export default function AppContextProvider({children}:Props) {
     const [darkMode, setDarkMode] = React.useState(false);
     const [activeItem, setActiveItem] = React.useState('dashboard');
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
   <AppContext value={{toggleDarkMode,darkMode,user,loginUser,logOutUser,activeItem,setActiveItem}}>{children}</AppContext>
  )
}
