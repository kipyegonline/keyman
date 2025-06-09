"use client"
import React from 'react'

export default function AccountLayout({children}) {
    React.useLayoutEffect(()=>{
        console.log("layout ran....")
    })
  return <div>{children}</div>
}
