'use client';
export const dynamic = 'force-static';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, XCircle } from 'lucide-react';
import { useCheckPaymentFail } from '@/hooks/usePayment';
import { toast } from 'sonner';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderCode = useMemo(() => searchParams?.get('orderCode') || '', [searchParams]);
  const status = useMemo(() => searchParams?.get('status') || '', [searchParams]);
  const { mutateAsync, isPending, data } = useCheckPaymentFail();
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    if (!hasRequested && orderCode && status) {
      setHasRequested(true);
      mutateAsync({ orderCode, status }).catch(() => {
        toast.error('Không thể xác nhận trạng thái thanh toán');
      });
    }
  }, [orderCode, status, hasRequested, mutateAsync]);

  const goHome = () => router.push('/');
  const tryAgain = () => window.history.back();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            {isPending ? (
              <Loader2 className="h-6 w-6 animate-spin text-red-600" aria-hidden="true" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
            )}
            <CardTitle className="text-xl">Thanh toán thất bại</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            {isPending
              ? 'Đang kiểm tra trạng thái giao dịch...'
              : data?.message || 'Giao dịch của bạn chưa được xử lý hoặc đã thất bại.'}
          </p>
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mã giao dịch</span>
              <span className="font-medium">{orderCode || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trạng thái</span>
              <span className="font-medium">{status || 'FAILED'}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button className="w-full" variant="default" onClick={tryAgain} aria-label="Thử lại">
            Thử lại
          </Button>
          <Button className="w-full" variant="ghost" onClick={goHome} aria-label="Về trang chủ">
            Về trang chủ
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-red-600" aria-hidden="true" />
        </div>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}
