'use client';

import { useMemo } from 'react';
import { useGetTransactions } from '@/hooks/useUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDownRight, ArrowUpRight, ReceiptText } from 'lucide-react';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import { Separator } from '@/components/ui/separator';

export default function TransactionsPage() {
  const { data, isLoading, error } = useGetTransactions();

  const wallet = data?.data?.data?.wallet;
  const moneyIn = wallet?.moneyIn ?? [];
  const moneyOut = wallet?.moneyOut ?? [];

  const getGatewayDisplayName = (gateway: string) => {
    switch (gateway) {
      case 'INTERNAL_WALLET':
        return 'Ví nội bộ';
      case 'PAYOS':
        return 'PayOS';
      case 'INTERNAL':
        return 'Hệ thống';
      default:
        return gateway;
    }
  };

  const totals = useMemo(() => {
    const inSum = moneyIn.reduce((sum, t) => sum + (t.amountIn || 0), 0);
    const outSum = moneyOut.reduce((sum, t) => sum + (t.amountOut || 0), 0);
    return { inSum, outSum, net: inSum - outSum };
  }, [moneyIn, moneyOut]);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Giao dịch</CardTitle>
          </CardHeader>
          <CardContent>Không thể tải giao dịch. Vui lòng thử lại sau.</CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-40" />
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-emerald-600" /> Tiền của bạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              {formatCurrency(totals.inSum, 'VND')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tổng thu nhập</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-rose-600" /> Chi tiêu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700">
              {formatCurrency(totals.outSum, 'VND')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tổng chi tiêu</p>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" /> Số dư
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.net, 'VND')}</div>
            <p className="text-xs text-muted-foreground mt-1">Thu nhập - Chi tiêu</p>
          </CardContent>
        </Card> */}
      </div>

      <Tabs defaultValue="in" className="w-full">
        <TabsList>
          <TabsTrigger value="in">Thu nhập ({moneyIn.length})</TabsTrigger>
          <TabsTrigger value="out">Chi tiêu ({moneyOut.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="in" className="space-y-3">
          {moneyIn.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                Không có giao dịch
              </CardContent>
            </Card>
          ) : (
            moneyIn.map(tx => (
              <Card key={`in-${tx.id}`}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        {getGatewayDisplayName(tx.gateway)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(tx.transactionDate).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="text-emerald-700 font-semibold">
                      + {formatCurrency(tx.amountIn, 'VND')}
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="text-sm flex items-center justify-between gap-4">
                    <div className="text-muted-foreground">{tx.transactionContent}</div>
                    {tx.referenceNumber && (
                      <div className="text-xs bg-muted px-2 py-1 rounded">
                        REF: {tx.referenceNumber}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="out" className="space-y-3">
          {moneyOut.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                Không có giao dịch
              </CardContent>
            </Card>
          ) : (
            moneyOut.map(tx => (
              <Card key={`out-${tx.id}`}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-rose-100 text-rose-700 border-rose-200">
                        {getGatewayDisplayName(tx.gateway)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(tx.transactionDate).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="text-rose-700 font-semibold">
                      - {formatCurrency(tx.amountOut, 'VND')}
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="text-muted-foreground flex items-center gap-2">
                      <ReceiptText className="w-4 h-4" /> {tx.transactionContent}
                    </div>
                    <div className="text-right">
                      {tx.serviceRequestId && (
                        <Badge variant="outline" className="text-xs">
                          SR #{tx.serviceRequestId}
                        </Badge>
                      )}
                      {tx.referenceNumber && (
                        <Badge variant="outline" className="text-xs ml-2">
                          REF: {tx.referenceNumber}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
