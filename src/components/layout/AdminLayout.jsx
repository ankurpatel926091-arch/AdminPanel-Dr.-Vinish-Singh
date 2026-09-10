import React, { useState, useEffect, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SearchModal from '../common/SearchModal';
import { Loader2 } from 'lucide-react';

const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-slate-500">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
    <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Loading Page...</span>
  </div>
);

export default function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setDesktopCollapsed(!desktopCollapsed);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={mobileSidebarOpen} 
        isCollapsed={desktopCollapsed}
        onClose={() => setMobileSidebarOpen(false)} 
      />

      {/* Main Content Workspace Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        desktopCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        <Header 
          onToggleSidebar={handleToggleSidebar}
          onOpenSearch={() => setSearchOpen(true)}
        />
        
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* Quick Search Ctrl+K Modal */}
      <SearchModal 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
      />
    </div>
  );
}
