import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export default function SelectedLanguage() {

    const { i18n } = useTranslation();

    const handleLanguageChange = (value: string) => {
        i18n.changeLanguage(value);
    }

    return  <>
        <div className="pr-3 flex items-center">
            <div>
                <Select onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[70px] hover:cursor-pointer">
                        <img
                            src={i18n.language === 'vi' ? '/icon-vi.png' : '/icon-en.png'}
                            className="w-7 h-6 rounded-md"
                            alt="language"
                        />
                        <SelectValue placeholder={i18n.language == 'vi' ? 'VI' : 'EN'} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="vi" className="hover:cursor-pointer">VI</SelectItem>
                            <SelectItem value="en" className="hover:cursor-pointer">EN</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>
    </>
}