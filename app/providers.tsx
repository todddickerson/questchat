'use client'

import { Suspense, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ErrorBoundary } from './error-boundary'

// Check if we're in an iframe
const isInIframe = () => {
  if (typeof window === 'undefined') return false
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}

// Simple fallback provider that does nothing
function FallbackProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// Dynamically import WhopIframeSdkProvider only when needed
const WhopIframeSdkProvider = dynamic(
  () => import('@whop/react').then((mod) => mod.WhopIframeSdkProvider).catch(() => {
    console.warn('Failed to load WhopIframeSdkProvider, using fallback')
    return FallbackProvider
  }),
  { 
    ssr: false,
    loading: () => <FallbackProvider>{null}</FallbackProvider>
  }
)

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [inIframe, setInIframe] = useState(false)

  useEffect(() => {
    setMounted(true)
    setInIframe(isInIframe())
  }, [])

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  // Wrap everything in an error boundary
  return (
    <ErrorBoundary>
      {inIframe ? (
        <Suspense fallback={<FallbackProvider>{children}</FallbackProvider>}>
          <WhopIframeSdkProvider>
            {children}
          </WhopIframeSdkProvider>
        </Suspense>
      ) : (
        <>{children}</>
      )}
    </ErrorBoundary>
  )
}