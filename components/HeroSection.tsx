import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Badge, MapPin, Search, Sparkles, Wrench } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-green-50">
      <div className="container px-4">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <Badge className="text-blue-600 bg-blue-100">
              🏠 Professional Home Services Marketplace
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
              Đặt dịch dịch với Home
              <span className="text-blue-600"> 360</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Duyệt, so sánh và đặt dịch vụ sửa chữa và vệ sinh chuyên nghiệp với giá cả minh bạch
              và đặt chỗ ngay lập tức.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Bạn muốn tìm kiếm dịch vụ gì?" className="pl-10 h-12 text-lg" />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Nhập địa chỉ của bạn" className="pl-10 h-12 text-lg" />
              </div>
              <Button size="lg" className="h-12 px-8 text-lg">
                Tìm dịch vụ
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/services/repairs">
              <Button variant="outline" className="h-12 px-6">
                <Wrench className="mr-2 h-5 w-5" />
                Sửa chữa & Bảo trì
              </Button>
            </Link>
            <Link href="/services/cleaning">
              <Button variant="outline" className="h-12 px-6">
                <Sparkles className="mr-2 h-5 w-5" />
                Dịch vụ dọn dẹp
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
