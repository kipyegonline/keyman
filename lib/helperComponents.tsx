"use client"
import { useAppContext } from "@/providers/AppContext";
import { Image, LoadingOverlay } from "@mantine/core";
import React from "react";

export const CheckAuthenticated = ({url}:{url:string}) => {
    const {user}= useAppContext();
   
    React.useLayoutEffect(() => {   
        if (!user) {
            window.location.href = url;
        }
    }, []);

  return null;
}

export const KeymanSkeleton=({isHome=false})=>{
     
   
  
    React.useEffect(() => {
        document.title = isHome ? "Welcome to Keyman Stores": "Keyman Dashboard";
        const style = document.createElement('style');
    style.textContent = `
     @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
         .text-gradient {
        background: linear-gradient(135deg, #3D6B2C, #4CAF50, #F08C23);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: shimmer 3s ease-in-out infinite;
      }`
    }, []);
    
    const dark="rgba(0,0,0,.5)"
    return (
        <>
        <LoadingOverlay visible bg={dark}
        overlayProps={{ radius: 'sm', blur: 2,bg:dark }} loaderProps={{children:(<div className="bg-white rounded-lg animate-pulse">
            <Image src="/keyman_logo.png" alt="Keyman Logo"  width={100} height={100} className="rounded-full mb-4" />
        </div>    )}} />
        
        </>
       
    );
}