import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Shield, Clock, Users, Star, Award, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function HeroSection() {
  const stats = [
    { number: '50K+', label: 'Khách hàng tin tưởng', icon: Users },
    { number: '4.9/5', label: 'Đánh giá trung bình', icon: Star },
    { number: '24/7', label: 'Hỗ trợ khách hàng', icon: Clock },
    { number: '1000+', label: 'Chuyên gia đối tác', icon: Award },
  ];

  const features = [
    'Đặt lịch online nhanh chóng',
    'Giá cả minh bạch, không phát sinh',
    'Đội ngũ chuyên nghiệp được xác minh',
  ];

  const testimonials = [
    { name: 'Nguyễn Minh', role: 'Khách hàng VIP', avatar: '/avatar1.jpg' },
    { name: 'Trần Thu', role: 'Khách hàng thường xuyên', avatar: '/avatar2.jpg' },
    { name: 'Lê Hoàng', role: 'Khách hàng mới', avatar: '/avatar3.jpg' },
  ];

  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-green-100/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-green-200/10 rounded-full blur-3xl" />

      {/* Geometric patterns */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-5">
        <div className="grid grid-cols-8 gap-4 h-full p-8">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className="bg-green-600 rounded-sm animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      <div className="container relative z-10 px-4 py-12 lg:py-10 mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex">
              <Badge className="bg-green-50 text-green-700 border-green-200 px-4 py-2 text-sm font-medium hover:bg-green-100 transition-colors">
                <Zap className="w-4 h-4 mr-2" />
                Nền tảng dịch vụ gia đình hàng đầu Việt Nam
              </Badge>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                Dịch vụ gia đình
                <span className="block text-green-600 relative">
                  chuyên nghiệp
                  <div className="absolute -bottom-2 left-0 w-fit h-1 bg-gradient-to-r from-green-600 to-green-400 rounded-full transform origin-left animate-pulse" />
                </span>
                <span className="block">tại nhà bạn</span>
              </h1>

              <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                Kết nối bạn với các chuyên gia tin cậy cho mọi nhu cầu sửa chữa, vệ sinh và bảo trì
                tại nhà với chất lượng đảm bảo.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 justify-center lg:justify-start"
                >
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <span className="text-lg text-foreground font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                Khám phá dịch vụ
                <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-2 border-green-200 text-green-700 hover:bg-green-50 px-8 py-4 text-lg font-semibold transition-all duration-300"
              >
                <Shield className="mr-3 w-5 h-5" />
                Tìm hiểu thêm
              </Button>
            </div>

            {/* Testimonials */}
            <div className="flex items-center gap-6 justify-center lg:justify-start pt-8">
              <div className="flex -space-x-3">
                {testimonials.map((testimonial, index) => (
                  <Avatar key={index} className="w-12 h-12 border-4 border-background shadow-lg">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                      {testimonial.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">2,000+</span> khách hàng hài lòng
                </p>
              </div>
            </div>
          </div>

          {/* Right Content - Stats Cards */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 border-green-100/50 hover:border-green-200"
                >
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-xl mb-4 group-hover:bg-green-100 transition-colors">
                      <stat.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">{stat.number}</div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Feature Highlight Card */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Cam kết chất lượng 100%
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Tất cả các chuyên gia đều được xác minh kỹ lưỡng và có bảo hiểm. Chúng tôi đảm
                      bảo chất lượng dịch vụ hoặc hoàn tiền.
                    </p>
                    {/* <div className="flex items-center gap-2 mt-4 text-sm font-medium text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      Bảo hành dịch vụ 30 ngày
                    </div> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/80 to-transparent" />
    </section>
  );
}
