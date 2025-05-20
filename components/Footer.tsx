'use client';

import Link from 'next/link';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full max-w-[1440px] px-6 md:px-8 xl:px-20 mx-auto py-16 bg-background text-foreground  border rounded-3xl">
      <div className="container px-4 py-12">
        <div className="grid gap-10 md:grid-cols-6">
          <div className="space-y-6 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-10 h-10">
                <Image
                  src="https://i.pinimg.com/736x/c4/f5/fa/c4f5fa60b185e0e5771de1f4c96d7372.jpg"
                  alt="HomeCare"
                  fill
                  sizes="100%"
                />
              </div>
              <div className="relative w-24 h-5">
                <Image
                  src="https://i.pinimg.com/736x/c4/f5/fa/c4f5fa60b185e0e5771de1f4c96d7372.jpg"
                  alt="HomeCare"
                  fill
                  sizes="100%"
                />
              </div>
            </Link>
            <div className="flex">
              <Input
                type="email"
                placeholder={t('footer.newsletter_placeholder')}
                className="rounded-r-none bg-muted/50 border-none"
              />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-l-none border border-l-0 border-muted bg-muted/50 hover:bg-muted"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="md:col-span-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: t('footer.home'),
                links: [
                  'footer.hero_section',
                  'footer.features',
                  'footer.services',
                  'footer.testimonials',
                  'footer.faqs',
                ],
              },
              {
                title: t('footer.about_us'),
                links: [
                  'footer.our_story',
                  'footer.our_works',
                  'footer.how_it_works',
                  'footer.our_team',
                  'footer.our_clients',
                ],
              },
              {
                title: t('footer.contact_us'),
                links: ['footer.contact_form', 'footer.our_offices'],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {links.map(key => (
                    <li key={key}>
                      <Link href="#" className="hover:text-foreground transition-colors">
                        {t(key)}
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
      <div className="container px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
              {t('footer.terms_conditions')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
