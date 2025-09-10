'use client'

import { useEffect, useState } from 'react'
import { ErrorBoundary } from './error-boundary'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Initialize Whop SDK if in iframe
    if (typeof window !== 'undefined') {
      try {
        if (window.self !== window.top) {
          // We're in an iframe - SDK initialization could go here
          console.log('Running in Whop iframe context')
        }
      } catch (e) {
        // Can't access parent, likely in iframe
        console.log('Running in restricted iframe context')
      }
    }
  }, [])

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  // For now, just render children without the problematic provider
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}