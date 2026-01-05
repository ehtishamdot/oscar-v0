'use client';

import Link from 'next/link';
import { useDemo } from '@/lib/demo-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Stethoscope, Building2, LogOut, ChevronDown, Home } from 'lucide-react';
import Logo from './logo';

export default function DemoHeader() {
  const { currentUser, logout, loginAs } = useDemo();

  const roleConfig = {
    patient: { icon: <User className="h-4 w-4" />, label: 'Patiënt', color: 'bg-blue-100 text-blue-800' },
    coordinator: { icon: <Stethoscope className="h-4 w-4" />, label: 'Regiehouder', color: 'bg-green-100 text-green-800' },
    provider: { icon: <Building2 className="h-4 w-4" />, label: 'Zorgverlener', color: 'bg-purple-100 text-purple-800' },
  };

  const config = currentUser ? roleConfig[currentUser.role] : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/demo" className="flex items-center gap-2">
            <Logo />
          </Link>
          <Badge variant="outline" className="hidden sm:flex">DEMO</Badge>
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <div className="hidden md:flex items-center gap-2">
                <Badge className={config?.color}>
                  {config?.icon}
                  <span className="ml-1">{config?.label}</span>
                </Badge>
                <span className="text-sm text-muted-foreground">{currentUser.name}</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Wissel Rol
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Demo Rollen</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/demo/register" onClick={() => loginAs('patient')}>
                      <User className="mr-2 h-4 w-4" />
                      Patiënt
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/demo/coordinator" onClick={() => loginAs('coordinator')}>
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Regiehouder
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/demo/provider" onClick={() => loginAs('provider')}>
                      <Building2 className="mr-2 h-4 w-4" />
                      Zorgverlener
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/demo" onClick={logout}>
                      <Home className="mr-2 h-4 w-4" />
                      Terug naar Start
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild>
              <Link href="/demo">Start Demo</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
