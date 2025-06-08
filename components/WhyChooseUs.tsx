import { Shield, Award, Clock, CheckCircle } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    {
      icon: Shield,
      title: 'Nhà cung cấp đã được xác minh',
      description:
        'Tất cả các nhà cung cấp dịch vụ đều được kiểm tra lý lịch, cấp phép và bảo hiểm',
      color: 'blue',
    },
    {
      icon: Award,
      title: 'Đảm bảo chất lượng',
      description: 'Đảm bảo hài lòng 100% cho tất cả các dịch vụ với chất lượng đảm bảo',
      color: 'green',
    },
    {
      icon: Clock,
      title: 'Đặt ngay',
      description: 'Đặt dịch vụ trực tuyến ngay lập tức với giá cả minh bạch',
      color: 'purple',
    },
    {
      icon: CheckCircle,
      title: 'Quản lý dễ dàng',
      description: 'Theo dõi đặt chỗ của bạn, giao tiếp với nhà cung cấp và quản lý thanh toán',
      color: 'orange',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container px-4 mx-auto">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Tại sao chọn Home 360
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Trải nghiệm cách thuận tiện nhất để đặt dịch vụ tại nhà với nền tảng toàn diện của chúng
            tôi
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`bg-${feature.color}-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              <div
                className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-${feature.color}-400 to-${feature.color}-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
