import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SearchModal from '../common/SearchModal';

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
    <div className="min-h-screen bg-slate-50 flex">
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
          <Outlet />
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
