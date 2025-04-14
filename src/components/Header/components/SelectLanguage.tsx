import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export default function SelectedLanguage() {

    const { i18n } = useTranslation();

    const handleLanguageChange = (value: string) => {
        i18n.changeLanguage(value);
    }
    
    return  <>
        <div className="pr-3 flex items-center">
            <div className="pr-1">
                <img src={i18n.language == 'vi' ? '/icon-vi.png' : '/icon-en.png'} className="rounded-md" alt="" />
            </div>
            <div>
                <Select defaultValue={i18n.language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[70px] hover:cursor-pointer">
                        <SelectValue placeholder="VI" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="vi" className="hover:cursor-pointer">VI</SelectItem>
                        <SelectItem value="en" className="hover:cursor-pointer">EN</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    </>
}