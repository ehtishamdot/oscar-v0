import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import type { ReactNode } from 'react';
import Link from 'next/link';

type CtaSectionProps = {
  icon: ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
  children?: ReactNode;
};

const CtaSection = ({ icon, title, description, buttonText, buttonLink, children }: CtaSectionProps) => {

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-start gap-4">
        {icon}
        <div className="flex-1">
            <CardTitle className="font-headline text-2xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-base">{description}</CardDescription>
        {children}
      </CardContent>
      <CardFooter>
        {buttonLink ? (
          <Button asChild
              className="w-full sm:w-auto"
              style={{
                  backgroundColor: 'hsl(var(--accent))',
                  color: 'hsl(var(--accent-foreground))'
              }}
          >
            <Link href={buttonLink}>{buttonText}</Link>
          </Button>
        ) : (
            <Button
                className="w-full sm:w-auto"
                style={{
                    backgroundColor: 'hsl(var(--accent))',
                    color: 'hsl(var(--accent-foreground))'
                }}
            >
                {buttonText}
            </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CtaSection;
