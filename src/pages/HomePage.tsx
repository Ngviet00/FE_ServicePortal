import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { Camera } from 'lucide-react'

export default function HomePage() {
    const { t, i18n } = useTranslation();

    return (
        <div>
            <h1>{t('welcome')}</h1>
            <button onClick={() => i18n.changeLanguage('vi')}>Tiếng Việt</button>
            <button onClick={() => i18n.changeLanguage('en')}>English</button>
            <Button>Click me</Button>
            <Camera color="red" size={48} />
        </div>
    );
}