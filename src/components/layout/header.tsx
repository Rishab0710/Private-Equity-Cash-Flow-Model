'use client';

import Link from 'next/link';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  AppWindow,
  Settings,
  LifeBuoy,
  Menu,
  ChevronDown
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/icons';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-card">
            <nav className="grid gap-6 text-lg font-medium">
              <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Logo className="h-6 w-6" />
                <span>Global ETF Dashboard</span>
              </Link>
              <Button variant="ghost" className="justify-start">All Funds <ChevronDown className="ml-2 h-4 w-4" /></Button>
              <Button variant="ghost" className="justify-start">Workflows</Button>
            </nav>
          </SheetContent>
        </Sheet>
        
        <Link href="/dashboard" className="hidden items-center gap-2 md:flex">
          <Logo className="h-6 w-6" />
          <h1 className="font-semibold text-lg">Global ETF Dashboard</h1>
        </Link>
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex lg:gap-2">
           <Button variant="link" className="text-foreground font-semibold">All Funds</Button>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost">
                <Calendar className="mr-2 h-4 w-4" />
                January 30th, 2026
            </Button>
             <Select defaultValue="workflows">
                <SelectTrigger className="w-[150px]">
                    <div className="flex items-center gap-2">
                        <AppWindow className="h-4 w-4" />
                        <SelectValue placeholder="Workflows" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="workflows">Workflows</SelectItem>
                    <SelectItem value="reporting">Reporting</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="https://picsum.photos/seed/風景/64/64" alt="User avatar" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Jane Doe</p>
                <p className="text-xs leading-none text-muted-foreground">
                  jane.doe@investor.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
             <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
                <LifeBuoy className="mr-2 h-4 w-4" />
                Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
