/**
 * Refresh Button - Client Component
 */

'use client'

export default function RefreshButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
    >
      Refresh Page
    </button>
  )
}
