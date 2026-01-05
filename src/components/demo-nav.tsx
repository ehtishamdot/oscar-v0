'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { User, Stethoscope, Building2, Home, ChevronDown, Shield, Menu } from 'lucide-react';

export default function DemoNav() {
  const pathname = usePathname();
  const { currentUser, loginAs, patients, careRequests } = useDemo();

  // Don't show on main demo page
  if (pathname === '/demo') return null;

  const pendingRequests = careRequests.filter(r => r.status === 'pending').length;

  const roleConfig = {
    patient: { icon: <User className="h-4 w-4" />, label: 'Patiënt', color: 'bg-blue-100 text-blue-800' },
    coordinator: { icon: <Stethoscope className="h-4 w-4" />, label: 'Regiehouder', color: 'bg-green-100 text-green-800' },
    provider: { icon: <Building2 className="h-4 w-4" />, label: 'Zorgverlener', color: 'bg-purple-100 text-purple-800' },
  };

  const config = currentUser ? roleConfig[currentUser.role] : null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-full shadow-lg h-14 px-4 gap-2">
            <Menu className="h-5 w-5" />
            {config && (
              <Badge variant="secondary" className={config.color}>
                {config.icon}
                <span className="ml-1 hidden sm:inline">{config.label}</span>
              </Badge>
            )}
            {pendingRequests > 0 && (
              <Badge className="bg-amber-500 ml-1">{pendingRequests}</Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Demo Navigatie</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/demo" className="cursor-pointer">
              <Home className="mr-2 h-4 w-4" />
              Demo Start
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">Wissel Rol</DropdownMenuLabel>

          <DropdownMenuItem asChild>
            <Link href="/demo/register" className="cursor-pointer" onClick={() => loginAs('patient')}>
              <User className="mr-2 h-4 w-4 text-blue-600" />
              Nieuwe Patiënt
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/demo/coordinator" className="cursor-pointer" onClick={() => loginAs('coordinator')}>
              <Stethoscope className="mr-2 h-4 w-4 text-green-600" />
              Regiehouder
              {patients.length > 0 && (
                <Badge variant="secondary" className="ml-auto">{patients.length}</Badge>
              )}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/demo/provider" className="cursor-pointer" onClick={() => loginAs('provider')}>
              <Building2 className="mr-2 h-4 w-4 text-purple-600" />
              Zorgverlener
              {pendingRequests > 0 && (
                <Badge className="ml-auto bg-amber-500">{pendingRequests}</Badge>
              )}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/demo/audit" className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              Audit Log
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
