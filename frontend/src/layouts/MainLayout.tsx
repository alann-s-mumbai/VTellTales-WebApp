import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { MobileHeader } from '../components/MobileHeader'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  )
}