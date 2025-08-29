/* eslint-disable @typescript-eslint/no-explicit-any */
import { useController } from "react-hook-form";

interface NumericInputProps {
    name: string;
    control: any;
    placeholder?: string;
    className?: string;
}

export const NumericInput = ({ name, control, placeholder, className }: NumericInputProps) => {
    const {
        field: { value, onChange, onBlur, ref },
        fieldState: { error }
    } = useController({ name, control });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        if (/^\d*\.?\d*$/.test(val)) {
            onChange(val);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        let val = e.target.value;

        if (val && !val.includes(".")) {
            val = String(parseInt(val, 10));
        }

        onChange(val);
        onBlur();
    };

    return (
        <div>
            <input
                ref={ref}
                value={value ?? ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                className={`dark:bg-[#454545] w-full p-2 text-sm border rounded ${
                error ? "border-red-500 bg-red-50" : "border-gray-300"
                } ${className}`}
            />
        </div>
    );
};
