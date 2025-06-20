'use client';

import Link from 'next/link';
import { Send, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface FooterLink {
  label: string;
  href: string;
  icon?: ReactNode;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

export default function Footer() {
  const footerSections: FooterSection[] = [
    {
      title: 'Home',
      links: [
        { label: 'Hero Section', href: '#hero' },
        { label: 'Features', href: '#features' },
        { label: 'Services', href: '#services' },
        { label: 'Testimonials', href: '#testimonials' },
        { label: 'FAQs', href: '#faqs' },
      ],
    },
    {
      title: 'About Us',
      links: [
        { label: 'Our Story', href: '/about' },
        { label: 'Our Works', href: '/works' },
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'Our Team', href: '/team' },
        { label: 'Our Clients', href: '/clients' },
      ],
    },
    {
      title: 'Contact Us',
      links: [
        { label: 'Contact Form', href: '/contact' },
        { label: 'Our Offices', href: '/offices' },
      ],
    },
    {
      title: 'Follow Us',
      links: [
        { label: 'Facebook', href: '#', icon: <Facebook className="w-4 h-4" /> },
        { label: 'Twitter', href: '#', icon: <Twitter className="w-4 h-4" /> },
        { label: 'Instagram', href: '#', icon: <Instagram className="w-4 h-4" /> },
        { label: 'LinkedIn', href: '#', icon: <Linkedin className="w-4 h-4" /> },
        { label: 'Youtube', href: '#', icon: <Youtube className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <footer className="w-full bg-background border-t">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-6">
            {/* Brand Section */}
            <div className="space-y-6 md:col-span-2">
              <Link href="/" className="flex items-center space-x-2">
                <div className="relative w-10 h-10">
                  <Image
                    src="https://i.pinimg.com/736x/c4/f5/fa/c4f5fa60b185e0e5771de1f4c96d7372.jpg"
                    alt="HomeCare"
                    fill
                    sizes="100%"
                    className="rounded-lg"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  HomeCare
                </span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm">
                Providing quality home care services to make your life easier and more comfortable.
              </p>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="rounded-r-none bg-muted/50 border-none focus-visible:ring-1"
                />
                <Button variant="default" size="icon" className="rounded-l-none">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Links Section */}
            <div className="md:col-span-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {footerSections.map(({ title, links }) => (
                <div key={title} className="space-y-4">
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <ul className="space-y-3">
                    {links.map(({ label, href, icon }) => (
                      <li key={label}>
                        <Link
                          href={href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                        >
                          {icon}
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} HomeCare. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
