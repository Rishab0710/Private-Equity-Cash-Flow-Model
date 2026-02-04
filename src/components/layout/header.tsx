'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, User, ChevronDown, LogOut, BrainCircuit, ClipboardList, TrendingUp } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/', label: 'Assumptions Studio', icon: ClipboardList },
  { href: '/portfolio-growth', label: 'Build Model Portfolio', icon: TrendingUp },
  { href: '/scenario-simulation', label: 'Scenario Simulation', icon: BrainCircuit },
];

export function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-4 border-b border-border bg-header px-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
           <Image src="https://firstrateaugmentedintelligence.com/kapnative-reporting-app/assets/images/logo-light.png" alt="KAPNATIVE Logo" width={120} height={24} />
        </Link>
        <nav className="hidden items-center gap-1 font-medium md:flex lg:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-1.5 rounded-md transition-colors text-xs',
                pathname === item.href || (pathname === '/' && item.href === '/')
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex flex-1 items-center justify-end gap-2">
        {mounted && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-header hover:text-white/90">
                <User className="h-4 w-4 text-accent" />
                <span className="font-semibold text-xs">QA1 Guest</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuItem className="text-accent cursor-pointer"><LogOut className="mr-2 h-4 w-4" /><span className="font-medium text-black">Logout</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
