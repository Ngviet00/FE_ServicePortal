import { getStrengthColor, PasswordStrength } from "@/lib/password";

interface PasswordStrengthIndicatorProps {
    strength: PasswordStrength;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ strength }) => {
    return (
        <div className="flex items-center">
            <strong className={`text-[0.9em] mr-[10px]`} style={{ color: getStrengthColor(strength) }}>
                {strength}
            </strong>

            <span
                className={`w-[50px] h-[6px] inline-block mr-[2px] transition-opacity duration-300 ease-in-out`}
                style={{
                    backgroundColor: getStrengthColor('Weak'),
                    opacity: ['Weak', 'Medium', 'Strong'].includes(strength) ? 1 : 0,
                }}
            ></span>

            <span
                className={`w-[50px] h-[6px] inline-block mr-[2px] transition-opacity duration-300 ease-in-out`}
                style={{
                    backgroundColor: getStrengthColor('Medium'),
                    opacity: ['Medium', 'Strong'].includes(strength) ? 1 : 0,
                }}
            ></span>

            <span
                className={`w-[50px] h-[6px] inline-block transition-opacity duration-300 ease-in-out`}
                style={{
                    backgroundColor: getStrengthColor('Strong'),
                    opacity: strength === 'Strong' ? 1 : 0,
                }}
            ></span>
        </div>
    )
}

export default PasswordStrengthIndicator;