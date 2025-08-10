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
import { UserX } from 'lucide-react';

interface ApiResponse {
  status: boolean;
  code: number;
  message: string;
}

interface EmptyStateProps {
  apiResponse: ApiResponse;
}

export function EmptyState({ apiResponse }: EmptyStateProps) {
  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <Card className="border shadow-sm text-center">
        <CardHeader className="pb-4 flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <UserX className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Profile Not Found</CardTitle>
          <CardDescription>
            {apiResponse.message ||
              "We couldn't find your profile data. Please try logging in again."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This might be because you haven&apos;t completed your profile setup, or there was an
            issue loading your data.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => (window.location.href = '/login')}>Go to Login</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
