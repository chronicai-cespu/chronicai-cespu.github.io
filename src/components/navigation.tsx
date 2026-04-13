"use client"

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, MessageCircle, User, ClipboardList, ShieldAlert, FlaskConical, LogOut } from 'lucide-react';
import { AppLogo } from '@/components/app-logo';
import { useHealth } from '@/components/health-context';
import { useAuth } from '@/firebase';
import { Button } from './ui/button';

export function Navigation() {
  const pathname = usePathname();
  const { role, assignedCode } = useHealth();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { 
      href: '/dashboard', 
      label: 'Os meus dados', 
      icon: Home,
      activeColor: "border-primary text-primary",
      hoverColor: "hover:text-primary hover:border-primary",
      show: !!role
    },
    { 
      href: '/logs', 
      label: 'Registos', 
      icon: ClipboardList,
      activeColor: "border-secondary text-secondary",
      hoverColor: "hover:text-secondary hover:border-secondary",
      show: role === 'patient' || role === 'researcher'
    },
    { 
      href: '/chat', 
      label: 'Assistente IA', 
      icon: MessageCircle,
      activeColor: "border-primary text-primary font-bold",
      hoverColor: "hover:text-primary hover:border-primary",
      show: role === 'patient'
    },
    { 
      href: '/admin', 
      label: 'Administração', 
      icon: ShieldAlert,
      activeColor: "border-red-500 text-red-500",
      hoverColor: "hover:text-red-500 hover:border-red-500",
      show: role === 'admin'
    },
    { 
      href: '/researcher', 
      label: 'Investigação', 
      icon: FlaskConical,
      activeColor: "border-purple-500 text-purple-500",
      hoverColor: "hover:text-purple-500 hover:border-purple-500",
      show: role === 'researcher' || role === 'admin'
    },
    { 
      href: '/profile', 
      label: 'Perfil', 
      icon: User,
      activeColor: "border-primary text-primary",
      hoverColor: "hover:text-primary hover:border-primary",
      show: !!role
    },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border">
                <AppLogo className="w-7 h-7" />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="font-bold text-xl font-headline hidden sm:block bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                  ChronicAI
                </span>
                {assignedCode && (
                  <span className="text-[10px] font-bold text-muted-foreground hidden sm:block">
                    Código: {assignedCode}
                  </span>
                )}
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-8 h-full">
            {navItems.filter(i => i.show).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors border-b-2 h-full gap-2",
                    isActive 
                      ? item.activeColor 
                      : cn("border-transparent text-muted-foreground", item.hoverColor)
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
            
            {!role ? (
              <Link href="/login" className="text-sm font-bold text-primary hover:underline">Entrar</Link>
            ) : (
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                <LogOut className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
