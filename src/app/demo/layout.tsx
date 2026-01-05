import { ReactNode } from 'react';
import DemoNav from '@/components/demo-nav';

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <DemoNav />
      <footer className="py-4 text-center text-xs text-muted-foreground border-t bg-secondary/30">
        Demo Mode - Geen echte gegevens worden opgeslagen of verzonden
      </footer>
    </>
  );
}
