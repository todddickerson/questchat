'use client'

import { WhopIframeSdkProvider } from '@whop/react'
import { useEffect, useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR/SSG, just render children without the provider
  if (!mounted) {
    return <>{children}</>
  }

  // Only initialize WhopIframeSdkProvider on client side
  return (
    <WhopIframeSdkProvider>
      {children}
    </WhopIframeSdkProvider>
  )
}