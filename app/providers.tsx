'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamic import to prevent SSR issues
const WhopIframeSdkProvider = dynamic(
  () => import('@whop/react').then((mod) => mod.WhopIframeSdkProvider),
  { 
    ssr: false,
    loading: () => null
  }
)

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <WhopIframeSdkProvider>
        {children}
      </WhopIframeSdkProvider>
    </Suspense>
  )
}