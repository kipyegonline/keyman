"use client"
import React from 'react'

export default function ErrorComponent({error,reset}: Readonly<{
  // This is the error that was thrown by the nearest error boundary    
  error: Error & { digest?: string }
  reset: () => void
}>) {
 React. useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
    const handleReset = () => {
        // Reset the state of your app so the error doesn't happen again
        reset()
    }   
  return (
    <div className='mx-w-6 p-12 mx-auto text-center flex flex-col items-center justify-center'>
      <p>Something went wrong</p>
      <p>Please try again later.</p>
      <p>If the problem persists, contact support.</p>
       <p className='text-sm text-gray-500 mt-4'>Error: {error.message}</p>
        <button
            onClick={handleReset}
            className="mt-4 bg-gradient-to-r from-[#3D6B2C] to-[#4CAF50] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"         
        >
            Try Again   </button>
   
    </div>
  )
}
