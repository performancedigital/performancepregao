'use client'

import { ReactNode, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-60">
        {/* Header */}
        <Header onMobileMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
