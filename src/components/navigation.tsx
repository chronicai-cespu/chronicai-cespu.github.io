
"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, MessageCircle, User, ClipboardList, ShieldAlert, FlaskConical, LogOut, UserPlus, LogIn } from 'lucide-react';
import { AppLogo } from '@/components/app-logo';
import { useHealth } from '@/components/health-context';
import { Button } from './ui/button';

export function Navigation() {
  const pathname = usePathname();
  const { role, assignedCode, userProfile, logout } = useHealth();

  const welcomeName = role === 'admin' ? 'Admin' : (userProfile?.name || '');

  const navItems = [
    { 
      href: '/admin', 
      label: 'Administração', 
      icon: ShieldAlert,
      activeColor: "border-red-500 text-red-500",
      show: role === 'admin'
    },
    { 
      href: '/researcher', 
      label: 'Pacientes', 
      icon: FlaskConical,
      activeColor: "border-purple-500 text-purple-500",
      show: role === 'researcher' || role === 'admin'
    },
    { 
      href: '/dashboard', 
      label: 'Painel', 
      icon: Home,
      activeColor: "border-primary text-primary",
      show: role === 'patient'
    },
    { 
      href: '/logs', 
      label: 'Registos', 
      icon: ClipboardList,
      activeColor: "border-secondary text-secondary",
      show: role === 'patient' || role === 'admin' || role === 'researcher'
    },
    { 
      href: '/chat', 
      label: 'IA Health', 
      icon: MessageCircle,
      activeColor: "border-primary text-primary font-bold",
      show: role === 'patient'
    },
    { 
      href: '/profile', 
      label: 'Perfil', 
      icon: User,
      activeColor: "border-primary text-primary",
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
              <span className="font-bold text-xl font-headline hidden sm:block bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                ChronicAI
              </span>
            </Link>

            {role && welcomeName && (
              <div className="ml-6 px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-sm font-bold hidden md:flex items-center">
                Olá, {welcomeName}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-6">
            {navItems.filter(i => i.show).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 h-full gap-2 transition-all active:scale-95",
                    isActive ? item.activeColor : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
            
            {!role ? (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-primary transition-all active:scale-95 flex items-center gap-1">
                  <LogIn className="w-4 h-4" /> Entrar
                </Link>
                <Button asChild variant="default" size="sm" className="rounded-full bg-primary shadow-md hidden sm:flex transition-all active:scale-95 active:bg-primary/80">
                  <Link href="/register" className="flex items-center gap-1">
                    <UserPlus className="w-4 h-4" /> Registar
                  </Link>
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive transition-all active:scale-90">
                <LogOut className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
