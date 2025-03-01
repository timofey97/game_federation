import { useTranslation } from '@/i18n/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  return (
    <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'sl')}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="sl">Slovenščina</SelectItem>
      </SelectContent>
    </Select>
  );
}
