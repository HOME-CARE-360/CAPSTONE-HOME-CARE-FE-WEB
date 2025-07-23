import { Shield, Award, Clock, CheckCircle, Star, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function WhyChooseUs() {
  const features = [
    {
      icon: Shield,
      title: 'Nhà cung cấp được xác minh',
      description:
        'Tất cả đối tác đều qua kiểm tra lý lịch kỹ lưỡng, có chứng chỉ hành nghề và bảo hiểm trách nhiệm nghề nghiệp.',
      stats: '100% xác minh',
      highlight: 'An toàn tuyệt đối',
      color: 'red',
    },
    {
      icon: Award,
      title: 'Cam kết chất lượng',
      description:
        'Đảm bảo hài lòng 100% với chế độ bảo hành dịch vụ. Không hài lòng? Chúng tôi sẽ làm lại miễn phí.',
      stats: '4.9/5 sao',
      highlight: 'Chất lượng vượt trội',
      color: 'red',
    },
    {
      icon: Clock,
      title: 'Đặt lịch nhanh chóng',
      description:
        'Đặt dịch vụ chỉ trong 30 giây với giá cả minh bạch, không phát sinh. Xác nhận ngay lập tức.',
      stats: '< 30 giây',
      highlight: 'Siêu tốc độ',
      color: 'red',
    },
    {
      icon: CheckCircle,
      title: 'Quản lý thông minh',
      description:
        'Theo dõi tiến độ real-time, chat trực tiếp với thợ, thanh toán an toàn và đánh giá dịch vụ dễ dàng.',
      stats: '24/7 hỗ trợ',
      highlight: 'Tiện lợi tối đa',
      color: 'red',
    },
  ];

  const testimonialStats = [
    { number: '50K+', label: 'Khách hàng tin tưởng' },
    { number: '98%', label: 'Tỷ lệ hài lòng' },
    { number: '1000+', label: 'Chuyên gia đối tác' },
    { number: '24/7', label: 'Hỗ trợ khách hàng' },
  ];

  return (
    <section className="relative py-24 bg-background overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-100/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-200/5 rounded-full blur-3xl" />

      {/* Floating geometric shapes */}
      <div
        className="absolute top-20 right-10 w-4 h-4 bg-green-200 rounded-full animate-bounce"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="absolute top-40 left-10 w-3 h-3 bg-green-300 rounded-full animate-bounce"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute bottom-40 right-20 w-5 h-5 bg-green-100 rounded-full animate-bounce"
        style={{ animationDelay: '2s' }}
      />

      <div className="container relative z-10 px-4 mx-auto">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-20">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Tại sao chọn chúng tôi?</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold tracking-tight">
            Tại sao chọn{' '}
            <span className="relative">
              <span className="text-green-600">HomeCare</span>
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-green-600 to-green-400 rounded-full" />
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Nền tảng dịch vụ gia đình hàng đầu Việt Nam với hệ sinh thái toàn diện, mang đến trải
            nghiệm đặt dịch vụ tại nhà thuận tiện và đáng tin cậy nhất.
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8">
            {testimonialStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-green-100/50 hover:border-green-200 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-3"
            >
              <CardContent className="p-8">
                {/* Icon and Badge */}
                <div className="flex items-start justify-between mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center group-hover:bg-green-100 transition-all duration-300 group-hover:scale-110">
                      <feature.icon className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-white fill-current" />
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-50 text-green-700 border-green-200 text-xs"
                  >
                    {feature.stats}
                  </Badge>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-green-600 transition-colors">
                      {feature.title}
                    </h3>
                    <div className="text-sm font-medium text-green-600 mb-3">
                      {feature.highlight}
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity">
                  <feature.icon className="w-full h-full text-green-600" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
