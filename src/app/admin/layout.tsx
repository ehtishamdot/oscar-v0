'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { ThemeProvider } from '@/components/admin/theme-provider';
import {
  LayoutDashboard,
  Users,
  Receipt,
  FolderOpen,
  BarChart3,
  LogOut,
  Menu,
  X,
  Loader2,
  Moon,
  Sun,
  Shield,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/partners', label: 'Partners', icon: Users },
  { href: '/admin/billing', label: 'Facturatie', icon: Receipt },
  { href: '/admin/cases', label: 'Cases', icon: FolderOpen },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-slate-300" />
      )}
    </button>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Skip auth check for login page
  const isLoginPage = pathname === '/admin/login';

  // Get current page name for breadcrumb
  const currentPage = navItems.find(item => item.href === pathname)?.label || 'Admin';

  useEffect(() => {
    if (isLoginPage) {
      setAuthenticated(true);
      return;
    }

    checkAuth();
  }, [pathname, isLoginPage]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();

      if (data.authenticated) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
        router.push('/admin/login');
      }
    } catch (error) {
      setAuthenticated(false);
      router.push('/admin/login');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show login page without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading while checking auth
  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Laden...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="ml-2 flex items-center">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="ml-2 font-bold text-gray-900 dark:text-white">Oscar Admin</span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white z-50 transform transition-transform lg:translate-x-0 shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold">Oscar Admin</h1>
                <p className="text-slate-400 text-xs">Beheerportaal</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500">Thema</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
          >
            <LogOut className="h-5 w-5 mr-3 text-slate-400 group-hover:text-red-400" />
            <span className="font-medium">Uitloggen</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        {/* Breadcrumb Bar */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-sm">
            <Link href="/admin/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              Admin
            </Link>
            <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">{currentPage}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              Beveiligd
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ThemeProvider>
  );
}
