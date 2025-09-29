'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Locale } from '@/lib/i18n';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'en' as Locale, name: 'English' },
  { code: 'zh' as Locale, name: '中文' },
  { code: 'es' as Locale, name: 'Español' },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  
  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          aria-label="Select language"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              setLocale(lang.code);
              setOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <span>{lang.name}</span>
            {locale === lang.code && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
