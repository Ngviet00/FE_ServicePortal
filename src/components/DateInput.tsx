import React from "react";
import { Input } from "@/components/ui/input";

type DateInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const DateInput: React.FC<DateInputProps> = ({ onClick, ...props }) => {
    const handleShowPicker = (e: React.MouseEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
        e.currentTarget.showPicker?.();

        if (e.type === "click" && onClick) {
            onClick(e as React.MouseEvent<HTMLInputElement>);
        }
    };

    return (
        <Input
            {...props}
            type="date"
            onClick={handleShowPicker}
        />
    );
};
