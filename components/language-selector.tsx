'use client';

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: 'vn' },
    { code: 'en', name: 'English', flag: 'gb' },
  ];
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map(language => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={i18n.language === language.code ? 'bg-accent' : ''}
          >
            <Image
              src={`https://flagcdn.com/w40/${language.flag}.png`}
              alt={language.code}
              width={24}
              height={16}
              className="mr-2"
            />

            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
