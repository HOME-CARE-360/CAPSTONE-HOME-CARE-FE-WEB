import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  error: Error | unknown;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>Error Loading Profile</CardTitle>
          </div>
          <CardDescription>
            We encountered a problem while loading your profile data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">{errorMessage}</div>
        </CardContent>
        <CardFooter>
          <Button onClick={onRetry}>Try Again</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
