import { CSSProperties, ReactNode } from 'react';
import { FilterValue } from '../FilterTypeConfig';
export type QSelectOption<T extends FilterValue> = {
    value: T;
    text: string;
    className?: string;
    disabled?: boolean;
    render?: ReactNode | ((option: QSelectOption<T>) => ReactNode);
};
export type QSelectProps<T extends FilterValue> = {
    options: QSelectOption<T>[];
    className?: string;
    style?: CSSProperties;
    id?: string;
    popoverClassName?: string;
    popoverStyle?: CSSProperties;
    onChange?: (value: T) => void;
    value?: T;
    /**
     * If true, the select will be cleared when the clear button is clicked.
     * @default false
     */
    clearable?: boolean;
    /**
     * The placeholder text to show when no value is selected.
     */
    placeholder?: string;
};
export declare function QSelect<T extends FilterValue>({ options, popoverClassName, popoverStyle, onChange, value, clearable, placeholder, ...props }: QSelectProps<T>): import("react/jsx-runtime").JSX.Element;
