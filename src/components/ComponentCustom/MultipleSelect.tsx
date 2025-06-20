import Select, { GroupBase } from 'react-select';
import { useCallback } from 'react';
import { MultiValue, ActionMeta } from 'react-select';
import { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';

export type OptionType = {
    label: string;
    value: string;
};

type GenericAsyncMultiSelectProps = {
    value?: MultiValue<OptionType>;
    onChange?: (value: MultiValue<OptionType>, meta: ActionMeta<OptionType>) => void;
    placeholder?: string;
    debounceMs?: number;
    options?: OptionType[];
    fetchOptions?: (input: string) => Promise<OptionType[]>;
    className?: string;
    mode?: 'single' | 'multi';
};

export function GenericAsyncMultiSelect({
    value = [],
    onChange,
    placeholder = 'Tìm kiếm...',
    debounceMs = 700,
    options,
    fetchOptions,
    className,
    mode = 'multi'
}: GenericAsyncMultiSelectProps) {

    const isMulti = mode === 'multi';

    const handleChange = (newValue: MultiValue<OptionType>, meta: ActionMeta<OptionType>) => {
        onChange?.(newValue, meta);
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedLoadOptions = useCallback(
        debounce((inputValue: string, callback: (options: OptionType[]) => void) => {
            if (options) {
                const filtered =
                inputValue.trim().length < 2
                    ? []
                    : options.filter((o) =>
                        o.label.toLowerCase().includes(inputValue.toLowerCase())
                    );
                callback(filtered);
                return;
            }

            if (fetchOptions) {
                if (!inputValue || inputValue.trim().length < 2) {
                    callback([]);
                    return;
                }

                fetchOptions(inputValue).then(callback).catch(() => callback([]));
            } else {
                callback([]);
            }
        }, debounceMs),
        [fetchOptions, options, debounceMs]
    );

    if (options) {
        return (
            <Select<OptionType, true>
                isMulti={isMulti ? true : undefined}
                className={className}
                options={options}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                closeMenuOnSelect={true}
                defaultMenuIsOpen={false}
            />
        );
    }

    return (
        <AsyncSelect<OptionType, true, GroupBase<OptionType>>
            isMulti={isMulti ? true : undefined}
            cacheOptions
            loadOptions={debouncedLoadOptions}
            value={value}
            onChange={handleChange}
            defaultOptions={false}
            placeholder={placeholder}
            className={className}
            noOptionsMessage={({ inputValue }) =>
                inputValue.length < 2
                ? 'Gõ ít nhất 2 ký tự...'
                : 'Không tìm thấy kết quả.'
            }
            loadingMessage={() => 'Đang tải...'}
            closeMenuOnSelect={false}
        />
    );
}
