'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Settings,
  LifeBuoy,
  Menu,
  TrendingUp,
  User,
  ChevronDown,
  LogOut,
  BrainCircuit,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { usePortfolioContext } from './app-layout';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/portfolio-growth', label: 'Portfolio Growth', icon: TrendingUp },
  { href: '/scenario-simulation', label: 'Scenario Simulation', icon: BrainCircuit },
];

export function Header() {
  const pathname = usePathname();
  const { fundId, setFundId, asOfDate, setAsOfDate } = usePortfolioContext();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-4 border-b border-border bg-header px-3">
      <div className="flex items-center gap-6">
        <Link href="/portfolio-growth" className="flex items-center gap-2">
           <Image src="https://firstrateaugmentedintelligence.com/kapnative-reporting-app/assets/images/logo-light.png" alt="KAPNATIVE Logo" width={140} height={28} />
        </Link>
        <nav className="hidden items-center gap-1 font-medium md:flex lg:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-2 rounded-md transition-colors text-sm',
                pathname.startsWith(item.href)
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
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-card">
            <nav className="grid gap-4 p-4 text-base font-medium">
              <Link
                href="/portfolio-growth"
                className="flex items-center gap-2 text-lg font-semibold mb-4"
              >
                <Image src="https://firstrateaugmentedintelligence.com/kapnative-reporting-app/assets/images/logo-light.png" alt="KAPNATIVE Logo" width={140} height={28} />
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm',
                     pathname.startsWith(item.href)
                      ? 'bg-muted text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-header hover:text-white/90">
              <User className="h-5 w-5 text-accent" />
              <span className="font-semibold text-sm">QA1 Guest</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem className="text-accent">
              <LogOut className="mr-2 h-4 w-4" />
              <span className="font-medium">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
