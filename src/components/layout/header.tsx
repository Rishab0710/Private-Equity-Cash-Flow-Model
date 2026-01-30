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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Settings,
  LifeBuoy,
  Menu,
  TrendingUp,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { usePortfolioContext } from './app-layout';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/portfolio-growth', label: 'Cash Flow Forecasting', icon: TrendingUp },
];

export function Header() {
  const pathname = usePathname();
  const { fundId, setFundId, asOfDate, setAsOfDate } = usePortfolioContext();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-4 border-b border-border bg-card px-3">
      <div className="flex items-center gap-6">
        <Link href="/portfolio-growth" className="flex items-center gap-2">
           <Image src="https://placehold.co/140x28/transparent/FFFFFF/?text=KAPNATIVE" alt="KAPNATIVE Logo" width={140} height={28} />
        </Link>
        <nav className="hidden items-center gap-1 text-xs font-medium md:flex lg:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-2 rounded-md transition-colors',
                isClient && (pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href)))
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
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
                <Image src="https://placehold.co/140x28/transparent/FFFFFF/?text=KAPNATIVE" alt="KAPNATIVE Logo" width={140} height={28} />
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm',
                    isClient && (pathname === item.href ||
                      (item.href !== '/dashboard' &&
                        pathname.startsWith(item.href)))
                      ? 'bg-primary/10 text-primary'
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
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src="https://picsum.photos/seed/1/64/64"
                  alt="User avatar"
                  data-ai-hint="profile person"
                />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Analyst Doe</p>
                <p className="text-xs leading-none text-muted-foreground">
                  analyst@verity.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
