'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

// Dynamically import WhopIframeSdkProvider to prevent SSR issues
const WhopIframeSdkProvider = dynamic(
  () => import('@whop/react').then(mod => mod.WhopIframeSdkProvider),
  { 
    ssr: false,
    loading: () => null 
  }
) as React.ComponentType<{ children: ReactNode }>

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WhopIframeSdkProvider>
      {children}
    </WhopIframeSdkProvider>
  )
}