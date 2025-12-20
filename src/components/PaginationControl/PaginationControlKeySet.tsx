import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface KeysetPaginationProps {
    hasNext: boolean;
    canPrevious: boolean;
    onNext: () => void;
    onPrevious: () => void;
    limit: number;
    onLimitChange: (limit: number) => void;
    className?: string;
}

const KeysetPagination: React.FC<KeysetPaginationProps> = React.memo(({
    hasNext,
    canPrevious,
    onNext,
    onPrevious,
    limit,
    onLimitChange,
    className
}) => {

    const { t } = useTranslation('common');

    const limitOptions = [20, 30, 40, 50];

    return (
        <div className={`flex justify-between items-center mt-6 ${className}`}>
            <div className="flex-1"></div>
            <div className="flex justify-center space-x-4">
                <button
                    onClick={onPrevious}
                    disabled={!canPrevious}
                    className="
                        px-4 py-2 border border-gray-300 rounded-md cursor-pointer
                        text-gray-700 bg-white hover:bg-gray-50 
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    <ChevronLeft />
                </button>

                <button
                    onClick={onNext}
                    disabled={!hasNext}
                    className="
                        px-4 py-2 border rounded-md cursor-pointer
                        text-white bg-black
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    <ChevronRight />
                </button>
            </div>

            <div className="flex-1 flex justify-end items-center space-x-2">
                <span className="text-sm text-gray-700 hidden sm:inline">{t('per_page')}</span>
                
                <select
                    value={limit}
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                    className="
                        p-2 border border-gray-300 rounded-md cursor-pointer w-[100px]
                        text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500
                    "
                >
                    {limitOptions.map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
});

export default KeysetPagination;
