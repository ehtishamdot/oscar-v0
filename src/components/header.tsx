import Link from 'next/link';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-5xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline text-primary-foreground">
            Oscar
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
            Over Artrose
          </Link>
          <Link href="/questionnaire" className="text-sm text-muted-foreground hover:text-foreground">
            Vragenlijst
          </Link>
          <Button asChild size="sm" variant="outline">
            <Link href="/demo">
              <Badge variant="secondary" className="mr-2 text-xs">Nieuw</Badge>
              Platform Demo
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
