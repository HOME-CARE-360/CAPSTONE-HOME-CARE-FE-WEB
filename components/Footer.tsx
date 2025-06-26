'use client';

import Link from 'next/link';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Clock,
  Award,
  Shield,
  ArrowUp,
  Heart,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ReactNode } from 'react';

interface FooterLink {
  label: string;
  href: string;
  icon?: ReactNode;
  isNew?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface ContactInfo {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
}

export default function Footer() {
  const footerSections: FooterSection[] = [
    {
      title: 'Dịch vụ',
      links: [
        { label: 'Sửa chữa điện nước', href: '/services/plumbing' },
        { label: 'Vệ sinh nhà cửa', href: '/services/cleaning' },
        { label: 'Sửa chữa điều hòa', href: '/services/aircon' },
        { label: 'Bảo trì thiết bị', href: '/services/maintenance' },
        { label: 'Dịch vụ khẩn cấp', href: '/services/emergency', isNew: true },
      ],
    },
    {
      title: 'Về chúng tôi',
      links: [
        { label: 'Câu chuyện của chúng tôi', href: '/about' },
        { label: 'Đội ngũ chuyên gia', href: '/team' },
        { label: 'Cách thức hoạt động', href: '/how-it-works' },
        { label: 'Chứng nhận & Giải thưởng', href: '/certifications' },
        { label: 'Tin tức & Blog', href: '/blog' },
      ],
    },
    {
      title: 'Hỗ trợ',
      links: [
        { label: 'Trung tâm trợ giúp', href: '/help' },
        { label: 'Liên hệ hỗ trợ', href: '/contact' },
        { label: 'Câu hỏi thường gặp', href: '/faq' },
        { label: 'Hướng dẫn đặt dịch vụ', href: '/guide' },
        { label: 'Báo cáo sự cố', href: '/report' },
      ],
    },
  ];

  const contactInfo: ContactInfo[] = [
    {
      icon: <Phone className="w-4 h-4" />,
      label: 'Hotline 24/7',
      value: '1900 xxxx',
      href: 'tel:1900xxxx',
    },
    {
      icon: <Mail className="w-4 h-4" />,
      label: 'Email hỗ trợ',
      value: 'support@homecare.vn',
      href: 'mailto:support@homecare.vn',
    },
    {
      icon: <MapPin className="w-4 h-4" />,
      label: 'Văn phòng chính',
      value: 'TP.HCM, Việt Nam',
      href: '#',
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: 'Giờ làm việc',
      value: '24/7 - Tất cả các ngày',
      href: '#',
    },
  ];

  const socialLinks = [
    {
      icon: <Facebook className="w-5 h-5" />,
      href: '#',
      label: 'Facebook',
      color: 'hover:text-blue-600',
    },
    {
      icon: <Instagram className="w-5 h-5" />,
      href: '#',
      label: 'Instagram',
      color: 'hover:text-pink-600',
    },
    {
      icon: <Twitter className="w-5 h-5" />,
      href: '#',
      label: 'Twitter',
      color: 'hover:text-sky-600',
    },
    {
      icon: <Linkedin className="w-5 h-5" />,
      href: '#',
      label: 'LinkedIn',
      color: 'hover:text-blue-700',
    },
    {
      icon: <Youtube className="w-5 h-5" />,
      href: '#',
      label: 'YouTube',
      color: 'hover:text-red-600',
    },
  ];

  const achievements = [
    { icon: <Award className="w-4 h-4" />, text: 'Top 1 Việt Nam' },
    { icon: <Shield className="w-4 h-4" />, text: 'Chứng nhận ISO' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-background border-t border-border/50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-100/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Brand Section */}
            <div className="lg:col-span-4 space-y-6">
              <Link href="/" className="flex items-center space-x-3 group">
                <Image src="/" alt="HomeCare" width={50} height={50} />
              </Link>

              <p className="text-muted-foreground leading-relaxed">
                Nền tảng dịch vụ gia đình hàng đầu Việt Nam, kết nối bạn với các chuyên gia tin cậy
                cho mọi nhu cầu sửa chữa, vệ sinh và bảo trì tại nhà.
              </p>

              {/* Achievements */}
              <div className="flex flex-wrap gap-3">
                {achievements.map((achievement, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-green-200 text-green-700 bg-green-50"
                  >
                    {achievement.icon}
                    <span className="ml-1 text-xs">{achievement.text}</span>
                  </Badge>
                ))}
              </div>

              {/* Social Links */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Kết nối với chúng tôi</h4>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <Link
                      key={index}
                      href={social.href}
                      className={`w-10 h-10 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground transition-all duration-300 hover:border-green-200 hover:bg-green-50 ${social.color}`}
                      aria-label={social.label}
                    >
                      {social.icon}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-6 grid gap-8 sm:grid-cols-3">
              {footerSections.map(({ title, links }) => (
                <div key={title} className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    {title}
                  </h3>
                  <ul className="space-y-3">
                    {links.map(({ label, href, icon, isNew }) => (
                      <li key={label}>
                        <Link
                          href={href}
                          className="text-sm text-muted-foreground hover:text-green-600 transition-colors flex items-center gap-2 group"
                        >
                          {icon}
                          <span className="group-hover:translate-x-1 transition-transform duration-200">
                            {label}
                          </span>
                          {isNew && (
                            <Badge className="bg-green-600 text-white text-xs px-1.5 py-0.5 ml-1">
                              Mới
                            </Badge>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Liên hệ
              </h3>
              <div className="space-y-4">
                {contactInfo.map(({ icon, label, value, href }, index) => (
                  <div key={index} className="group">
                    {href ? (
                      <Link
                        href={href}
                        className="flex items-start gap-3 p-2 -m-2 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        <div className="text-green-600 mt-0.5">{icon}</div>
                        <div>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-medium text-foreground group-hover:text-green-600 transition-colors">
                            {value}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="text-green-600 mt-0.5">{icon}</div>
                        <div>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-medium text-foreground">{value}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* Bottom Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
              <p className="flex items-center gap-1">
                © {new Date().getFullYear()} HomeCare. Được phát triển với
                <Heart className="w-4 h-4 text-green-500 fill-current" />
                tại Việt Nam.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-sm">
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-green-600 transition-colors"
                >
                  Điều khoản sử dụng
                </Link>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-green-600 transition-colors"
                >
                  Chính sách bảo mật
                </Link>
                <Link
                  href="/cookies"
                  className="text-muted-foreground hover:text-green-600 transition-colors"
                >
                  Cookie
                </Link>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={scrollToTop}
                className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
