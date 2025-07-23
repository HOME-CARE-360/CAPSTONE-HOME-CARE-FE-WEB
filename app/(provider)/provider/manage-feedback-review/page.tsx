import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  TrendingUp,
  MessageSquare,
  Search,
  Reply,
  Flag,
  ThumbsUp,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import { SiteHeader } from '@/app/(provider)/components/SiteHeader';

export default function SupplierFeedbackPage() {
  const feedbackStats = {
    averageRating: 4.7,
    totalReviews: 342,
    ratingDistribution: [
      { stars: 5, count: 198, percentage: 58 },
      { stars: 4, count: 89, percentage: 26 },
      { stars: 3, count: 34, percentage: 10 },
      { stars: 2, count: 14, percentage: 4 },
      { stars: 1, count: 7, percentage: 2 },
    ],
    monthlyTrend: '+12%',
    responseRate: 89,
  };

  const serviceReviews = [
    {
      id: 1,
      customer: {
        name: 'Sarah Johnson',
        avatar: '/placeholder.svg?height=40&width=40',
        initials: 'SJ',
      },
      service: 'Dọn dẹp nhà cửa chuyên sâu',
      rating: 5,
      date: '15-01-2024',
      comment:
        'Dịch vụ tuyệt vời! Đội ngũ chuyên nghiệp, kỹ lưỡng và làm cho nhà tôi sạch bong. Họ chú ý đến từng chi tiết và thậm chí còn dọn dẹp những khu vực tôi không ngờ tới. Chắc chắn sẽ đặt lại!',
      images: ['/placeholder.svg?height=100&width=100', '/placeholder.svg?height=100&width=100'],
      helpful: 12,
      responded: false,
      verified: true,
      staff: ['Maria', 'Carlos'],
    },
    {
      id: 2,
      customer: {
        name: 'Mike Chen',
        avatar: '/placeholder.svg?height=40&width=40',
        initials: 'MC',
      },
      service: 'Sửa chữa ống nước',
      rating: 4,
      date: '12-01-2024',
      comment:
        'Nhìn chung dịch vụ tốt. Thợ sửa ống nước đến đúng giờ và khắc phục sự cố nhanh chóng. Tuy nhiên, việc dọn dẹp có thể tốt hơn. Giá cả hợp lý cho công việc đã hoàn thành.',
      images: [],
      helpful: 8,
      responded: true,
      verified: true,
      staff: ['John'],
      response: {
        date: '13-01-2024',
        message:
          'Cảm ơn phản hồi của bạn, Mike! Chúng tôi rất vui vì đã có thể khắc phục sự cố ống nước của bạn một cách nhanh chóng. Chúng tôi sẽ đảm bảo cải thiện quy trình dọn dẹp của mình. Cảm ơn bạn đã tin dùng dịch vụ!',
      },
    },
    {
      id: 3,
      customer: {
        name: 'Lisa Williams',
        avatar: '/placeholder.svg?height=40&width=40',
        initials: 'LW',
      },
      service: 'Bảo trì HVAC',
      rating: 2,
      date: '10-01-2024',
      comment:
        'Kỹ thuật viên đến muộn và có vẻ không am hiểu lắm. Phải gọi lại vào ngày hôm sau vì sự cố chưa được giải quyết triệt để. Không hài lòng với chất lượng dịch vụ.',
      images: [],
      helpful: 3,
      responded: false,
      verified: true,
      staff: ['Robert'],
      flagged: true,
    },
  ];

  const staffReviews = [
    {
      id: 1,
      staff: {
        name: 'Maria Rodriguez',
        avatar: '/placeholder.svg?height=40&width=40',
        initials: 'MR',
        role: 'Chuyên viên Dọn dẹp',
      },
      rating: 4.9,
      totalReviews: 87,
      recentReviews: [
        {
          customer: 'Sarah Johnson',
          rating: 5,
          comment:
            'Maria cực kỳ kỹ lưỡng và chuyên nghiệp. Người dọn dẹp tốt nhất chúng tôi từng có!',
          date: '15-01-2024',
        },
        {
          customer: 'David Kim',
          rating: 5,
          comment: 'Chú ý đến chi tiết một cách đáng kinh ngạc. Maria đã làm vượt cả mong đợi.',
          date: '12-01-2024',
        },
      ],
    },
    {
      id: 2,
      staff: {
        name: 'John Smith',
        avatar: '/placeholder.svg?height=40&width=40',
        initials: 'JS',
        role: 'Thợ sửa ống nước',
      },
      rating: 4.6,
      totalReviews: 64,
      recentReviews: [
        {
          customer: 'Mike Chen',
          rating: 4,
          comment: 'Chuyên nghiệp và hiệu quả. Đã khắc phục sự cố nhanh chóng.',
          date: '12-01-2024',
        },
        {
          customer: 'Anna Brown',
          rating: 5,
          comment: 'John giải thích mọi thứ rõ ràng và làm việc xuất sắc.',
          date: '08-01-2024',
        },
      ],
    },
    {
      id: 3,
      staff: {
        name: 'Robert Davis',
        avatar: '/placeholder.svg?height=40&width=40',
        initials: 'RD',
        role: 'Kỹ thuật viên HVAC',
      },
      rating: 3.8,
      totalReviews: 45,
      recentReviews: [
        {
          customer: 'Lisa Williams',
          rating: 2,
          comment: 'Đến muộn và phải gọi lại vì công việc chưa hoàn thành.',
          date: '10-01-2024',
        },
        {
          customer: 'Tom Wilson',
          rating: 4,
          comment: 'Kiến thức kỹ thuật tốt, nhưng giao tiếp có thể cải thiện.',
          date: '05-01-2024',
        },
      ],
      needsAttention: true,
    },
  ];

  return (
    <>
      <SiteHeader title="Phản hồi từ Khách hàng" />

      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          {/* Tổng quan chỉ số */}
          <section className="py-8">
            <div className="container px-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Star className="h-8 w-8 text-yellow-500" />
                      <div>
                        <div className="text-2xl font-bold">{feedbackStats.averageRating}</div>
                        <div className="text-sm text-muted-foreground">Xếp hạng Trung bình</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">
                        {feedbackStats.monthlyTrend} trong tháng này
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-8 w-8 text-blue-500" />
                      <div>
                        <div className="text-2xl font-bold">{feedbackStats.totalReviews}</div>
                        <div className="text-sm text-muted-foreground">Tổng số Đánh giá</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">Trên tất cả dịch vụ</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Reply className="h-8 w-8 text-green-500" />
                      <div>
                        <div className="text-2xl font-bold">{feedbackStats.responseRate}%</div>
                        <div className="text-sm text-muted-foreground">Tỷ lệ Phản hồi</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">Trong 30 ngày qua</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-8 w-8 text-orange-500" />
                      <div>
                        <div className="text-2xl font-bold">3</div>
                        <div className="text-sm text-muted-foreground">Cần chú ý</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">Đánh giá xếp hạng thấp</div>
                  </CardContent>
                </Card>
              </div>

              {/* Phân bổ Xếp hạng */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Phân bổ Xếp hạng</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feedbackStats.ratingDistribution.map(rating => (
                      <div key={rating.stars} className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 w-16">
                          <span className="text-sm">{rating.stars}</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${rating.percentage}%` }}
                          />
                        </div>
                        <div className="text-sm text-muted-foreground w-20">
                          {rating.count} đánh giá
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Các tab Phản hồi */}
              <Tabs defaultValue="service-reviews" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="service-reviews">Đánh giá Dịch vụ</TabsTrigger>
                  <TabsTrigger value="staff-reviews">Đánh giá Nhân viên</TabsTrigger>
                </TabsList>

                {/* Tab Đánh giá Dịch vụ */}
                <TabsContent value="service-reviews" className="space-y-6">
                  {/* Bộ lọc */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Tìm kiếm đánh giá..." className="pl-10" />
                        </div>
                        <Select>
                          <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Xếp hạng" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả Xếp hạng</SelectItem>
                            <SelectItem value="5">5 Sao</SelectItem>
                            <SelectItem value="4">4 Sao</SelectItem>
                            <SelectItem value="3">3 Sao</SelectItem>
                            <SelectItem value="2">2 Sao</SelectItem>
                            <SelectItem value="1">1 Sao</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Dịch vụ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả Dịch vụ</SelectItem>
                            <SelectItem value="cleaning">Dọn dẹp</SelectItem>
                            <SelectItem value="plumbing">Sửa ống nước</SelectItem>
                            <SelectItem value="electrical">Sửa điện</SelectItem>
                            <SelectItem value="hvac">HVAC</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả Đánh giá</SelectItem>
                            <SelectItem value="responded">Đã phản hồi</SelectItem>
                            <SelectItem value="pending">Chờ phản hồi</SelectItem>
                            <SelectItem value="flagged">Đã gắn cờ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Danh sách Đánh giá */}
                  <div className="space-y-6">
                    {serviceReviews.map(review => (
                      <Card key={review.id} className={review.flagged ? 'border-red-200' : ''}>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* Header Đánh giá */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <Avatar>
                                  <AvatarImage src={review.customer.avatar || '/placeholder.svg'} />
                                  <AvatarFallback>{review.customer.initials}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-semibold">{review.customer.name}</h4>
                                    {review.verified && (
                                      <Badge variant="secondary" className="text-xs">
                                        Đã xác minh
                                      </Badge>
                                    )}
                                    {review.flagged && (
                                      <Badge variant="destructive" className="text-xs">
                                        <Flag className="h-3 w-3 mr-1" />
                                        Đã gắn cờ
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center space-x-2 text-sm text-muted-foreground">
                                    <span>{review.service}</span>
                                    <span>•</span>
                                    <span>{review.date}</span>
                                    <span>•</span>
                                    <span>Nhân viên: {review.staff.join(', ')}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Nội dung Đánh giá */}
                            <div className="space-y-3">
                              <p className="text-muted-foreground">{review.comment}</p>

                              {/* Hình ảnh Đánh giá */}
                              {review.images.length > 0 && (
                                <div className="flex space-x-2">
                                  {review.images.map((image, index) => (
                                    <Image
                                      key={index}
                                      src={image || '/placeholder.svg'}
                                      alt={`Hình ảnh đánh giá ${index + 1}`}
                                      width={100}
                                      height={100}
                                      className="rounded-lg object-cover cursor-pointer hover:opacity-80"
                                    />
                                  ))}
                                </div>
                              )}

                              {/* Hành động Đánh giá */}
                              <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{review.helpful} hữu ích</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {!review.responded && (
                                    <Button size="sm">
                                      <Reply className="h-4 w-4 mr-2" />
                                      Phản hồi
                                    </Button>
                                  )}
                                  <Button variant="outline" size="sm">
                                    <Flag className="h-4 w-4 mr-2" />
                                    Gắn cờ
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Phản hồi của Nhà cung cấp */}
                            {review.response && (
                              <>
                                <Separator />
                                <div className="bg-muted/50 p-4 rounded-lg">
                                  <div className="flex items-start space-x-3">
                                    <div className="bg-blue-600 p-2 rounded-full">
                                      <Reply className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-semibold text-sm">
                                          Phản hồi của bạn
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {review.response.date}
                                        </span>
                                      </div>
                                      <p className="text-sm">{review.response.message}</p>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Tab Đánh giá Nhân viên */}
                <TabsContent value="staff-reviews" className="space-y-6">
                  <div className="grid gap-6">
                    {staffReviews.map(staff => (
                      <Card
                        key={staff.id}
                        className={staff.needsAttention ? 'border-orange-200' : ''}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={staff.staff.avatar || '/placeholder.svg'} />
                                <AvatarFallback>{staff.staff.initials}</AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="flex items-center space-x-2">
                                  <span>{staff.staff.name}</span>
                                  {staff.needsAttention && (
                                    <Badge
                                      variant="outline"
                                      className="text-orange-600 border-orange-200"
                                    >
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Cần chú ý
                                    </Badge>
                                  )}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">{staff.staff.role}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1">
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                <span className="text-xl font-bold">{staff.rating}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {staff.totalReviews} đánh giá
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <h4 className="font-semibold">Đánh giá Gần đây</h4>
                            <div className="space-y-3">
                              {staff.recentReviews.map((review, index) => (
                                <div key={index} className="border-l-2 border-muted pl-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-sm">{review.customer}</span>
                                    <div className="flex items-center space-x-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-3 w-3 ${
                                            i < review.rating
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-1">
                                    {review.comment}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{review.date}</p>
                                </div>
                              ))}
                            </div>
                            <Button variant="outline" size="sm" className="w-full">
                              Xem tất cả đánh giá cho {staff.staff.name}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
