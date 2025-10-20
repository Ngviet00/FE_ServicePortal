// import Select, { GroupBase } from 'react-select';
// import { useCallback } from 'react';
// import { MultiValue, ActionMeta } from 'react-select';
// import { debounce } from 'lodash';
// import AsyncSelect from 'react-select/async';

// export type OptionType = {
//     label: string;
//     value: string;
// };

// type GenericAsyncMultiSelectProps = {
//     value?: MultiValue<OptionType>;
//     onChange?: (value: MultiValue<OptionType>, meta: ActionMeta<OptionType>) => void;
//     placeholder?: string;
//     debounceMs?: number;
//     options?: OptionType[];
//     fetchOptions?: (input: string) => Promise<OptionType[]>;
//     className?: string;
//     mode?: 'single' | 'multi';
// };

// export function GenericAsyncMultiSelect({
//     value = [],
//     onChange,
//     placeholder = 'Tìm kiếm...',
//     debounceMs = 700,
//     options,
//     fetchOptions,
//     className,
//     mode = 'multi'
// }: GenericAsyncMultiSelectProps) {

//     const isMulti = mode === 'multi';

//     const handleChange = (newValue: MultiValue<OptionType>, meta: ActionMeta<OptionType>) => {
//         onChange?.(newValue, meta);
//     };

//   // eslint-disable-next-line react-hooks/exhaustive-deps
//     const debouncedLoadOptions = useCallback(
//         debounce((inputValue: string, callback: (options: OptionType[]) => void) => {
//             if (options) {
//                 const filtered =
//                 inputValue.trim().length < 2
//                     ? []
//                     : options.filter((o) =>
//                         o.label.toLowerCase().includes(inputValue.toLowerCase())
//                     );
//                 callback(filtered);
//                 return;
//             }

//             if (fetchOptions) {
//                 if (!inputValue || inputValue.trim().length < 2) {
//                     callback([]);
//                     return;
//                 }

//                 fetchOptions(inputValue).then(callback).catch(() => callback([]));
//             } else {
//                 callback([]);
//             }
//         }, debounceMs),
//         [fetchOptions, options, debounceMs]
//     );

//     if (options) {
//         return (
//             <Select<OptionType, true>
//                 isMulti={isMulti ? true : undefined}
//                 className={className}
//                 options={options}
//                 value={value}
//                 onChange={handleChange}
//                 placeholder={placeholder}
//                 closeMenuOnSelect={true}
//                 defaultMenuIsOpen={false}
//             />
//         );
//     }

//     return (
//         <AsyncSelect<OptionType, true, GroupBase<OptionType>>
//             isMulti={isMulti ? true : undefined}
//             cacheOptions
//             loadOptions={debouncedLoadOptions}
//             value={value}
//             onChange={handleChange}
//             defaultOptions={false}
//             placeholder={placeholder}
//             className={className}
//             noOptionsMessage={({ inputValue }) =>
//                 inputValue.length < 2
//                 ? 'Gõ ít nhất 2 ký tự...'
//                 : 'Không tìm thấy kết quả.'
//             }
//             loadingMessage={() => 'Đang tải...'}
//             closeMenuOnSelect={false}
//         />
//     );
// }
// import Select, { GroupBase } from 'react-select';
// import AsyncSelect from 'react-select/async';
// import { useCallback, useMemo } from 'react';
// import { debounce } from 'lodash';
// import { MultiValue, ActionMeta } from 'react-select';

// export type OptionType = {
//     label: string;
//     value: string;
// };

// type GenericAsyncMultiSelectProps = {
//     value?: MultiValue<OptionType>;
//     onChange?: (value: MultiValue<OptionType>, meta: ActionMeta<OptionType>) => void;
//     placeholder?: string;
//     debounceMs?: number;
//     options?: OptionType[];
//     fetchOptions?: (input: string) => Promise<OptionType[]>;
//     className?: string;
//     mode?: 'single' | 'multi';
// };

// export function GenericAsyncMultiSelect({
//     value = [],
//     onChange,
//     placeholder = 'Tìm kiếm...',
//     debounceMs = 700,
//     options,
//     fetchOptions,
//     className,
//     mode = 'multi'
// }: GenericAsyncMultiSelectProps) {

//     const isMulti = mode === 'multi';

//     const handleChange = (newValue: MultiValue<OptionType>, meta: ActionMeta<OptionType>) => {
//         onChange?.(newValue, meta);
//     };

//     // ✅ Debounce fetchOptions thực sự
//     const debouncedFetch = useMemo(() => {
//         if (!fetchOptions) return undefined;
//         return debounce(async (inputValue: string, callback: (options: OptionType[]) => void) => {
//             if (inputValue.trim().length < 2) {
//                 callback([]);
//                 return;
//             }

//             try {
//                 const results = await fetchOptions(inputValue);
//                 callback(results);
//             } catch {
//                 callback([]);
//             }
//         }, debounceMs);
//     }, [fetchOptions, debounceMs]);

//     if (options) {
//         // Trường hợp local options (không cần gọi API)
//         return (
//             <Select<OptionType, true>
//                 isMulti={isMulti ? true : undefined}
//                 className={className}
//                 options={options}
//                 value={value}
//                 onChange={handleChange}
//                 placeholder={placeholder}
//                 closeMenuOnSelect={true}
//                 defaultMenuIsOpen={false}
//             />
//         );
//     }
    

//     return (
//         <AsyncSelect<OptionType, true, GroupBase<OptionType>>
//             isMulti={isMulti ? true : undefined}
//             cacheOptions
//             loadOptions={debouncedFetch!}
//             value={value}
//             onChange={handleChange}
//             defaultOptions={false}
//             placeholder={placeholder}
//             className={className}
//             noOptionsMessage={({ inputValue }) =>
//                 inputValue.length < 2
//                     ? 'Gõ ít nhất 2 ký tự...'
//                     : 'Không tìm thấy kết quả.'
//             }
//             loadingMessage={() => 'Đang tải...'}
//             closeMenuOnSelect={false}
//             filterOption={null}
//         />
//     );
// }
import Select, { GroupBase } from 'react-select';
import AsyncSelect from 'react-select/async';
import { useMemo } from 'react';
import { debounce } from 'lodash';
import { MultiValue, ActionMeta } from 'react-select';

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

    // ✅ Dùng debounce đúng kiểu Promise<OptionType[]>
    const debouncedFetch = useMemo(() => {
        if (!fetchOptions) return undefined;

        const load = async (inputValue: string): Promise<OptionType[]> => {
            if (inputValue.trim().length < 2) return [];
            try {
                const results = await fetchOptions(inputValue);
                return results;
            } catch {
                return [];
            }
        };

        // lodash.debounce làm mất return type → mình bọc lại
        const debounced = debounce(
            (input: string, resolve: (value: OptionType[]) => void) => {
                load(input).then(resolve);
            },
            debounceMs
        );

        // trả về hàm đúng kiểu mà AsyncSelect cần
        return (inputValue: string): Promise<OptionType[]> =>
            new Promise((resolve) => debounced(inputValue, resolve));
    }, [fetchOptions, debounceMs]);

    if (options) {
        // Trường hợp local options (không cần gọi API)
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
            loadOptions={debouncedFetch!}
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
            filterOption={null}
        />
    );
}
