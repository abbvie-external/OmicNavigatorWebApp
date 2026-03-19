import { Dispatch, HTMLAttributes, ReactNode, SetStateAction } from 'react';
import { FilterValue } from '../FilterTypeConfig';
interface Option<T extends FilterValue> {
    value: T;
    text?: FilterValue;
    className?: string;
}
export interface QSearchableMultiSelectProps<T extends FilterValue> {
    search?: string;
    setSearch?: (search: string) => void;
    options: Option<T>[];
    selected: Set<T>;
    setSelected?: Dispatch<SetStateAction<Set<T>>>;
    onToggleValue?: (value: T) => void;
    placeholder?: string;
    clearSearchOnSelectOrClearAll?: boolean;
    loading?: boolean;
}
export declare function QSearchableMultiSelect<T extends string | null | undefined | number>({ clearSearchOnSelectOrClearAll, loading, ...props }: QSearchableMultiSelectProps<T>): import("react/jsx-runtime").JSX.Element;
declare const Option: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & {
    active: boolean;
    selected: boolean;
    children: ReactNode;
} & import("react").RefAttributes<HTMLDivElement>>;
export {};
