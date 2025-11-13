import { Menu, X, Bell, Search } from 'lucide-react'
import { useState } from 'react'

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-50"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary-yellow via-accent-orange to-accent-orange p-1.5 rounded-xl">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3l14 9-14 9V3z"/>
              </svg>
            </div>
            <span className="font-bold text-lg text-gray-900">VtellTales: WebApp</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-50">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-50">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg">
          {/* Mobile navigation items would go here */}
          <div className="p-4">
            <p className="text-gray-600">Mobile navigation menu</p>
          </div>
        </div>
      )}
    </header>
  )
}