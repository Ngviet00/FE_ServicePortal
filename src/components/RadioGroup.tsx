import React from "react";

export interface RadioOption {
    label: string;
    value: string;
}

interface RadioGroupProps {
    label?: string;
    options: RadioOption[];
    value: string;
    onChange: (value: string) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ label, options, value, onChange }) => {
    return (
        <div className="flex items-center space-y-2">
            {label && <span className="font-semibold mb-0 mr-4">{label}: </span>}
                {options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2 mb-0 mr-3">
                        <input
                            type="radio"
                            id={`radio-${option.value}`}
                            name={label}
                            value={option.value}
                            checked={value === option.value}
                            onChange={() => onChange(option.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 hover:cursor-pointer"
                        />
                        <label htmlFor={`radio-${option.value}`} className="cursor-pointer">
                            {option.label}
                        </label>
                    </div>
                ))
            }
        </div>
    );
};

export default RadioGroup;
