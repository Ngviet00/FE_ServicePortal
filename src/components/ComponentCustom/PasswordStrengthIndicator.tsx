import React from 'react';
import { hasAlphanumeric, hasAlphanumericLowerCase, hasMinimumLength, hasNumber, hasSpecialCharacter } from '@/lib/password';
import { useTranslation } from 'react-i18next';

interface PasswordStrengthIndicatorProps {
    password: string;
}

const getRequirementColor = (isMet: boolean, passwordIsEmpty: boolean): string => {
    if (passwordIsEmpty) {
        return 'text-gray-500';
    }
    return isMet ? 'text-green-700' : 'text-red-700';
};

const PasswordRequirementIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
    const isPasswordEmpty = password.length === 0;
    const minLengthMet = isPasswordEmpty ? false : hasMinimumLength(password);
    const alphanumericMet = isPasswordEmpty ? false : hasAlphanumeric(password);
    const alphanumericNormalCaseMet = isPasswordEmpty ? false : hasAlphanumericLowerCase(password);
    const specialCharMet = isPasswordEmpty ? false : hasSpecialCharacter(password);
    const hasDigit = isPasswordEmpty ? false : hasNumber(password);
    const { t } = useTranslation();

    return (
        <div className="password-requirements text-base text-gray-500 italic mb-0 mt-2">
            <span className="font-bold text-black">{t('change_password_page.required_password')}</span>
            <ul className='pl-5'>
                <li className={`list-disc ml-5 text-sm font-bold mb-1 mt-1 ${getRequirementColor(minLengthMet, isPasswordEmpty)}`}>
                    {t('change_password_page.required_8_character')}
                </li>
                <li className={`list-disc ml-5 text-sm font-bold mb-1 ${getRequirementColor(alphanumericMet, isPasswordEmpty)}`}>
                    {t('change_password_page.required_character_upper_case')}
                </li>
                <li className={`list-disc ml-5 text-sm font-bold mb-1 ${getRequirementColor(alphanumericNormalCaseMet, isPasswordEmpty)}`}>
                    {t('change_password_page.required_character_lower_case')}
                </li>
                <li className={`list-disc ml-5 text-sm font-bold mb-1 ${getRequirementColor(hasDigit, isPasswordEmpty)}`}>
                    {t('change_password_page.required_number')}
                </li>
                <li className={`list-disc ml-5 text-sm font-bold mb-1 ${getRequirementColor(specialCharMet, isPasswordEmpty)}`}>
                    {t('change_password_page.required_special_character')}
                </li>
            </ul>
        </div>
    );
};

export default PasswordRequirementIndicator;