import { useTranslation } from 'react-i18next'

export default function HomePage() {
    const { t } = useTranslation();

    return (
        <div>
            <h1>{t('welcome')}</h1>
        </div>
    );
}