
"use client";

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label"; // Assuming you have a Label component

export function LanguageSwitcher() {
    const t = useTranslations('LanguageSwitcher');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const onSelectChange = (nextLocale: string) => {
        // Remove the current locale prefix from the pathname
        const currentPathWithoutLocale = pathname.startsWith(`/${locale}`)
            ? pathname.substring(`/${locale}`.length) || '/'
            : pathname;

        // Navigate to the same path with the new locale prefix
        // Ensure path starts with /
        const newPath = `/${nextLocale}${currentPathWithoutLocale.startsWith('/') ? '' : '/'}${currentPathWithoutLocale}`;
        router.replace(newPath);
    };

    return (
        <div className="flex items-center gap-2">
             {/* <Label htmlFor="language-select" className="text-sm font-medium text-primary-foreground hidden sm:inline">
                 {t('label')}
             </Label> */}
            <Select value={locale} onValueChange={onSelectChange}>
                <SelectTrigger id="language-select" className="w-[100px] sm:w-[120px] bg-secondary text-secondary-foreground border-input h-9">
                    <SelectValue placeholder={t('label')} />
                </SelectTrigger>
                <SelectContent>
                    {locales.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                            {t(loc === 'en' ? 'english' : 'arabic')}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
