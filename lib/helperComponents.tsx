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

export const KeymanSkeleton=()=>{
     
   
  
    React.useEffect(() => {
        document.title = "Keyman Dashboard";
    }, []);
    
    const dark="rgba(0,0,0,.5)"
    return (
        <>
        <LoadingOverlay visible bg={dark}
        overlayProps={{ radius: 'sm', blur: 2,bg:dark }} loaderProps={{children:(<div className="bg-white rounded-lg animate-pulse"><Image src="/keyman_logo.png" alt="Keyman Logo" width={100} height={100} className="rounded-full" /> </div>    )}} />
        
        </>
       
    );
}