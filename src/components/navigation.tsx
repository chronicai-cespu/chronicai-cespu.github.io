
"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, MessageCircle, User, ClipboardList } from 'lucide-react';
import { AppLogo } from '@/components/app-logo';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Início', icon: LayoutDashboard },
    { href: '/chat', label: 'Assistente IA', icon: MessageCircle },
    { href: '/logs', label: 'Registos', icon: ClipboardList },
    { href: '/profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <AppLogo className="text-white w-6 h-6" />
              </div>
              <span className="font-bold text-xl text-primary font-headline hidden sm:block">ChronicAI</span>
            </Link>
          </div>
          <div className="flex space-x-2 sm:space-x-4 md:space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors border-b-2 h-full gap-2",
                    isActive 
                      ? "border-primary text-primary" 
                      : "border-transparent text-muted-foreground hover:text-secondary hover:border-secondary"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
